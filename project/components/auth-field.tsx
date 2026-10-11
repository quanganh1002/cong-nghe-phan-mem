"use client"

import { useId, useState, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

interface AuthFieldProps {
  label: string
  icon: ReactNode
  type?: "text" | "email" | "password" | "tel"
  value: string
  onChange: (v: string) => void
  error?: string
  optional?: boolean
  autoComplete?: string
  placeholder?: string
  hint?: string
}

export function AuthField({
  label,
  icon,
  type = "text",
  value,
  onChange,
  error,
  optional,
  autoComplete,
  placeholder,
  hint,
}: AuthFieldProps) {
  const { dict } = useApp()
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted-foreground">{dict.optional}</span>}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3.5 grid place-items-center text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          inputMode={type === "tel" ? "tel" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(
            "h-12 w-full rounded-xl border bg-background ps-11 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
            isPassword ? "pe-12" : "pe-4",
            error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15" : "border-input",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? dict.hidePassword : dict.showPassword}
            className="absolute inset-y-0 end-1.5 grid w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("mt-1.5 text-xs", error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
