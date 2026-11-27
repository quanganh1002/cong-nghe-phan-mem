"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Eye, EyeOff, FileText, Pencil, Plus, Trash2 } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFoodSpots } from "@/hooks/use-food-spots"
import { SPOT_RADIUS, type FoodSpot } from "@/lib/dishes"
import { useDishes } from "@/lib/dishes-context"
import { cn } from "@/lib/utils"

// Leaflet chỉ chạy ở trình duyệt
const SpotMap = dynamic(() => import("@/components/spot-map"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-muted/50 text-sm text-muted-foreground">Đang tải bản đồ…</div>,
})

type Tab = "list" | "map"

/** "21.0380, 105.8490" (dán từ Google Maps) → [21.038, 105.849] */
function parseCoords(s: string): [number, number] | null {
  const m = s.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

const input = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
const btn = "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"

/** Hộp thoại thêm / sửa điểm: tên, tọa độ tâm (gõ hoặc bấm lên bản đồ), bán kính */
function SpotForm({
  spot,
  busy,
  error,
  onSave,
  onClose,
}: {
  spot: FoodSpot | null
  busy: boolean
  error: string
  onSave: (body: Omit<FoodSpot, "id">) => void
  onClose: () => void
}) {
  const [name, setName] = useState(spot?.name ?? "")
  const [coords, setCoords] = useState(spot ? `${spot.at[0]}, ${spot.at[1]}` : "")
  const [radius, setRadius] = useState(String(spot?.radius ?? SPOT_RADIUS))
  const [localError, setLocalError] = useState("")
  const at = parseCoords(coords)
  const r = Number(radius)
  const preview = useMemo(
    () => (at ? [{ id: "draft", name: name || "Điểm mới", at, radius: Number.isFinite(r) && r > 0 ? r : SPOT_RADIUS }] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [at?.[0], at?.[1], name, r],
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!at) return setLocalError("Tọa độ phải có dạng: vĩ độ, kinh độ (vd. 21.038, 105.849) — hoặc bấm lên bản đồ")
    setLocalError("")
    onSave({ name, at, radius: r, hidden: spot?.hidden ?? false, dishes: spot?.dishes ?? [] })
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="text-lg">{spot ? `Sửa điểm: ${spot.name}` : "Thêm điểm"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
        <label className="block text-sm font-semibold">
          Tên điểm
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Chợ Đồng Xuân, Hà Nội" maxLength={120} required />
        </label>
        <label className="block text-sm font-semibold">
          Tọa độ tâm (vĩ độ, kinh độ)
          <input className={input} value={coords} onChange={(e) => setCoords(e.target.value)} placeholder="21.038, 105.849" inputMode="decimal" required />
        </label>
        <label className="block text-sm font-semibold">
          Bán kính (m)
          <input className={input} type="number" min={10} max={5000} step={5} value={radius} onChange={(e) => setRadius(e.target.value)} required />
        </label>
      </div>
      <div>
        <SpotMap spots={preview} focus={preview[0]?.at ?? null} onPick={(p) => setCoords(`${p[0]}, ${p[1]}`)} className="h-72 w-full overflow-hidden rounded-lg border border-border sm:h-80" />
        <p className="mt-1.5 text-xs text-muted-foreground">Bấm lên bản đồ để đặt tâm điểm; vòng tròn là vùng theo bán kính.</p>
      </div>
      {(localError || error) && <p className="text-sm font-semibold text-destructive">{localError || error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">
          Hủy
        </button>
        <button type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {spot ? "Lưu thay đổi" : "Thêm điểm"}
        </button>
      </div>
    </form>
  )
}

/** Hộp thoại "Nội dung": chọn các món bán ở điểm này (hiện ở trang bản đồ) */
function SpotContent({ spot, busy, error, onSave, onClose }: { spot: FoodSpot; busy: boolean; error: string; onSave: (dishes: string[]) => void; onClose: () => void }) {
  const { dishes } = useDishes()
  const [chosen, setChosen] = useState(spot.dishes)
  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle className="text-lg">Nội dung: {spot.name}</DialogTitle>
        <p className="text-sm text-muted-foreground">Các món bán ở điểm này ({chosen.length}). Khách bấm vào điểm trên trang bản đồ sẽ thấy các món này.</p>
      </DialogHeader>
      <div className="flex max-h-[50vh] flex-wrap gap-1.5 overflow-y-auto">
        {dishes.map((d) => {
          const on = chosen.includes(d.id)
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
              )}
            >
              {d.emoji} {d.vi.name}
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-bold">
          Hủy
        </button>
        <button type="button" disabled={busy} onClick={() => onSave(chosen)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
          Lưu nội dung
        </button>
      </div>
    </div>
  )
}

/** Quản lý điểm ẩm thực (POI): danh sách + sơ đồ vùng. Lưu qua /api/spots. */
function SpotManager({ pin }: { pin: string }) {
  const [spots, reload] = useFoodSpots(pin)
  const { getDish } = useDishes()
  const [tab, setTab] = useState<Tab>("list")
  // null: đóng; "new": thêm; FoodSpot: sửa
  const [form, setForm] = useState<FoodSpot | "new" | null>(null)
  const [content, setContent] = useState<FoodSpot | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const call = async (method: string, id: string | null, body?: unknown) => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/spots${id ? `?id=${encodeURIComponent(id)}` : ""}`, {
        method,
        headers: { "x-admin-pin": pin, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      if (!res.ok) {
        setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Lỗi ${res.status}`)
        return false
      }
      reload()
      return true
    } catch {
      setError("Không kết nối được máy chủ")
      return false
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setForm(null)
    setContent(null)
    setError("")
  }

  const remove = async (s: FoodSpot) => {
    if (confirm(`Xóa hẳn "${s.name}"? (Chỉ muốn tạm thời không hiện thì bấm "Ẩn".)`)) await call("DELETE", s.id)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Tabs */}
      <div role="tablist" className="flex border-b border-border">
        {(
          [
            ["list", "Danh sách điểm"],
            ["map", "Sơ đồ vùng"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
              tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {spots.length} điểm · {spots.filter((s) => !s.hidden).length} đang hiển thị
          </p>
          <button
            type="button"
            onClick={() => {
              setError("")
              setForm("new")
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <Plus className="size-4" />
            Thêm điểm
          </button>
        </div>
        {error && !form && !content && <p className="mb-3 text-sm font-semibold text-destructive">{error}</p>}

        {tab === "list" ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-primary/10 text-xs uppercase tracking-wide">
                <tr>
                  <th className="w-14 px-3 py-3 text-center font-bold">STT</th>
                  <th className="px-3 py-3 text-left font-bold">Tên điểm</th>
                  <th className="px-3 py-3 text-center font-bold">Tọa độ tâm</th>
                  <th className="px-3 py-3 text-center font-bold">Bán kính</th>
                  <th className="px-3 py-3 text-center font-bold">Trạng thái</th>
                  <th className="px-3 py-3 text-center font-bold">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {spots.map((s, i) => (
                  <tr key={s.id} className={cn("border-t border-border", s.hidden && "bg-muted/40")}>
                    <td className="px-3 py-3 text-center tabular-nums">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-bold">{s.name}</p>
                      <a href={`/map?spot=${s.id}`} target="_blank" rel="noopener" className="text-xs text-muted-foreground hover:text-primary hover:underline">
                        /map?spot={s.id}
                      </a>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {s.dishes.length ? s.dishes.map((id) => getDish(id)?.vi.name ?? id).join(", ") : "Chưa có món"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">
                      {s.at[0].toFixed(5)}, {s.at[1].toFixed(5)}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums">{s.radius ?? SPOT_RADIUS} m</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block rounded px-2 py-1 text-xs font-bold",
                          s.hidden ? "bg-muted text-muted-foreground" : "bg-emerald-600 text-white",
                        )}
                      >
                        {s.hidden ? "Đang ẩn" : "Đang hiển thị"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex flex-wrap items-center justify-center gap-1.5">
                        <button type="button" onClick={() => (setError(""), setContent(s))} className={cn(btn, "bg-sky-600")}>
                          <FileText className="size-3.5" />
                          Nội dung ({s.dishes.length})
                        </button>
                        <button type="button" onClick={() => (setError(""), setForm(s))} className={cn(btn, "bg-amber-500")}>
                          <Pencil className="size-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => call("PUT", s.id, { ...s, hidden: !s.hidden })}
                          className={cn(btn, s.hidden ? "bg-emerald-600" : "bg-red-600")}
                        >
                          {s.hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                          {s.hidden ? "Hiện" : "Ẩn"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(s)}
                          aria-label={`Xóa ${s.name}`}
                          title="Xóa hẳn"
                          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <SpotMap spots={spots} className="h-[65vh] min-h-96 w-full overflow-hidden rounded-lg border border-border" />
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="me-1 inline-block size-3 rounded-full border-2 border-[#6d4aff] bg-[#6d4aff]/20 align-middle" />
                Đang hiển thị
              </span>
              <span>
                <span className="me-1 inline-block size-3 rounded-full border-2 border-dashed border-[#9ca3af] align-middle" />
                Đang ẩn
              </span>
              <span>Bấm vào một điểm để phóng to và thấy vòng tròn bán kính.</span>
            </p>
          </div>
        )}
      </div>

      <Dialog open={form !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {form !== null && (
            <SpotForm
              key={form === "new" ? "new" : form.id}
              spot={form === "new" ? null : form}
              busy={busy}
              error={error}
              onClose={close}
              onSave={async (body) => {
                if (await call(form === "new" ? "POST" : "PUT", form === "new" ? null : form.id, body)) close()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={content !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-2xl">
          {content && (
            <SpotContent
              key={content.id}
              spot={content}
              busy={busy}
              error={error}
              onClose={close}
              onSave={async (dishes) => {
                if (await call("PUT", content.id, { ...content, dishes })) close()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminSpotsPage() {
  return <AdminShell title="Quản lý điểm ẩm thực & vùng">{(pin) => <SpotManager pin={pin} />}</AdminShell>
}
