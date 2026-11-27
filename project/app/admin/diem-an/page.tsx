"use client"

import { useState } from "react"
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useFoodSpots } from "@/hooks/use-food-spots"
import type { FoodSpot } from "@/lib/dishes"
import { useDishes } from "@/lib/dishes-context"
import { cn } from "@/lib/utils"

type Draft = { name: string; coords: string; dishes: string[] }
const EMPTY: Draft = { name: "", coords: "", dishes: [] }

/** "21.0380, 105.8490" (dán từ Google Maps) → [21.038, 105.849] */
function parseCoords(s: string): [number, number] | null {
  const m = s.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

const input = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"

/** Thêm / sửa / xóa điểm ẩm thực (POI) hiện ở trang /map. Lưu qua /api/spots. */
function SpotManager({ pin }: { pin: string }) {
  const [spots, reload] = useFoodSpots()
  const { dishes, getDish } = useDishes()
  const [editing, setEditing] = useState<string | null>(null) // id đang sửa; null = thêm mới
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setEditing(null)
    setDraft(EMPTY)
    setError("")
  }

  const edit = (s: FoodSpot) => {
    setEditing(s.id)
    setDraft({ name: s.name, coords: `${s.at[0]}, ${s.at[1]}`, dishes: s.dishes })
    setError("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const at = parseCoords(draft.coords)
    if (!at) return setError("Tọa độ phải có dạng: vĩ độ, kinh độ (vd. 21.038, 105.849)")
    if (await call(editing ? "PUT" : "POST", editing, { name: draft.name, at, dishes: draft.dishes })) reset()
  }

  const remove = async (s: FoodSpot) => {
    if (!confirm(`Xóa "${s.name}"?`)) return
    if ((await call("DELETE", s.id)) && editing === s.id) reset()
  }

  const toggleDish = (id: string) =>
    setDraft((d) => ({ ...d, dishes: d.dishes.includes(id) ? d.dishes.filter((x) => x !== id) : [...d.dishes, id] }))

  const at = parseCoords(draft.coords)

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold">{editing ? "Sửa điểm" : "Thêm điểm mới"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Tên điểm
            <input
              className={cn(input, "mt-1")}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Chợ Đồng Xuân, Hà Nội"
              maxLength={120}
              required
            />
          </label>
          <label className="block text-sm font-semibold">
            Tọa độ (vĩ độ, kinh độ)
            <input
              className={cn(input, "mt-1")}
              value={draft.coords}
              onChange={(e) => setDraft({ ...draft, coords: e.target.value })}
              placeholder="21.038, 105.849"
              inputMode="decimal"
              required
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Trên Google Maps: bấm chuột phải vào điểm, chọn dòng tọa độ để chép.
              {at && (
                <a
                  href={`https://www.google.com/maps?q=${at[0]},${at[1]}`}
                  target="_blank"
                  rel="noopener"
                  className="ms-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  Kiểm tra <ExternalLink className="size-3" />
                </a>
              )}
            </span>
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Món bán ở đây ({draft.dishes.length})</legend>
          <div className="mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
            {dishes.map((d) => {
              const on = draft.dishes.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDish(d.id)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                  )}
                >
                  {d.vi.name}
                </button>
              )
            })}
          </div>
        </fieldset>

        {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {editing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {editing ? "Lưu thay đổi" : "Thêm điểm"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold">
              <X className="size-4" />
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Điểm ({spots.length})</th>
              <th className="px-2 py-3 font-semibold">Tọa độ</th>
              <th className="px-2 py-3 font-semibold">Món</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {spots.map((s) => (
              <tr key={s.id} className={cn("border-b border-border last:border-0", editing === s.id && "bg-accent/50")}>
                <td className="px-4 py-2.5 font-semibold">{s.name}</td>
                <td className="px-2 py-2.5 tabular-nums text-muted-foreground">
                  {s.at[0]}, {s.at[1]}
                </td>
                <td className="px-2 py-2.5 text-muted-foreground">{s.dishes.map((id) => getDish(id)?.vi.name ?? id).join(", ")}</td>
                <td className="px-4 py-2.5">
                  <span className="flex justify-end gap-1">
                    <button type="button" onClick={() => edit(s)} aria-label={`Sửa ${s.name}`} className="rounded-lg p-2 hover:bg-accent">
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      disabled={busy}
                      aria-label={`Xóa ${s.name}`}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
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
    </div>
  )
}

export default function AdminSpotsPage() {
  return <AdminShell title="Điểm ẩm thực">{(pin) => <SpotManager pin={pin} />}</AdminShell>
}
