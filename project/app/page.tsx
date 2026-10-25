"use client"

import Link from "next/link"
import Image from "next/image"
import Form from "next/form"
import { useEffect } from "react"
import { ArrowRight, Pause, Search, Sparkles, Volume2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DishCard } from "@/components/dish-card"
import { useApp } from "@/lib/store"
import { DISHES, REGIONS } from "@/lib/dishes"
import { useDishText } from "@/lib/use-dish-text"
import { getLanguage } from "@/lib/languages"
import { splitText, useSpeech } from "@/hooks/use-speech"

const REGION_DICT = {
  north: { name: "regionNorth", desc: "regionNorthDesc", icon: "🏯" },
  central: { name: "regionCentral", desc: "regionCentralDesc", icon: "🏖️" },
  south: { name: "regionSouth", desc: "regionSouthDesc", icon: "🛶" },
} as const

const featured = DISHES.filter((d) => d.popular).slice(0, 4)
const festival = DISHES.filter((d) => d.category === "festival")
const listed = [...featured, ...festival]
const hero = DISHES.find((d) => d.id === "pho-bo") ?? DISHES[0]

export default function HomePage() {
  const { dict, lang } = useApp()
  const text = useDishText(listed, ["name", "summary"])
  const speech = useSpeech()

  // Stop reading when the language changes (the text on screen changes with it)
  useEffect(() => {
    speech.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  /** Read the hero title and description aloud in the selected language; a second press stops it */
  const readIntro = () => {
    if (speech.speaking) return speech.stop()
    speech.speak(splitText(`${dict.heroTitle}\n${dict.heroSubtitle}`), getLanguage(lang).speechLang, 0, dict.appName)
  }

  return (
    <AppShell>
      {/* Hero */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl hero-surface p-6 shadow-lg sm:p-8">
          <div className="absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -start-8 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="size-3.5" />
                {dict.heroBadge}
              </span>
              <h1 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">{dict.heroTitle}</h1>
              <p className="mt-2 text-pretty text-sm text-white/85 sm:text-base">{dict.heroSubtitle}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dishes"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-md transition-all active:scale-95 hover:gap-3"
                >
                  {dict.startExplore}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
                <button
                  type="button"
                  onClick={readIntro}
                  aria-pressed={speech.speaking}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-all active:scale-95 hover:bg-white/25"
                >
                  {speech.speaking ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
                  {dict.listen}
                </button>
              </div>
            </div>
            <div className="relative hidden aspect-square w-40 shrink-0 sm:block lg:w-52">
              <div className="animate-float absolute inset-0 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl">
                {hero.image && <Image src={hero.image} alt={text(hero).name} fill className="object-cover" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search: bấm Enter/kính lúp mới sang /dishes?q=... */}
      <section className="px-4 pt-5">
        <Form action="/dishes" role="search" className="relative">
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchPlaceholder}
            className="w-full rounded-2xl border border-border bg-card py-3 ps-4 pe-12 text-sm shadow-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            aria-label={dict.searchPlaceholder}
            className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-primary"
          >
            <Search className="size-5" />
          </button>
        </Form>
      </section>

      {/* Regions */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-lg font-bold">{dict.byRegion}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {REGIONS.map((r, i) => {
            const k = REGION_DICT[r]
            return (
              <Link
                key={r}
                href={`/dishes?region=${r}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all active:scale-95 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-2xl">{k.icon}</span>
                <span className="min-w-0">
                  <span className="block font-bold">{dict[k.name]}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{dict[k.desc]}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <Section title={dict.featured} href="/dishes">
        {featured.map((d, i) => (
          <DishCard key={d.id} dish={d} name={text(d).name} summary={text(d).summary} index={i} />
        ))}
      </Section>

      <Section title={dict.festivalTitle} href="/dishes?cat=festival">
        {festival.map((d, i) => (
          <DishCard key={d.id} dish={d} name={text(d).name} summary={text(d).summary} index={i} />
        ))}
      </Section>

      <footer className="px-4 py-8 text-center text-xs text-muted-foreground">{dict.footer}</footer>
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
