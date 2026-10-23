"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PinForm } from "@/components/admin-pin-form"
import { readPin, writePin } from "@/lib/admin-pin"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/thong-ke", label: "Thống kê" },
  { href: "/admin/mon-an", label: "Món ăn" },
  { href: "/admin/qr", label: "Mã QR" },
]

/** Khung chung của các trang /admin: nhập PIN, thanh điều hướng, rồi mới hiện nội dung */
export function AdminShell({ title, children }: { title: string; children: (pin: string) => ReactNode }) {
  const pathname = usePathname()
  const [pin, setPin] = useState<string | null>(null)
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState("")
  const [serverError, setServerError] = useState("")

  useEffect(() => setPin(readPin()), [])

  // Kiểm tra PIN với server
  useEffect(() => {
    if (!pin) return
    let alive = true
    fetch("/api/presence", { headers: { "x-admin-pin": pin }, cache: "no-store" })
      .then(async (res) => {
        if (!alive) return
        if (res.status === 401) {
          writePin("")
          setAuthed(false)
          setError("Sai mã PIN")
          setPin("")
        } else if (res.ok) {
          setAuthed(true)
          setError("")
        } else {
          // PIN đúng nhưng server lỗi (thường là Supabase chưa tạo bảng): vẫn cho vào và báo lỗi, không treo ở "Đang tải"
          const { detail } = (await res.json().catch(() => ({}))) as { detail?: string }
          setAuthed(true)
          setServerError(detail ?? `Máy chủ lỗi (${res.status})`)
        }
      })
      .catch(() => alive && setError("Không kết nối được máy chủ"))
    return () => {
      alive = false
    }
  }, [pin])

  if (pin === null) return null
  if (!pin) {
    return (
      <PinForm
        title="Quản trị"
        error={error}
        onSubmit={(p) => {
          writePin(p)
          setError("")
          setPin(p)
        }}
      />
    )
  }
  if (!authed) return <main className="grid min-h-dvh place-items-center text-muted-foreground">{error || "Đang tải…"}</main>

  // Trang con của admin thì quay về Tổng quan, chỉ từ Tổng quan mới ra trang web
  const isOverview = pathname === "/admin"

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-5">
      <header className="flex items-center gap-3">
        <Link
          href={isOverview ? "/" : "/admin"}
          aria-label={isOverview ? "Về trang web" : "Về trang quản trị"}
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-extrabold">{title}</h1>
      </header>
      <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 print:hidden">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              pathname === t.href
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {serverError && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          Máy chủ không đọc được dữ liệu: {serverError}. Nếu đang dùng Supabase, hãy chạy supabase/schema.sql trong SQL Editor
          và kiểm tra SUPABASE_URL / SUPABASE_SECRET_KEY.
        </p>
      )}
      <div className="mt-4">{children(pin)}</div>
    </main>
  )
}
