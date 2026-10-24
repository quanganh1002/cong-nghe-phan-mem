"use client"

import { useState } from "react"
import { Eye, Globe, Headphones, Link2, MapPin, QrCode, TrendingUp, Trophy, Users } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { StatCard, langLabel } from "@/components/admin-ui"
import { usePresence, useStats, type DayRow, type StatsData } from "@/hooks/use-admin-data"
import { DISHES } from "@/lib/dishes"
import { GLOSSARY } from "@/lib/glossary"
import { cn } from "@/lib/utils"

/** Thống kê lượt truy cập: http://localhost:3000/admin/thong-ke (dùng chung PIN với /admin) */

const TOP_DISHES = 10

const pct = (n: number, of: number) => (of > 0 ? Math.min(100, Math.round((n / of) * 100)) : 0)

const dayLabel = (d: string) => `${d.slice(8)}/${d.slice(5, 7)}`

function Panel({ icon: Icon, title, children, className }: { icon: typeof Users; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/** Cột chồng: QR (đậm) + link (nhạt) cho mỗi ngày; rê chuột/bấm vào cột để xem số */
function VisitBars({ days }: { days: DayRow[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...days.map((d) => d.visits))
  const shown = active !== null ? days[active] : null
  return (
    <div>
      <p className="mb-2 h-5 text-xs text-muted-foreground">
        {shown ? (
          <b className="text-foreground">
            {dayLabel(shown.date)}: {shown.visits} lượt (QR {shown.qr} · link {shown.link}) · {shown.views} lượt xem món · {shown.plays} lượt nghe
          </b>
        ) : (
          `Nhiều nhất: ${max} lượt/ngày`
        )}
      </p>
      <div className="flex h-44 items-end gap-[3px] border-b border-border" onMouseLeave={() => setActive(null)}>
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={`${dayLabel(d.date)}: ${d.visits}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <span className="block w-full bg-primary/35" style={{ height: `${(d.link / max) * 92}%` }} />
            <span className="block w-full rounded-t-sm bg-primary" style={{ height: `${(d.qr / max) * 92}%` }} />
            {d.visits === 0 && <span className="block h-px w-full bg-muted" />}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {days.map((d, i) => (
          <span key={d.date} className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground">
            {i % 5 === 0 ? dayLabel(d.date) : ""}
          </span>
        ))}
      </div>
      <p className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" />Quét QR</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/35" />Mở link</span>
      </p>
    </div>
  )
}

function Dashboard({ stats, online }: { stats: StatsData; online: number | undefined }) {
  const [showAll, setShowAll] = useState(false)
  const { total, days } = stats
  const last7 = days.slice(-7).reduce((n, d) => n + d.visits, 0)
  const qrPct = total.visits ? Math.round((total.qr / total.visits) * 100) : 0
  const ranked = DISHES.map((d) => {
    const p = stats.dishPlays[d.id]
    return { dish: d, views: stats.dishes[d.id] ?? 0, plays: p?.plays ?? 0, completes: p?.completes ?? 0 }
  }).sort((a, b) => b.views - a.views || b.plays - a.plays)
  const topMax = Math.max(1, ranked[0]?.views ?? 0)
  const shownDishes = showAll ? ranked : ranked.slice(0, TOP_DISHES)
  const langs = Object.entries(stats.langs)
    .map(([code, s]) => ({ code, ...s }))
    .sort((a, b) => b.views + b.plays - (a.views + a.plays))
  const langMax = Math.max(1, ...langs.map((l) => l.views))
  const playsByDish = Object.values(stats.dishPlays)
  const shortPlays = playsByDish.reduce((n, p) => n + p.short, 0)
  const allPlays = playsByDish.reduce((n, p) => n + p.plays, 0)
  const feat = (prefix: string, suffix: string) =>
    Object.entries(stats.features)
      .filter(([k]) => k.startsWith(prefix) && k.endsWith(suffix))
      .reduce((n, [, v]) => n + v, 0)
  const topWords = GLOSSARY.map((g) => ({
    name: g.vi.name,
    n: (stats.features[`glossary:${g.id}:term`] ?? 0) + (stats.features[`glossary:${g.id}:meaning`] ?? 0),
  }))
    .filter((w) => w.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
  const listenPct = total.views ? Math.min(100, Math.round((total.plays / total.views) * 100)) : 0

  return (
    <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Đang online" value={online} />
        <StatCard icon={TrendingUp} label="Lượt vào 7 ngày qua" value={last7} />
        <StatCard icon={Users} label="Tổng lượt vào" value={total.visits} />
        <StatCard icon={Eye} label="Tổng lượt xem món" value={total.views} />
        <StatCard icon={Headphones} label="Tổng lượt nghe thuyết minh" value={total.plays} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel icon={TrendingUp} title="Lượt vào web 30 ngày gần nhất" className="lg:col-span-2">
          <VisitBars days={days} />
        </Panel>

        <Panel icon={QrCode} title="Khách vào bằng cách nào?">
          {total.visits === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-3">
              {[
                { label: "Quét mã QR", icon: QrCode, n: total.qr },
                { label: "Mở link", icon: Link2, n: total.link },
              ].map((r) => (
                <li key={r.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <r.icon className="size-4 text-muted-foreground" />
                      {r.label}
                    </span>
                    <span className="font-bold tabular-nums">{Math.round((r.n / total.visits) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.n / total.visits) * 100}%` }} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.n} lượt</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {qrPct}% khách đến từ mã QR (link có <code>?src=qr</code>, tạo ở mục Mã QR).
          </p>
        </Panel>

        <Panel icon={Globe} title="Ngôn ngữ được dùng" className="lg:col-span-3">
          {langs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
          ) : (
            <>
              <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {langs.map((l) => (
                  <li key={l.code} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 truncate font-semibold">{langLabel(l.code)}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(l.views / langMax) * 100}%` }} />
                    </span>
                    <span className="w-44 text-right text-xs tabular-nums text-muted-foreground">
                      <b className="text-sm text-foreground">{l.views}</b> xem · {l.plays} nghe
                      {l.plays > 0 && ` · ${pct(l.completes, l.plays)}% hết`}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Tính theo lượt xem trang món và lượt bấm nghe. Cứ 100 lượt xem món thì có khoảng {listenPct} lượt nghe thuyết minh.
              </p>
            </>
          )}
        </Panel>

        <Panel icon={Headphones} title="Khách nghe thế nào?">
          {allPlays === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lượt nghe nào.</p>
          ) : (
            <ul className="space-y-3">
              {[
                { label: "Bản tóm tắt", n: shortPlays },
                { label: "Bản đầy đủ", n: allPlays - shortPlays },
              ].map((r) => (
                <li key={r.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{r.label}</span>
                    <span className="font-bold tabular-nums">{pct(r.n, allPlays)}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct(r.n, allPlays)}%` }} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.n} lượt</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            <b className="text-foreground">{pct(total.completes, total.plays)}%</b> lượt nghe được nghe đến hết câu cuối ({total.completes}/{total.plays}).
            Chỉ tính khi khách bắt đầu từ câu đầu tiên.
          </p>
        </Panel>

        <Panel icon={MapPin} title="Tính năng khác" className="lg:col-span-2">
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              { label: "Bấm 'Tìm món ăn gần tôi'", n: stats.features.near_me ?? 0 },
              { label: "Nghe thuyết minh ở mục 'gần tôi'", n: stats.features.near_listen ?? 0 },
              { label: "Từ điển: nghe phát âm", n: feat("glossary:", ":term") },
              { label: "Từ điển: nghe giải nghĩa", n: feat("glossary:", ":meaning") },
            ].map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <b className="text-lg tabular-nums">{r.n}</b>
              </li>
            ))}
          </ul>
          {topWords.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Từ được nghe nhiều nhất:{" "}
              {topWords.map((w, i) => (
                <span key={w.name}>
                  {i > 0 && ", "}
                  <b className="text-foreground">{w.name}</b> ({w.n})
                </span>
              ))}
            </p>
          )}
        </Panel>

        <Panel icon={Trophy} title="Món được xem nhiều nhất" className="lg:col-span-3">
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {shownDishes.map((r, i) => (
              <li key={r.dish.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-xs font-bold text-muted-foreground">{i + 1}</span>
                <span className="w-36 shrink-0 truncate font-semibold">{r.dish.vi.name}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.views / topMax) * 100}%` }} />
                </span>
                <span className="w-40 text-right tabular-nums">
                  <b className="font-bold">{r.views}</b>
                  <span className="ms-1 text-xs text-muted-foreground">
                    · {r.plays} nghe{r.plays > 0 && ` · ${pct(r.completes, r.plays)}% hết`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {ranked.length > TOP_DISHES && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              {showAll ? "Thu gọn" : `Xem tất cả ${ranked.length} món`}
            </button>
          )}
        </Panel>
      </div>
    </>
  )
}

function StatsView({ pin }: { pin: string }) {
  const stats = useStats(pin)
  const presence = usePresence(pin)
  if (!stats) return <p className="py-16 text-center text-muted-foreground">Đang tải…</p>
  return <Dashboard stats={stats} online={presence?.online} />
}

export default function StatsPage() {
  return <AdminShell title="Thống kê truy cập">{(pin) => <StatsView pin={pin} />}</AdminShell>
}
