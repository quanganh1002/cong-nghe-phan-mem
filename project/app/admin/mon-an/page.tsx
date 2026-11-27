"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useStats } from "@/hooks/use-admin-data"
import { CATEGORIES, REGIONS, getDishCoords, getDishPlace, type Dish, type DishCategory, type DishText, type Region } from "@/lib/dishes"
import { useDishes } from "@/lib/dishes-context"
import { cn } from "@/lib/utils"

const REGION = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" } as const
const CATEGORY = { main: "Món chính", snack: "Món ăn nhẹ", drink: "Đồ uống", dessert: "Tráng miệng", festival: "Lễ hội & Tết" } as const
const FIELDS: { key: keyof DishText; label: string; long?: boolean }[] = [
  { key: "name", label: "Tên món" },
  { key: "summary", label: "Giới thiệu ngắn", long: true },
  { key: "origin", label: "Nguồn gốc", long: true },
  { key: "culture", label: "Văn hóa", long: true },
  { key: "ingredients", label: "Nguyên liệu (cách nhau bằng dấu phẩy)", long: true },
  { key: "tip", label: "Cách thưởng thức", long: true },
]

const emptyText = (): DishText => ({ name: "", summary: "", origin: "", culture: "", ingredients: "", tip: "" })
type Draft = {
  region: Region
  category: DishCategory
  emoji: string
  image: string
  popular: boolean
  place: string
  coords: string
  vi: DishText
  en: DishText
}
const EMPTY: Draft = { region: "north", category: "main", emoji: "🍲", image: "", popular: false, place: "", coords: "", vi: emptyText(), en: emptyText() }

const toDraft = (d: Dish): Draft => {
  const at = getDishCoords(d)
  return {
    region: d.region,
    category: d.category,
    emoji: d.emoji,
    image: d.image ?? "",
    popular: !!d.popular,
    place: getDishPlace(d),
    coords: at ? `${at[0]}, ${at[1]}` : "",
    vi: { ...d.vi },
    en: { ...d.en },
  }
}

/** "21.038, 105.849" → [21.038, 105.849]; rỗng → null; sai dạng → undefined */
function parseCoords(s: string): [number, number] | null | undefined {
  if (!s.trim()) return null
  const m = s.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  return m ? [Number(m[1]), Number(m[2])] : undefined
}

const input = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"

function DishForm({ pin, editing, initial, onDone }: { pin: string; editing: string | null; initial: Draft; onDone: () => void }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(initial)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const setText = (lang: "vi" | "en", k: keyof DishText, v: string) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [k]: v } }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const at = parseCoords(draft.coords)
    if (at === undefined) return setError("Tọa độ phải có dạng: vĩ độ, kinh độ (vd. 21.038, 105.849), hoặc để trống")
    const { coords: _, ...rest } = draft
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/dishes${editing ? `?id=${encodeURIComponent(editing)}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "x-admin-pin": pin, "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, at }),
      })
      if (!res.ok) return setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Lỗi ${res.status}`)
      router.refresh() // đọc lại món từ server cho mọi trang
      onDone()
    } catch {
      setError("Không kết nối được máy chủ")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{editing ? `Sửa món: ${initial.vi.name}` : "Thêm món mới"}</h2>
        <button type="button" onClick={onDone} aria-label="Đóng" className="rounded-lg p-2 hover:bg-accent">
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-semibold">
          Vùng miền
          <select className={input} value={draft.region} onChange={(e) => set("region", e.target.value as Region)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {REGION[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Loại món
          <select className={input} value={draft.category} onChange={(e) => set("category", e.target.value as DishCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {CATEGORY[c.key]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Emoji (khi không có ảnh)
          <input className={input} value={draft.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={16} required />
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold">
          <input type="checkbox" checked={draft.popular} onChange={(e) => set("popular", e.target.checked)} className="size-4" />
          Món tiêu biểu (hiện ở trang chủ)
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-semibold">
          Ảnh (không bắt buộc)
          <input className={input} value={draft.image} onChange={(e) => set("image", e.target.value)} placeholder="/foods/pho-bo.png hoặc https://..." maxLength={500} />
        </label>
        <label className="block text-sm font-semibold">
          Địa điểm trên bản đồ
          <input className={input} value={draft.place} onChange={(e) => set("place", e.target.value)} placeholder="Phố cổ Hà Nội" maxLength={120} />
        </label>
        <label className="block text-sm font-semibold">
          Tọa độ địa điểm (vĩ độ, kinh độ)
          <input className={input} value={draft.coords} onChange={(e) => set("coords", e.target.value)} placeholder="21.0343, 105.851" inputMode="decimal" />
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {(["vi", "en"] as const).map((lang) => (
          <fieldset key={lang} className="space-y-3 rounded-xl border border-border p-3">
            <legend className="px-1 text-sm font-bold">{lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 Tiếng Anh (8 ngôn ngữ khác dịch tự động từ đây)"}</legend>
            {FIELDS.map((f) => (
              <label key={f.key} className="block text-sm font-semibold">
                {f.label}
                {f.long ? (
                  <textarea
                    className={cn(input, "min-h-20")}
                    value={draft[lang][f.key]}
                    onChange={(e) => setText(lang, f.key, e.target.value)}
                    maxLength={4000}
                    required
                  />
                ) : (
                  <input className={input} value={draft[lang][f.key]} onChange={(e) => setText(lang, f.key, e.target.value)} maxLength={120} required />
                )}
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {editing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {editing ? "Lưu thay đổi" : "Thêm món"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full border border-border px-4 py-2 text-sm font-bold">
          Hủy
        </button>
      </div>
    </form>
  )
}

/** Thêm / sửa / xóa món ăn (lưu qua /api/dishes) và số lượt xem, lượt nghe từng món */
function DishManager({ pin }: { pin: string }) {
  const router = useRouter()
  const stats = useStats(pin)
  const { dishes } = useDishes()
  // null: đóng form; "": thêm mới; còn lại: id món đang sửa
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState("")
  const current = editing ? dishes.find((d) => d.id === editing) : undefined

  const open = (id: string) => {
    setEditing(id)
    setError("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const remove = async (d: Dish) => {
    if (!confirm(`Xóa món "${d.vi.name}"? Trang món, mã QR đã in và điểm ẩm thực có món này sẽ không còn hiện món.`)) return
    setError("")
    try {
      const res = await fetch(`/api/dishes?id=${encodeURIComponent(d.id)}`, { method: "DELETE", headers: { "x-admin-pin": pin } })
      if (!res.ok) return setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Lỗi ${res.status}`)
      if (editing === d.id) setEditing(null)
      router.refresh()
    } catch {
      setError("Không kết nối được máy chủ")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {dishes.length} món · {CATEGORIES.length} nhóm. Nội dung ở 8 ngôn ngữ khác được dịch tự động từ bản tiếng Anh.
        </p>
        {editing === null && (
          <button type="button" onClick={() => open("")} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" />
            Thêm món
          </button>
        )}
      </div>

      {editing !== null && (
        <DishForm key={editing} pin={pin} editing={editing || null} initial={current ? toDraft(current) : EMPTY} onDone={() => setEditing(null)} />
      )}
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Món</th>
              <th className="px-2 py-3 font-semibold">Vùng</th>
              <th className="px-2 py-3 font-semibold">Loại</th>
              <th className="px-2 py-3 text-right font-semibold">Lượt xem</th>
              <th className="px-2 py-3 text-right font-semibold">Lượt nghe</th>
              <th className="w-32 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id} className={cn("border-b border-border last:border-0", editing === d.id && "bg-accent/50")}>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-3">
                    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent text-xl">
                      {d.image ? <Image src={d.image} alt="" fill sizes="40px" className="object-cover" /> : d.emoji}
                    </span>
                    <span className="font-semibold">{d.vi.name}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 text-muted-foreground">{REGION[d.region]}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{CATEGORY[d.category]}</td>
                <td className="px-2 py-2.5 text-right font-bold tabular-nums">{stats ? (stats.dishes[d.id] ?? 0) : "–"}</td>
                <td className="px-2 py-2.5 text-right font-bold tabular-nums">{stats ? (stats.dishPlays[d.id]?.plays ?? 0) : "–"}</td>
                <td className="px-4 py-2.5">
                  <span className="flex justify-end gap-1">
                    <button type="button" onClick={() => open(d.id)} aria-label={`Sửa ${d.vi.name}`} className="rounded-lg p-2 hover:bg-accent">
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => remove(d)} aria-label={`Xóa ${d.vi.name}`} className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                      <Trash2 className="size-4" />
                    </button>
                    <Link href={`/dishes/${d.id}`} target="_blank" aria-label={`Mở trang ${d.vi.name}`} className="rounded-lg p-2 text-muted-foreground hover:text-primary">
                      <ExternalLink className="size-4" />
                    </Link>
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

export default function AdminDishesPage() {
  return <AdminShell title="Món ăn">{(pin) => <DishManager pin={pin} />}</AdminShell>
}
