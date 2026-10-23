"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Leaf, Map as MapIcon, MapPin, Pause, Play, RotateCcw, ScrollText, Utensils, Volume2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DishCard, DishVisual } from "@/components/dish-card"
import { useApp } from "@/lib/store"
import { DISHES, getDish } from "@/lib/dishes"
import { getLanguage } from "@/lib/languages"
import { useDishText } from "@/lib/use-dish-text"
import { useSpeech } from "@/hooks/use-speech"
import { cn, goBack } from "@/lib/utils"

const REGION_KEY = { north: "regionNorth", central: "regionCentral", south: "regionSouth" } as const
const CAT_KEY = {
  main: "catMain",
  snack: "catSnack",
  drink: "catDrink",
  dessert: "catDessert",
  festival: "catFestival",
} as const

export default function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { dict, lang } = useApp()
  const router = useRouter()
  const speech = useSpeech()
  const [unsupported, setUnsupported] = useState(false)

  const dish = getDish(id)
  const related = dish
    ? DISHES.filter((d) => d.id !== dish.id && (d.region === dish.region || d.category === dish.category)).slice(0, 4)
    : []
  const text = useDishText(dish ? [dish, ...related] : [], ["name", "summary", "origin", "culture", "ingredients", "tip"])

  // Dừng đọc khi rời trang hoặc đổi ngôn ngữ
  useEffect(() => {
    return () => speech.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    speech.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  if (!dish) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <span className="text-5xl">🤔</span>
          <p className="font-semibold text-muted-foreground">{dict.noResults}</p>
          <Link href="/dishes" className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">
            {dict.browseDishes}
          </Link>
        </div>
      </AppShell>
    )
  }

  const info = text(dish)
  const language = getLanguage(lang)
  const narration = [
    info.name,
    info.summary,
    `${dict.sectionOrigin}. ${info.origin}`,
    `${dict.sectionCulture}. ${info.culture}`,
    `${dict.sectionIngredients}. ${info.ingredients}`,
    `${dict.sectionTip}. ${info.tip}`,
  ].join("\n")
  const ingredients = info.ingredients.split(/\s*[,、，،]\s*/).filter(Boolean)
  const isPlaying = speech.speaking && !speech.paused

  const handlePlay = () => {
    if (!speech.supported) {
      setUnsupported(true)
      return
    }
    if (speech.speaking && !speech.paused) speech.pause()
    else if (speech.speaking && speech.paused) speech.resume()
    else speech.speak(narration, language.speechLang)
  }

  const sections = [
    { title: dict.sectionOrigin, icon: ScrollText, body: info.origin },
    { title: dict.sectionCulture, icon: BookOpen, body: info.culture },
  ]

  return (
    <AppShell>
      {/* Hero image */}
      <div className="relative">
        <div className="relative aspect-[16/11] w-full overflow-hidden sm:aspect-[21/9]">
          <DishVisual dish={dish} alt={info.name} sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </div>
        <button
          onClick={() => goBack(router)}
          aria-label={dict.back}
          className="absolute start-4 top-4 grid size-10 place-items-center rounded-full bg-background/80 shadow-md backdrop-blur transition-transform active:scale-90"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
      </div>

      <div className="relative -mt-8 px-4">
        <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
              <MapPin className="size-3.5" />
              {dict[REGION_KEY[dish.region]]}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              {dict[CAT_KEY[dish.category]]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight">{info.name}</h1>
          <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{info.summary}</p>
          <Link
            href={`/map?dish=${dish.id}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3.5 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <MapIcon className="size-4" />
            {dict.mapFindOnMap}
          </Link>

          {/* Narration player */}
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-accent to-secondary p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                aria-label={dict.listen}
                className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90"
              >
                {isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ps-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-bold">
                  <Volume2 className="size-4 text-primary" />
                  {dict.listen}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {language.flag} {language.name} · {language.speechLang}
                </p>
              </div>
              {/* Animated equalizer while speaking */}
              <div className="flex h-8 items-end gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn("w-1 rounded-full bg-primary", isPlaying ? "wave-bar" : "h-1.5 opacity-40")}
                    style={isPlaying ? { height: "100%", animationDelay: `${i * 0.12}s` } : undefined}
                  />
                ))}
              </div>
              {speech.speaking && (
                <button
                  onClick={() => {
                    speech.stop()
                    speech.speak(narration, language.speechLang)
                  }}
                  aria-label={dict.replay}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-background/70 text-foreground shadow transition-transform active:scale-90"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              {unsupported ? dict.notSupported : dict.narrationNote}
            </p>
          </div>
        </div>
      </div>

      {/* Origin + culture */}
      <div className="grid gap-4 px-4 pt-5 md:grid-cols-2">
        {sections.map(({ title, icon: Icon, body }) => (
          <section key={title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <Icon className="size-5 text-primary" />
              {title}
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>

      {/* Ingredients */}
      <section className="mx-4 mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 font-bold">
          <Leaf className="size-5 text-primary" />
          {dict.sectionIngredients}
        </h2>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((x) => (
            <span key={x} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* How to enjoy */}
      <section className="mx-4 mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 font-bold">
          <Utensils className="size-5 text-primary" />
          {dict.sectionTip}
        </h2>
        <p className="text-pretty leading-relaxed text-muted-foreground">{info.tip}</p>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-4 pt-7">
          <h2 className="mb-3 text-lg font-bold">{dict.related}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((d, i) => (
              <DishCard key={d.id} dish={d} name={text(d).name} summary={text(d).summary} index={i} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  )
}
