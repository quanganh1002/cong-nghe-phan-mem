"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Bell,
  BellOff,
  Bike,
  ChefHat,
  CircleCheck,
  ClipboardList,
  MessageSquareText,
  Phone,
  RefreshCw,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import { getFood, formatPrice } from "@/lib/foods"
import { cn } from "@/lib/utils"
import type { ShopOrder, ShopOrderStatus } from "@/lib/orders-db"
import { readPin, writePin } from "@/lib/admin-pin"
import { PinForm } from "@/components/admin-pin-form"

/**
 * Màn hình bếp / thu ngân: mở http://localhost:3000/admin trên máy của quán.
 * Tự cập nhật mỗi 3 giây, có tiếng "ting" khi có đơn mới.
 */

const POLL_MS = 3000

const STATUS: Record<ShopOrderStatus, { label: string; icon: LucideIcon; badge: string; next?: ShopOrderStatus; action?: string }> = {
  ordered: { label: "Đơn mới", icon: ClipboardList, badge: "bg-primary text-primary-foreground", next: "confirmed", action: "Nhận đơn" },
  confirmed: { label: "Đã nhận", icon: CircleCheck, badge: "bg-chart-4/15 text-chart-4", next: "preparing", action: "Bắt đầu làm" },
  preparing: { label: "Đang làm", icon: ChefHat, badge: "bg-chart-2/20 text-accent-foreground", next: "delivering", action: "Mang ra / Giao" },
  delivering: { label: "Đang mang ra", icon: Bike, badge: "bg-primary/10 text-primary", next: "completed", action: "Hoàn thành" },
  completed: { label: "Xong", icon: CircleCheck, badge: "bg-chart-3/15 text-chart-3" },
}

const PAYMENT: Record<string, string> = {
  qr: "Chuyển khoản QR",
  bank: "Chuyển khoản",
  wallet: "MoMo / ZaloPay",
  cod: "Tiền mặt",
}

type Filter = "active" | "done" | "all"

function timeAgo(iso: string, now: number) {
  const m = Math.floor((now - new Date(iso).getTime()) / 60000)
  if (m < 1) return "vừa xong"
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h} giờ trước` : new Date(iso).toLocaleString("vi")
}

export default function AdminPage() {
  const [pin, setPin] = useState<string | null>(null) // null = đang đọc localStorage
  const [authed, setAuthed] = useState(false)
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [filter, setFilter] = useState<Filter>("active")
  const [sound, setSound] = useState(false)
  const [error, setError] = useState("")
  const [now, setNow] = useState(() => Date.now())
  const [busy, setBusy] = useState<string | null>(null)

  const seen = useRef<Set<string> | null>(null)
  const audio = useRef<AudioContext | null>(null)

  useEffect(() => setPin(readPin()), [])

  const beep = useCallback(() => {
    const ctx = audio.current
    if (!ctx) return
    // 2 tiếng "ting ting"
    ;[0, 0.25].forEach((delay) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.0001, ctx.currentTime + delay)
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.2)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + delay)
      o.stop(ctx.currentTime + delay + 0.22)
    })
  }, [])

  const load = useCallback(async () => {
    if (!pin) return
    try {
      const res = await fetch("/api/orders", { headers: { "x-admin-pin": pin }, cache: "no-store" })
      if (res.status === 401) {
        setAuthed(false)
        setError("Sai mã PIN")
        writePin("")
        return
      }
      if (!res.ok) throw new Error()
      const list = (await res.json()) as ShopOrder[]
      setAuthed(true)
      setError("")
      setOrders(list)

      // Phát hiện đơn mới (bỏ qua lần tải đầu tiên)
      const ids = new Set(list.map((o) => o.id))
      if (seen.current && list.some((o) => !seen.current!.has(o.id))) beep()
      seen.current = ids
    } catch {
      setError("Mất kết nối tới server — kiểm tra máy đang chạy npm run dev")
    }
  }, [pin, beep])

  // Tự tải lại mỗi 3 giây
  useEffect(() => {
    if (!pin) return
    load()
    const id = setInterval(() => {
      load()
      setNow(Date.now())
    }, POLL_MS)
    return () => clearInterval(id)
  }, [pin, load])

  // Hiện số đơn mới trên tab trình duyệt
  const newCount = orders.filter((o) => o.status === "ordered").length
  useEffect(() => {
    document.title = newCount ? `(${newCount}) Đơn mới · Bếp` : "Bếp · FoodLingo"
  }, [newCount])

  const toggleSound = () => {
    if (!sound) {
      audio.current ??= new AudioContext()
      void audio.current.resume()
      setSound(true)
      beep() // phát thử
    } else {
      setSound(false)
      void audio.current?.suspend()
    }
  }

  const advance = async (o: ShopOrder) => {
    const next = STATUS[o.status].next
    if (!next || !pin) return
    setBusy(o.id)
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: next } : x))) // đổi ngay trên màn hình
    try {
      await fetch(`/api/orders/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ status: next }),
      })
    } finally {
      setBusy(null)
      load()
    }
  }

  /* ---------- Nhập PIN ---------- */
  if (pin === null) return null
  if (!pin || (!authed && error === "Sai mã PIN")) {
    return <PinForm title="Trang bếp" error={error} onSubmit={(p) => { writePin(p); setError(""); seen.current = null; setPin(p) }} />
  }

  const shown = orders.filter((o) =>
    filter === "all" ? true : filter === "done" ? o.status === "completed" : o.status !== "completed",
  )
  const activeCount = orders.filter((o) => o.status !== "completed").length
  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt).toDateString() === new Date(now).toDateString())
    .reduce((s, o) => s + o.total, 0)

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 py-5">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <div className="me-auto">
          <h1 className="text-2xl font-extrabold">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            Tự cập nhật mỗi 3 giây · Doanh thu hôm nay: <b className="text-foreground">{formatPrice(todayRevenue)}</b>
          </p>
        </div>
        <Link
          href="/admin/thong-ke"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-primary/40 active:scale-95"
        >
          <BarChart3 className="size-4 text-primary" />
          Thống kê
        </Link>
        <button
          onClick={toggleSound}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95",
            sound ? "bg-chart-3/15 text-chart-3" : "animate-pulse bg-primary text-primary-foreground",
          )}
        >
          {sound ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          {sound ? "Âm báo: Bật" : "Bấm để bật âm báo"}
        </button>
        <button
          onClick={load}
          aria-label="Tải lại"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-transform active:scale-90"
        >
          <RefreshCw className="size-4" />
        </button>
      </header>

      {error && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive">{error}</p>
      )}

      {/* Bộ lọc */}
      <nav className="mt-4 flex gap-2">
        {(
          [
            ["active", `Đang xử lý (${activeCount})`],
            ["done", "Đã xong"],
            ["all", "Tất cả"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Danh sách đơn */}
      {shown.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center text-muted-foreground">
          <UtensilsCrossed className="size-12 opacity-40" />
          <p className="font-semibold">{filter === "active" ? "Chưa có đơn nào cần làm" : "Chưa có đơn"}</p>
          <p className="text-sm">Khách quét QR ở bàn và đặt món, đơn sẽ hiện ở đây.</p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} now={now} busy={busy === o.id} onAdvance={() => advance(o)} />
          ))}
        </ul>
      )}
    </main>
  )
}

function OrderCard({ order: o, now, busy, onAdvance }: { order: ShopOrder; now: number; busy: boolean; onAdvance: () => void }) {
  const st = STATUS[o.status]
  const isNew = o.status === "ordered"

  return (
    <li
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-4 shadow-sm",
        isNew ? "border-primary ring-4 ring-primary/20" : "border-border",
        o.status === "completed" && "opacity-70",
      )}
    >
      {/* Bàn / giao hàng + trạng thái */}
      <div className="flex items-start gap-3">
        {o.table ? (
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <div className="text-center leading-none">
              <div className="text-[10px] font-bold uppercase">Bàn</div>
              <div className="text-2xl font-extrabold">{o.table}</div>
            </div>
          </div>
        ) : (
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <div className="flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase">
              <Bike className="size-6" />
              Giao
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">#{o.id}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(o.createdAt, now)}</p>
          {o.name && !o.name.startsWith("Bàn ") && <p className="truncate text-sm font-semibold">{o.name}</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", st.badge)}>{st.label}</span>
      </div>

      {/* Món */}
      <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
        {o.items.map((it) => {
          const food = getFood(it.foodId)
          return (
            <li key={it.foodId} className="flex items-baseline gap-2">
              <span className="grid min-w-7 place-items-center rounded-md bg-accent px-1.5 text-sm font-extrabold text-accent-foreground">
                {it.quantity}
              </span>
              <span className="flex-1 font-semibold">{food?.t.vi.name ?? it.foodId}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{formatPrice(it.unitPrice * it.quantity)}</span>
            </li>
          )
        })}
      </ul>

      {o.note && (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          <MessageSquareText className="mt-0.5 size-4 shrink-0" />
          {o.note}
        </p>
      )}

      {/* Giao hàng: SĐT + địa chỉ */}
      {!o.table && (o.phone || o.address) && (
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {o.phone && (
            <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary">
              <Phone className="size-3.5" />
              {o.phone}
            </a>
          )}
          {o.address && <p>{o.address}</p>}
        </div>
      )}

      {/* Thanh toán + tổng (đẩy xuống đáy thẻ để các thẻ thẳng hàng) */}
      <div className="min-h-3 flex-1" />
      <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{PAYMENT[o.payment] ?? o.payment}</p>
          {o.payment !== "cod" && o.transferNote && (
            <p>
              Nội dung CK: <b className="text-foreground">{o.transferNote}</b>
            </p>
          )}
        </div>
        <p className="text-xl font-extrabold tabular-nums text-primary">{formatPrice(o.total)}</p>
      </div>

      {st.next && (
        <button
          onClick={onAdvance}
          disabled={busy}
          className="mt-3 w-full rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {st.action}
        </button>
      )}
    </li>
  )
}
