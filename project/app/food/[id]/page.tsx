"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Minus, Pause, Play, Plus, RotateCcw, Star, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { FoodCard } from "@/components/food-card"
import { useApp } from "@/lib/store"
import { getFood, formatPrice, FOODS } from "@/lib/foods"
import { getLanguage } from "@/lib/languages"
import { useSpeech } from "@/hooks/use-speech"
import { cn } from "@/lib/utils"

export default function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { dict, lang, addToCart } = useApp()
  const router = useRouter()
  const speech = useSpeech()
  const [qty, setQty] = useState(1)

  const food = getFood(id)

  useEffect(() => {
    return () => speech.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop narration when language changes
  useEffect(() => {
    speech.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  if (!food) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <span className="text-5xl">🤔</span>
          <p className="font-semibold text-muted-foreground">{dict.noResults}</p>
          <Link href="/menu" className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">
            {dict.browseMenu}
          </Link>
        </div>
      </AppShell>
    )
  }

  const info = food.t[lang]
  const speechLang = getLanguage(lang).speechLang
  const narration = `${info.name}. ${info.description}`
  const related = FOODS.filter((f) => f.category === food.category && f.id !== food.id).slice(0, 4)

  const handlePlay = () => {
    if (!speech.supported) {
      toast.error(dict.notSupported)
      return
    }
    if (speech.speaking && !speech.paused) speech.pause()
    else if (speech.speaking && speech.paused) speech.resume()
    else speech.speak(narration, speechLang)
  }

  const handleAdd = () => {
    addToCart(food.id, qty)
    toast.success(`${info.name} × ${qty} · ${dict.addToCart}`, { icon: "🛒" })
  }

  const isPlaying = speech.speaking && !speech.paused

  return (
    <AppShell>
      {/* Hero image */}
      <div className="relative">
        <div className="relative aspect-[16/11] w-full overflow-hidden sm:aspect-[21/9]">
          <Image
            src={food.image || "/placeholder.svg"}
            alt={info.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </div>
        <button
          onClick={() => router.back()}
          aria-label="back"
          className="absolute start-4 top-4 grid size-10 place-items-center rounded-full bg-background/80 shadow-md backdrop-blur transition-transform active:scale-90"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
      </div>

      <div className="relative -mt-8 px-4">
        <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-extrabold leading-tight">{info.name}</h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-accent-foreground">
              <Star className="size-4 fill-amber-500 text-amber-500" />
              {food.rating}
            </span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-primary">{formatPrice(food.price)}</p>

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
                  {getLanguage(lang).flag} {getLanguage(lang).name} · {getLanguage(lang).speechLang}
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
                    speech.speak(narration, speechLang)
                  }}
                  aria-label={dict.replay}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-background/70 text-foreground shadow transition-transform active:scale-90"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{dict.narrationNote}</p>
          </div>

          {/* Description */}
          <div className="mt-5">
            <h2 className="mb-1.5 font-bold">{dict.description}</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">{info.description}</p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-4 pt-7">
          <h2 className="mb-3 text-lg font-bold">{dict.featured}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((f, i) => (
              <FoodCard key={f.id} food={f} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky add-to-cart bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 md:bottom-0">
        <div className="mx-auto max-w-6xl px-4">
          <div className="animate-slide-up mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur md:mb-4">
            <div className="flex items-center gap-2 rounded-full bg-secondary p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="-"
                className="grid size-9 place-items-center rounded-full bg-background text-foreground shadow-sm transition-transform active:scale-90"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-bold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="+"
                className="grid size-9 place-items-center rounded-full bg-background text-foreground shadow-sm transition-transform active:scale-90"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] hover:shadow-lg"
            >
              {dict.addToCart}
              <span className="opacity-90">· {formatPrice(food.price * qty)}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
