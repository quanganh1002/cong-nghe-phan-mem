"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

/** Floating button (bottom-right) that appears after scrolling down and jumps back to the top */
export function ScrollToTop() {
  const { dict } = useApp()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={dict.backToTop}
      title={dict.backToTop}
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed end-4 bottom-24 z-30 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background/70 transition-all duration-300 active:scale-90 md:bottom-8 md:end-8 hover:-translate-y-0.5",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
