import { promises as fs } from "fs"
import path from "path"
import { FOODS, type Food } from "./foods"
import { STORAGE, sb, sbFail } from "./orders-db"

/**
 * Món do admin thêm/sửa — lưu cùng chỗ với đơn hàng (Supabase bảng foods, hoặc file data/foods.json).
 * Mỗi dòng là 1 món ĐẦY ĐỦ; trùng id với món trong lib/foods.ts thì bản trong DB thắng,
 * id mới thì là món thêm. Xóa món = ẩn (hidden) để đơn cũ vẫn tra được.
 */

const FILE = path.join(process.cwd(), "data", "foods.json")

async function loadFile(): Promise<Record<string, Food>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"))
  } catch {
    return {}
  }
}

async function loadSaved(): Promise<Food[]> {
  if (STORAGE === "file") return Object.values(await loadFile())
  const res = await sb("foods?select=data&limit=1000")
  if (!res.ok) await sbFail(res, "đọc món ăn")
  return ((await res.json()) as { data: Food }[]).map((r) => r.data)
}

/** Toàn bộ món (kể cả món đã ẩn): menu gốc + phần admin đã chỉnh */
export async function listAllFoods(): Promise<Food[]> {
  const saved = await loadSaved().catch(() => [] as Food[]) // DB lỗi thì vẫn bán được menu gốc
  const byId = new Map(saved.map((f) => [f.id, f]))
  const merged = FOODS.map((f) => byId.get(f.id) ?? f)
  const known = new Set(FOODS.map((f) => f.id))
  return [...merged, ...saved.filter((f) => !known.has(f.id))]
}

export async function findFood(id: string): Promise<Food | undefined> {
  return (await listAllFoods()).find((f) => f.id === id)
}

// Ghi file lần lượt để 2 lần lưu cùng lúc không đè nhau
let queue: Promise<unknown> = Promise.resolve()

export async function saveFood(food: Food): Promise<void> {
  if (STORAGE === "file") {
    const run = queue.then(async () => {
      const all = await loadFile()
      all[food.id] = food
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      await fs.writeFile(`${FILE}.tmp`, JSON.stringify(all, null, 2), "utf8")
      await fs.rename(`${FILE}.tmp`, FILE)
    })
    queue = run.catch(() => {})
    return run
  }
  const res = await sb("foods", {
    method: "POST",
    body: { id: food.id, data: food, updated_at: new Date().toISOString() },
    prefer: "resolution=merge-duplicates",
  })
  if (!res.ok) await sbFail(res, "lưu món ăn")
}

/** Tên bucket Supabase Storage chứa ảnh món (tạo bởi supabase/schema.sql) */
const BUCKET = "foods"
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").trim().replace(/\/+$/, "")
const SUPABASE_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()

export const IMAGE_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`

/** Lưu ảnh món, trả về đường dẫn dùng được trong <Image src>. Supabase: Storage; chạy máy cá nhân: public/foods/ */
export async function saveFoodImage(name: string, bytes: Buffer, contentType: string): Promise<string> {
  if (STORAGE === "file") {
    const dir = path.join(process.cwd(), "public", "foods")
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, name), bytes)
    return `/foods/${name}`
  }
  const headers: Record<string, string> = { apikey: SUPABASE_KEY, "Content-Type": contentType, "x-upsert": "true" }
  if (!SUPABASE_KEY.startsWith("sb_")) headers.Authorization = `Bearer ${SUPABASE_KEY}`
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`, {
    method: "POST",
    headers,
    body: new Uint8Array(bytes),
  })
  if (!res.ok) await sbFail(res, "tải ảnh món")
  return IMAGE_URL_PREFIX + name
}
