import { timingSafeEqual } from "node:crypto"

/** Mã PIN vào trang quản trị — đổi bằng biến môi trường ADMIN_PIN */
const ADMIN_PIN = process.env.ADMIN_PIN || "1234"

export function isAdminPin(pin: string | null): boolean {
  if (!pin) return false
  const a = Buffer.from(pin)
  const b = Buffer.from(ADMIN_PIN)
  return a.length === b.length && timingSafeEqual(a, b)
}
