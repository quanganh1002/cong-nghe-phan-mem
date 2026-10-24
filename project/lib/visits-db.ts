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
  /** Số lượt bấm nghe thuyết minh */
  plays: number
  /** Số lượt nghe đến hết câu cuối */
  completes: number
}

/** Lượt xem trang món và lượt nghe theo từng ngôn ngữ */
export interface LangStats {
  views: number
  plays: number
  completes: number
}

/** Lượt nghe của từng món: tổng, trong đó bản tóm tắt, và số lần nghe hết */
export interface DishPlayStats {
  plays: number
  short: number
  completes: number
}

export interface VisitData {
  days: Record<string, DayStats>
  dishes: Record<string, number>
  dishPlays: Record<string, DishPlayStats>
  langs: Record<string, LangStats>
  /** Mức dùng tính năng phụ: "near_me", "near_listen", "glossary:<id>:term|meaning" */
  features: Record<string, number>
}

const FILE = path.join(process.cwd(), "data", "visits.json")
const KEEP_DAYS = 400

const empty = (): DayStats => ({ visits: 0, qr: 0, link: 0, views: 0, plays: 0, completes: 0 })
const emptyLang = (): LangStats => ({ views: 0, plays: 0, completes: 0 })
const emptyPlay = (): DishPlayStats => ({ plays: 0, short: 0, completes: 0 })

/** Ngày theo giờ Việt Nam (UTC+7), dạng yyyy-mm-dd */
export const vnDay = (ms = Date.now()) => new Date(ms + 7 * 3600_000).toISOString().slice(0, 10)

/* ---------- Lưu trong file ---------- */

let data: VisitData | null = null
let queue: Promise<void> = Promise.resolve()

async function load(): Promise<VisitData> {
  if (data) return data
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<VisitData>
    data = {
      days: raw.days ?? {},
      dishes: raw.dishes ?? {},
      dishPlays: {},
      langs: raw.langs ?? {},
      features: raw.features ?? {},
    }
    // file cũ chưa có các số liệu về lượt nghe; dishPlays cũ là số đơn giản
    for (const day of Object.values(data.days)) {
      day.plays ??= 0
      day.completes ??= 0
    }
    for (const l of Object.values(data.langs)) l.completes ??= 0
    for (const [id, v] of Object.entries(raw.dishPlays ?? {})) {
      const old = v as unknown
      data.dishPlays[id] =
        typeof old === "number" ? { plays: old, short: 0, completes: 0 } : { ...emptyPlay(), ...(old as Partial<DishPlayStats>) }
    }
  } catch {
    data = { days: {}, dishes: {}, dishPlays: {}, langs: {}, features: {} }
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

export async function recordDishView(dishId: string, lang: string): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_dish_view", { method: "POST", body: { p_day: vnDay(), p_dish: dishId, p_lang: lang } })
    if (!res.ok) await sbFail(res, "ghi lượt xem món")
    return
  }
  const d = await load()
  const day = (d.days[vnDay()] ??= empty())
  day.views++
  d.dishes[dishId] = (d.dishes[dishId] ?? 0) + 1
  if (lang) (d.langs[lang] ??= emptyLang()).views++
  save(d)
}

/** Khách bấm nghe thuyết minh một món (short = bản tóm tắt) */
export async function recordPlay(dishId: string, lang: string, short: boolean): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_play", { method: "POST", body: { p_day: vnDay(), p_dish: dishId, p_lang: lang, p_short: short } })
    if (!res.ok) await sbFail(res, "ghi lượt nghe")
    return
  }
  const d = await load()
  const day = (d.days[vnDay()] ??= empty())
  day.plays++
  const p = (d.dishPlays[dishId] ??= emptyPlay())
  p.plays++
  if (short) p.short++
  if (lang) (d.langs[lang] ??= emptyLang()).plays++
  save(d)
}

/** Khách nghe đến hết câu cuối của bài thuyết minh */
export async function recordComplete(dishId: string, lang: string): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_complete", { method: "POST", body: { p_day: vnDay(), p_dish: dishId, p_lang: lang } })
    if (!res.ok) await sbFail(res, "ghi lượt nghe hết")
    return
  }
  const d = await load()
  const day = (d.days[vnDay()] ??= empty())
  day.completes++
  ;(d.dishPlays[dishId] ??= emptyPlay()).completes++
  if (lang) (d.langs[lang] ??= emptyLang()).completes++
  save(d)
}

/** Một lần dùng tính năng phụ (đã được route kiểm tra khóa hợp lệ) */
export async function recordFeature(key: string): Promise<void> {
  if (USE_SUPABASE) {
    const res = await sb("rpc/record_feature", { method: "POST", body: { p_key: key } })
    if (!res.ok) await sbFail(res, "ghi lượt dùng tính năng")
    return
  }
  const d = await load()
  d.features[key] = (d.features[key] ?? 0) + 1
  save(d)
}
export async function readVisits(): Promise<VisitData> {
  if (!USE_SUPABASE) return load()
  const [daysRes, dishesRes, langsRes, featuresRes] = await Promise.all([
    sb(`visit_days?select=day,visits,qr,link,views,plays,completes&order=day.desc&limit=${KEEP_DAYS}`),
    sb("dish_views?select=dish_id,views,plays,plays_short,completes"),
    sb("lang_stats?select=lang,views,plays,completes"),
    sb("feature_uses?select=feature,uses"),
  ])
  if (!daysRes.ok) await sbFail(daysRes, "đọc thống kê")
  if (!dishesRes.ok) await sbFail(dishesRes, "đọc lượt xem món")
  if (!langsRes.ok) await sbFail(langsRes, "đọc thống kê ngôn ngữ")
  if (!featuresRes.ok) await sbFail(featuresRes, "đọc lượt dùng tính năng")
  const days: Record<string, DayStats> = {}
  for (const r of (await daysRes.json()) as ({ day: string } & DayStats)[]) {
    days[r.day] = { visits: r.visits, qr: r.qr, link: r.link, views: r.views, plays: r.plays, completes: r.completes }
  }
  const dishes: Record<string, number> = {}
  const dishPlays: Record<string, DishPlayStats> = {}
  for (const r of (await dishesRes.json()) as { dish_id: string; views: number; plays: number; plays_short: number; completes: number }[]) {
    dishes[r.dish_id] = r.views
    dishPlays[r.dish_id] = { plays: r.plays, short: r.plays_short, completes: r.completes }
  }
  const langs: Record<string, LangStats> = {}
  for (const r of (await langsRes.json()) as ({ lang: string } & LangStats)[]) {
    langs[r.lang] = { views: r.views, plays: r.plays, completes: r.completes }
  }
  const features: Record<string, number> = {}
  for (const r of (await featuresRes.json()) as { feature: string; uses: number }[]) features[r.feature] = r.uses
  return { days, dishes, dishPlays, langs, features }
}