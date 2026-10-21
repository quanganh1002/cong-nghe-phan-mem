"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquareReply, Pencil, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/lib/store"
import { getLanguage } from "@/lib/languages"
import { loginHref } from "@/lib/require-login"
import type { PublicReview as Review } from "@/lib/reviews-db"
import { cn } from "@/lib/utils"

/** Tải danh sách đánh giá từ endpoint (kèm x-user-id để server đánh dấu đánh giá của mình); reload() để tải lại */
export function useReviews(endpoint: string) {
  const { user, hydrated } = useApp()
  const [reviews, setReviews] = useState<Review[]>([])
  const userId = user?.id
  const reload = useCallback(() => {
    if (!hydrated) return // chờ đọc xong tài khoản, tránh tải 2 lần
    fetch(endpoint, { cache: "no-store", headers: userId ? { "x-user-id": userId } : {} })
      .then((r) => (r.ok ? r.json() : []))
      .then(setReviews)
      .catch(() => {})
  }, [endpoint, userId, hydrated])
  useEffect(reload, [reload])
  return [reviews, reload] as const
}

export function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= value ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40")} />
      ))}
    </span>
  )
}

/** Chọn sao + nhận xét. Dùng cho cả viết mới và sửa */
function ReviewForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: { rating: number; comment: string }
  submitLabel: string
  onSubmit: (rating: number, comment: string) => Promise<boolean>
  onCancel?: () => void
}) {
  const { dict } = useApp()
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [comment, setComment] = useState(initial?.comment ?? "")
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || sending) return
    setSending(true)
    const ok = await onSubmit(rating, comment)
    setSending(false)
    if (ok && !initial) {
      setRating(0)
      setComment("")
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="flex gap-1" role="radiogroup" aria-label={dict.rating}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n}/5`}
            onClick={() => setRating(n)}
            className="transition-transform active:scale-90"
          >
            <Star className={cn("size-8", n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40")} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder={dict.reviewPlaceholder}
        aria-label={dict.writeReview}
        className="mt-3 w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
      />
      <div className="mt-2 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border px-5 py-3 font-bold transition-all active:scale-[0.98]"
          >
            {dict.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={!rating || sending}
          className="flex-[2] rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

/**
 * Ô viết đánh giá + danh sách đánh giá (kèm phản hồi của quán). endpoint: /api/shops/<id>/reviews hoặc /api/foods/<id>/reviews.
 * editable: chủ đánh giá được sửa/xóa đánh giá của mình (đánh giá món)
 */
export function ReviewsPanel({
  endpoint,
  reviews,
  onSaved,
  editable = false,
}: {
  endpoint: string
  reviews: Review[]
  onSaved: () => void
  editable?: boolean
}) {
  const { dict, lang, user } = useApp()
  const pathname = usePathname()
  const [editing, setEditing] = useState<string | null>(null) // id đánh giá đang sửa
  const date = (iso: string) => new Date(iso).toLocaleDateString(getLanguage(lang).speechLang)
  const fail = () => toast.error(lang === "vi" ? "Không gửi được, thử lại sau." : "Could not send, please try again.")

  const send = async (method: "POST" | "PATCH" | "DELETE", data: Record<string, unknown>) => {
    if (!user) return false
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...data }),
      })
      if (!res.ok) throw new Error()
      onSaved()
      return true
    } catch {
      fail()
      return false
    }
  }

  const create = async (rating: number, comment: string) => {
    const ok = await send("POST", { name: user?.name, rating, comment })
    if (ok) toast.success(dict.reviewSent)
    return ok
  }

  const update = async (id: string, rating: number, comment: string) => {
    const ok = await send("PATCH", { id, rating, comment })
    if (ok) setEditing(null)
    return ok
  }

  const remove = (id: string) => {
    if (confirm(dict.deleteReviewConfirm)) send("DELETE", { id })
  }

  return (
    <div className="space-y-4">
      {user ? (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 font-bold">{dict.writeReview}</h3>
          <ReviewForm submitLabel={dict.submitReview} onSubmit={create} />
        </div>
      ) : (
        <Link
          href={loginHref(pathname)}
          className="block rounded-3xl border border-dashed border-border bg-card p-4 text-center font-bold text-primary"
        >
          {dict.loginToReview}
        </Link>
      )}

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{dict.noReviews}</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground">
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {date(r.createdAt)}
                    {r.editedAt && ` · ${dict.edited}`}
                  </p>
                </div>
                {editing !== r.id && <Stars value={r.rating} />}
              </div>

              {editing === r.id ? (
                <div className="mt-3">
                  <ReviewForm
                    initial={{ rating: r.rating, comment: r.comment }}
                    submitLabel={dict.save}
                    onSubmit={(rating, comment) => update(r.id, rating, comment)}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <>
                  {r.comment && <p className="mt-2.5 whitespace-pre-line text-pretty text-sm leading-relaxed">{r.comment}</p>}
                  {editable && r.mine && (
                    <div className="mt-2 flex gap-4 text-xs font-bold">
                      <button onClick={() => setEditing(r.id)} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Pencil className="size-3.5" />
                        {dict.edit}
                      </button>
                      <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 text-destructive hover:underline">
                        <Trash2 className="size-3.5" />
                        {dict.remove}
                      </button>
                    </div>
                  )}
                </>
              )}

              {r.reply && (
                <div className="mt-3 rounded-2xl border-s-4 border-primary bg-secondary p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <MessageSquareReply className="size-3.5" />
                    {dict.shopReply}
                    {r.repliedAt && <span className="font-normal text-muted-foreground">· {date(r.repliedAt)}</span>}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-pretty text-sm leading-relaxed">{r.reply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
