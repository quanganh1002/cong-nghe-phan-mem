"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Sparkles, Volume2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { FoodCard } from "@/components/food-card"
import { useApp } from "@/lib/store"
import { FOODS, CATEGORIES } from "@/lib/foods"

export default function HomePage() {
  const { dict, lang } = useApp()
  const featured = FOODS.filter((f) => f.popular).slice(0, 4)
  const newest = FOODS.filter((f) => f.isNew).slice(0, 4)
  const hero = FOODS.find((f) => f.id === "pho-bo")!

  return (
    <AppShell>
      {/* Hero */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-2 p-6 text-primary-foreground shadow-lg sm:p-8">
          <div className="absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -start-8 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="size-3.5" />
                {dict.appTagline}
              </span>
              <h1 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">{dict.heroTitle}</h1>
              <p className="mt-2 text-pretty text-sm text-white/85 sm:text-base">{dict.heroSubtitle}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-md transition-all active:scale-95 hover:gap-3"
                >
                  {dict.viewAll}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur">
                  <Volume2 className="size-4" />
                  {dict.listen}
                </span>
              </div>
            </div>
            <div className="relative hidden aspect-square w-40 shrink-0 sm:block lg:w-52">
              <div className="animate-float absolute inset-0 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl">
                <Image src={hero.image || "/placeholder.svg"} alt={hero.t[lang].name} fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search shortcut */}
      <section className="px-4 pt-5">
        <Link
          href="/menu"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm transition-colors hover:border-primary/40"
        >
          <Search className="size-5" />
          <span className="text-sm">{dict.searchPlaceholder}</span>
        </Link>
      </section>

      {/* Categories */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-lg font-bold">{dict.categories}</h2>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              href={`/menu?cat=${c.key}`}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition-all active:scale-95 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-2xl">{c.icon}</span>
              <span className="text-xs font-semibold leading-tight">
                {dict[`cat${c.key[0].toUpperCase()}${c.key.slice(1)}` as keyof typeof dict]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <Section title={dict.featured} href="/menu">
        {featured.map((f, i) => (
          <FoodCard key={f.id} food={f} index={i} />
        ))}
      </Section>

      {/* New dishes */}
      {newest.length > 0 && (
        <Section title={dict.newDishes} href="/menu">
          {newest.map((f, i) => (
            <FoodCard key={f.id} food={f} index={i} />
          ))}
        </Section>
      )}

      <footer className="px-4 py-8 text-center text-xs text-muted-foreground">
        FoodLingo · {dict.appTagline}
      </footer>
    </AppShell>
  )
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  const { dict } = useApp()
  return (
    <section className="px-4 pt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
          {dict.viewAll}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  )
}
