"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { Dish } from "./dishes"

const Ctx = createContext<Dish[]>([])

/** Danh sách món do root layout đọc từ database ở server; admin lưu xong gọi router.refresh() để cập nhật */
export function DishesProvider({ dishes, children }: { dishes: Dish[]; children: ReactNode }) {
  return <Ctx.Provider value={dishes}>{children}</Ctx.Provider>
}

export function useDishes() {
  const dishes = useContext(Ctx)
  return useMemo(() => {
    const byId = new Map(dishes.map((d) => [d.id, d]))
    return { dishes, getDish: (id: string) => byId.get(id) }
  }, [dishes])
}
