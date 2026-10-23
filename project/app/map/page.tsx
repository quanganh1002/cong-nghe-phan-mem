"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { MapPin, Map as MapIcon, LocateFixed, Navigation, Loader2, Landmark, Store, Volume2 } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DishVisual } from "@/components/dish-card"
import { useApp } from "@/lib/store"
import { DISHES, REGIONS, getDish, getDishPlace, type Region } from "@/lib/dishes"
import { useDishText } from "@/lib/use-dish-text"
import { cn } from "@/lib/utils"

type Coords = { lat: number; lng: number; accuracy: number }
type GeoStatus = "idle" | "locating" | "ok" | "error"
type Mode = "origin" | "nearby"

const REGION_KEY = { north: "regionNorth", central: "regionCentral", south: "regionSouth" } as const
const REGION_EMOJI = { north: "🏯", central: "🏮", south: "🌴" } as const

function Step({ n, title, desc, highlight, children }: { n: number; title: string; desc: string; highlight?: boolean; children: ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-3xl border p-4 shadow-sm sm:p-5",
        highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {n}
        </span>
        <div>
          <h2 className="font-bold leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function MapPage() {
  const { dict } = useApp()
  const dishText = useDishText(DISHES, ["name", "summary"])
  const [region, setRegion] = useState<Region>("north")
  const [dishId, setDishId] = useState(DISHES.find((d) => d.region === "north")!.id)
  const [mode, setMode] = useState<Mode>("origin")
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<GeoStatus>("idle")

  // Mở từ trang chi tiết món: /map?dish=<id>
  useEffect(() => {
    const d = getDish(new URLSearchParams(window.location.search).get("dish") ?? "")
    if (d) {
      setRegion(d.region)
      setDishId(d.id)
    }
  }, [])

  const regionDishes = DISHES.filter((d) => d.region === region)
  const dish = getDish(dishId) ?? regionDishes[0]
  const info = dishText(dish)
  const place = getDishPlace(dish)

  const pickRegion = (r: Region) => {
    setRegion(r)
    setDishId(DISHES.find((d) => d.region === r)!.id)
  }

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error")
      return
    }
    setStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy })
        setStatus("ok")
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  const pickMode = (m: Mode) => {
    setMode(m)
    if (m === "nearby" && !coords && status !== "locating") locate()
  }

  // Tìm trên Google Maps bằng tên tiếng Việt cho khớp với tên quán/địa danh trong nước
  const destination = mode === "origin" ? place : dish.vi.name
  const embedSrc =
    mode === "origin"
      ? `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=14&output=embed`
      : coords
        ? `https://maps.google.com/maps?q=${encodeURIComponent(`${dish.vi.name} near ${coords.lat},${coords.lng}`)}&z=15&output=embed`
        : null

  const directions = () => {
    const params = new URLSearchParams({ api: "1", destination })
    if (coords) params.set("origin", `${coords.lat},${coords.lng}`)
    if (mode === "nearby") params.set("travelmode", "walking")
    window.open(`https://www.google.com/maps/dir/?${params}`, "_blank", "noopener")
  }

  const statusText =
    status === "locating"
      ? dict.mapLocating
      : status === "error"
        ? dict.mapLocateError
        : coords
          ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} · ±${Math.round(coords.accuracy)} m`
          : dict.mapGpsHint

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6">
        <div>
          <h1 className="text-2xl font-extrabold">{dict.mapTitle}</h1>
          <p className="mt-1 text-muted-foreground">{dict.mapSubtitle}</p>
        </div>

        {/* 1. Vùng miền */}
        <Step n={1} title={dict.mapStep1} desc={dict.mapStep1Desc}>
          <div className="grid grid-cols-3 gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pickRegion(r)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 font-semibold transition-colors",
                  region === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                <span className="text-2xl">{REGION_EMOJI[r]}</span>
                <span className="text-sm">{dict[REGION_KEY[r]]}</span>
                <span className={cn("text-xs", region === r ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {DISHES.filter((d) => d.region === r).length} {dict.dishesCount}
                </span>
              </button>
            ))}
          </div>
        </Step>

        {/* 2. Món ăn */}
        <Step n={2} title={dict.mapStep2} desc={dict.mapStep2Desc}>
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5">
            {regionDishes.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDishId(d.id)}
                className={cn(
                  "w-24 shrink-0 snap-start overflow-hidden rounded-2xl border-2 bg-background text-start transition-colors",
                  d.id === dish.id ? "border-primary" : "border-transparent",
                )}
              >
                <div className="relative aspect-square bg-muted [&_span]:text-4xl">
                  <DishVisual dish={d} alt={dishText(d).name} sizes="96px" />
                </div>
                <p className="line-clamp-2 px-1.5 py-1 text-xs font-semibold leading-tight">{dishText(d).name}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-3 rounded-2xl bg-secondary/60 p-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted [&_span]:text-4xl">
              <DishVisual dish={dish} alt={info.name} sizes="80px" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold leading-tight">{info.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{info.summary}</p>
              <Link
                href={`/dishes/${dish.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                <Volume2 className="size-4" />
                {dict.mapViewDish}
              </Link>
            </div>
          </div>
        </Step>

        {/* 3. Bản đồ */}
        <Step n={3} title={dict.mapStep3} desc={dict.mapStep3Desc}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "origin", label: dict.mapModeOrigin, icon: Landmark },
                { key: "nearby", label: dict.mapNearby, icon: Store },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => pickMode(key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                  mode === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-destructive" />
            {mode === "origin" ? (
              <div>
                <p className="font-bold">{place}</p>
                <p className="text-sm text-muted-foreground">{dict.mapModeOriginDesc}</p>
              </div>
            ) : (
              <div>
                <p className="font-bold">{dict.mapYourLocation}</p>
                <p className={cn("text-sm", status === "error" ? "text-destructive" : "text-muted-foreground")}>
                  {statusText}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-border">
            {embedSrc ? (
              <iframe
                key={embedSrc}
                title={dict.mapPlaceholderTitle}
                src={embedSrc}
                className="block h-[50vh] min-h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <button
                type="button"
                onClick={locate}
                disabled={status === "locating"}
                className="flex w-full flex-col items-center gap-3 bg-primary/10 px-4 py-10 text-center transition-colors hover:bg-primary/15"
              >
                {status === "locating" ? (
                  <Loader2 className="size-8 animate-spin text-primary" />
                ) : (
                  <MapIcon className="size-8 text-primary" />
                )}
                <span className="text-lg font-bold text-primary">{dict.mapPlaceholderTitle}</span>
                <span className="text-muted-foreground">{dict.mapPlaceholderDesc}</span>
              </button>
            )}
          </div>
        </Step>

        {/* 4. Đường đi */}
        <Step n={4} title={dict.mapStep4} desc={dict.mapStep4Desc} highlight>
          <p className="mb-3 text-sm">
            <span className="text-muted-foreground">{dict.mapDestination}: </span>
            <span className="font-bold">{mode === "origin" ? place : `${info.name} · ${dict.mapNearby}`}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={locate}
              disabled={status === "locating"}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 font-semibold transition-colors hover:bg-accent disabled:opacity-60"
            >
              {status === "locating" ? <Loader2 className="size-5 animate-spin" /> : <LocateFixed className="size-5" />}
              {coords ? "✓ " : ""}
              {dict.mapMyLocation}
            </button>
            <button
              type="button"
              onClick={directions}
              className="flex flex-col items-center gap-2 rounded-2xl bg-primary px-3 py-4 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
            >
              <Navigation className="size-5" />
              {dict.mapDirections}
            </button>
          </div>
        </Step>

        <p className="text-sm text-muted-foreground">{dict.mapNote}</p>
      </div>
    </AppShell>
  )
}
