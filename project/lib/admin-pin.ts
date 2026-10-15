/** Mã PIN trang quản lý được nhớ trên trình duyệt của máy quán (dùng chung cho /admin và /admin/thong-ke) */
const PIN_KEY = "foodlingo:admin-pin"

export function readPin() {
  try {
    return localStorage.getItem(PIN_KEY) ?? ""
  } catch {
    return ""
  }
}

export function writePin(pin: string) {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin)
    else localStorage.removeItem(PIN_KEY)
  } catch {
    // trình duyệt chặn localStorage thì thôi, lần sau nhập lại
  }
}
