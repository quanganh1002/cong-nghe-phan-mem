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
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40",
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
      <section className="px-4 pt-5">
        <h1 className="text-2xl font-extrabold">{dict.dishesTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length} {dict.dishesCount}
        </p>

        <div className="relative mt-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.searchPlaceholder}
            aria-label={dict.searchPlaceholder}
            className="w-full rounded-2xl border border-border bg-card py-3 ps-4 pe-12 text-sm shadow-sm outline-none transition-colors focus:border-primary"
          />
          <Search className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={region === null} onClick={() => setRegion(null)}>
            {dict.regionAll}
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {dict[REGION_KEY[r]]}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
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

      <section className="px-4 pt-5">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🤔</span>
            <p className="font-semibold text-muted-foreground">{dict.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((d, i) => (
              <DishCard key={d.id} dish={d} name={text(d).name} summary={text(d).summary} index={i} />
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
