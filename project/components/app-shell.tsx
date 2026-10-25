"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, BookOpen, BookA, Map as MapIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { ScrollToTop } from "@/components/scroll-to-top"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function useNav() {
  const { dict } = useApp()
  return [
    { href: "/", label: dict.navHome, icon: Home },
    { href: "/dishes", label: dict.navDishes, icon: UtensilsCrossed },
    { href: "/map", label: dict.navMap, icon: MapIcon },
    { href: "/glossary", label: dict.navGlossary, icon: BookA },
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
    <div className="flex min-h-dvh w-full flex-col">
      {/* Top header: full-width bar, content aligned with the page column */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
          <Logo />

          {/* Desktop nav: text links with an underline on the current page */}
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1.5 text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform",
                    active
                      ? "text-foreground after:scale-x-100"
                      : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-50",
                  )}
                >
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

      <main className="mx-auto w-full max-w-6xl flex-1 pb-28 md:pb-16">{children}</main>

      <ScrollToTop />

      {/* Mobile bottom nav: floating dock, the active tab expands to show its label */}
      <nav className="safe-bottom pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 md:hidden">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border-2 border-primary/30 bg-card/95 p-1.5 shadow-2xl shadow-primary/25 ring-4 ring-primary/10 backdrop-blur-xl">
          {nav.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-full text-xs font-bold transition-all",
                  active ? "bg-primary px-4 text-primary-foreground shadow-sm" : "w-11 text-foreground/60 hover:text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {active && <span className="max-w-24 truncate">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
