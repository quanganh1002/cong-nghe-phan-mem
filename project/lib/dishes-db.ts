import { promises as fs } from "node:fs"
import path from "node:path"
import { CATEGORIES, DISHES, REGIONS, makeId, type Dish, type DishText } from "./dishes"
import { USE_SUPABASE, sb, sbFail } from "./supabase"

/**
 * Món ăn do admin thêm/sửa/xóa. Có Supabase thì lưu ở bảng dishes (xem supabase/schema.sql, mỗi món là một
 * cột jsonb); không thì lưu vào data/dishes.json. Bảng/file còn trống thì nạp DISHES trong lib/dishes.ts.
 */
const FILE = path.join(process.cwd(), "data", "dishes.json")
const TEXT_FIELDS: (keyof DishText)[] = ["name", "summary", "origin", "culture", "ingredients", "tip"]
const CACHE_MS = 10_000

export type DishInput = Omit<Dish, "id">

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")

/** Kiểm tra dữ liệu gửi lên; trả về lỗi (tiếng Việt) hoặc món đã chuẩn hóa (chưa có id) */
export function parseDish(x: unknown): DishInput | string {
  const o = (x ?? {}) as Record<string, unknown>
  const region = REGIONS.find((r) => r === o.region)
  if (!region) return "Vùng miền không hợp lệ"
  const category = CATEGORIES.find((c) => c.key === o.category)?.key
  if (!category) return "Loại món không hợp lệ"
  const emoji = str(o.emoji)
  if (!emoji || emoji.length > 16) return "Cần một emoji (tối đa 16 ký tự)"
  const image = str(o.image)
  // Ảnh trong public/foods hoặc ảnh https bên ngoài; không cho javascript:, data:...
  if (image && (image.length > 500 || !/^(\/foods\/[\w./-]+|https:\/\/\S+)$/.test(image) || image.includes("..")))
    return "Ảnh phải là đường dẫn /foods/... hoặc https://..."

  const text = (lang: "vi" | "en"): DishText | string => {
    const t = (o[lang] ?? {}) as Record<string, unknown>
    const out = {} as DishText
    for (const f of TEXT_FIELDS) {
      const v = str(t[f])
      const max = f === "name" ? 120 : 4000
      if (!v || v.length > max) return `${lang === "vi" ? "Tiếng Việt" : "Tiếng Anh"}: mục "${f}" phải có 1–${max} ký tự`
      out[f] = v
    }
    return out
  }
  const vi = text("vi")
  if (typeof vi === "string") return vi
  const en = text("en")
  if (typeof en === "string") return en

  const dish: DishInput = { region, category, emoji, vi, en }
  if (image) dish.image = image
  if (o.popular === true) dish.popular = true
  const place = str(o.place)
  if (place.length > 120) return "Địa điểm tối đa 120 ký tự"
  if (place) dish.place = place
  if (o.at != null) {
    const at = Array.isArray(o.at) && o.at.length === 2 ? o.at.map(Number) : []
    if (at.length !== 2 || !at.every(Number.isFinite) || Math.abs(at[0]) > 90 || Math.abs(at[1]) > 180) return "Tọa độ không hợp lệ"
    dish.at = [at[0], at[1]]
  }
  return dish
}

/* ---------- Lưu trong file ---------- */

// Không giữ bản sao trong bộ nhớ: Next đóng gói route API và trang thành các bản riêng, bản sao sẽ lệch nhau.
async function loadFile(): Promise<Dish[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Dish[]
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(DISHES)
    throw e
  }
}

let queue: Promise<unknown> = Promise.resolve()

/** Đọc - sửa - ghi lần lượt từng thao tác; ghi tạm rồi đổi tên để không hỏng file. Ghi lỗi thì báo lỗi lên API. */
function editFile<T>(fn: (all: Dish[]) => T): Promise<T> {
  const run = queue.then(async () => {
    const all = await loadFile()
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

async function loadSupabase(): Promise<Dish[]> {
  const res = await sb("dishes?select=id,data&order=position.asc")
  if (!res.ok) await sbFail(res, "đọc món ăn")
  let dishes = ((await res.json()) as { id: string; data: DishInput }[]).map((r) => ({ ...r.data, id: r.id }))
  if (dishes.length === 0) {
    // bảng mới tạo: nạp món mặc định (chạy song song cũng không sao nhờ bỏ qua trùng khóa)
    const rows = DISHES.map(({ id, ...data }, position) => ({ id, position, data }))
    const ins = await sb("dishes", { method: "POST", body: rows, prefer: "resolution=ignore-duplicates,return=minimal" })
    if (!ins.ok) await sbFail(ins, "nạp món mặc định")
    dishes = DISHES
  }
  return dishes
}

/* ---------- API dùng chung ---------- */

/** Luôn đọc mới (trang và admin cần thấy ngay thay đổi) */
export const listDishes = (): Promise<Dish[]> => (USE_SUPABASE ? loadSupabase() : loadFile())

// Kiểm tra mã món của heartbeat/lượt nghe (vài giây một lần mỗi khách): dùng bản đọc trong 10 giây gần nhất
let cache: { at: number; dishes: Dish[] } | null = null
export async function findDish(id: string): Promise<Dish | undefined> {
  if (!cache || Date.now() - cache.at > CACHE_MS) cache = { at: Date.now(), dishes: await listDishes() }
  return cache.dishes.find((d) => d.id === id) ?? (await listDishes()).find((d) => d.id === id) // món vừa thêm
}

export async function createDish(d: DishInput): Promise<Dish> {
  if (!USE_SUPABASE) {
    return editFile((all) => {
      const dish: Dish = { id: makeId(d.vi.name, new Set(all.map((x) => x.id))), ...d }
      all.push(dish)
      return dish
    })
  }
  const all = await loadSupabase()
  const dish: Dish = { id: makeId(d.vi.name, new Set(all.map((x) => x.id))), ...d }
  const res = await sb("dishes", { method: "POST", body: { id: dish.id, position: all.length + 1000, data: d }, prefer: "return=minimal" })
  if (!res.ok) await sbFail(res, "thêm món")
  return dish
}

/** false nếu không có món `id` */
export async function updateDish(id: string, d: DishInput): Promise<boolean> {
  if (!USE_SUPABASE) {
    return editFile((all) => {
      const i = all.findIndex((x) => x.id === id)
      if (i >= 0) all[i] = { id, ...d }
      return i >= 0
    })
  }
  const res = await sb(`dishes?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { data: d }, prefer: "return=representation" })
  if (!res.ok) await sbFail(res, "sửa món")
  return ((await res.json()) as unknown[]).length > 0
}

/** "missing" nếu không có món, "last" nếu là món cuối cùng (bảng trống sẽ bị nạp lại món mặc định) */
export async function deleteDish(id: string): Promise<true | "missing" | "last"> {
  if (!USE_SUPABASE) {
    return editFile((all) => {
      const i = all.findIndex((x) => x.id === id)
      if (i < 0) return "missing" as const
      if (all.length === 1) return "last" as const
      all.splice(i, 1)
      return true as const
    })
  }
  const all = await loadSupabase()
  if (!all.some((x) => x.id === id)) return "missing"
  if (all.length === 1) return "last"
  const res = await sb(`dishes?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", prefer: "return=minimal" })
  if (!res.ok) await sbFail(res, "xóa món")
  return true
}
