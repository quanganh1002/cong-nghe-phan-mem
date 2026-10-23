"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { useApp } from "@/lib/store"

export default function AboutPage() {
  const { dict } = useApp()
  const steps = [dict.aboutHow1, dict.aboutHow2, dict.aboutHow3]

  return (
    <AppShell>
      <article className="mx-auto max-w-2xl px-4 pt-6">
        <h1 className="text-2xl font-extrabold">{dict.aboutTitle}</h1>
        <div className="mt-3 space-y-3 text-pretty leading-relaxed text-muted-foreground">
          <p>{dict.aboutP1}</p>
          <p>{dict.aboutP2}</p>
          <p>{dict.aboutP3}</p>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-bold">{dict.aboutHowTitle}</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <Link
          href="/dishes"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-md transition-all active:scale-95 hover:gap-3"
        >
          {dict.startExplore}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </article>
    </AppShell>
  )
}
