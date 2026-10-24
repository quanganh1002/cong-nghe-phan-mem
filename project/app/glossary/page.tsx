"use client"

import { useState } from "react"
import { Languages, Search, Volume2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { useApp } from "@/lib/store"
import { GLOSSARY } from "@/lib/glossary"
import { getLanguage } from "@/lib/languages"
import { useL10n } from "@/lib/translate-client"
import { splitText, useSpeech } from "@/hooks/use-speech"
import { cn } from "@/lib/utils"

const VI_NAMES = GLOSSARY.map((g) => g.vi.name)
const EN_NAMES = GLOSSARY.map((g) => g.en.name)
const VI_DESCS = GLOSSARY.map((g) => g.vi.desc)
const EN_DESCS = GLOSSARY.map((g) => g.en.desc)

/** Lowercase, no diacritics, so "nuoc mam" finds "nước mắm" */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")

export default function GlossaryPage() {
  const { dict, lang } = useApp()
  const speech = useSpeech()
  const [query, setQuery] = useState("")
  // Which button is playing, as "<term id>:term" or "<term id>:meaning"
  const [active, setActive] = useState<string | null>(null)

  const names = useL10n(VI_NAMES, EN_NAMES, lang)
  const descs = useL10n(VI_DESCS, EN_DESCS, lang)
  const language = getLanguage(lang)
  const foreign = lang !== "vi" && lang !== "en"

  const q = fold(query.trim())
  const items = GLOSSARY.map((g, i) => ({ g, name: names[i], desc: descs[i] })).filter(
    ({ g, name }) => !q || fold(g.term).includes(q) || fold(name).includes(q),
  )

  const play = (key: string, segments: string[], speechLang: string, title: string) => {
    if (active === key && speech.speaking) {
      speech.stop()
      return
    }
    setActive(key)
    speech.speak(segments, speechLang, 0, title)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-2xl font-extrabold">{dict.glossaryTitle}</h1>
        <p className="mt-1 text-muted-foreground">{dict.glossarySubtitle}</p>
        {foreign && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Languages className="mt-0.5 size-3.5 shrink-0" />
            {dict.machineNotice}
          </p>
        )}

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.glossarySearch}
            className="w-full rounded-full border border-border bg-card py-2.5 pe-4 ps-10 outline-none focus:border-primary"
          />
        </label>

        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{dict.glossaryNoResults}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map(({ g, name, desc }) => {
              const termKey = `${g.id}:term`
              const meaningKey = `${g.id}:meaning`
              const termOn = speech.speaking && active === termKey
              const meaningOn = speech.speaking && active === meaningKey
              return (
                <li key={g.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xl font-extrabold leading-tight text-primary">{g.term}</p>
                      {lang !== "vi" && <p className="mt-0.5 text-sm font-semibold">{name}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => play(termKey, [g.term], "vi-VN", g.term)}
                        aria-label={dict.glossaryListenTerm}
                        title={dict.glossaryListenTerm}
                        className={cn(
                          "grid size-9 place-items-center rounded-full shadow transition-transform active:scale-90",
                          termOn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <Volume2 className="size-4" />
                      </button>
                      <button
                        onClick={() => play(meaningKey, splitText(desc), language.speechLang, name)}
                        aria-label={dict.glossaryListenMeaning}
                        title={dict.glossaryListenMeaning}
                        className={cn(
                          "grid size-9 place-items-center rounded-full shadow transition-transform active:scale-90",
                          meaningOn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <Languages className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
