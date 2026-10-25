"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Map as MapIcon, LocateFixed, Navigation, Loader2, Landmark, Store, Volume2, Pause } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { DishVisual } from "@/components/dish-card"
import { useApp } from "@/lib/store"
import { DISHES, REGIONS, distanceKm, getDish, getDishCoords, getDishPlace, type Region } from "@/lib/dishes"
import { getLanguage } from "@/lib/languages"
import { useSpeech } from "@/hooks/use-speech"
import { useReportListening } from "@/lib/listening"
import { trackFeature } from "@/lib/track"
import { useDishText } from "@/lib/use-dish-text"
import { cn } from "@/lib/utils"

type Coords = { lat: number; lng: number; accuracy: number }
type GeoStatus = "idle" | "locating" | "ok" | "error"
type Mode = "origin" | "nearby"

const REGION_KEY = { north: "regionNorth", central: "regionCentral", south: "regionSouth" } as const
const REGION_EMOJI = { north: "🏯", central: "🏮", south: "🌴" } as const

/** Small numbered label above a control group, so the page reads top to bottom: region → dish → map */
function Label({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mb-2.5 flex items-center gap-2 text-sm font-bold">
      <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">{n}</span>
      {children}
    </p>
  )
}

export default function MapPage() {
  const { dict, lang } = useApp()
  const speech = useSpeech()
  const [playingId, setPlayingId] = useState<string | null>(null)
  useReportListening(speech.speaking && !speech.paused ? playingId : null)
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

  // Dishes whose place is closest to the visitor (straight-line distance)
  const nearest = coords
    ? DISHES.flatMap((d) => {
        const at = getDishCoords(d)
        return at ? [{ dish: d, km: distanceKm([coords.lat, coords.lng], at) }] : []
      })
        .sort((a, b) => a.km - b.km)
        .slice(0, 4)
    : []

  const listenNear = (d: (typeof DISHES)[number]) => {
    if (playingId === d.id && speech.speaking) {
      speech.stop()
      return
    }
    const t = dishText(d)
    trackFeature("near_listen")
    setPlayingId(d.id)
    speech.speak([t.name, ...t.summary.split(/(?<=[.!?。！？])\s+/)], getLanguage(lang).speechLang, 0, t.name)
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
      <div className="px-5 pt-8 md:px-8 md:pt-12">
        <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl">{dict.mapTitle}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{dict.mapSubtitle}</p>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 px-5 md:px-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        {/* Left: choose a region, then a dish */}
        <div className="min-w-0 space-y-6">
          <div>
            <Label n={1}>{dict.mapStep1}</Label>
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRegion(r)}
                  aria-pressed={region === r}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 transition-all",
                    region === r ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <span className="text-xl">{REGION_EMOJI[r]}</span>
                  <span className="text-sm font-bold">{dict[REGION_KEY[r]]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label n={2}>{dict.mapStep2}</Label>
            <div className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 no-scrollbar md:-mx-8 md:px-8 lg:mx-0 lg:max-h-[26rem] lg:flex-col lg:overflow-y-auto lg:px-0 lg:pb-0 lg:pe-1">
              {regionDishes.map((d) => {
                const on = d.id === dish.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDishId(d.id)}
                    aria-pressed={on}
                    className={cn(
                      "flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border text-start transition-all lg:w-full lg:flex-row lg:items-center lg:gap-3 lg:p-2",
                      on
                        ? "border-primary bg-accent shadow-md shadow-primary/10 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-muted lg:size-14 lg:shrink-0 lg:overflow-hidden lg:rounded-xl [&_span]:text-4xl">
                      <DishVisual dish={d} alt={dishText(d).name} sizes="144px" />
                    </div>
                    <p className="line-clamp-2 px-2.5 py-2 text-sm font-bold leading-tight lg:p-0">{dishText(d).name}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: the map is the main thing; mode toggle on top, actions underneath */}
        <div className="min-w-0 lg:sticky lg:top-24">
          <Label n={3}>{dict.mapStep3}</Label>
          <div className="overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-lg shadow-primary/10">
            <div className="grid grid-cols-2 gap-1 border-b border-border bg-muted/50 p-1.5">
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
                  aria-pressed={mode === key}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all",
                    mode === key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {embedSrc ? (
              <iframe
                key={embedSrc}
                title={dict.mapPlaceholderTitle}
                src={embedSrc}
                className="block h-[52vh] min-h-72 w-full lg:h-[26rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <button
                type="button"
                onClick={locate}
                disabled={status === "locating"}
                className="flex h-[52vh] min-h-72 w-full flex-col items-center justify-center gap-3 bg-accent/40 px-4 text-center transition-colors hover:bg-accent/60 lg:h-[26rem]"
              >
                {status === "locating" ? (
                  <Loader2 className="size-8 animate-spin text-primary" />
                ) : (
                  <MapIcon className="size-8 text-primary" />
                )}
                <span className="text-lg font-bold text-primary">{dict.mapPlaceholderTitle}</span>
                <span className="text-sm text-muted-foreground">{dict.mapPlaceholderDesc}</span>
              </button>
            )}

            {/* Destination + actions */}
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{dict.mapDestination}</p>
                  {mode === "origin" ? (
                    <>
                      <p className="font-bold">{place}</p>
                      <p className="text-sm text-muted-foreground">{dict.mapModeOriginDesc}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">
                        {info.name} · {dict.mapNearby}
                      </p>
                      <p className={cn("text-sm", status === "error" ? "text-destructive" : "text-muted-foreground")}>
                        {dict.mapYourLocation}: {statusText}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={locate}
                  disabled={status === "locating"}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-3 text-sm font-bold transition-colors hover:bg-accent disabled:opacity-60"
                >
                  {status === "locating" ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                  {coords ? "✓ " : ""}
                  {dict.mapMyLocation}
                </button>
                <button
                  type="button"
                  onClick={directions}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-95"
                >
                  <Navigation className="size-4" />
                  {dict.mapDirections}
                </button>
              </div>

              {/* The chosen dish, with a link to its story */}
              <div className="flex gap-3 rounded-2xl bg-accent/50 p-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted [&_span]:text-3xl">
                  <DishVisual dish={dish} alt={info.name} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold leading-tight">{info.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{info.summary}</p>
                  <Link
                    href={`/dishes/${dish.id}`}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                  >
                    <Volume2 className="size-4" />
                    {dict.mapViewDish}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dishes near the visitor */}
      <section className="mx-5 mt-10 rounded-3xl border border-primary/30 bg-gradient-to-br from-accent via-accent/40 to-card p-5 shadow-md shadow-primary/10 md:mx-8 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold leading-tight">
          <LocateFixed className="size-5 text-primary" />
          {dict.mapNearYouTitle}
        </h2>
        {nearest.length === 0 ? (
          <>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{dict.mapNearYouDesc}</p>
            {status === "error" && <p className="mt-2 text-sm text-destructive">{dict.mapLocateError}</p>}
            <button
              type="button"
              onClick={() => {
                trackFeature("near_me")
                locate()
              }}
              disabled={status === "locating"}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow transition-transform active:scale-95 disabled:opacity-60"
            >
              {status === "locating" ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
              {status === "locating" ? dict.mapLocating : dict.mapNearYouFind}
            </button>
          </>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {nearest.map(({ dish: d, km }) => {
              const on = speech.speaking && playingId === d.id
              return (
                <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-sm">
                  <Link href={`/dishes/${d.id}`} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted [&_span]:text-3xl">
                    <DishVisual dish={d} alt={dishText(d).name} sizes="56px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/dishes/${d.id}`} className="block truncate font-bold hover:underline">
                      {dishText(d).name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {km < 10 ? km.toFixed(1) : Math.round(km)} km · {getDishPlace(d)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => listenNear(d)}
                    aria-label={dict.mapListenHere}
                    title={dict.mapListenHere}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow transition-transform active:scale-90"
                  >
                    {on ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="px-5 pt-6 text-xs text-muted-foreground md:px-8">{dict.mapNote}</p>
    </AppShell>
  )
}
