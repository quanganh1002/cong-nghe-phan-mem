import type { ShopOrder } from "./orders-db"

/**
 * Tính toàn bộ số liệu cho trang thống kê.
 * Chỉ tính đơn đã "Hoàn thành" (status = completed) vào doanh thu.
 * Mọi mốc thời gian theo giờ của máy đang mở trang (giờ Việt Nam).
 */

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "month" | "lastMonth" | "all" | "custom"

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  "7d": "7 ngày",
  "30d": "30 ngày",
  month: "Tháng này",
  lastMonth: "Tháng trước",
  all: "Tất cả",
  custom: "Tùy chọn",
}

export const PAYMENT_LABELS: Record<string, string> = {
  qr: "Chuyển khoản QR",
  bank: "Chuyển khoản",
  wallet: "MoMo / ZaloPay",
  cod: "Tiền mặt",
}

export const STATUS_LABELS: Record<string, string> = {
  ordered: "Đơn mới",
  confirmed: "Đã nhận",
  preparing: "Đang làm",
  delivering: "Đang mang ra",
  completed: "Hoàn thành",
  cancelled: "Đã từ chối",
}

export const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
export const fromInputDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}
export const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

/** [bắt đầu, kết thúc) của khoảng thời gian đang chọn */
export function rangeBounds(key: RangeKey, now: Date, orders: ShopOrder[], from?: string, to?: string): [Date, Date] {
  const today = day0(now)
  switch (key) {
    case "today":
      return [today, addDays(today, 1)]
    case "yesterday":
      return [addDays(today, -1), today]
    case "7d":
      return [addDays(today, -6), addDays(today, 1)]
    case "30d":
      return [addDays(today, -29), addDays(today, 1)]
    case "month":
      return [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 1)]
    case "lastMonth":
      return [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 1)]
    case "all": {
      const first = orders.reduce((min, o) => Math.min(min, new Date(o.createdAt).getTime()), today.getTime())
      return [day0(new Date(first)), addDays(today, 1)]
    }
    case "custom": {
      let a = (from && fromInputDate(from)) || today
      let b = (to && fromInputDate(to)) || today
      if (a > b) [a, b] = [b, a]
      return [a, addDays(b, 1)]
    }
  }
}

type Agg = { count: number; revenue: number }
const agg = (): Agg => ({ count: 0, revenue: 0 })

export type Stats = ReturnType<typeof computeStats>

export function computeStats(orders: ShopOrder[], start: Date, end: Date, compare: boolean) {
  const s = start.getTime()
  const e = end.getTime()
  const len = e - s
  const time = (o: ShopOrder) => new Date(o.createdAt).getTime()

  const inRange = orders.filter((o) => time(o) >= s && time(o) < e)
  const done = inRange.filter((o) => o.status === "completed")
  const unfinished = inRange.filter((o) => o.status !== "completed" && o.status !== "cancelled")
  const cancelled = inRange.filter((o) => o.status === "cancelled")
  const prev = compare ? orders.filter((o) => o.status === "completed" && time(o) >= s - len && time(o) < s) : []

  const sum = (list: ShopOrder[]) => list.reduce((t, o) => t + o.total, 0)
  const qty = (list: ShopOrder[]) => list.reduce((t, o) => t + o.items.reduce((q, i) => q + i.quantity, 0), 0)

  const revenue = sum(done)
  const prevRevenue = sum(prev)
  const pct = (cur: number, before: number) => (compare && before > 0 ? ((cur - before) / before) * 100 : null)

  const summary = {
    revenue,
    orders: done.length,
    avg: done.length ? revenue / done.length : 0,
    items: qty(done),
    revenueDelta: pct(revenue, prevRevenue),
    ordersDelta: pct(done.length, prev.length),
    avgDelta: pct(done.length ? revenue / done.length : 0, prev.length ? prevRevenue / prev.length : 0),
    itemsDelta: pct(qty(done), qty(prev)),
    unfinished: unfinished.length,
    unfinishedValue: sum(unfinished),
    cancelled: cancelled.length,
    cancelledValue: sum(cancelled),
  }

  // Doanh thu theo ngày (khoảng dài hơn 62 ngày thì gộp theo tháng)
  const today1 = addDays(day0(new Date()), 1)
  const chartEnd = new Date(Math.min(e, Math.max(today1.getTime(), s + 86400000)))
  const byMonth = len > 62 * 86400000
  const timeline: { key: string; label: string; title: string; revenue: number; count: number }[] = []
  const index = new Map<string, number>()
  if (byMonth) {
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d < chartEnd; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const key = `${d.getFullYear()}-${d.getMonth()}`
      index.set(key, timeline.length)
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`
      timeline.push({ key, label, title: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`, revenue: 0, count: 0 })
    }
  } else {
    for (let d = new Date(start); d < chartEnd; d = addDays(d, 1)) {
      const key = toInputDate(d)
      index.set(key, timeline.length)
      timeline.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, title: fmtDate(d), revenue: 0, count: 0 })
    }
  }

  const dishes = new Map<string, { qty: number; revenue: number; orders: number }>()
  const payments = new Map<string, Agg>()
  const tables = new Map<string, Agg>()
  const kind = { dineIn: agg(), delivery: agg() }
  const hours = Array.from({ length: 24 }, agg)
  const weekdays = Array.from({ length: 7 }, agg)

  for (const o of done) {
    const d = new Date(o.createdAt)
    const key = byMonth ? `${d.getFullYear()}-${d.getMonth()}` : toInputDate(d)
    const ti = index.get(key)
    if (ti !== undefined) {
      timeline[ti].revenue += o.total
      timeline[ti].count++
    }

    for (const it of o.items) {
      const x = dishes.get(it.foodId) ?? { qty: 0, revenue: 0, orders: 0 }
      x.qty += it.quantity
      x.revenue += it.quantity * it.unitPrice
      x.orders++
      dishes.set(it.foodId, x)
    }

    const p = payments.get(o.payment) ?? agg()
    p.count++
    p.revenue += o.total
    payments.set(o.payment, p)

    const k = o.table ? kind.dineIn : kind.delivery
    k.count++
    k.revenue += o.total

    if (o.table) {
      const t = tables.get(o.table) ?? agg()
      t.count++
      t.revenue += o.total
      tables.set(o.table, t)
    }

    hours[d.getHours()].count++
    hours[d.getHours()].revenue += o.total
    const wd = (d.getDay() + 6) % 7 // T2 = 0 ... CN = 6
    weekdays[wd].count++
    weekdays[wd].revenue += o.total
  }

  const dishTotal = [...dishes.values()].reduce((t, d) => t + d.revenue, 0)
  const peakHour = hours.reduce((best, h, i) => (h.count > hours[best].count ? i : best), 0)

  return {
    summary,
    timeline,
    byMonth,
    dishes: [...dishes.entries()]
      .map(([foodId, v]) => ({ foodId, ...v, share: dishTotal ? v.revenue / dishTotal : 0 }))
      .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue),
    payments: [...payments.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.revenue - a.revenue),
    kind,
    tables: [...tables.entries()]
      .map(([table, v]) => ({ table, ...v }))
      .sort((a, b) => a.table.localeCompare(b.table, "vi", { numeric: true })),
    hours,
    peakHour: hours[peakHour].count ? peakHour : null,
    weekdays,
    inRange, // để xuất Excel
    done,
  }
}
