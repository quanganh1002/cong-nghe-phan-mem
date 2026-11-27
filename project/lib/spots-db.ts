import { promises as fs } from "node:fs"
import path from "node:path"
import { FOOD_SPOTS, makeId, type FoodSpot } from "./dishes"
import { USE_SUPABASE, sb, sbFail } from "./supabase"

/**
 * Điểm ẩm thực (POI) do admin thêm/sửa/xóa. Có Supabase thì lưu ở bảng food_spots (xem supabase/schema.sql);
 * không thì lưu vào data/spots.json. Chưa có file thì dùng FOOD_SPOTS trong lib/dishes.ts.
 */
const FILE = path.join(process.cwd(), "data", "spots.json")

export type SpotInput = Omit<FoodSpot, "id">

/** Kiểm tra dữ liệu gửi lên (`dishIds`: mã các món đang có); trả về lỗi (tiếng Việt) hoặc dữ liệu đã chuẩn hóa */
export function parseSpot(x: unknown, dishIds: Set<string>): SpotInput | string {
  const o = (x ?? {}) as Record<string, unknown>
  const name = typeof o.name === "string" ? o.name.trim() : ""
  if (!name || name.length > 120) return "Tên điểm phải có 1–120 ký tự"
  const at = o.at
  if (!Array.isArray(at) || at.length !== 2) return "Thiếu tọa độ"
  const [lat, lng] = at.map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return "Tọa độ không hợp lệ"
  const dishes = Array.isArray(o.dishes) ? [...new Set(o.dishes.filter((d): d is string => typeof d === "string"))] : []
  if (dishes.length === 0) return "Chọn ít nhất 1 món"
  if (dishes.length > 30 || dishes.some((d) => !dishIds.has(d))) return "Danh sách món không hợp lệ"
  return { name, at: [lat, lng], dishes }
}

/* ---------- Lưu trong file ---------- */

// Không giữ bản sao trong bộ nhớ: mỗi route của Next là một bản đóng gói riêng, bản sao sẽ lệch nhau.
async function load(): Promise<FoodSpot[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as FoodSpot[]
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(FOOD_SPOTS)
    throw e
  }
}

let queue: Promise<unknown> = Promise.resolve()

/** Đọc - sửa - ghi lần lượt từng thao tác; ghi tạm rồi đổi tên để không hỏng file. Ghi lỗi thì báo lỗi lên API. */
function edit<T>(fn: (all: FoodSpot[]) => T): Promise<T> {
  const run = queue.then(async () => {
    const all = await load()
    const out = fn(all)
    await fs.mkdir(path.dirname(FILE), { recursive: true })
    await fs.writeFile(FILE + ".tmp", JSON.stringify(all, null, 1))
    await fs.rename(FILE + ".tmp", FILE)
    return out
  })
  queue = run.catch(() => {})
  return run
}

/* ---------- Supabase ---------- */

type Row = { id: string; name: string; lat: number; lng: number; dishes: string[] }
const fromRow = (r: Row): FoodSpot => ({ id: r.id, name: r.name, at: [r.lat, r.lng], dishes: r.dishes })
const toRow = (id: string, s: SpotInput): Row => ({ id, name: s.name, lat: s.at[0], lng: s.at[1], dishes: s.dishes })

/* ---------- API dùng chung ---------- */

export async function listSpots(): Promise<FoodSpot[]> {
  if (USE_SUPABASE) {
    const res = await sb("food_spots?select=*&order=lat.desc")
    if (!res.ok) await sbFail(res, "đọc điểm ẩm thực")
    return ((await res.json()) as Row[]).map(fromRow)
  }
  return load()
}

export async function createSpot(s: SpotInput): Promise<FoodSpot> {
  if (!USE_SUPABASE) {
    return edit((all) => {
      const spot = { id: makeId(s.name, new Set(all.map((x) => x.id))), ...s }
      all.push(spot)
      return spot
    })
  }
  const id = makeId(s.name, new Set((await listSpots()).map((x) => x.id)))
  const res = await sb("food_spots", { method: "POST", body: toRow(id, s), prefer: "return=minimal" })
  if (!res.ok) await sbFail(res, "thêm điểm ẩm thực")
  return { id, ...s }
}

/** false nếu không có điểm `id` */
export async function updateSpot(id: string, s: SpotInput): Promise<boolean> {
  if (USE_SUPABASE) {
    const { id: _, ...row } = toRow(id, s)
    const res = await sb(`food_spots?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: row, prefer: "return=representation" })
    if (!res.ok) await sbFail(res, "sửa điểm ẩm thực")
    return ((await res.json()) as Row[]).length > 0
  }
  return edit((all) => {
    const i = all.findIndex((x) => x.id === id)
    if (i >= 0) all[i] = { id, ...s }
    return i >= 0
  })
}

/** false nếu không có điểm `id` */
export async function deleteSpot(id: string): Promise<boolean> {
  if (USE_SUPABASE) {
    const res = await sb(`food_spots?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", prefer: "return=representation" })
    if (!res.ok) await sbFail(res, "xóa điểm ẩm thực")
    return ((await res.json()) as Row[]).length > 0
  }
  return edit((all) => {
    const i = all.findIndex((x) => x.id === id)
    if (i >= 0) all.splice(i, 1)
    return i >= 0
  })
}
