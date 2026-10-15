"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { XCircle } from "lucide-react"
import { useApp } from "@/lib/store"
import { fetchServerStatuses, isFinal, readLinks } from "@/lib/order-links"

/**
 * Chạy ngầm trên mọi trang của khách: cứ 5 giây hỏi quán trạng thái các đơn khách đã đặt.
 * Đơn nào bị quán từ chối → hiện bảng thông báo (mỗi đơn chỉ báo 1 lần).
 * Được gắn 1 lần duy nhất trong app/layout.tsx.
 */

const FINAL_KEY = "foodlingo:order-final" // đơn đã kết thúc → không hỏi nữa
const SEEN_KEY = "foodlingo:order-cancel-seen" // đơn bị từ chối đã báo cho khách
const POLL_MS = 5000

const TEXT = {
  vi: {
    title: "Đơn hàng bị từ chối",
    desc: "Rất tiếc, quán đã từ chối đơn #{id} của bạn.",
    reason: "Lý do",
    refund: "Nếu bạn đã chuyển khoản, vui lòng liên hệ quán để được hoàn tiền.",
    ok: "Đã hiểu",
    view: "Xem đơn hàng",
  },
  en: {
    title: "Order declined",
    desc: "Sorry, the shop has declined your order #{id}.",
    reason: "Reason",
    refund: "If you have already paid by transfer, please contact the shop for a refund.",
    ok: "OK",
    view: "View orders",
  },
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // bỏ qua
  }
}

type Notice = { id: string; reason?: string }

export function OrderWatcher() {
  const pathname = usePathname() ?? ""
  const { lang } = useApp()
  const t = lang === "vi" ? TEXT.vi : TEXT.en
  const [queue, setQueue] = useState<Notice[]>([])

  // Trang của quán (bếp, thống kê, tạo QR) thì không cần
  const shopPage = pathname.startsWith("/admin") || pathname.startsWith("/qr")

  useEffect(() => {
    if (shopPage) return
    let stopped = false

    const check = async () => {
      if (document.visibilityState !== "visible") return
      const final = readJSON<Record<string, string>>(FINAL_KEY, {})
      const ids = [...new Set(Object.values(readLinks()))].filter((id) => !final[id]).slice(-50)
      if (ids.length === 0) return

      let data
      try {
        data = await fetchServerStatuses(ids)
      } catch {
        return // mất mạng tạm thời: lần sau thử lại
      }
      if (stopped) return

      const seen = new Set(readJSON<string[]>(SEEN_KEY, []))
      const fresh: Notice[] = []
      for (const id of ids) {
        const info = data[id]
        if (!info) {
          final[id] = "missing" // đơn không còn trên máy quán → thôi không hỏi nữa
          continue
        }
        if (isFinal(info.status)) final[id] = info.status
        if (info.status === "cancelled" && !seen.has(id)) {
          seen.add(id)
          fresh.push({ id, reason: info.reason })
        }
      }
      writeJSON(FINAL_KEY, final)
      writeJSON(SEEN_KEY, [...seen])

      if (fresh.length > 0) {
        setQueue((q) => [...q, ...fresh])
        try {
          navigator.vibrate?.(200) // rung nhẹ trên điện thoại Android
        } catch {
          // bỏ qua
        }
      }
    }

    check()
    const timer = setInterval(check, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === "visible") check()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [shopPage])

  const current = queue[0]
  if (shopPage || !current) return null

  const dismiss = () => setQueue((q) => q.slice(1))

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="order-declined-title"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
    >
      <div className="animate-scale-in w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10">
          <XCircle className="size-9 text-destructive" />
        </div>
        <h2 id="order-declined-title" className="mt-3 text-xl font-extrabold">
          {t.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.desc.replace("{id}", current.id)}</p>
        {current.reason && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {t.reason}: {current.reason}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{t.refund}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 rounded-full border border-border bg-card px-4 py-3 font-bold transition-all active:scale-95 hover:bg-muted"
          >
            {t.ok}
          </button>
          <Link
            href="/orders"
            onClick={dismiss}
            className="flex-1 rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground shadow-md transition-all active:scale-95"
          >
            {t.view}
          </Link>
        </div>
      </div>
    </div>
  )
}
