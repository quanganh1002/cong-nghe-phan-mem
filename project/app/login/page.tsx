"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"
import { AuthField } from "@/components/auth-field"
import { AuthLayout } from "@/components/auth-layout"
import { authenticate, EMAIL_RE } from "@/lib/auth"
import { readNext } from "@/lib/require-login"
import { useApp } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { dict, hydrated, user, login } = useApp()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const [next, setNext] = useState("/")

  useEffect(() => setNext(readNext()), [])

  // Đã đăng nhập → quay lại trang khách đang xem dở (vd /checkout, /food/pho-bo)
  useEffect(() => {
    if (hydrated && user) router.replace(readNext())
  }, [hydrated, user, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!email.trim()) next.email = dict.required
    else if (!EMAIL_RE.test(email.trim())) next.email = dict.errEmail
    if (!password) next.password = dict.required
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      const found = await authenticate(email, password)
      if (!found) {
        setErrors({ form: dict.errCredentials })
        return
      }
      login(found)
      toast.success(dict.loginSuccess)
      router.replace(readNext())
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={dict.login}
      subtitle={dict.loginSubtitle}
      footer={
        <>
          {dict.noAccount}{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-primary hover:underline">
            {dict.register}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <AuthField
          label={dict.email}
          icon={<Mail />}
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <AuthField
          label={dict.password}
          icon={<Lock />}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        {errors.form && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-sm font-semibold text-destructive">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
        >
          {loading && <Loader2 className="size-5 animate-spin" />}
          {dict.login}
        </button>
      </form>
    </AuthLayout>
  )
}
