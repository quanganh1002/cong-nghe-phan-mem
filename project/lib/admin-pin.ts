/** Mã PIN trang quản lý chỉ nhớ trong tab đang mở (sessionStorage): đóng tab hoặc thoát khỏi /admin là phải nhập lại. Dùng chung cho các trang /admin */
const PIN_KEY = "foodlingo:admin-pin"
const SHOP_KEY = "foodlingo:admin-shop" // quán của mã PIN đang đăng nhập (server báo về)

export function readPin() {
  try {
    return sessionStorage.getItem(PIN_KEY) ?? ""
  } catch {
    return ""
  }
}

export function writePin(pin: string) {
  try {
    if (pin) sessionStorage.setItem(PIN_KEY, pin)
    else {
      sessionStorage.removeItem(PIN_KEY)
      sessionStorage.removeItem(SHOP_KEY)
    }
  } catch {
    // trình duyệt chặn sessionStorage thì thôi, lần sau nhập lại
  }
}

export function readShop() {
  try {
    return sessionStorage.getItem(SHOP_KEY) ?? ""
  } catch {
    return ""
  }
}

export function writeShop(shop: string) {
  try {
    if (shop) sessionStorage.setItem(SHOP_KEY, shop)
    else sessionStorage.removeItem(SHOP_KEY)
  } catch {}
}
