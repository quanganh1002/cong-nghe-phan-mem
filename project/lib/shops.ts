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
  cover?: string // ảnh bìa (data URL đã thu nhỏ)
  description?: string
  openTime?: string // "HH:MM"; để trống cả giờ mở và giờ đóng = không giới hạn giờ
  closeTime?: string // nhỏ hơn giờ mở = qua đêm
  days?: number[] // ngày hoạt động trong tuần, 0 = Chủ nhật … 6 = Thứ 7; thiếu = mọi ngày
  status?: ShopStatus // thiếu = "open"
}

/** open = bình thường, closed = tạm đóng cửa, paused = vẫn mở nhưng tạm ngừng nhận đơn */
export type ShopStatus = "open" | "closed" | "paused"

export const WEEKDAYS = [
  [1, "T2"],
  [2, "T3"],
  [3, "T4"],
  [4, "T5"],
  [5, "T6"],
  [6, "T7"],
  [0, "CN"],
] as const

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export type ShopState = "open" | "closed" | "paused" | "off-hours"

/** Trạng thái thực tế của quán lúc `now` (giờ Việt Nam): nút bật/tắt của quán trước, rồi mới tới giờ/ngày hoạt động */
export function shopState(info: Pick<ShopInfo, "status" | "openTime" | "closeTime" | "days"> | null | undefined, now = new Date()): ShopState {
  if (info?.status === "closed") return "closed"
  if (info?.status === "paused") return "paused"
  const open = info?.openTime
  const close = info?.closeTime
  const days = info?.days
  if (!info || (!open && !close && !days?.length)) return "open"

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  const cur = `${get("hour")}:${get("minute")}`

  if (open && close && open !== close) {
    if (open < close) {
      if (days?.length && !days.includes(day)) return "off-hours"
      return cur >= open && cur < close ? "open" : "off-hours"
    }
    // Qua đêm: phần sau nửa đêm thuộc về ngày hoạt động hôm trước
    if (cur >= open) return !days?.length || days.includes(day) ? "open" : "off-hours"
    if (cur < close) return !days?.length || days.includes((day + 6) % 7) ? "open" : "off-hours"
    return "off-hours"
  }
  return days?.length && !days.includes(day) ? "off-hours" : "open"
}

export const SHOP_AVATARS = ["🍜", "🍟", "🧁", "🍕", "🍔", "🍣", "🥗", "🍰", "☕", "🍹", "🥐", "🍲", "🍗", "🌮", "🍦", "🥟"]

export const fullAddress = (i: Pick<ShopInfo, "address" | "ward" | "province">) =>
  [i.address, i.ward, i.province].filter(Boolean).join(", ")
