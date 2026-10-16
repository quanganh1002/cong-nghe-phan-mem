"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { QuantityStepper } from "@/components/quantity-stepper"
import { useApp } from "@/lib/store"
import { getFood, formatPrice } from "@/lib/foods"
import { useRequireLogin } from "@/lib/require-login"

export default function CartPage() {
  const { dict, lang, cart, cartTotal, setQuantity, removeFromCart } = useApp()
  const router = useRouter()
  const requireLogin = useRequireLogin()

  if (cart.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="animate-pop grid size-24 place-items-center rounded-full bg-accent">
            <ShoppingBag className="size-11 text-primary" />
          </div>
          <h1 className="text-xl font-bold">{dict.cartEmpty}</h1>
          <p className="max-w-xs text-sm text-muted-foreground">{dict.cartEmptyDesc}</p>
          <Link
            href="/menu"
            className="mt-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
          >
            {dict.browseMenu}
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-extrabold">{dict.cartTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.items.replace("{count}", String(cart.length))}</p>

        <ul className="mt-4 space-y-3">
          {cart.map((item, i) => {
            const food = getFood(item.foodId)
            if (!food) return null
            const info = food.t[lang]
            return (
              <li
                key={item.foodId}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <Link href={`/food/${food.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={food.image || "/placeholder.svg"} alt={info.name} fill className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/food/${food.id}`} className="line-clamp-1 font-bold hover:text-primary">
                      {info.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.foodId)}
                      aria-label={dict.remove}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatPrice(food.price)}</span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.foodId, q)}
                      min={0}
                    />
                    <span className="font-extrabold tabular-nums">{formatPrice(food.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Summary bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 md:bottom-0">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur md:mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dict.total}</span>
              <span className="text-xl font-extrabold text-primary">{formatPrice(cartTotal)}</span>
            </div>
            <button
              onClick={() => {
                if (requireLogin("/checkout")) router.push("/checkout")
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] hover:shadow-lg"
            >
              {dict.checkout}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
