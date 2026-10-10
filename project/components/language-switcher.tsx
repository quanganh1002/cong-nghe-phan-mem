"use client"

import { useState } from "react"
import { Check, Globe } from "lucide-react"
import { LANGUAGES } from "@/lib/languages"
import { useApp } from "@/lib/store"
import { t } from "@/lib/i18n"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ variant = "chip" }: { variant?: "chip" | "icon" }) {
  const { lang, setLang, dict } = useApp()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === lang)!

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={dict.language}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border bg-card font-semibold shadow-sm transition-all active:scale-95 hover:border-primary/40",
          variant === "chip" ? "px-3 py-1.5 text-sm" : "size-10 justify-center",
        )}
      >
        <span className="text-lg leading-none">{current.flag}</span>
        {variant === "chip" && <span className="max-w-24 truncate">{current.name}</span>}
        {variant === "chip" && <Globe className="size-4 text-muted-foreground" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden gap-0">
          <DialogHeader className="p-5 pb-3 text-start">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Globe className="size-5 text-primary" />
              {dict.languageTitle}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">{dict.languageNote}</p>
          </DialogHeader>
          <div className="grid max-h-[55vh] grid-cols-1 gap-1.5 overflow-y-auto p-3 sm:grid-cols-2">
            {LANGUAGES.map((l, i) => {
              const active = l.code === lang
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code)
                    setOpen(false)
                  }}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={cn(
                    "animate-fade-up flex items-center gap-3 rounded-2xl border p-3 text-start transition-all active:scale-[0.97]",
                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                  )}
                >
                  <span className="text-2xl leading-none">{l.flag}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold leading-tight">{l.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{l.englishName}</span>
                  </span>
                  {active && <Check className="size-5 shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
          <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">
            {t(lang, "appTagline")}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
