import Link from "next/link"
import { Soup } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg"
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold">
      <span
        className={cn(
          "grid place-items-center bg-primary text-primary-foreground shadow-sm",
          lg ? "size-14 rounded-2xl" : "size-9 rounded-xl",
        )}
      >
        <Soup className={lg ? "size-7" : "size-5"} />
      </span>
      <span className={cn("tracking-tight", lg ? "text-3xl" : "text-lg")}>
        Vị<span className="text-primary">Việt</span>
      </span>
    </Link>
  )
}
