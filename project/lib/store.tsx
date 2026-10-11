"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { DEFAULT_LANG, getLanguage, type LangCode } from "./languages"
import { translations, type Dict } from "./i18n"
import { FOODS } from "./foods"

export type OrderStatus = "ordered" | "confirmed" | "preparing" | "delivering" | "completed"

export const ORDER_STEPS: OrderStatus[] = ["ordered", "confirmed", "preparing", "delivering", "completed"]

export interface CartItem {
  foodId: string
  quantity: number
}

export interface OrderItem {
  foodId: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  name: string
  phone: string
  address: string
  note: string
  payment: "cod" | "bank" | "qr" | "wallet"
  status: OrderStatus
  date: string // ISO
}

export interface User {
  id: string
  name: string
  username?: string
  email: string
  phone?: string
  address?: string
  createdAt: string // ISO
}

interface AppState {
  lang: LangCode
  setLang: (l: LangCode) => void
  dict: Dict
  cart: CartItem[]
  addToCart: (foodId: string, quantity?: number) => void
  removeFromCart: (foodId: string) => void
  setQuantity: (foodId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  orders: Order[]
  placeOrder: (o: Omit<Order, "id" | "status" | "date">) => Order
  /** null = chưa đăng nhập */
  user: User | null
  /** false until localStorage has been read (avoids a flash of the guest state) */
  hydrated: boolean
  login: (u: User) => void
  logout: () => void
}

const AppContext = createContext<AppState | null>(null)

const LANG_KEY = "foodlingo:lang"
const CART_KEY = "foodlingo:cart"
// v2: bỏ các đơn mẫu cũ đã lưu trong trình duyệt
const ORDERS_KEY = "foodlingo:orders:v2"
const LEGACY_ORDERS_KEY = "foodlingo:orders"
const USER_KEY = "foodlingo:user"

function price(foodId: string): number {
  return FOODS.find((f) => f.id === foodId)?.price ?? 0
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load persisted state once on mount
  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY) as LangCode | null
      if (l) setLangState(l)
      const c = localStorage.getItem(CART_KEY)
      if (c) setCart(JSON.parse(c))
      const u = localStorage.getItem(USER_KEY)
      if (u) setUser(JSON.parse(u))
      const o = localStorage.getItem(ORDERS_KEY)
      setOrders(o ? JSON.parse(o) : [])
      localStorage.removeItem(LEGACY_ORDERS_KEY)
    } catch {
      // dữ liệu lưu trữ bị lỗi → bắt đầu lại với danh sách trống
    }
    setHydrated(true)
  }, [])

  // Persist + reflect language on <html>
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(LANG_KEY, lang)
    const meta = getLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = meta.dir
  }, [lang, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user, hydrated])

  const setLang = useCallback((l: LangCode) => setLangState(l), [])

  const addToCart = useCallback((foodId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.foodId === foodId)
      if (existing) {
        return prev.map((i) => (i.foodId === foodId ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { foodId, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((foodId: string) => {
    setCart((prev) => prev.filter((i) => i.foodId !== foodId))
  }, [])

  const setQuantity = useCallback((foodId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.foodId !== foodId)
        : prev.map((i) => (i.foodId === foodId ? { ...i, quantity } : i)),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const placeOrder = useCallback((o: Omit<Order, "id" | "status" | "date">): Order => {
    const order: Order = {
      ...o,
      id: "DH" + String(Math.floor(1000 + Math.random() * 9000)),
      status: "confirmed",
      date: new Date().toISOString(),
    }
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  const login = useCallback((u: User) => setUser(u), [])
  const logout = useCallback(() => setUser(null), [])

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0)
  const cartTotal = cart.reduce((sum, i) => sum + price(i.foodId) * i.quantity, 0)

  const value: AppState = {
    lang,
    setLang,
    dict: translations[lang],
    cart,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    cartCount,
    cartTotal,
    orders,
    placeOrder,
    user,
    hydrated,
    login,
    logout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
