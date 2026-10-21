"use client"

import { useEffect, type ReactNode } from "react"
import { writePin } from "@/lib/admin-pin"

let mounted = 0

/** Rời khỏi mọi trang /admin thì xoá PIN, lần sau vào phải nhập lại (đổi giữa các trang admin thì giữ nguyên) */
export default function AdminLayout({ children }: { children: ReactNode }) {
  // Đóng tab, tải lại, hoặc gõ địa chỉ sang trang khác (không đi qua cleanup của React) cũng xoá PIN
  useEffect(() => {
    const clear = () => writePin("")
    window.addEventListener("pagehide", clear)
    return () => window.removeEventListener("pagehide", clear)
  }, [])

  useEffect(() => {
    mounted++
    return () => {
      mounted--
      // chờ 1 nhịp: React Strict Mode (dev) gỡ rồi gắn lại ngay, lúc đó không được xoá
      setTimeout(() => {
        if (mounted === 0) writePin("")
      }, 0)
    }
  }, [])
  return children
}
