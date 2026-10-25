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
      className="animate-fade-up group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted ring-1 ring-border transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/15">
        <DishVisual
          dish={dish}
          alt={name}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        {dish.popular && (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow">
            <Flame className="size-3" />
            {dict.featured}
          </span>
        )}
        <span className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow">
          <MapPin className="size-3" />
          {dict[REGION_KEY[dish.region]]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3">
        <h3 className="line-clamp-1 font-display text-lg font-bold leading-snug transition-colors group-hover:text-primary">
          {name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary}</p>
      </div>
    </Link>
  )
}
