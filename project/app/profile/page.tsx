"use client"

import Link from "next/link"
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { AtSign, CalendarDays, ChevronRight, CircleCheck, ClipboardList, Globe, LogIn, LogOut, Mail, MapPin, Pencil, Phone, ShoppingBag, User as UserIcon, UserPlus } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AvatarPicker, UserAvatar } from "@/components/user-avatar"
import { useApp, type User } from "@/lib/store"
import { updateAccount } from "@/lib/auth"
import type { LangCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/** Chuỗi riêng cho form chỉnh sửa (các nhãn còn lại dùng lại từ dict) */
const EDIT_TEXT: Record<LangCode, { cancel: string; invalidEmail: string; invalidPhone: string; saved: string }> = {
  vi: { cancel: "Hủy", invalidEmail: "Email không hợp lệ", invalidPhone: "Số điện thoại không hợp lệ", saved: "Đã cập nhật thông tin" },
  en: { cancel: "Cancel", invalidEmail: "Invalid email address", invalidPhone: "Invalid phone number", saved: "Profile updated" },
  ja: { cancel: "キャンセル", invalidEmail: "メールアドレスが正しくありません", invalidPhone: "電話番号が正しくありません", saved: "情報を更新しました" },
  zh: { cancel: "取消", invalidEmail: "邮箱格式不正确", invalidPhone: "手机号码格式不正确", saved: "信息已更新" },
  es: { cancel: "Cancelar", invalidEmail: "Correo electrónico no válido", invalidPhone: "Número de teléfono no válido", saved: "Información actualizada" },
  fr: { cancel: "Annuler", invalidEmail: "Adresse e-mail invalide", invalidPhone: "Numéro de téléphone invalide", saved: "Informations mises à jour" },
  ar: { cancel: "إلغاء", invalidEmail: "البريد الإلكتروني غير صالح", invalidPhone: "رقم الهاتف غير صالح", saved: "تم تحديث المعلومات" },
  pt: { cancel: "Cancelar", invalidEmail: "E-mail inválido", invalidPhone: "Número de telefone inválido", saved: "Informações atualizadas" },
  ru: { cancel: "Отмена", invalidEmail: "Неверный адрес эл. почты", invalidPhone: "Неверный номер телефона", saved: "Данные обновлены" },
  hi: { cancel: "रद्द करें", invalidEmail: "अमान्य ईमेल", invalidPhone: "अमान्य फ़ोन नंबर", saved: "जानकारी अपडेट हो गई" },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s.-]{8,15}$/

export default function ProfilePage() {
  const { dict, hydrated, user } = useApp()

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold">{dict.profileTitle}</h1>
      </div>

      {!hydrated ? <ProfileSkeleton /> : user ? <AccountView /> : <GuestView />}
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/* Chưa đăng nhập                                                      */
/* ------------------------------------------------------------------ */
function GuestView() {
  const { dict } = useApp()

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="animate-pop grid size-24 place-items-center rounded-full bg-accent">
        <UserIcon className="size-11 text-primary" />
      </div>
      <h2 className="text-xl font-bold">{dict.guestTitle}</h2>
      <p className="max-w-xs text-pretty text-sm text-muted-foreground">{dict.guestDesc}</p>

      <div className="mt-2 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm sm:flex-row">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
        >
          <LogIn className="size-5" />
          {dict.login}
        </Link>
        <Link
          href="/register"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-primary bg-card px-6 py-3 font-bold text-primary shadow-sm transition-all active:scale-95 hover:bg-primary/10"
        >
          <UserPlus className="size-5" />
          {dict.register}
        </Link>
      </div>

      {/* Người dùng vẫn đổi được ngôn ngữ khi chưa đăng nhập */}
      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <Globe className="size-4" />
        <span>{dict.language}</span>
        <LanguageSwitcher />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Đã đăng nhập                                                        */
/* ------------------------------------------------------------------ */
function AccountView() {
  const { dict, lang, user, orders, logout } = useApp()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  // tự ẩn thông báo "đã cập nhật" sau 3 giây
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(t)
  }, [saved])

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="px-4 pb-4 pt-4">
      {/* Header card — cùng kiểu gradient với hero ở trang chủ */}
      <section className="animate-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-2 p-6 text-primary-foreground shadow-lg">
        <div className="absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -start-8 size-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <UserAvatar
            name={user.name}
            avatar={user.avatar}
            className="size-16 border-4 border-white/30 bg-white/20 text-xl backdrop-blur"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-extrabold leading-tight">{user.name}</h2>
            <p className="truncate text-sm text-white/85">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Thông tin tài khoản */}
      <section
        style={{ animationDelay: "60ms" }}
        className="animate-fade-up mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-muted-foreground">{dict.accountInfo}</h3>
          {!editing && (
            <button
              onClick={() => {
                setSaved(false)
                setEditing(true)
              }}
              className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary transition-all active:scale-95 hover:bg-primary hover:text-primary-foreground"
            >
              <Pencil className="size-3.5" />
              {dict.editProfile}
            </button>
          )}
        </div>

        {saved && (
          <p className="animate-pop mb-3 flex items-center gap-2 rounded-xl bg-chart-3/15 px-3 py-2 text-sm font-semibold text-chart-3">
            <CircleCheck className="size-4 shrink-0" />
            {EDIT_TEXT[lang].saved}
          </p>
        )}

        {editing ? (
          <EditForm
            user={user}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              setSaved(true)
            }}
          />
        ) : (
          <dl className="divide-y divide-border">
            <InfoRow icon={<UserIcon className="size-4" />} label={dict.fullName} value={user.name} />
            <InfoRow icon={<AtSign className="size-4" />} label={dict.username} value={user.username} />
            <InfoRow icon={<Mail className="size-4" />} label={dict.email} value={user.email} />
            <InfoRow icon={<Phone className="size-4" />} label={dict.phone} value={user.phone} />
            <InfoRow icon={<MapPin className="size-4" />} label={dict.address} value={user.address} />
            <InfoRow icon={<CalendarDays className="size-4" />} label={dict.memberSince} value={memberSince} />
            <InfoRow icon={<ShoppingBag className="size-4" />} label={dict.totalOrders} value={String(orders.length)} />
          </dl>
        )}
      </section>

      {/* Menu */}
      <section
        style={{ animationDelay: "120ms" }}
        className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <Link
          href="/orders"
          className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40 active:bg-accent/60"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
            <ClipboardList className="size-5" />
          </span>
          <span className="flex-1 font-semibold">{dict.myOrders}</span>
          <ChevronRight className="size-5 text-muted-foreground rtl:rotate-180" />
        </Link>

        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-primary">
            <Globe className="size-5" />
          </span>
          <span className="flex-1 font-semibold">{dict.language}</span>
          <LanguageSwitcher />
        </div>
      </section>

      <button
        onClick={logout}
        style={{ animationDelay: "180ms" }}
        className="animate-fade-up mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-5 py-3.5 font-bold text-destructive transition-all active:scale-[0.98] hover:bg-destructive/20"
      >
        <LogOut className="size-5" />
        {dict.logout}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form chỉnh sửa: họ tên, email, số điện thoại, địa chỉ nhận hàng       */
/* ------------------------------------------------------------------ */
type EditableKey = "name" | "email" | "phone" | "address"

function EditForm({ user, onCancel, onSaved }: { user: User; onCancel: () => void; onSaved: () => void }) {
  const { dict, lang, login } = useApp()
  const t = EDIT_TEXT[lang]
  const [form, setForm] = useState<Record<EditableKey, string>>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
  })
  const [errors, setErrors] = useState<Partial<Record<EditableKey, string>>>({})
  const [avatar, setAvatar] = useState(user.avatar)

  const onChange = (key: EditableKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    }

    const next: Partial<Record<EditableKey, string>> = {}
    if (!v.name) next.name = dict.required
    if (!v.email) next.email = dict.required
    else if (!EMAIL_RE.test(v.email)) next.email = t.invalidEmail
    if (!v.phone) next.phone = dict.required
    else if (!PHONE_RE.test(v.phone)) next.phone = t.invalidPhone
    // địa chỉ không bắt buộc
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const updated = { ...user, name: v.name, email: v.email, phone: v.phone, address: v.address || undefined, avatar }
    // Lưu vào danh sách tài khoản (để đăng xuất rồi đăng nhập lại vẫn còn), rồi cập nhật phiên hiện tại
    const saved = updateAccount(updated)
    if (saved === "email") {
      setErrors({ email: dict.errEmailTaken })
      return
    }
    if (saved === "missing") {
      // Phiên đăng nhập này không có tài khoản tương ứng trong máy → đăng xuất, đăng nhập lại rồi sửa lại
      setErrors({ name: lang === "vi" ? "Không tìm thấy tài khoản trên máy này, hãy đăng nhập lại rồi sửa lại" : "Account not found on this device, please log in again and retry" })
      return
    }
    login(updated)
    onSaved()
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <AvatarPicker name={form.name} value={avatar} onChange={setAvatar} />
      <Field label={dict.fullName} error={errors.name}>
        <input
          value={form.name}
          onChange={onChange("name")}
          autoComplete="name"
          aria-invalid={!!errors.name}
          className={INPUT_CLASS}
        />
      </Field>
      <Field label={dict.email} error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={onChange("email")}
          autoComplete="email"
          aria-invalid={!!errors.email}
          className={INPUT_CLASS}
        />
      </Field>
      <Field label={dict.phone} error={errors.phone}>
        <input
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={onChange("phone")}
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          className={INPUT_CLASS}
        />
      </Field>
      <Field label={dict.address} error={errors.address}>
        <textarea
          rows={2}
          value={form.address}
          onChange={onChange("address")}
          autoComplete="street-address"
          className={cn(INPUT_CLASS, "h-auto resize-none py-2.5")}
        />
      </Field>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-border bg-card px-5 py-3 font-bold transition-all active:scale-95 hover:bg-muted"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          className="flex-1 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
        >
          {dict.save}
        </button>
      </div>
    </form>
  )
}

const INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn("break-words font-semibold", !value && "text-muted-foreground")}>{value || "—"}</dd>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Skeleton khi đang đọc localStorage                                  */
/* ------------------------------------------------------------------ */
function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4" aria-hidden>
      <div className="shimmer h-28 rounded-3xl bg-muted" />
      <div className="shimmer h-64 rounded-2xl bg-muted" />
    </div>
  )
}
