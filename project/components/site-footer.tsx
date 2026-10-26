"use client"

import Link from "next/link"
import { useApp } from "@/lib/store"
import { Logo } from "@/components/logo"

export function SiteFooter() {
  const { dict } = useApp()
  const explore = [
    { href: "/", label: dict.navHome },
    { href: "/dishes", label: dict.navDishes },
    { href: "/map", label: dict.navMap },
    { href: "/glossary", label: dict.navGlossary },
    { href: "/about", label: dict.navAbout },
  ]
  const regions = [
    { href: "/dishes?region=north", label: dict.regionNorth },
    { href: "/dishes?region=central", label: dict.regionCentral },
    { href: "/dishes?region=south", label: dict.regionSouth },
  ]
  const link = "text-sm text-muted-foreground transition-colors hover:text-primary"

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] md:px-8">
        <div className="max-w-md">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{dict.footerBlurb}</p>
        </div>
        <nav aria-label={dict.footerExplore} className="hidden sm:block">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground">{dict.footerExplore}</h3>
          <ul className="space-y-2">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={dict.footerRegions}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground">{dict.footerRegions}</h3>
          <ul className="space-y-2">
            {regions.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between md:px-8">
          <span>© {new Date().getFullYear()} {dict.footer}</span>
          <span>{dict.footerNote}</span>
        </div>
      </div>
    </footer>
  )
}