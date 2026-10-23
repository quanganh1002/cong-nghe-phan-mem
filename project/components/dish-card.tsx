"use client"

import Image from "next/image"
import Link from "next/link"
import { Flame, MapPin } from "lucide-react"
import type { Dish } from "@/lib/dishes"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

const REGION_KEY = { north: "regionNorth", central: "regionCentral", south: "regionSouth" } as const

/** Ảnh món ăn; món chưa có ảnh thì hiện emoji trên nền màu */
export function DishVisual({ dish, alt, sizes, className }: { dish: Dish; alt: string; sizes?: string; className?: string }) {
  return dish.image ? (
    <Image src={dish.image} alt={alt} fill sizes={sizes} priority={false} className={cn("object-cover", className)} />
  ) : (
    <div
      role="img"
      aria-label={alt}
      className={cn("absolute inset-0 grid place-items-center bg-gradient-to-br from-accent via-secondary to-accent", className)}
    >
      <span className="text-6xl drop-shadow-sm sm:text-7xl">{dish.emoji}</span>
    </div>
  )
}

export function DishCard({
  dish,
  name,
  summary,
  index = 0,
}: {
  dish: Dish
  name: string
  summary: string
  index?: number
}) {
  const { dict } = useApp()

  return (
    <Link
      href={`/dishes/${dish.id}`}
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-fade-up group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <DishVisual
          dish={dish}
          alt={name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute start-2 top-2 flex gap-1.5">
          {dish.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
              <Flame className="size-3" />
              {dict.featured}
            </span>
          )}
        </div>
        <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
          <MapPin className="size-3" />
          {dict[REGION_KEY[dish.region]]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 font-bold leading-tight">{name}</h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{summary}</p>
      </div>
    </Link>
  )
}
