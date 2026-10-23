import type { Category, Food, FoodText } from "./foods"
import { IMAGE_URL_PREFIX } from "./foods-db"
import type { ShopId } from "./shops"
import { translateFood } from "./translate"

const CATEGORIES: Category[] = ["main", "drink", "dessert", "snack"]

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** Ảnh hợp lệ: ảnh có sẵn trong public/foods hoặc ảnh đã tải lên Supabase Storage của web này */
const imageOk = (v: string) => /^\/foods\/[\w.-]+$/.test(v) || (IMAGE_URL_PREFIX.startsWith("https://") && v.startsWith(IMAGE_URL_PREFIX) && !/\s/.test(v))

/** Mã món từ tên tiếng Việt: "Phở bò" → "pho-bo-x7k2" */
export const newFoodId = (name: string) =>
  `${name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "mon"}-${Math.random().toString(36).slice(2, 6)}`

/**
 * Ghép dữ liệu admin gửi lên thành 1 món hoàn chỉnh. `current` = món đang có (khi sửa).
 * Tên/mô tả tiếng Việt đổi (hoặc món mới) thì tự dịch lại sang 9 ngôn ngữ còn lại.
 * Trả `error` nếu dữ liệu sai, `failed` = các ngôn ngữ dịch lỗi (đang dùng tạm bản cũ / tiếng Việt).
 */
export async function buildFood(
  body: Record<string, unknown>,
  shop: ShopId,
  current: Food | undefined,
  id: string,
): Promise<{ food: Food; failed: string[] } | { error: string }> {
  const vi: FoodText = {
    name: str(body.name, 100) || current?.t.vi.name || "",
    description: typeof body.description === "string" ? str(body.description, 600) : (current?.t.vi.description ?? ""),
  }
  if (!vi.name) return { error: "Tên món không được để trống" }

  const price = body.price === undefined && current ? current.price : Math.round(Number(body.price))
  if (!Number.isFinite(price) || price < 0 || price > 100_000_000) return { error: "Giá không hợp lệ" }

  const category = (body.category ?? current?.category) as Category
  if (!CATEGORIES.includes(category)) return { error: "Danh mục không hợp lệ" }

  const image = body.image === undefined && current ? current.image : str(body.image, 500)
  if (image && !imageOk(image)) return { error: "Ảnh không hợp lệ" }

  const changed = !current || current.t.vi.name !== vi.name || current.t.vi.description !== vi.description
  let t = current?.t
  let failed: string[] = []
  if (changed || !t) {
    const res = await translateFood(vi, current?.t)
    t = res.t
    failed = res.failed
  }

  const flag = (key: "popular" | "isNew" | "hidden") => (body[key] === undefined ? current?.[key] : body[key] === true) || undefined

  const food: Food = {
    id,
    category,
    shop,
    price,
    image,
    ...(flag("popular") && { popular: true }),
    ...(flag("isNew") && { isNew: true }),
    ...(flag("hidden") && { hidden: true }),
    t,
  }
  return { food, failed }
}
