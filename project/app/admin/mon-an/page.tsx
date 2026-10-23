"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Eye, EyeOff, ImagePlus, Languages, LogOut, Pencil, Plus, X } from "lucide-react"
import { readPin, readShop, writePin } from "@/lib/admin-pin"
import { formatPrice, type Category, type Food } from "@/lib/foods"
import { refreshFoods } from "@/lib/foods-client"

const CATEGORY_LABEL: Record<Category, string> = { main: "Món chính", drink: "Đồ uống", dessert: "Tráng miệng", snack: "Ăn vặt" }

type Draft = {
  id?: string // có = đang sửa món cũ, không có = thêm món mới
  name: string
  description: string
  price: string
  category: Category
  image: string
  popular: boolean
  isNew: boolean
}

const EMPTY: Draft = { name: "", description: "", price: "", category: "main", image: "", popular: false, isNew: false }

const INPUT = "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"

/** Thu ảnh về tối đa 800px (JPEG) trước khi tải lên cho nhẹ */
async function shrinkImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 800 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#fff" // ảnh PNG trong suốt không bị nền đen
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.85))
}

/** Quản lý món ăn của quán: thêm món, sửa tên/mô tả/giá/ảnh, ẩn món. Tên + mô tả tiếng Việt tự dịch sang 9 ngôn ngữ còn lại. */
export default function FoodsAdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [foods, setFoods] = useState<Food[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const logout = useCallback(() => {
    writePin("")
    router.replace("/admin")
  }, [router])

  const headers = () => ({ "Content-Type": "application/json", "x-admin-pin": readPin() })

  const load = useCallback(async () => {
    const shop = readShop()
    const res = await fetch("/api/foods", { cache: "no-store" })
    if (!res.ok) throw new Error()
    setFoods(((await res.json()) as Food[]).filter((f) => f.shop === shop))
  }, [])

  useEffect(() => {
    if (!readPin()) return router.replace("/admin") // chưa đăng nhập → về trang nhập PIN
    load()
      .catch(() => alert("Không tải được danh sách món, kiểm tra kết nối rồi thử lại."))
      .finally(() => setReady(true))
  }, [router, load])

  const edit = (f: Food) =>
    setDraft({
      id: f.id,
      name: f.t.vi.name,
      description: f.t.vi.description,
      price: String(f.price),
      category: f.category,
      image: f.image,
      popular: !!f.popular,
      isNew: !!f.isNew,
    })

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !draft) return
    setUploading(true)
    try {
      const blob = await shrinkImage(file)
      const res = await fetch("/api/foods/upload", { method: "POST", headers: { "Content-Type": "image/jpeg", "x-admin-pin": readPin() }, body: blob })
      if (res.status === 401) return logout()
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error)
      setDraft((d) => d && { ...d, image: data.url! })
    } catch (err) {
      alert(err instanceof Error && err.message ? err.message : "Không tải được ảnh, hãy thử ảnh khác.")
    } finally {
      setUploading(false)
    }
  }

  /** Gửi lên server. `body` chỉ gồm các trường cần đổi (ẩn/hiện món thì chỉ gửi hidden) */
  const send = async (id: string | undefined, body: Record<string, unknown>) => {
    const res = await fetch(id ? `/api/foods/${id}` : "/api/foods", { method: id ? "PUT" : "POST", headers: headers(), body: JSON.stringify(body) })
    if (res.status === 401) {
      logout()
      return null
    }
    const data = (await res.json().catch(() => ({}))) as { food?: Food; failed?: string[]; error?: string }
    if (!res.ok || !data.food) throw new Error(data.error || "Không lưu được, thử lại sau.")
    await load()
    refreshFoods() // để các trang khách trong tab này thấy ngay
    return data
  }

  const save = async () => {
    if (!draft || saving) return
    if (!draft.name.trim()) return alert("Hãy nhập tên món.")
    const price = Number(draft.price)
    if (!Number.isFinite(price) || price < 0) return alert("Giá không hợp lệ.")
    setSaving(true)
    try {
      const data = await send(draft.id, {
        name: draft.name,
        description: draft.description,
        price,
        category: draft.category,
        image: draft.image,
        popular: draft.popular,
        isNew: draft.isNew,
      })
      if (!data) return
      if (data.failed?.length) alert(`Đã lưu, nhưng chưa dịch được ${data.failed.length} ngôn ngữ (${data.failed.join(", ")}). Các ngôn ngữ đó tạm hiện tiếng Việt — bấm Sửa rồi Lưu lại để dịch lại.`)
      setDraft(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không lưu được, thử lại sau.")
    } finally {
      setSaving(false)
    }
  }

  const toggleHidden = async (f: Food) => {
    if (!f.hidden && !confirm(`Ẩn món "${f.t.vi.name}"? Khách sẽ không thấy và không đặt được món này nữa (đơn cũ vẫn giữ nguyên).`)) return
    try {
      await send(f.id, { hidden: !f.hidden })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không lưu được, thử lại sau.")
    }
  }

  if (!ready) return null

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-5">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          aria-label="Quay lại"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm active:scale-90"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="me-auto text-2xl font-extrabold">Món ăn</h1>
        <button
          onClick={() => setDraft(EMPTY)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md active:scale-95"
        >
          <Plus className="size-4" />
          Thêm món
        </button>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/10 active:scale-95"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </header>

      {draft && (
        <section className="mt-5 rounded-2xl border border-primary/40 bg-card p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">{draft.id ? "Sửa món" : "Thêm món mới"}</h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
              <Image src={draft.image || "/placeholder.svg"} alt="" fill className="object-cover" />
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-bold active:scale-95 disabled:opacity-60"
              >
                <ImagePlus className="size-4" />
                {uploading ? "Đang tải ảnh…" : draft.image ? "Đổi ảnh" : "Tải ảnh"}
              </button>
              <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG hoặc WebP. Ảnh vuông hiển thị đẹp nhất.</p>
            </div>
          </div>

          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            Tên món (tiếng Việt)
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={100} placeholder="VD: Phở bò" className={INPUT} />
          </label>

          <label className="mt-4 block text-xs font-semibold text-muted-foreground">
            Mô tả (tiếng Việt) — cũng là nội dung đọc to cho khách
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              maxLength={600}
              rows={4}
              placeholder="Giới thiệu nguyên liệu, hương vị, cách ăn…"
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-muted-foreground">
              Giá (₫)
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="45000"
                className={INPUT}
              />
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Danh mục
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })} className={INPUT}>
                {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={draft.popular} onChange={(e) => setDraft({ ...draft, popular: e.target.checked })} className="size-4 accent-primary" />
              Món nổi bật
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={draft.isNew} onChange={(e) => setDraft({ ...draft, isNew: e.target.checked })} className="size-4 accent-primary" />
              Món mới
            </label>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            <Languages className="mt-0.5 size-4 shrink-0 text-primary" />
            Khi lưu, tên và mô tả sẽ được tự động dịch sang 9 ngôn ngữ còn lại (có thể mất vài giây). Chỉ đổi giá/ảnh thì không cần dịch lại.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setDraft(null)}
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-3 font-bold active:scale-[0.98]"
            >
              <X className="size-4" />
              Hủy
            </button>
            <button
              onClick={save}
              disabled={saving || uploading}
              className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              <Check className="size-4" />
              {saving ? "Đang lưu và dịch…" : "Lưu"}
            </button>
          </div>
        </section>
      )}

      <ul className="mt-5 space-y-3">
        {foods.length === 0 && <li className="py-10 text-center text-muted-foreground">Quán chưa có món nào.</li>}
        {foods.map((f) => (
          <li key={f.id} className={`flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm ${f.hidden ? "opacity-60" : ""}`}>
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
              <Image src={f.image || "/placeholder.svg"} alt="" fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{f.t.vi.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(f.price)} · {CATEGORY_LABEL[f.category]}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {f.hidden && <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">Đã ẩn</span>}
                {f.popular && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-600">Nổi bật</span>}
                {f.isNew && <span className="rounded-full bg-chart-3/15 px-2 py-0.5 text-chart-3">Mới</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  edit(f)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                aria-label="Sửa món"
                className="grid size-10 place-items-center rounded-full border border-border bg-background active:scale-90"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => toggleHidden(f)}
                aria-label={f.hidden ? "Hiện món" : "Ẩn món"}
                title={f.hidden ? "Hiện món" : "Ẩn món"}
                className="grid size-10 place-items-center rounded-full border border-border bg-background active:scale-90"
              >
                {f.hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
