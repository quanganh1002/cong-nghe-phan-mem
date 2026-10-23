"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, BookOpen, Map as MapIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function useNav() {
  const { dict } = useApp()
  return [
    { href: "/", label: dict.navHome, icon: Home },
    { href: "/dishes", label: dict.navDishes, icon: UtensilsCrossed },
    { href: "/map", label: dict.navMap, icon: MapIcon },
    { href: "/about", label: dict.navAbout, icon: BookOpen },
  ]
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const nav = useNav()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {nav.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold"
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-2xl transition-all",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
