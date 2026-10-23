import { promises as fs } from "node:fs"
import path from "node:path"
import type { Source } from "./presence-db"
import { USE_SUPABASE, sb, sbFail } from "./supabase"

/**
 * Bộ đếm lượt truy cập. Có Supabase thì lưu ở các bảng visit_days / dish_views (xem supabase/schema.sql);
 * không thì lưu vào data/visits.json (ghi tuần tự, ghi tạm rồi đổi tên). Nếu không ghi được file
 * (host chỉ đọc) thì vẫn đếm trong bộ nhớ cho tới khi tiến trình khởi động lại.
 */
export interface DayStats {
  /** Số lượt vào web (mỗi tab mới là 1 lượt) */
  visits: number
  qr: number
  link: number
  /** Số lượt xem trang món ăn */
  views: number
}

export interface VisitData {
  days: Record<string, DayStats>
  dishes: Record<string, number>
}

const FILE = path.join(process.cwd(), "data", "visits.json")
const KEEP_DAYS = 400

const empty = (): DayStats => ({ visits: 0, qr: 0, link: 0, views: 0 })

/** Ngày theo giờ Việt Nam (UTC+7), dạng yyyy-mm-dd */
export const vnDay = (ms = Date.now()) => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10)

/* ---------- Lưu trong file ---------- */

let data: VisitData | null = null
let queue: Promise<void> = Promise.resolve()

async function load(): Promise<VisitData> {
  if (data) return data
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<VisitData>
    data = { days: raw.days ?? {}, dishes: raw.dishes ?? {} }
  } catch {
    data = { days: {}, dishes: {} }
  }
  return data
}

function save(d: VisitData) {
  queue = queue
    .then(async () => {
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      const tmp = FILE + ".tmp"
      await fs.writeFile(tmp, JSON.stringify(d))
      await fs.rename(tmp, FILE)
    })
    .catch(() => {})
}

/* ---------- API dùng chung ---------- */

export async function recordVisit(source: Source): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_visit", { method: "POST", body: { p_day: vnDay(), p_source: source } })
    if (!res.ok) await sbFail(res, "ghi lượt truy cập")
    return
  }
  const d = await load()
  const day = (d.days[vnDay()] ??= empty())
  day.visits++
  day[source]++
  for (const k of Object.keys(d.days).sort().slice(0, -KEEP_DAYS)) delete d.days[k]
  save(d)
}

export async function recordDishView(dishId: string): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_dish_view", { method: "POST", body: { p_day: vnDay(), p_dish: dishId } })
    if (!res.ok) await sbFail(res, "ghi lượt xem món")
    return
  }
  const d = await load()
  const day = (d.days[vnDay()] ??= empty())
  day.views++
  d.dishes[dishId] = (d.dishes[dishId] ?? 0) + 1
  save(d)
}

export async function readVisits(): Promise<VisitData> {
  if (!USE_SUPABASE) return load()
  const [daysRes, dishesRes] = await Promise.all([
    sb(`visit_days?select=day,visits,qr,link,views&order=day.desc&limit=${KEEP_DAYS}`),
    sb("dish_views?select=dish_id,views"),
  ])
  if (!daysRes.ok) await sbFail(daysRes, "đọc thống kê")
  if (!dishesRes.ok) await sbFail(dishesRes, "đọc lượt xem món")
  const days: Record<string, DayStats> = {}
  for (const r of (await daysRes.json()) as ({ day: string } & DayStats)[]) {
    days[r.day] = { visits: r.visits, qr: r.qr, link: r.link, views: r.views }
  }
  const dishes: Record<string, number> = {}
  for (const r of (await dishesRes.json()) as { dish_id: string; views: number }[]) dishes[r.dish_id] = r.views
  return { days, dishes }
}
