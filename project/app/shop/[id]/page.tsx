"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, MapPin, Phone, Star } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { FoodCard } from "@/components/food-card"
import { ReviewsPanel, useReviews } from "@/components/reviews"
import { useApp } from "@/lib/store"
import { FOODS } from "@/lib/foods"
import { cn } from "@/lib/utils"
import { useShopInfo } from "@/hooks/use-shop-info"
import { ShopAvatar } from "@/components/shop-avatar"

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { dict } = useApp()
  const router = useRouter()
  const shop = useShopInfo(id)
  const [tab, setTab] = useState<"menu" | "reviews">("menu")
  const endpoint = `/api/shops/${id}/reviews`
  const [reviews, loadReviews] = useReviews(endpoint)

  if (!shop) {
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

  const foods = FOODS.filter((f) => f.shop === shop.id)
  // Trung bình số sao khách đánh giá; chưa có lượt nào thì hiện "–"
  const rating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "–"

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          aria-label="back"
          className="grid size-10 place-items-center rounded-full bg-card shadow-md transition-transform active:scale-90"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>

        <div className="animate-fade-up mt-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <ShopAvatar value={shop.emoji} className="size-20 bg-accent text-5xl" />
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight">{shop.name}</h1>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold">
                <Star className="size-4 fill-amber-500 text-amber-500" />
                {rating}
              </p>
            </div>
          </div>

          <h2 className="mt-5 mb-2 font-bold">{dict.shopInfo}</h2>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <dt className="sr-only">{dict.address}</dt>
              <dd>{shop.address}</dd>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <dt className="sr-only">{dict.phone}</dt>
              <dd>
                <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="font-semibold text-primary hover:underline">
                  {shop.phone}
                </a>
              </dd>
            </div>
            {shop.email && (
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <dt className="sr-only">{dict.email}</dt>
                <dd>
                  <a href={`mailto:${shop.email}`} className="break-all font-semibold text-primary hover:underline">
                    {shop.email}
                  </a>
                </dd>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Star className="mt-0.5 size-4 shrink-0 text-primary" />
              <dt className="sr-only">{dict.rating}</dt>
              <dd>
                {dict.rating}: {rating}/5 ({reviews.length} {dict.reviews.toLowerCase()})
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="px-4 pt-6 pb-6">
        <div role="tablist" className="mb-4 flex gap-1 rounded-full bg-secondary p-1">
          {(["menu", "reviews"] as const).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {key === "menu" ? `${dict.shopMenu} (${foods.length})` : `${dict.reviews} (${reviews.length})`}
            </button>
          ))}
        </div>

        {tab === "menu" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {foods.map((f, i) => (
              <FoodCard key={f.id} food={f} index={i} />
            ))}
          </div>
        ) : (
          <ReviewsPanel endpoint={endpoint} reviews={reviews} onSaved={loadReviews} />
        )}
      </section>
    </AppShell>
  )
}
