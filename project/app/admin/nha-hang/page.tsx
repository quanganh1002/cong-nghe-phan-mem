"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ImagePlus, LogOut, Mail, MapPin, MessageSquareReply, Pencil, Phone, Star, Store, X } from "lucide-react"
import { readPin, readShop, writePin } from "@/lib/admin-pin"
import { ShopAvatar, isImageAvatar } from "@/components/shop-avatar"
import type { PublicReview as Review } from "@/lib/reviews-db"
import { SHOP_AVATARS, fullAddress, getShop, type ShopInfo } from "@/lib/shops"

/** Thông tin nhà hàng: lưu trên server (/api/shops/<mã quán>), trang quán phía khách đọc lại để hiển thị. */
const OLD_KEY = "foodlingo:restaurant" // bản cũ lưu trong localStorage (OLD_KEY:<mã quán>), chỉ đọc để chuyển lên server

// province/ward chọn từ danh sách đơn vị hành chính (2 cấp, từ 1/7/2025)
type Info = ShopInfo
type Unit = { name: string; wards: string[] }

const DEFAULT: Info = { name: "FoodLingo", address: "", province: "", ward: "", phone: "", email: "" }

const FULL_ADDRESS = fullAddress

const FIELDS: { key: "name" | "address" | "phone" | "email"; label: string; icon: typeof Store; type?: string }[] = [
  { key: "name", label: "Tên nhà hàng", icon: Store },
  { key: "address", label: "Địa chỉ", icon: MapPin },
  { key: "phone", label: "Số điện thoại", icon: Phone, type: "tel" },
  { key: "email", label: "Email", icon: Mail, type: "email" },
]

const SELECT =
  "mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50"

export default function RestaurantPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"info" | "reviews">("info")
  const [info, setInfo] = useState<Info>(DEFAULT)
  const [draft, setDraft] = useState<Info | null>(null) // null = đang xem, có giá trị = đang sửa
  const [units, setUnits] = useState<Unit[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Chỉ tải danh sách tỉnh/phường (~65KB) khi bắt đầu sửa
  useEffect(() => {
    if (!draft || units.length) return
    fetch("/vn-units.json")
      .then((r) => r.json())
      .then(setUnits)
      .catch(() => {})
  }, [draft, units.length])

  useEffect(() => {
    if (!readPin()) return router.replace("/admin") // chưa đăng nhập → về trang nhập PIN
    const shop = readShop()
    setInfo({ ...DEFAULT, name: getShop(shop)?.name ?? DEFAULT.name, avatar: getShop(shop)?.emoji })
    fetch(`/api/shops/${shop}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Info | null) => {
        // Server chưa có → lấy bản cũ từng lưu trên máy này (trước khi chuyển lên server), bấm Lưu là được đẩy lên
        if (!data) {
          try {
            data = JSON.parse(localStorage.getItem(`${OLD_KEY}:${shop}`) ?? "null")
          } catch {}
        }
        if (data) setInfo((cur) => ({ ...cur, ...data }))
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [router])

  // Crop to a centered square and shrink to 256px so the data URL stays small
  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !draft) return
    try {
      const bmp = await createImageBitmap(file)
      const side = Math.min(bmp.width, bmp.height)
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 256
      canvas.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 256, 256)
      setDraft((d) => d && { ...d, avatar: canvas.toDataURL("image/jpeg", 0.85) })
    } catch {
      alert("Không đọc được ảnh này, hãy thử ảnh khác.")
    }
  }

  const save = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${readShop()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": readPin() },
        body: JSON.stringify({ ...draft, name: draft.name.trim() || info.name }),
      })
      if (res.status === 401) return logout() // PIN không còn đúng
      if (!res.ok) throw new Error()
      setInfo(await res.json())
      setDraft(null)
    } catch {
      alert("Không lưu được, kiểm tra kết nối rồi thử lại.")
    } finally {
      setSaving(false)
    }
  }

  const logout = () => {
    writePin("")
    router.replace("/admin")
  }

  if (!ready) return null

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-4 py-5">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          aria-label="Quay lại"
          className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm active:scale-90"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="me-auto text-2xl font-extrabold">Nhà hàng</h1>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/10 active:scale-95"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </header>

      <div role="tablist" className="mt-5 flex gap-1 rounded-full bg-secondary p-1">
        {(
          [
            ["info", "Thông tin"],
            ["reviews", "Đánh giá"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "reviews" ? (
        <AdminReviews onUnauthorized={logout} />
      ) : (
      <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex flex-col items-center gap-3">
          <ShopAvatar value={(draft ?? info).avatar} className="size-20 bg-secondary text-5xl" />
          {draft && (
            <div role="radiogroup" aria-label="Avatar nhà hàng" className="flex flex-wrap justify-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Tải ảnh lên"
                className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-all active:scale-95 ${
                  isImageAvatar(draft.avatar) ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border bg-background"
                }`}
              >
                <ImagePlus className="size-4" />
                Tải ảnh
              </button>
              {SHOP_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  role="radio"
                  aria-checked={draft.avatar === emoji}
                  onClick={() => setDraft({ ...draft, avatar: emoji })}
                  className={`grid size-11 place-items-center rounded-full border text-2xl transition-all active:scale-90 ${
                    draft.avatar === emoji ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border bg-background"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <ul className="space-y-4">
          {FIELDS.map(({ key, label, icon: Icon, type }) => (
            <li key={key} className="flex items-start gap-3">
              <Icon className="mt-2.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <label htmlFor={key} className="text-xs font-semibold text-muted-foreground">
                  {label}
                </label>
                {draft ? (
                  <>
                  <input
                    id={key}
                    type={type}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    maxLength={200}
                    placeholder={key === "address" ? "Số nhà, tên đường" : undefined}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                  {key === "address" && (
                    <>
                      <select
                        aria-label="Tỉnh/Thành phố"
                        value={draft.province}
                        onChange={(e) => setDraft({ ...draft, province: e.target.value, ward: "" })}
                        className={SELECT}
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {/* giữ giá trị đã lưu dù danh sách chưa tải xong */}
                        {draft.province && !units.length && <option>{draft.province}</option>}
                        {units.map((u) => (
                          <option key={u.name}>{u.name}</option>
                        ))}
                      </select>
                      <select
                        aria-label="Phường/Xã"
                        value={draft.ward}
                        onChange={(e) => setDraft({ ...draft, ward: e.target.value })}
                        disabled={!draft.province}
                        className={SELECT}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {draft.ward && !units.length && <option>{draft.ward}</option>}
                        {units
                          .find((u) => u.name === draft.province)
                          ?.wards.map((w) => (
                            <option key={w}>{w}</option>
                          ))}
                      </select>
                    </>
                  )}
                  </>
                ) : (
                  <p className="break-words font-semibold">{(key === "address" ? FULL_ADDRESS(info) : info[key]) || <span className="text-muted-foreground">Chưa cập nhật</span>}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2">
          {draft ? (
            <>
              <button
                onClick={() => setDraft(null)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-3 font-bold active:scale-[0.98]"
              >
                <X className="size-4" />
                Hủy
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex flex-[2] items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                <Check className="size-4" />
                {saving ? "Đang lưu…" : "Lưu"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setDraft(info)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-bold text-primary-foreground shadow-md active:scale-[0.98]"
            >
              <Pencil className="size-4" />
              Sửa thông tin
            </button>
          )}
        </div>
      </section>
      )}
    </main>
  )
}

/** Tab đánh giá: quán xem đánh giá của khách và trả lời */
function AdminReviews({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [editing, setEditing] = useState<string | null>(null) // id của đánh giá đang soạn phản hồi
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch(`/api/shops/${readShop()}/reviews`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [])

  const send = async (id: string, reply: string) => {
    setSending(true)
    try {
      const res = await fetch(`/api/shops/${readShop()}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": readPin() },
        body: JSON.stringify({ id, reply }),
      })
      if (res.status === 401) return onUnauthorized()
      if (!res.ok) throw new Error()
      const saved: Review = await res.json()
      setReviews((list) => list?.map((r) => (r.id === id ? saved : r)) ?? null)
      setEditing(null)
    } catch {
      alert("Không lưu được phản hồi, thử lại sau.")
    } finally {
      setSending(false)
    }
  }

  if (!reviews) return <p className="py-10 text-center text-muted-foreground">Đang tải…</p>

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "–"
  const date = (iso: string) => new Date(iso).toLocaleDateString("vi-VN")

  return (
    <section className="mt-5 space-y-3">
      <p className="flex items-center gap-1.5 font-bold">
        <Star className="size-5 fill-amber-500 text-amber-500" />
        {avg}/5 · {reviews.length} đánh giá · {reviews.filter((r) => !r.reply).length} chưa trả lời
      </p>

      {reviews.length === 0 && <p className="py-10 text-center text-muted-foreground">Chưa có đánh giá nào.</p>}

      {reviews.map((r) => (
        <article key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{r.name}</p>
              <p className="text-xs text-muted-foreground">{date(r.createdAt)}</p>
            </div>
            <span className="inline-flex gap-0.5" aria-label={`${r.rating}/5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`size-4 ${n <= r.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`} />
              ))}
            </span>
          </div>
          {r.comment && <p className="mt-2 whitespace-pre-line text-sm">{r.comment}</p>}

          {editing === r.id ? (
            <div className="mt-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                rows={3}
                autoFocus
                aria-label="Phản hồi của quán"
                placeholder="Viết phản hồi cho khách…"
                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-full border border-border px-4 py-2 text-sm font-bold active:scale-[0.98]"
                >
                  Hủy
                </button>
                <button
                  onClick={() => send(r.id, text)}
                  disabled={sending || !text.trim()}
                  className="flex-[2] rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {sending ? "Đang gửi…" : "Gửi phản hồi"}
                </button>
              </div>
            </div>
          ) : r.reply ? (
            <div className="mt-3 rounded-xl border-s-4 border-primary bg-secondary p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <MessageSquareReply className="size-3.5" />
                Phản hồi của quán · {date(r.repliedAt ?? r.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">{r.reply}</p>
              <div className="mt-2 flex gap-3 text-xs font-bold">
                <button
                  onClick={() => {
                    setEditing(r.id)
                    setText(r.reply ?? "")
                  }}
                  className="text-primary hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => confirm("Xóa phản hồi này?") && send(r.id, "")}
                  disabled={sending}
                  className="text-destructive hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditing(r.id)
                setText("")
              }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-sm font-bold text-primary active:scale-95"
            >
              <MessageSquareReply className="size-4" />
              Trả lời
            </button>
          )}
        </article>
      ))}
    </section>
  )
}
