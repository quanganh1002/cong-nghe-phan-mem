"use client"

import { useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useApp } from "@/lib/store"
import { useTable } from "@/lib/table"

/** Chỉ cho quay về đường dẫn nội bộ (chặn kiểu ?next=https://web-la.com) */
export function safeNext(raw: string | null | undefined, fallback = "/") {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback
}

/** Đọc ?next= trên URL hiện tại */
export function readNext() {
  if (typeof window === "undefined") return "/"
  return safeNext(new URLSearchParams(window.location.search).get("next"))
}

export const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`

/**
 * Quy tắc gọi món:
 *  - Ngồi tại bàn (quét QR có số bàn) → gọi món luôn, KHÔNG cần đăng nhập
 *  - Đặt giao hàng (QR chung / vào web từ ngoài) → BẮT đăng nhập hoặc đăng ký
 * Trả về true nếu được phép; nếu không thì báo và chuyển sang trang đăng nhập.
 */
export function useRequireLogin() {
  const { user, hydrated, lang } = useApp()
  const [table] = useTable()
  const router = useRouter()
  const pathname = usePathname()

  return useCallback(
    (next?: string) => {
      if (table || user) return true
      if (!hydrated) return false
      toast.info(
        lang === "vi"
          ? "Đặt giao hàng cần đăng nhập hoặc đăng ký. Nếu đang ngồi tại quán, hãy quét mã QR trên bàn."
          : "Please log in or sign up to order for delivery. If you're dining in, scan the QR code on your table.",
      )
      router.push(loginHref(next ?? pathname))
      return false
    },
    [table, user, hydrated, lang, router, pathname],
  )
}
