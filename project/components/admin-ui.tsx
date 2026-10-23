import type { LucideIcon } from "lucide-react"
import { LANGUAGES } from "@/lib/languages"

/** "🇯🇵 日本語" cho mã ngôn ngữ; rỗng nếu chưa biết ngôn ngữ */
export function langLabel(code: string): string {
  const l = LANGUAGES.find((x) => x.code === code)
  return l ? `${l.flag} ${l.name}` : ""
}

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | undefined }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums">{value ?? "–"}</p>
    </div>
  )
}
