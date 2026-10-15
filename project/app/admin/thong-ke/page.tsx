"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Clock,
  CreditCard,
  Download,
  Hourglass,
  LayoutGrid,
  Receipt,
  RefreshCw,
  ShoppingBasket,
  TrendingDown,
  TrendingUp,
  Trophy,
  UtensilsCrossed,
  Wallet,
} from "lucide-react"
import { getFood, formatPrice } from "@/lib/foods"
import { cn } from "@/lib/utils"
import type { ShopOrder } from "@/lib/orders-db"
import { readPin, writePin } from "@/lib/admin-pin"
import { PinForm } from "@/components/admin-pin-form"
import { downloadXlsx, type Cell } from "@/lib/xlsx-lite"
import {
  PAYMENT_LABELS,
  RANGE_LABELS,
  STATUS_LABELS,
  WEEKDAYS,
  addDays,
  computeStats,
  fmtDate,
  rangeBounds,
  toInputDate,
  type RangeKey,
  type Stats,
} from "@/lib/order-stats"

/**
 * Trang thống kê doanh thu: http://localhost:3000/admin/thong-ke
 * Dùng chung mã PIN với trang bếp /admin.
 */

const RANGES: RangeKey[] = ["today", "yesterday", "7d", "30d", "month", "lastMonth", "all", "custom"]
const dishName = (id: string) => getFood(id)?.t.vi.name ?? id
const short = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".0", "")}tr` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)

export default function StatsPage() {
  const [pin, setPin] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState("")
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [range, setRange] = useState<RangeKey>("7d")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setPin(readPin())
    const d = new Date()
    setNow(d)
    setFrom(toInputDate(addDays(d, -6)))
    setTo(toInputDate(d))
  }, [])

  const load = useCallback(async () => {
    if (!pin) return
    setLoading(true)
    try {
      const res = await fetch("/api/orders?all=1", { headers: { "x-admin-pin": pin }, cache: "no-store" })
      if (res.status === 401) {
        writePin("")
        setAuthed(false)
        setPinError("Sai mã PIN")
        setPin("")
        return
      }
      if (!res.ok) throw new Error()
      setOrders((await res.json()) as ShopOrder[])
      setAuthed(true)
      setError("")
      setNow(new Date())
    } catch {
      setError("Không tải được dữ liệu — kiểm tra máy đang chạy npm run dev")
    } finally {
      setLoading(false)
    }
  }, [pin])

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000) // tự làm mới mỗi phút
    return () => clearInterval(id)
  }, [load])

  const [start, end] = useMemo(
    () => (now ? rangeBounds(range, now, orders, from, to) : [new Date(0), new Date(0)]),
    [range, now, orders, from, to],
  )
  const stats = useMemo(() => computeStats(orders, start, end, range !== "all"), [orders, start, end, range])

  if (pin === null || now === null) return null
  if (!pin) {
    return (
      <PinForm
        title="Thống kê"
        error={pinError}
        onSubmit={(p) => {
          writePin(p)
          setPinError("")
          setPin(p)
        }}
      />
    )
  }
  if (!authed && loading) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Đang tải…</main>
  }

  const periodText =
    range === "today" || range === "yesterday" || addDays(start, 1).getTime() === end.getTime()
      ? fmtDate(start)
      : `${fmtDate(start)} – ${fmtDate(addDays(end, -1))}`

  const s = stats.summary
  const empty = stats.done.length === 0

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-5">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          aria-label="Về trang bếp"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="me-auto">
          <h1 className="text-2xl font-extrabold">Thống kê doanh thu</h1>
          <p className="text-sm text-muted-foreground">
            {periodText} · chỉ tính đơn đã hoàn thành
          </p>
        </div>
        <button
          onClick={() => exportExcel(stats, start, end)}
          disabled={stats.inRange.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-chart-3 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Download className="size-4" />
          Xuất Excel
        </button>
        <button
          onClick={load}
          aria-label="Tải lại"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-transform active:scale-90"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </button>
      </header>

      {error && <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive">{error}</p>}

      {/* Chọn khoảng thời gian */}
      <nav className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              range === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </nav>
      {range === "custom" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <CalendarDays className="size-4 text-muted-foreground" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 outline-none focus:border-primary" />
          <span className="text-muted-foreground">đến</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 outline-none focus:border-primary" />
        </div>
      )}

      {/* Thẻ tổng quan */}
      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Doanh thu" value={formatPrice(s.revenue)} delta={s.revenueDelta} highlight />
        <StatCard icon={Receipt} label="Số đơn" value={String(s.orders)} delta={s.ordersDelta} />
        <StatCard icon={ShoppingBasket} label="TB mỗi đơn" value={formatPrice(Math.round(s.avg))} delta={s.avgDelta} />
        <StatCard icon={UtensilsCrossed} label="Món đã bán" value={String(s.items)} delta={s.itemsDelta} />
      </section>
      {range !== "all" && (
        <p className="mt-2 text-xs text-muted-foreground">% so với khoảng thời gian dài bằng ngay trước đó.</p>
      )}
      {s.unfinished > 0 && (
        <p className="mt-2 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          <Hourglass className="size-4 shrink-0" />
          Còn {s.unfinished} đơn chưa hoàn thành ({formatPrice(s.unfinishedValue)}) — chưa tính vào doanh thu.
        </p>
      )}

      {empty ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
          <Receipt className="size-12 opacity-40" />
          <p className="font-semibold">Chưa có đơn hoàn thành trong khoảng này</p>
          <p className="max-w-sm text-sm">Đơn chỉ được tính khi ở trang bếp bấm “Hoàn thành”. Thử chọn khoảng thời gian khác.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Biểu đồ doanh thu */}
          <Panel icon={TrendingUp} title={stats.byMonth ? "Doanh thu theo tháng" : "Doanh thu theo ngày"} className="lg:col-span-3">
            <Bars
              height={220}
              data={stats.timeline.map((t) => ({
                label: t.label,
                value: t.revenue,
                title: `${t.title}: ${formatPrice(t.revenue)} · ${t.count} đơn`,
              }))}
            />
          </Panel>

          {/* Món bán chạy */}
          <Panel icon={Trophy} title="Món bán chạy" className="lg:col-span-2">
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="w-8 px-1 pb-2 font-semibold">#</th>
                    <th className="px-1 pb-2 font-semibold">Món</th>
                    <th className="px-1 pb-2 text-right font-semibold">SL</th>
                    <th className="px-1 pb-2 text-right font-semibold">Doanh thu</th>
                    <th className="w-28 px-1 pb-2 font-semibold">Tỉ trọng</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dishes.slice(0, 15).map((d, i) => (
                    <tr key={d.foodId} className="border-t border-border">
                      <td className="px-1 py-2">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-full text-xs font-extrabold",
                            i === 0 ? "bg-amber-400 text-amber-950" : i === 1 ? "bg-zinc-300 text-zinc-800" : i === 2 ? "bg-orange-300 text-orange-950" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-1 py-2 font-semibold">{dishName(d.foodId)}</td>
                      <td className="px-1 py-2 text-right font-bold tabular-nums">{d.qty}</td>
                      <td className="px-1 py-2 text-right tabular-nums">{formatPrice(d.revenue)}</td>
                      <td className="px-1 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${d.share * 100}%` }} />
                          </div>
                          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{Math.round(d.share * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stats.dishes.length > 15 && (
              <p className="mt-2 text-xs text-muted-foreground">Còn {stats.dishes.length - 15} món khác — xem đủ trong file Excel.</p>
            )}
          </Panel>

          <div className="space-y-4">
            {/* Tại bàn / giao hàng */}
            <Panel icon={UtensilsCrossed} title="Tại bàn / Giao hàng">
              <HBars
                rows={[
                  { key: "in", label: "Tại bàn", icon: UtensilsCrossed, value: stats.kind.dineIn.revenue, sub: `${stats.kind.dineIn.count} đơn` },
                  { key: "out", label: "Giao hàng", icon: Bike, value: stats.kind.delivery.revenue, sub: `${stats.kind.delivery.count} đơn` },
                ]}
              />
            </Panel>

            {/* Thanh toán */}
            <Panel icon={CreditCard} title="Hình thức thanh toán">
              <HBars
                rows={stats.payments.map((p) => ({
                  key: p.key,
                  label: PAYMENT_LABELS[p.key] ?? p.key,
                  value: p.revenue,
                  sub: `${p.count} đơn`,
                }))}
              />
            </Panel>
          </div>

          {/* Giờ cao điểm */}
          <Panel
            icon={Clock}
            title="Giờ cao điểm"
            className="lg:col-span-2"
            extra={stats.peakHour !== null && <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Đông nhất: {stats.peakHour}h – {stats.peakHour + 1}h</span>}
          >
            <Bars
              height={160}
              labelEvery={3}
              data={stats.hours.map((h, i) => ({
                label: `${i}h`,
                value: h.count,
                title: `${i}h–${i + 1}h: ${h.count} đơn · ${formatPrice(h.revenue)}`,
              }))}
              format={(v) => `${v} đơn`}
            />
          </Panel>

          {/* Theo thứ */}
          <Panel icon={CalendarDays} title="Theo thứ trong tuần">
            <Bars
              height={160}
              data={stats.weekdays.map((w, i) => ({
                label: WEEKDAYS[i],
                value: w.revenue,
                title: `${WEEKDAYS[i]}: ${formatPrice(w.revenue)} · ${w.count} đơn`,
              }))}
            />
          </Panel>

          {/* Theo bàn */}
          <Panel icon={LayoutGrid} title="Theo bàn" className="lg:col-span-3">
            {stats.tables.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có đơn gọi tại bàn.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
                {stats.tables.map((t) => {
                  const max = Math.max(...stats.tables.map((x) => x.revenue))
                  return (
                    <div key={t.table} className="py-2">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-bold">Bàn {t.table}</span>
                        <span className="text-xs text-muted-foreground">{t.count} đơn</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(t.revenue / max) * 100}%` }} />
                      </div>
                      <p className="mt-0.5 text-xs font-semibold tabular-nums">{formatPrice(t.revenue)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* Các khối giao diện                                                   */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  highlight,
}: {
  icon: typeof Wallet
  label: string
  value: string
  delta: number | null
  highlight?: boolean
}) {
  const up = delta !== null && delta >= 0
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm",
        highlight ? "border-transparent bg-gradient-to-br from-primary to-chart-2 text-primary-foreground" : "border-border bg-card",
      )}
    >
      <p className={cn("flex items-center gap-1.5 text-xs font-semibold", highlight ? "text-white/85" : "text-muted-foreground")}>
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-1.5 truncate text-xl font-extrabold tabular-nums sm:text-2xl">{value}</p>
      {delta !== null && (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            highlight ? "bg-white/20" : up ? "bg-chart-3/15 text-chart-3" : "bg-destructive/10 text-destructive",
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {up ? "+" : ""}
          {delta.toFixed(Math.abs(delta) < 10 ? 1 : 0)}%
        </p>
      )}
    </div>
  )
}

function Panel({
  icon: Icon,
  title,
  extra,
  className,
  children,
}: {
  icon: typeof Wallet
  title: string
  extra?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="me-auto font-bold">{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  )
}

/** Biểu đồ cột đơn giản (rê chuột lên cột để xem số) */
function Bars({
  data,
  height = 180,
  labelEvery,
  format = (v) => formatPrice(v),
}: {
  data: { label: string; value: number; title: string }[]
  height?: number
  labelEvery?: number
  format?: (v: number) => string
}) {
  const max = Math.max(0, ...data.map((d) => d.value))
  const every = labelEvery ?? Math.max(1, Math.ceil(data.length / 12))
  const [active, setActive] = useState<number | null>(null)
  const shown = active !== null ? data[active] : null

  return (
    <div>
      <p className="mb-2 h-5 text-xs text-muted-foreground">
        {shown ? <b className="text-foreground">{shown.title}</b> : `Cao nhất: ${format(max)}`}
      </p>
      <div className="flex items-end gap-[3px] border-b border-border" style={{ height }} onMouseLeave={() => setActive(null)}>
        {data.map((d, i) => (
          <button
            key={i}
            type="button"
            title={d.title}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className="group flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            {d.value > 0 && data.length <= 16 && (
              <span className="mb-0.5 block truncate text-center text-[10px] font-semibold text-muted-foreground">{short(d.value)}</span>
            )}
            <span
              className={cn(
                "block w-full rounded-t-md transition-colors",
                d.value > 0 ? "bg-primary/75 group-hover:bg-primary" : "bg-muted",
                active === i && "bg-primary",
              )}
              style={{ height: max ? `${Math.max((d.value / max) * 88, d.value > 0 ? 2 : 1)}%` : "1%" }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {data.map((d, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground">
            {i % every === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Thanh ngang có % (cho thanh toán, tại bàn/giao hàng) */
function HBars({ rows }: { rows: { key: string; label: string; icon?: typeof Wallet; value: number; sub: string }[] }) {
  const total = rows.reduce((t, r) => t + r.value, 0)
  if (total === 0) return <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const Icon = r.icon
        const pct = (r.value / total) * 100
        return (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                {Icon && <Icon className="size-4 text-muted-foreground" />}
                {r.label}
              </span>
              <span className="font-bold tabular-nums">{Math.round(pct)}%</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatPrice(r.value)} · {r.sub}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Xuất Excel: 3 sheet — Tổng hợp, Đơn hàng, Chi tiết món               */
/* ------------------------------------------------------------------ */

function exportExcel(stats: Stats, start: Date, end: Date) {
  const last = addDays(end, -1)
  const s = stats.summary
  const time = (iso: string) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  const date = (iso: string) => fmtDate(new Date(iso))

  const summary: Cell[][] = [
    ["Chỉ số", "Giá trị"],
    ["Từ ngày", fmtDate(start)],
    ["Đến ngày", fmtDate(last)],
    ["Doanh thu (đơn hoàn thành)", s.revenue],
    ["Số đơn hoàn thành", s.orders],
    ["Trung bình mỗi đơn", Math.round(s.avg)],
    ["Số món đã bán", s.items],
    ["Đơn chưa hoàn thành", s.unfinished],
    ["Tiền đơn chưa hoàn thành", s.unfinishedValue],
    [],
    ["Món", "Số lượng", "Doanh thu", "Tỉ trọng (%)"],
    ...stats.dishes.map((d) => [dishName(d.foodId), d.qty, d.revenue, Math.round(d.share * 1000) / 10]),
    [],
    ["Thanh toán", "Số đơn", "Doanh thu"],
    ...stats.payments.map((p) => [PAYMENT_LABELS[p.key] ?? p.key, p.count, p.revenue]),
    [],
    ["Bàn", "Số đơn", "Doanh thu"],
    ...stats.tables.map((t) => [`Bàn ${t.table}`, t.count, t.revenue]),
  ]

  const ordersSheet: Cell[][] = [
    ["Mã đơn", "Ngày", "Giờ", "Trạng thái", "Hình thức", "Bàn", "Khách", "SĐT", "Địa chỉ", "Thanh toán", "Nội dung CK", "Số món", "Tổng tiền", "Ghi chú"],
    ...[...stats.inRange]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((o) => [
        o.id,
        date(o.createdAt),
        time(o.createdAt),
        STATUS_LABELS[o.status] ?? o.status,
        o.table ? "Tại bàn" : "Giao hàng",
        o.table ?? "",
        o.name,
        o.phone,
        o.table ? "" : o.address,
        PAYMENT_LABELS[o.payment] ?? o.payment,
        o.transferNote,
        o.items.reduce((q, i) => q + i.quantity, 0),
        o.total,
        o.note,
      ]),
  ]

  const itemsSheet: Cell[][] = [
    ["Mã đơn", "Ngày", "Giờ", "Bàn", "Món", "Số lượng", "Đơn giá", "Thành tiền", "Trạng thái"],
    ...[...stats.inRange]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .flatMap((o) =>
        o.items.map((it) => [
          o.id,
          date(o.createdAt),
          time(o.createdAt),
          o.table ?? "Giao hàng",
          dishName(it.foodId),
          it.quantity,
          it.unitPrice,
          it.quantity * it.unitPrice,
          STATUS_LABELS[o.status] ?? o.status,
        ]),
      ),
  ]

  downloadXlsx(`thong-ke_${toInputDate(start)}_den_${toInputDate(last)}.xlsx`, [
    { name: "Tổng hợp", rows: summary, colWidths: [30, 16, 16, 14] },
    { name: "Đơn hàng", rows: ordersSheet, colWidths: [10, 12, 8, 14, 12, 7, 18, 13, 30, 16, 14, 8, 13, 30] },
    { name: "Chi tiết món", rows: itemsSheet, colWidths: [10, 12, 8, 11, 28, 10, 12, 13, 14] },
  ])
}
