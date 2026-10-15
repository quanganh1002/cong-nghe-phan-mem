"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarDays, ChefHat, CircleCheck, ClipboardList, MapPin, PackageCheck, Truck, XCircle, type LucideIcon } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { useApp, ORDER_STEPS, type Order, type OrderStatus } from "@/lib/store"
import { getFood, formatPrice } from "@/lib/foods"
import { useServerOrders, type ServerStatus } from "@/lib/order-links"
import type { Dict } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const STEP_META: Record<OrderStatus, { icon: LucideIcon; labelKey: keyof Dict; badge: string }> = {
  ordered: { icon: ClipboardList, labelKey: "statusOrdered", badge: "bg-muted text-muted-foreground" },
  confirmed: { icon: CircleCheck, labelKey: "statusConfirmed", badge: "bg-chart-4/15 text-chart-4" },
  preparing: { icon: ChefHat, labelKey: "statusPreparing", badge: "bg-chart-2/20 text-accent-foreground" },
  delivering: { icon: Truck, labelKey: "statusDelivering", badge: "bg-primary/10 text-primary" },
  completed: { icon: PackageCheck, labelKey: "statusCompleted", badge: "bg-chart-3/15 text-chart-3" },
}

export default function OrdersPage() {
  const { dict, hydrated, orders } = useApp()

  // Đơn đặt trước đứng trên cùng → sắp xếp theo ngày đặt tăng dần
  const sorted = [...orders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Lấy trạng thái thật từ quán (trang bếp /admin cập nhật), tự làm mới mỗi 5 giây
  const live = useServerOrders(orders.map((o) => o.id))

  if (!hydrated) {
    return (
      <AppShell>
        <div className="space-y-3 px-4 pt-4" aria-hidden>
          <div className="shimmer h-8 w-40 rounded-lg bg-muted" />
          <div className="shimmer h-72 rounded-2xl bg-muted" />
          <div className="shimmer h-72 rounded-2xl bg-muted" />
        </div>
      </AppShell>
    )
  }

  if (sorted.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="animate-pop grid size-24 place-items-center rounded-full bg-accent">
            <ClipboardList className="size-11 text-primary" />
          </div>
          <h1 className="text-xl font-bold">{dict.noOrders}</h1>
          <p className="max-w-xs text-sm text-muted-foreground">{dict.noOrdersDesc}</p>
          <Link
            href="/menu"
            className="mt-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
          >
            {dict.browseMenu}
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold">{dict.ordersTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.trackingTitle}</p>

        <ul className="mt-4 space-y-3">
          {sorted.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} live={live[order.id]} />
          ))}
        </ul>
      </div>
    </AppShell>
  )
}

function OrderCard({
  order,
  index,
  live,
}: {
  order: Order
  index: number
  live?: { serverId: string; status?: ServerStatus; reason?: string }
}) {
  const { dict, lang } = useApp()
  // Đơn đã gửi về quán: dùng trạng thái + mã đơn bên quán (trùng với trang bếp)
  const cancelled = live?.status === "cancelled"
  const status: OrderStatus = cancelled ? order.status : ((live?.status as OrderStatus | undefined) ?? order.status)
  const code = live?.serverId ?? order.id
  const meta = STEP_META[status]
  const vi = lang === "vi"
  const date = new Date(order.date).toLocaleString(lang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <li
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "animate-fade-up rounded-2xl border bg-card p-4 shadow-sm",
        cancelled ? "border-destructive/30" : "border-border",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold">
            {dict.orderNo} #{code}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span className="truncate">{date}</span>
          </p>
        </div>
        {cancelled ? (
          <span className="shrink-0 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            {vi ? "Bị từ chối" : "Declined"}
          </span>
        ) : (
          <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", meta.badge)}>
            {dict[meta.labelKey]}
          </span>
        )}
      </div>

      {/* Lộ trình đơn hàng (hoặc thông báo bị từ chối) */}
      {cancelled ? (
        <div className="my-4 flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-3">
          <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="min-w-0 text-sm">
            <p className="font-bold text-destructive">{vi ? "Quán đã từ chối đơn này" : "The shop declined this order"}</p>
            {live?.reason && (
              <p className="mt-0.5">
                {vi ? "Lý do" : "Reason"}: <b>{live.reason}</b>
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {vi
                ? "Nếu bạn đã chuyển khoản, vui lòng liên hệ quán để được hoàn tiền."
                : "If you have already paid by transfer, please contact the shop for a refund."}
            </p>
          </div>
        </div>
      ) : (
        <Timeline status={status} />
      )}

      {/* Món trong đơn */}
      <ul className="space-y-2 border-t border-border pt-3">
        {order.items.map((it) => {
          const food = getFood(it.foodId)
          if (!food) return null
          return (
            <li key={it.foodId} className="flex items-center gap-3">
              <Link href={`/food/${food.id}`} className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src={food.image || "/placeholder.svg"} alt={food.t[lang].name} fill className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold">{food.t[lang].name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatPrice(it.unitPrice)} × {it.quantity}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">{formatPrice(it.unitPrice * it.quantity)}</span>
            </li>
          )
        })}
      </ul>

      {/* Địa chỉ + tổng tiền */}
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <p className="flex min-w-0 items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-2">{order.address}</span>
        </p>
        <div className="shrink-0 text-end">
          <p className="text-xs text-muted-foreground">{dict.total}</p>
          <p className="text-lg font-extrabold text-primary tabular-nums">{formatPrice(order.total)}</p>
        </div>
      </div>
    </li>
  )
}

/** 5 bước: Đã đặt → Đã xác nhận → Đang chuẩn bị → Đang giao → Hoàn thành */
function Timeline({ status }: { status: OrderStatus }) {
  const { dict } = useApp()
  const current = ORDER_STEPS.indexOf(status)

  return (
    <ol className="my-4 flex items-start">
      {ORDER_STEPS.map((step, i) => {
        const { icon: Icon, labelKey } = STEP_META[step]
        const done = i < current
        const active = i === current
        const reached = i <= current
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
            {/* đường nối sang bước kế tiếp */}
            {i < ORDER_STEPS.length - 1 && (
              <span
                className={cn(
                  "absolute start-1/2 top-4 h-0.5 w-full -translate-y-1/2 rounded-full",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 place-items-center rounded-full border-2 transition-colors",
                reached ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                active && "ring-4 ring-primary/20",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span
              className={cn(
                "px-0.5 text-[10px] font-semibold leading-tight sm:text-[11px]",
                reached ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {dict[labelKey]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
