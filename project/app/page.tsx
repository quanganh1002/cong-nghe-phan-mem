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
      <section className="px-4 pt-4 md:px-8 md:pt-6">
        <div className="hero-surface flex flex-col-reverse items-center gap-10 overflow-hidden rounded-[2rem] p-7 shadow-xl sm:p-10 md:flex-row md:justify-between lg:p-14">
          <div className="w-full max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="size-3.5" />
              {dict.heroBadge}
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.08] sm:text-5xl">
              {dict.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/80 sm:text-base">
              {dict.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/dishes"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-all hover:gap-3 active:scale-95"
              >
                {dict.startExplore}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <button
                type="button"
                onClick={readIntro}
                aria-pressed={speech.speaking}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition-all hover:bg-white/20 active:scale-95"
              >
                {speech.speaking ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
                {dict.listen}
              </button>
            </div>
          </div>
          {/* Dish photo as a glowing planet */}
          <div className="planet w-44 shrink-0 sm:w-52 lg:w-72">
            <div className="planet-img animate-float relative aspect-square overflow-hidden rounded-full">
              {hero.image && (
                <Image
                  src={hero.image}
                  alt={text(hero).name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 208px, 288px"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search: bấm Enter/kính lúp mới sang /dishes?q=... */}
      <section className="px-4 pt-6 md:px-8">
        <Form action="/dishes" role="search" className="relative mx-auto max-w-2xl">
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchPlaceholder}
            className="w-full rounded-full border-2 border-primary/40 bg-card py-3.5 ps-6 pe-14 text-sm shadow-lg shadow-primary/15 outline-none ring-4 ring-primary/10 transition-all placeholder:text-muted-foreground/80 focus:border-primary focus:ring-primary/15"
          />
          <button
            type="submit"
            aria-label={dict.searchPlaceholder}
            className="absolute end-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
          >
            <Search className="size-4" />
          </button>
        </Form>
      </section>

      {/* Regions */}
      <section className="px-4 pt-12 md:px-8">
        <h2 className="mb-5 font-display text-2xl font-bold sm:text-3xl">{dict.byRegion}</h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {REGIONS.map((r, i) => {
            const k = REGION_DICT[r]
            return (
              <Link
                key={r}
                href={`/dishes?region=${r}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-accent via-accent/40 to-card p-5 shadow-md shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/15 active:scale-[0.98] sm:flex-col sm:items-start sm:gap-6 sm:p-6"
              >
                <span className="pointer-events-none absolute -end-2 -top-5 select-none font-display text-8xl font-bold text-primary/[0.12]">
                  0{i + 1}
                </span>
                <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-card text-2xl shadow-sm ring-1 ring-primary/20">{k.icon}</span>
                <span className="relative min-w-0">
                  <span className="block font-display text-xl font-bold">{dict[k.name]}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{dict[k.desc]}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <Section title={dict.featured} href="/dishes">
        {featured.map((d, i) => (
          <DishCard key={d.id} dish={d} name={d.vi.name} altName={text(d).name} summary={text(d).summary} index={i} />
        ))}
      </Section>

      <Section title={dict.festivalTitle} href="/dishes?cat=festival">
        {festival.map((d, i) => (
          <DishCard key={d.id} dish={d} name={d.vi.name} altName={text(d).name} summary={text(d).summary} index={i} />
        ))}
      </Section>

    </AppShell>
  )
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  const { dict } = useApp()
  return (
    <section className="px-4 pt-14 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-3">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
          {dict.viewAll}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  )
}
