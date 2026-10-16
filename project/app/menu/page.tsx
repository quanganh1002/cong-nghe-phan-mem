"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { LogIn, Search, SlidersHorizontal, UtensilsCrossed, X } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { FoodCard } from "@/components/food-card"
import { useApp } from "@/lib/store"
import { FOODS, CATEGORIES, type Category } from "@/lib/foods"
import { isValidTable, useTable } from "@/lib/table"
import { cn } from "@/lib/utils"

type Sort = "popular" | "priceLow" | "priceHigh"

function MenuContent() {
  const { dict, lang, user, hydrated } = useApp()
  const params = useSearchParams()
  const initialCat = (params.get("cat") as Category | null) ?? "all"

  // Khách quét QR ở bàn → link có dạng /menu?table=5 → nhớ số bàn lại
  // Quét QR chung (đặt online) → link /menu?table=none → xóa số bàn đang nhớ, đặt kiểu giao hàng
  const [table, setTable] = useTable()
  useEffect(() => {
    const t = params.get("table")
    if (t === "none") setTable(null)
    else if (isValidTable(t)) setTable(t)
  }, [params, setTable])

  const [cat, setCat] = useState<Category | "all">(
    CATEGORIES.some((c) => c.key === initialCat) ? (initialCat as Category) : "all",
  )
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<Sort>("popular")

  const results = useMemo(() => {
    let list = FOODS.filter((f) => cat === "all" || f.category === cat)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((f) => {
        const info = f.t[lang]
        return (
          info.name.toLowerCase().includes(q) ||
          info.description.toLowerCase().includes(q) ||
          f.t.en.name.toLowerCase().includes(q)
        )
      })
    }
    list = [...list]
    if (sort === "priceLow") list.sort((a, b) => a.price - b.price)
    else if (sort === "priceHigh") list.sort((a, b) => b.price - a.price)
    else list.sort((a, b) => Number(b.popular ?? false) - Number(a.popular ?? false) || b.rating - a.rating)
    return list
  }, [cat, query, sort, lang])

  const catTabs: { key: Category | "all"; label: string; icon?: string }[] = [
    { key: "all", label: dict.catAll },
    ...CATEGORIES.map((c) => ({
      key: c.key,
      label: dict[`cat${c.key[0].toUpperCase()}${c.key.slice(1)}` as keyof typeof dict] as string,
      icon: c.icon,
    })),
  ]

  const sortOptions: { key: Sort; label: string }[] = [
    { key: "popular", label: dict.sortPopular },
    { key: "priceLow", label: dict.sortPriceLow },
    { key: "priceHigh", label: dict.sortPriceHigh },
  ]

  return (
    <div className="px-4 pt-4">
      <h1 className="text-2xl font-extrabold">{dict.menuTitle}</h1>

      {/* Đang ngồi tại bàn (vào từ QR) */}
      {table && (
        <div className="animate-fade-up mt-3 flex items-center gap-3 rounded-2xl bg-accent px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-accent-foreground">
              {lang === "vi" ? `Bạn đang ngồi bàn ${table}` : `You're at table ${table}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "vi" ? "Món sẽ được mang ra tận bàn" : "Your food will be served to your table"}
            </p>
          </div>
        </div>
      )}

      {/* Không ngồi tại bàn + chưa đăng nhập → báo trước: đặt giao hàng cần đăng nhập */}
      {hydrated && !table && !user && (
        <div className="animate-fade-up mt-3 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {lang === "vi" ? "Đặt giao hàng cần đăng nhập" : "Log in to order for delivery"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "vi" ? "Ngồi tại quán? Quét mã QR trên bàn để gọi món luôn." : "Dining in? Scan the QR code on your table."}
            </p>
          </div>
          <Link
            href="/login?next=/menu"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform active:scale-95"
          >
            <LogIn className="size-4" />
            {dict.login}
          </Link>
        </div>
      )}

      {/* Search */}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="w-full rounded-2xl border border-border bg-card py-3 ps-11 pe-10 text-sm shadow-sm outline-none transition-colors focus:border-primary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="clear"
            className="absolute end-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {catTabs.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              cat === c.key
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {c.icon && <span>{c.icon}</span>}
            {c.label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{dict.foundDishes.replace("{count}", String(results.length))}</p>
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
          {sortOptions.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                sort === s.key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {results.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((f, i) => (
            <FoodCard key={f.id} food={f} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🍽️</span>
          <p className="font-semibold text-muted-foreground">{dict.noResults}</p>
        </div>
      )}
    </div>
  )
}

export default function MenuPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-4 pt-8 text-muted-foreground">…</div>}>
        <MenuContent />
      </Suspense>
    </AppShell>
  )
}
