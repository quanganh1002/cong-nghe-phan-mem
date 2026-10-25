import Link from "next/link"
import { cn } from "@/lib/utils"

/** Monoline emblem: an orbit ring, a bowl and a four-point star rising from it like steam */
function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="14.5" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 2.5" opacity="0.6" />
      <path d="M9.5 21.5h21a10.5 10.5 0 0 1-21 0Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M15 31.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 8c.5 3.2 1.8 4.5 5 5-3.2.5-4.5 1.8-5 5-.5-3.2-1.8-4.5-5-5 3.2-.5 4.5-1.8 5-5Z" fill="currentColor" />
    </svg>
  )
}

/** Emblem + spaced capitals with a thin rule: quiet and premium rather than loud */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg"
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Vị Việt">
      <Emblem
        className={cn(
          "shrink-0 text-primary transition-transform duration-700 group-hover:rotate-[20deg]",
          lg ? "size-14" : "size-9",
        )}
      />
      <span className="flex flex-col leading-none">
        <span className={cn("font-semibold uppercase tracking-[0.3em]", lg ? "text-3xl" : "text-[15px]")}>
          Vị <span className="text-primary">Việt</span>
        </span>
        <span className="mt-2 h-px w-full bg-gradient-to-r from-primary/70 to-transparent" />
      </span>
    </Link>
  )
}
