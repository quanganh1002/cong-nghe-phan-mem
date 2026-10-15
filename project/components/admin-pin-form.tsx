"use client"

import { useState, type FormEvent } from "react"
import { Lock } from "lucide-react"

/** Màn hình nhập PIN cho các trang quản lý */
export function PinForm({ title = "Trang quản lý", error, onSubmit }: { title?: string; error?: string; onSubmit: (pin: string) => void }) {
  const [value, setValue] = useState("")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSubmit(value.trim())
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-xs rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-primary">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-3 text-xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Nhập mã PIN của quán</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-4 h-12 w-full rounded-xl border border-border bg-background px-3 text-center text-lg tracking-[0.4em] outline-none focus:border-primary"
        />
        {error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}
        <button type="submit" className="mt-4 h-12 w-full rounded-full bg-primary font-bold text-primary-foreground shadow-md active:scale-[0.98]">
          Vào
        </button>
      </form>
    </main>
  )
}
