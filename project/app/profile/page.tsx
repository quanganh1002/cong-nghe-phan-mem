"use client"

import Link from "next/link"
import { ChevronRight, ClipboardList, Globe, LogIn, LogOut, Mail, MapPin, Phone, User as UserIcon, UserPlus, CalendarDays, ShoppingBag } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export default function ProfilePage() {
  const { dict, hydrated, user } = useApp()

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold">{dict.profileTitle}</h1>
      </div>

      {!hydrated ? <ProfileSkeleton /> : user ? <AccountView /> : <GuestView />}
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Chưa đăng nhập                                                      */
/* ------------------------------------------------------------------ */
function GuestView() {
  const { dict } = useApp()

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="animate-pop grid size-24 place-items-center rounded-full bg-accent">
        <UserIcon className="size-11 text-primary" />
      </div>
      <h2 className="text-xl font-bold">{dict.guestTitle}</h2>
      <p className="max-w-xs text-pretty text-sm text-muted-foreground">{dict.guestDesc}</p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm sm:flex-row">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
        >
          <LogIn className="size-5" />
          {dict.login}
        </Link>
        <Link
          href="/register"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-card px-6 py-3 font-bold text-primary shadow-sm transition-all active:scale-95 hover:bg-primary/10"
        >
          <UserPlus className="size-5" />
          {dict.register}
        </Link>
      </div>

      {/* Người dùng vẫn đổi được ngôn ngữ khi chưa đăng nhập */}
      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <Globe className="size-4" />
        <span>{dict.language}</span>
        <LanguageSwitcher />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Đã đăng nhập                                                        */
/* ------------------------------------------------------------------ */
function AccountView() {
  const { dict, lang, user, orders, logout } = useApp()
  if (!user) return null

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  const memberSince = new Date(user.createdAt).toLocaleDateString(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="px-4 pb-4 pt-4">
      {/* Header card — cùng kiểu gradient với hero ở trang chủ */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-2 p-6 text-primary-foreground shadow-lg">
        <div className="absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -start-8 size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border-4 border-white/30 bg-white/20 text-xl font-extrabold backdrop-blur">
            {initials || <UserIcon className="size-7" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-extrabold leading-tight">{user.name}</h2>
            <p className="truncate text-sm text-white/85">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Thông tin tài khoản */}
      <section
        style={{ animationDelay: "60ms" }}
        className="animate-fade-up mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-bold text-muted-foreground">{dict.accountInfo}</h3>
        <dl className="divide-y divide-border">
          <InfoRow icon={<UserIcon className="size-4" />} label={dict.fullName} value={user.name} />
          <InfoRow icon={<Mail className="size-4" />} label={dict.email} value={user.email} />
          <InfoRow icon={<Phone className="size-4" />} label={dict.phone} value={user.phone} />
          <InfoRow icon={<MapPin className="size-4" />} label={dict.address} value={user.address} />
          <InfoRow icon={<CalendarDays className="size-4" />} label={dict.memberSince} value={memberSince} />
          <InfoRow icon={<ShoppingBag className="size-4" />} label={dict.totalOrders} value={String(orders.length)} />
        </dl>
      </section>

      {/* Menu */}
      <section
        style={{ animationDelay: "120ms" }}
        className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <Link
          href="/orders"
          className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40 active:bg-accent/60"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
            <ClipboardList className="size-5" />
          </span>
          <span className="flex-1 font-semibold">{dict.myOrders}</span>
          <ChevronRight className="size-5 text-muted-foreground rtl:rotate-180" />
        </Link>

        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
            <Globe className="size-5" />
          </span>
          <span className="flex-1 font-semibold">{dict.language}</span>
          <LanguageSwitcher />
        </div>
      </section>

      <button
        onClick={logout}
        style={{ animationDelay: "180ms" }}
        className="animate-fade-up mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-5 py-3.5 font-bold text-destructive transition-all active:scale-[0.98] hover:bg-destructive/20"
      >
        <LogOut className="size-5" />
        {dict.logout}
      </button>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn("break-words font-semibold", !value && "text-muted-foreground")}>{value || "—"}</dd>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Skeleton khi đang đọc localStorage                                  */
/* ------------------------------------------------------------------ */
function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4" aria-hidden>
      <div className="shimmer h-28 rounded-3xl bg-muted" />
      <div className="shimmer h-64 rounded-2xl bg-muted" />
    </div>
  )
}
