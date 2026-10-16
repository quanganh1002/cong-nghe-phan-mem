"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus, Star, Sparkles, Flame } from "lucide-react"
import { toast } from "sonner"
import type { Food } from "@/lib/foods"
import { formatPrice } from "@/lib/foods"
import { useApp } from "@/lib/store"
import { useRequireLogin } from "@/lib/require-login"

export function FoodCard({ food, index = 0 }: { food: Food; index?: number }) {
  const { lang, dict, addToCart } = useApp()
  const requireLogin = useRequireLogin()
  const info = food.t[lang]

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!requireLogin()) return // giao hàng mà chưa đăng nhập → đã chuyển sang trang đăng nhập
    addToCart(food.id, 1)
    toast.success(`${info.name} · ${dict.addToCart}`, {
      icon: "🛒",
    })
  }

  return (
    <Link
      href={`/food/${food.id}`}
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-fade-up group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={food.image || "/placeholder.svg"}
          alt={info.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute start-2 top-2 flex gap-1.5">
          {food.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
              <Flame className="size-3" />
              {dict.sortPopular}
            </span>
          )}
          {food.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-chart-4 px-2 py-0.5 text-[11px] font-bold text-white shadow">
              <Sparkles className="size-3" />
              {dict.newDishes}
            </span>
          )}
        </div>
        <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {food.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 font-bold leading-tight">{info.name}</h3>
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{info.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-extrabold text-primary">{formatPrice(food.price)}</span>
          <button
            onClick={handleAdd}
            aria-label={dict.addToCart}
            className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all active:scale-90 hover:rotate-90 hover:shadow-md"
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
