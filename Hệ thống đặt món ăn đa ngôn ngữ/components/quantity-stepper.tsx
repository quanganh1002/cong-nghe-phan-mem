"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  value,
  onChange,
  size = "md",
}: {
  value: number
  onChange: (v: number) => void
  size?: "sm" | "md"
}) {
  const btn =
    "grid place-items-center rounded-full bg-secondary text-secondary-foreground transition-all active:scale-90 hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
  const dim = size === "sm" ? "size-7" : "size-9"
  return (
    <div className="flex items-center gap-2">
      <button className={cn(btn, dim)} onClick={() => onChange(value - 1)} aria-label="-">
        <Minus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
      <span className={cn("text-center font-bold tabular-nums", size === "sm" ? "w-5 text-sm" : "w-6")}>{value}</span>
      <button className={cn(btn, dim)} onClick={() => onChange(value + 1)} aria-label="+">
        <Plus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
    </div>
  )
}
