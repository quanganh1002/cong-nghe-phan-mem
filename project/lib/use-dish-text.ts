"use client"

import { useMemo } from "react"
import type { Dish, DishText } from "./dishes"
import { useApp } from "./store"
import { useL10n } from "./translate-client"

/**
 * Nội dung món ăn theo ngôn ngữ đang chọn.
 * `fields` giới hạn các trường cần dịch (danh sách chỉ cần tên + giới thiệu, trang chi tiết cần đủ).
 */
export function useDishText(dishes: Dish[], fields: (keyof DishText)[]): (dish: Dish) => DishText {
  const { lang } = useApp()
  const fieldsKey = fields.join(",")
  const flat = useMemo(() => {
    const keys: [string, keyof DishText][] = []
    for (const d of dishes) for (const f of fields) keys.push([d.id, f])
    return keys
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishes, fieldsKey])
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes])

  const viTexts = flat.map(([id, f]) => byId.get(id)!.vi[f])
  const enTexts = flat.map(([id, f]) => byId.get(id)!.en[f])
  const texts = useL10n(viTexts, enTexts, lang)

  return (dish) => {
    const base = lang === "vi" ? dish.vi : dish.en
    const out: DishText = { ...base }
    flat.forEach(([id, f], i) => {
      if (id === dish.id) out[f] = texts[i]
    })
    return out
  }
}
