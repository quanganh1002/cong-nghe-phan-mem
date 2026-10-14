"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const THEME_KEY = "foodlingo:theme"

/** Nút tròn đổi light/dark. Class `dark`/`light` trên <html> được đặt sớm bởi script trong layout để tránh nháy. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    const root = document.documentElement
    root.classList.toggle("dark", next)
    root.classList.toggle("light", !next)
    root.style.colorScheme = next ? "dark" : "light"
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light")
    } catch {}
    setDark(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Light mode" : "Dark mode"}
      className="grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm transition-all active:scale-95 hover:border-primary/40"
    >
      {dark ? <Moon className="size-5" /> : <Sun className="size-5 text-primary" />}
    </button>
  )
}
