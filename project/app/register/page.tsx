"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AtSign, Loader2, Lock, Mail, MapPin, Phone, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { AuthField } from "@/components/auth-field"
import { AuthLayout } from "@/components/auth-layout"
import { EMAIL_RE, isValidPhone, registerAccount, USERNAME_RE } from "@/lib/auth"
import { readNext } from "@/lib/require-login"
import { useApp } from "@/lib/store"

const EMPTY = { name: "", username: "", email: "", password: "", confirm: "", phone: "", address: "" }
type Form = typeof EMPTY
type Errors = Partial<Record<keyof Form, string>>

export default function RegisterPage() {
  const router = useRouter()
  const { dict, hydrated, user, login } = useApp()

  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [next, setNext] = useState("/")

  useEffect(() => setNext(readNext()), [])

  // Đã đăng nhập → quay lại trang khách đang xem dở (vd /checkout, /food/pho-bo)
  useEffect(() => {
    if (hydrated && user) router.replace(readNext())
  }, [hydrated, user, router])

  const set = (key: keyof Form) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  function validate(): Errors {
    const e: Errors = {}
    if (!form.name.trim()) e.name = dict.required

    if (!form.username.trim()) e.username = dict.required
    else if (!USERNAME_RE.test(form.username.trim())) e.username = dict.errUsername

    if (!form.email.trim()) e.email = dict.required
    else if (!EMAIL_RE.test(form.email.trim())) e.email = dict.errEmail

    if (!form.password) e.password = dict.required
    else if (form.password.length < 6) e.password = dict.errPassword

    if (!form.confirm) e.confirm = dict.required
    else if (form.confirm !== form.password) e.confirm = dict.errConfirm

    if (!form.phone.trim()) e.phone = dict.required
    else if (!isValidPhone(form.phone)) e.phone = dict.errPhone
    // address: không bắt buộc
    return e
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      const res = await registerAccount({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
      })
      if (!res.ok) {
        setErrors(res.error === "email" ? { email: dict.errEmailTaken } : { username: dict.errUsernameTaken })
        return
      }
      login(res.user)
      toast.success(dict.registerSuccess)
      router.replace(readNext())
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={dict.register}
      subtitle={dict.registerSubtitle}
      footer={
        <>
          {dict.haveAccount}{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-primary hover:underline">
            {dict.login}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <AuthField
          label={dict.fullName}
          icon={<UserIcon />}
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
        />
        <AuthField
          label={dict.username}
          icon={<AtSign />}
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          error={errors.username}
        />
        <AuthField
          label={dict.email}
          icon={<Mail />}
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <AuthField
          label={dict.password}
          icon={<Lock />}
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />
        <AuthField
          label={dict.confirmPassword}
          icon={<Lock />}
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />
        <AuthField
          label={dict.phone}
          icon={<Phone />}
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
        />
        <AuthField
          label={dict.address}
          icon={<MapPin />}
          autoComplete="street-address"
          optional
          hint={dict.addressHint}
          value={form.address}
          onChange={set("address")}
          error={errors.address}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
        >
          {loading && <Loader2 className="size-5 animate-spin" />}
          {dict.register}
        </button>
      </form>
    </AuthLayout>
  )
}
