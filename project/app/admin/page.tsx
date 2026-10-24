"use client"

import { Activity, Eye, Headphones, Link2, LogIn, LogOut, QrCode, Users } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { StatCard, langLabel } from "@/components/admin-ui"
import { useLiveEvents, usePresence, useStats } from "@/hooks/use-admin-data"
import { getDish } from "@/lib/dishes"
import { cn } from "@/lib/utils"

/** Nhãn dễ đọc cho đường dẫn đang xem */
function pageLabel(path: string) {
  if (path === "/" || path === "") return "Trang chủ"
  if (path === "/dishes") return "Danh sách món ăn"
  if (path === "/about") return "Giới thiệu"
  if (path === "/map") return "Bản đồ ẩm thực"
  if (path === "/glossary") return "Từ điển món ăn"
  const id = /^\/dishes\/([^/]+)$/.exec(path)?.[1]
  const dish = id ? getDish(id) : undefined
  return dish ? `Món: ${dish.vi.name}` : path
}

function Overview({ pin }: { pin: string }) {
  const presence = usePresence(pin)
  const stats = useStats(pin)
  const devices = presence?.devices ?? []
  const events = useLiveEvents(presence?.devices)
  const byQr = devices.filter((d) => d.source === "qr").length
  const today = stats?.days[stats.days.length - 1]

  return (
    <>
      {/* Số người đang online: đổi `presence.online` để thay đổi số hiển thị */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary to-chart-2 p-6 text-primary-foreground shadow-lg">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/85">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-white" />
          </span>
          Đang truy cập web ngay lúc này
        </p>
        <p className="mt-2 text-6xl font-extrabold tabular-nums">{presence?.online ?? "–"}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5">
            <QrCode className="size-4" />
            Quét QR: {presence ? byQr : "–"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5">
            <Link2 className="size-4" />
            Mở link: {presence ? devices.length - byQr : "–"}
          </span>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Lượt vào hôm nay" value={today?.visits} />
        <StatCard icon={Eye} label="Lượt xem món hôm nay" value={today?.views} />
        <StatCard icon={QrCode} label="Vào bằng QR hôm nay" value={today?.qr} />
        <StatCard icon={Headphones} label="Lượt nghe thuyết minh hôm nay" value={today?.plays} />
      </section>

      {/* Ai vừa vào / vừa rời đi: cập nhật mỗi 2 giây khi trang này đang mở */}
      <section className="mt-4 rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="flex items-center gap-2 border-b border-border px-4 py-3 font-bold">
          <Activity className="size-4 text-primary" />
          Hoạt động trực tiếp
        </h2>
        {events.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Đang chờ… khi có người quét QR, mở link hoặc rời khỏi web, thông báo sẽ hiện ở đây.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.key} className="animate-fade-up flex items-center gap-3 px-4 py-2.5 text-sm">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    e.kind === "join" ? "bg-chart-3/15 text-chart-3" : "bg-muted text-muted-foreground",
                  )}
                >
                  {e.kind === "join" ? <LogIn className="size-4" /> : <LogOut className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {e.kind === "join"
                      ? `Vừa vào bằng ${e.device.source === "qr" ? "mã QR" : "link"}`
                      : "Vừa rời khỏi web"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[langLabel(e.device.lang), pageLabel(e.device.path)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {new Date(e.at).toLocaleTimeString("vi-VN")}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="border-b border-border px-4 py-3 font-bold">Thiết bị đang online ({devices.length})</h2>
        {devices.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có ai đang xem web</p>
        ) : (
          <ul className="divide-y divide-border">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    d.source === "qr" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {d.source === "qr" ? <QrCode className="size-4" /> : <Link2 className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{pageLabel(d.path)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[langLabel(d.lang), d.source === "qr" ? "Vào bằng mã QR" : "Vào bằng link"].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default function AdminPage() {
  return <AdminShell title="Quản trị Vị Việt">{(pin) => <Overview pin={pin} />}</AdminShell>
}
