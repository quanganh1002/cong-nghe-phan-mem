"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/sonner"

/** Khung dùng chung cho trang đăng nhập và đăng ký: nền ấm + thẻ form nổi có đổ bóng. */
export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-accent via-background to-secondary">
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          aria-label="Home"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-all active:scale-95 hover:border-primary/40"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className="animate-fade-up w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-[0_24px_60px_-12px_rgba(226,86,47,0.35),0_8px_24px_-8px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>

      <Toaster position="top-center" richColors />
    </div>
  )
}
