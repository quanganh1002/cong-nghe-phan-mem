/** Các quán trong hệ thống. Mỗi quán có 1 mã PIN riêng (xem orders-db.ts). */
// city/address/phone: dữ liệu mẫu, chỉ hiện khi admin quán chưa nhập thông tin (xem ShopInfo)
export const SHOPS = [
  {
    id: "sang",
    name: "Quán ăn sáng",
    emoji: "🍜",
    city: "Hà Nội",
    address: "12 Hàng Bạc, Phường Hoàn Kiếm, Hà Nội",
    phone: "0901 234 567",
  },
  {
    id: "vat",
    name: "Quán ăn vặt",
    emoji: "🍟",
    city: "TP. Hồ Chí Minh",
    address: "45 Nguyễn Trãi, Phường Bến Thành, TP. Hồ Chí Minh",
    phone: "0912 345 678",
  },
  {
    id: "ngot",
    name: "Tiệm bánh ngọt",
    emoji: "🧁",
    city: "Đà Nẵng",
    address: "88 Bạch Đằng, Phường Hải Châu, Đà Nẵng",
    phone: "0923 456 789",
  },
] as const

export type ShopId = (typeof SHOPS)[number]["id"]

export const getShop = (id: string | null | undefined) => SHOPS.find((s) => s.id === id)

/** Thông tin quán do admin nhập ở /admin/nha-hang. address = số nhà, tên đường; province/ward chọn từ danh sách đơn vị hành chính */
export type ShopInfo = {
  name: string
  address: string
  province: string
  ward: string
  phone: string
  email: string
  avatar?: string // emoji chọn từ SHOP_AVATARS; thiếu thì dùng emoji mặc định của quán
}

export const SHOP_AVATARS = ["🍜", "🍟", "🧁", "🍕", "🍔", "🍣", "🥗", "🍰", "☕", "🍹", "🥐", "🍲", "🍗", "🌮", "🍦", "🥟"]

export const fullAddress = (i: Pick<ShopInfo, "address" | "ward" | "province">) =>
  [i.address, i.ward, i.province].filter(Boolean).join(", ")
