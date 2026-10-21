import { createHash, randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { STORAGE, sb, sbFail } from "./orders-db"
import type { ShopId } from "./shops"

/**
 * Đánh giá quán và đánh giá món — lưu cùng chỗ với đơn hàng (Supabase bảng reviews, hoặc file data/reviews.json).
 * foodId rỗng = đánh giá quán (mỗi tài khoản 1 đánh giá / quán), có foodId = đánh giá món (viết bao nhiêu lần cũng được).
 * userId không bao giờ trả ra ngoài (xem toPublic): nó là thứ duy nhất chứng minh ai là chủ đánh giá.
 */

/** reply/repliedAt: phản hồi của quán (chỉ có khi quán đã trả lời) */
export type Review = {
  id: string
  shopId: ShopId
  foodId: string
  userId: string
  name: string
  rating: number
  comment: string
  createdAt: string
  editedAt?: string
  reply?: string
  repliedAt?: string
}

/** Thứ trình duyệt được thấy: bỏ userId, thêm mine = đánh giá của người đang xem */
export type PublicReview = Omit<Review, "userId"> & { mine: boolean }

export const toPublic = (r: Review, viewerId: string | null): PublicReview => {
  const { userId, ...rest } = r
  return { ...rest, mine: !!viewerId && userId === viewerId }
}

/** Điểm trung bình + số lượt đánh giá của từng món */
export type FoodRatings = Record<string, { avg: number; count: number }>

type Row = {
  id: string
  shop_id: ShopId
  food_id: string
  user_id: string
  name: string
  rating: number
  comment: string
  created_at: string
  edited_at?: string | null
  reply?: string | null
  replied_at?: string | null
}

const FILE = path.join(process.cwd(), "data", "reviews.json")

// Bản ghi cũ chưa có id → tạo id cố định từ nội dung để lần đọc nào cũng ra cùng 1 id
const legacyId = (r: Review) =>
  createHash("sha1").update(`${r.shopId}|${r.foodId}|${r.userId}|${r.createdAt}`).digest("hex").slice(0, 16)

async function loadFile(): Promise<Review[]> {
  try {
    return (JSON.parse(await fs.readFile(FILE, "utf8")) as Review[]).map((r) => {
      const review = { ...r, foodId: r.foodId ?? "" } // bản ghi trước khi có đánh giá món = đánh giá quán
      return review.id ? review : { ...review, id: legacyId(review) }
    })
  } catch {
    return []
  }
}

// Ghi file lần lượt để 2 người gửi cùng lúc không đè nhau
let queue: Promise<unknown> = Promise.resolve()
function serial<T>(fn: (all: Review[]) => Promise<{ save: boolean; result: T }>): Promise<T> {
  const run = queue.then(async () => {
    const all = await loadFile()
    const { save, result } = await fn(all)
    if (save) {
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      await fs.writeFile(`${FILE}.tmp`, JSON.stringify(all, null, 2), "utf8")
      await fs.rename(`${FILE}.tmp`, FILE)
    }
    return result
  })
  queue = run.catch(() => {})
  return run
}

const toReview = (r: Row): Review => ({
  id: r.id,
  shopId: r.shop_id,
  foodId: r.food_id ?? "",
  userId: r.user_id,
  name: r.name,
  rating: r.rating,
  comment: r.comment,
  createdAt: new Date(r.created_at).toISOString(),
  ...(r.edited_at ? { editedAt: new Date(r.edited_at).toISOString() } : {}),
  ...(r.reply ? { reply: r.reply, repliedAt: new Date(r.replied_at ?? r.created_at).toISOString() } : {}),
})

const toRow = (r: Review): Row => ({
  id: r.id,
  shop_id: r.shopId,
  food_id: r.foodId,
  user_id: r.userId,
  name: r.name,
  rating: r.rating,
  comment: r.comment,
  created_at: r.createdAt,
})

const enc = encodeURIComponent

/** Đánh giá của quán (foodId rỗng) hoặc của 1 món, mới nhất lên đầu */
export async function listReviews(shopId: ShopId, foodId = ""): Promise<Review[]> {
  if (STORAGE === "file") {
    return (await loadFile())
      .filter((r) => r.shopId === shopId && r.foodId === foodId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  const res = await sb(`reviews?select=*&shop_id=eq.${enc(shopId)}&food_id=eq.${enc(foodId)}&order=created_at.desc&limit=500`)
  if (!res.ok) await sbFail(res, "đọc đánh giá")
  return ((await res.json()) as Row[]).map(toReview)
}

/** Điểm trung bình của mọi món đã có đánh giá */
export async function foodRatings(): Promise<FoodRatings> {
  let rows: { foodId: string; rating: number }[]
  if (STORAGE === "file") rows = (await loadFile()).filter((r) => r.foodId)
  else {
    // shortcut: đọc tối đa 10000 lượt đánh giá món; nhiều hơn thì chuyển sang view/hàm tính trung bình trong Supabase
    const res = await sb("reviews?select=food_id,rating&food_id=neq.&limit=10000")
    if (!res.ok) await sbFail(res, "đọc điểm món")
    rows = ((await res.json()) as Pick<Row, "food_id" | "rating">[]).map((r) => ({ foodId: r.food_id, rating: r.rating }))
  }
  const sums: Record<string, { sum: number; count: number }> = {}
  for (const r of rows) {
    const s = (sums[r.foodId] ??= { sum: 0, count: 0 })
    s.sum += r.rating
    s.count++
  }
  return Object.fromEntries(Object.entries(sums).map(([id, s]) => [id, { avg: s.sum / s.count, count: s.count }]))
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** Kiểm tra số sao + nhận xét khách gửi lên. Sai thì trả về null */
export function contentFromBody(body: Record<string, unknown>): { rating: number; comment: string } | null {
  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null
  return { rating, comment: str(body.comment, 500) }
}

/**
 * Đánh giá mới từ body { userId, name, rating: 1..5, comment }. Sai thì trả về null.
 * shortcut: tài khoản chỉ nằm trong localStorage nên server chỉ biết chủ đánh giá qua userId (không lộ ra API công khai); khi có đăng nhập phía server thì lấy userId từ phiên
 */
export function reviewFromBody(body: Record<string, unknown>, shopId: ShopId, foodId: string): Review | null {
  const content = contentFromBody(body)
  const userId = str(body.userId, 60)
  const name = str(body.name, 80)
  if (!content || !userId || !name) return null
  return { id: randomUUID(), shopId, foodId, userId, name, ...content, createdAt: new Date().toISOString() }
}

/** Thêm 1 đánh giá mới (đánh giá món: viết bao nhiêu lần cũng được) */
export async function addReview(review: Review): Promise<void> {
  if (STORAGE === "file") {
    return serial(async (all) => {
      all.push(review)
      return { save: true, result: undefined }
    })
  }
  const res = await sb("reviews", { method: "POST", body: toRow(review) })
  if (!res.ok) await sbFail(res, "lưu đánh giá")
}

/** Đánh giá quán: mỗi tài khoản 1 bản, viết lại thì thay bản cũ (phản hồi cũ của quán bị bỏ vì nội dung đã đổi) */
export async function saveShopReview(review: Review): Promise<void> {
  if (STORAGE === "file") {
    return serial(async (all) => {
      const i = all.findIndex((r) => r.shopId === review.shopId && r.foodId === "" && r.userId === review.userId)
      if (i >= 0) all.splice(i, 1)
      all.push(review)
      return { save: true, result: undefined }
    })
  }
  const del = await sb(`reviews?shop_id=eq.${enc(review.shopId)}&food_id=eq.&user_id=eq.${enc(review.userId)}`, { method: "DELETE" })
  if (!del.ok) await sbFail(del, "thay đánh giá")
  await addReview(review)
}

export type OwnerResult = { review: Review } | { error: "not_found" | "forbidden" }

/** Chủ đánh giá sửa số sao / nhận xét. Người khác (userId không khớp) → forbidden */
export async function updateReview(
  id: string,
  userId: string,
  content: { rating: number; comment: string },
): Promise<OwnerResult> {
  const editedAt = new Date().toISOString()
  if (STORAGE === "file") {
    return serial<OwnerResult>(async (all) => {
      const review = all.find((r) => r.id === id)
      if (!review) return { save: false, result: { error: "not_found" as const } }
      if (review.userId !== userId) return { save: false, result: { error: "forbidden" as const } }
      Object.assign(review, content, { editedAt })
      return { save: true, result: { review } }
    })
  }
  const owner = await ownerCheck(id, userId)
  if (owner) return owner
  const res = await sb(`reviews?id=eq.${enc(id)}&user_id=eq.${enc(userId)}`, {
    method: "PATCH",
    body: { ...content, edited_at: editedAt },
    prefer: "return=representation",
  })
  if (!res.ok) await sbFail(res, "sửa đánh giá")
  const [row] = (await res.json()) as Row[]
  return row ? { review: toReview(row) } : { error: "not_found" }
}

/** Chủ đánh giá xóa đánh giá. Người khác → forbidden */
export async function deleteReview(id: string, userId: string): Promise<OwnerResult | { ok: true }> {
  if (STORAGE === "file") {
    return serial<OwnerResult | { ok: true }>(async (all) => {
      const i = all.findIndex((r) => r.id === id)
      if (i < 0) return { save: false, result: { error: "not_found" as const } }
      if (all[i].userId !== userId) return { save: false, result: { error: "forbidden" as const } }
      all.splice(i, 1)
      return { save: true, result: { ok: true as const } }
    })
  }
  const owner = await ownerCheck(id, userId)
  if (owner) return owner
  const res = await sb(`reviews?id=eq.${enc(id)}&user_id=eq.${enc(userId)}`, { method: "DELETE" })
  if (!res.ok) await sbFail(res, "xóa đánh giá")
  return { ok: true }
}

/** Supabase: không có đánh giá → not_found, có mà không phải chủ → forbidden, đúng chủ → null */
async function ownerCheck(id: string, userId: string): Promise<{ error: "not_found" | "forbidden" } | null> {
  const res = await sb(`reviews?select=user_id&id=eq.${enc(id)}`)
  if (!res.ok) await sbFail(res, "kiểm tra đánh giá")
  const [row] = (await res.json()) as Pick<Row, "user_id">[]
  if (!row) return { error: "not_found" }
  return row.user_id === userId ? null : { error: "forbidden" }
}

/** Quán trả lời 1 đánh giá quán (reply rỗng = xóa phản hồi). Trả về null nếu không có đánh giá đó */
export async function replyReview(shopId: ShopId, id: string, reply: string): Promise<Review | null> {
  const repliedAt = new Date().toISOString()
  if (STORAGE === "file") {
    return serial(async (all) => {
      const review = all.find((r) => r.id === id && r.shopId === shopId && r.foodId === "")
      if (!review) return { save: false, result: null }
      if (reply) Object.assign(review, { reply, repliedAt })
      else {
        delete review.reply
        delete review.repliedAt
      }
      return { save: true, result: review }
    })
  }
  const res = await sb(`reviews?id=eq.${enc(id)}&shop_id=eq.${enc(shopId)}&food_id=eq.`, {
    method: "PATCH",
    body: { reply: reply || null, replied_at: reply ? repliedAt : null },
    prefer: "return=representation",
  })
  if (!res.ok) await sbFail(res, "trả lời đánh giá")
  const [row] = (await res.json()) as Row[]
  return row ? toReview(row) : null
}
