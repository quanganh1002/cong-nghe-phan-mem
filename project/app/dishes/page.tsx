"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DishCard } from "@/components/dish-card"
import { useApp } from "@/lib/store"
import { CATEGORIES, DISHES, REGIONS, type DishCategory, type Region } from "@/lib/dishes"
import { useDishText } from "@/lib/use-dish-text"
import { cn } from "@/lib/utils"

const REGION_KEY = { north: "regionNorth", central: "regionCentral", south: "regionSouth" } as const
const CAT_KEY = {
  main: "catMain",
  snack: "catSnack",
  drink: "catDrink",
  dessert: "catDessert",
  festival: "catFestival",
} as const

/** Bỏ dấu + chữ thường để gõ "pho" vẫn tìm ra "Phở" */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all active:scale-95",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function DishList() {
  const { dict } = useApp()
  const params = useSearchParams()
  const text = useDishText(DISHES, ["name", "summary"])

  const initialRegion = REGIONS.find((r) => r === params.get("region")) ?? null
  const initialCat = CATEGORIES.find((c) => c.key === params.get("cat"))?.key ?? null
  const [region, setRegion] = useState<Region | null>(initialRegion)
  const [cat, setCat] = useState<DishCategory | null>(initialCat)
  const [q, setQ] = useState(params.get("q") ?? "")

  const list = useMemo(() => {
    const needle = norm(q.trim())
    return DISHES.filter((d) => {
      if (region && d.region !== region) return false
      if (cat && d.category !== cat) return false
      if (!needle) return true
      const t = text(d)
      return norm(`${d.vi.name} ${d.en.name} ${t.name} ${t.summary}`).includes(needle)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, region, cat, text])

  return (
    <AppShell>
      <section className="px-5 pt-8 md:px-8 md:pt-12">
        <p className="eyebrow">{list.length} {dict.dishesCount}</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{dict.dishesTitle}</h1>

        <div className="relative mt-6 max-w-xl">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchPlaceholder}
            className="w-full rounded-full border border-border bg-card py-3 ps-5 pe-12 text-sm shadow-sm outline-none transition-all focus:border-primary focus:shadow-md focus:shadow-primary/10"
          />
          <Search className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0">
          <Chip active={region === null} onClick={() => setRegion(null)}>
            {dict.regionAll}
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {dict[REGION_KEY[r]]}
            </Chip>
          ))}
        </div>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0">
          <Chip active={cat === null} onClick={() => setCat(null)}>
            {dict.catAll}
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>
              {c.icon} {dict[CAT_KEY[c.key]]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8 md:px-8">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🤔</span>
            <p className="font-semibold text-muted-foreground">{dict.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((d, i) => (
              <DishCard key={d.id} dish={d} name={d.vi.name} altName={text(d).name} summary={text(d).summary} index={i} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default function DishesPage() {
  return (
    <Suspense fallback={null}>
      <DishList />
    </Suspense>
  )
}
