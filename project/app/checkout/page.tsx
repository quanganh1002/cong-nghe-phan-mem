"use client"
 
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Banknote,
  Check,
  CircleCheck,
  Copy,
  Landmark,
  Loader2,
  MapPin,
  Phone,
  QrCode,
  ShoppingBag,
  User as UserIcon,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { useApp } from "@/lib/store"
import { getFood, formatPrice } from "@/lib/foods"
import { useTable } from "@/lib/table"
import { linkOrder } from "@/lib/order-links"
import { cn } from "@/lib/utils"
 
/* ====== SỬA THÔNG TIN NHẬN TIỀN CỦA BẠN Ở ĐÂY ====== */
const BANK_ID = "970422" // mã ngân hàng theo VietQR: MB, VCB, TCB, ACB, BIDV, VPB, TPB...
const BANK_NAME = "MB Bank"
const ACCOUNT_NO = "0329766004"
const ACCOUNT_NAME = "NGUYEN TIEN TAI"
const WALLET_PHONE = "0329766004" // số MoMo / ZaloPay
/* ==================================================== */
 
type Method = "cod" | "qr" | "bank" | "wallet"
 
const TEXT = {
  vi: {
    title: "Thanh toán",
    back: "Quay lại giỏ hàng",
    receiver: "Thông tin nhận hàng",
    name: "Họ và tên",
    phone: "Số điện thoại",
    address: "Địa chỉ giao hàng",
    note: "Ghi chú (không bắt buộc)",
    method: "Phương thức thanh toán",
    cod: "Tiền mặt khi nhận hàng",
    codDesc: "Thanh toán cho shipper khi nhận món",
    qr: "Quét mã QR",
    qrDesc: "Quét bằng app ngân hàng bất kỳ (VietQR)",
    bank: "Chuyển khoản ngân hàng",
    bankDesc: "Chuyển khoản thủ công theo thông tin bên dưới",
    wallet: "Ví điện tử MoMo / ZaloPay",
    walletDesc: "Chuyển tiền đến số ví của quán",
    scanTitle: "Quét mã để thanh toán",
    scanHint: "Mở app ngân hàng → Quét QR. Số tiền và nội dung đã được điền sẵn.",
    bankName: "Ngân hàng",
    accNo: "Số tài khoản",
    accName: "Chủ tài khoản",
    amount: "Số tiền",
    content: "Nội dung CK",
    walletNo: "Số ví",
    copy: "Đã sao chép",
    summary: "Đơn hàng của bạn",
    total: "Tổng cộng thanh toán",
    place: "Xác nhận đặt hàng",
    paid: "Tôi đã thanh toán · Đặt hàng",
    placing: "Đang xử lý…",
    errName: "Vui lòng nhập họ tên",
    errPhone: "Số điện thoại không hợp lệ",
    errAddress: "Vui lòng nhập địa chỉ giao hàng",
    successTitle: "Đặt hàng thành công!",
    successDesc: "Cảm ơn bạn. Quán đã nhận đơn và sẽ xác nhận trong ít phút.",
    orderCode: "Mã đơn hàng",
    viewOrders: "Xem đơn hàng",
    keepShopping: "Tiếp tục chọn món",
    empty: "Giỏ hàng đang trống",
    browse: "Xem thực đơn",
    // Gọi món tại bàn (vào từ QR)
    dineIn: "Gọi món tại bàn",
    tableNo: "Bàn",
    dineInDesc: "Món sẽ được mang ra tận bàn của bạn",
    guestInfo: "Thông tin người gọi món (không bắt buộc)",
    codTable: "Tiền mặt tại quầy",
    codTableDesc: "Thanh toán tại quầy hoặc cho nhân viên",
    atShop: "tại quán",
    sendFail: "Không gửi được đơn tới quán. Kiểm tra mạng rồi bấm lại nhé.",
  },
  en: {
    title: "Checkout",
    back: "Back to cart",
    receiver: "Delivery information",
    name: "Full name",
    phone: "Phone number",
    address: "Delivery address",
    note: "Note (optional)",
    method: "Payment method",
    cod: "Cash on delivery",
    codDesc: "Pay the courier when your food arrives",
    qr: "Scan QR code",
    qrDesc: "Scan with any banking app (VietQR)",
    bank: "Bank transfer",
    bankDesc: "Transfer manually using the details below",
    wallet: "E-wallet MoMo / ZaloPay",
    walletDesc: "Send money to the shop's wallet number",
    scanTitle: "Scan to pay",
    scanHint: "Open your banking app → Scan QR. Amount and note are pre-filled.",
    bankName: "Bank",
    accNo: "Account number",
    accName: "Account holder",
    amount: "Amount",
    content: "Transfer note",
    walletNo: "Wallet number",
    copy: "Copied",
    summary: "Your order",
    total: "Total to pay",
    place: "Place order",
    paid: "I have paid · Place order",
    placing: "Processing…",
    errName: "Please enter your name",
    errPhone: "Invalid phone number",
    errAddress: "Please enter a delivery address",
    successTitle: "Order placed!",
    successDesc: "Thank you. The shop received your order and will confirm shortly.",
    orderCode: "Order code",
    viewOrders: "View orders",
    keepShopping: "Keep shopping",
    empty: "Your cart is empty",
    browse: "Browse menu",
    dineIn: "Dine-in order",
    tableNo: "Table",
    dineInDesc: "Your food will be served to your table",
    guestInfo: "Your details (optional)",
    codTable: "Cash at the counter",
    codTableDesc: "Pay at the counter or to our staff",
    atShop: "dine-in",
    sendFail: "Couldn't send your order to the shop. Check your connection and try again.",
  },
}
 
const METHODS: { key: Method; icon: LucideIcon; label: "cod" | "qr" | "bank" | "wallet" }[] = [
  { key: "qr", icon: QrCode, label: "qr" },
  { key: "bank", icon: Landmark, label: "bank" },
  { key: "wallet", icon: Wallet, label: "wallet" },
  { key: "cod", icon: Banknote, label: "cod" },
]
 
export default function CheckoutPage() {
  const { lang, cart, cartTotal, user, hydrated, placeOrder, clearCart } = useApp()
  const t = lang === "vi" ? TEXT.vi : TEXT.en
  const [table] = useTable()
 
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [method, setMethod] = useState<Method>("qr")
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ id: string } | null>(null)
  const [memo, setMemo] = useState("")
  const [total, setTotal] = useState(0)
 
  // Mã nội dung chuyển khoản (tạo ở client để tránh lệch SSR)
  useEffect(() => {
    setMemo(`FL${Date.now().toString().slice(-6)}`)
  }, [])
 
  // Điền sẵn thông tin từ tài khoản
  useEffect(() => {
    if (!user) return
    setName((v) => v || (user.name ?? ""))
    setPhone((v) => v || (user.phone ?? ""))
    setAddress((v) => v || (user.address ?? ""))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
 
  // Giữ lại tổng tiền để hiển thị ở màn hình thành công (giỏ sẽ bị xóa sau khi đặt)
  useEffect(() => {
    if (!done) setTotal(cartTotal)
  }, [cartTotal, done])
 
  // Nội dung CK có kèm số bàn (vd FL123456B5) để quán dễ đối soát
  const transferNote = table ? `${memo}B${table}` : memo

  const qrUrl = useMemo(
    () =>
      `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${cartTotal}` +
      `&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`,
    [cartTotal, transferNote],
  )
 
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t.copy)
    } catch {
      toast.error("Copy failed")
    }
  }
 
  const validate = () => {
    const e: typeof errors = {}
    const phoneOk = /^(\+?84|0)\d{9,10}$/.test(phone.replace(/[\s.-]/g, ""))
    if (table) {
      // Ngồi tại bàn: không bắt buộc gì, chỉ kiểm tra SĐT nếu khách có nhập
      if (phone.trim() && !phoneOk) e.phone = t.errPhone
    } else {
      if (!name.trim()) e.name = t.errName
      if (!phoneOk) e.phone = t.errPhone
      if (!address.trim()) e.address = t.errAddress
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }
 
  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        items: cart.map((i) => ({ foodId: i.foodId, quantity: i.quantity, unitPrice: getFood(i.foodId)?.price ?? 0 })),
        total: cartTotal,
        name: name.trim() || (table ? `${t.tableNo} ${table}` : ""),
        phone: phone.trim(),
        // Đơn tại bàn: ghi số bàn vào chỗ địa chỉ để trang Đơn hàng hiển thị luôn
        address: table ? `${t.tableNo} ${table} · ${t.atShop}` : address.trim(),
        note: note.trim(),
        payment: method,
      }

      // 1) Gửi đơn về máy của quán (trang bếp /admin sẽ thấy)
      let serverId: string
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, table, transferNote }),
        })
        if (!res.ok) throw new Error(String(res.status))
        serverId = ((await res.json()) as { id: string }).id
      } catch {
        toast.error(t.sendFail) // giữ nguyên giỏ hàng để khách bấm lại
        return
      }

      // 2) Lưu thêm một bản trên máy khách để xem ở trang "Đơn hàng",
      //    và nhớ mã đơn bên quán để trang đó lấy được trạng thái bếp cập nhật
      const local = placeOrder(payload)
      linkOrder(local.id, serverId)
      setTotal(cartTotal)
      setDone({ id: serverId })
      clearCart()
    } finally {
      setLoading(false)
    }
  }
 
  /* ---------- Thành công ---------- */
  if (done) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
          <div className="animate-pop grid size-24 place-items-center rounded-full bg-chart-3/15">
            <CircleCheck className="size-12 text-chart-3" />
          </div>
          <h1 className="text-2xl font-extrabold">{t.successTitle}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{t.successDesc}</p>
          <div className="mt-1 rounded-2xl border border-border bg-card px-6 py-3 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {t.orderCode}: <b className="text-foreground">#{done.id}</b>
            </p>
            {table && (
              <p className="text-sm text-muted-foreground">
                {t.tableNo}: <b className="text-foreground">{table}</b>
              </p>
            )}
            <p className="text-lg font-extrabold text-primary">{formatPrice(total)}</p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/orders"
              className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95"
            >
              {t.viewOrders}
            </Link>
            <Link
              href="/menu"
              className="rounded-full border border-border bg-card px-6 py-3 font-bold transition-transform active:scale-95"
            >
              {t.keepShopping}
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }
 
  /* ---------- Giỏ trống ---------- */
  if (hydrated && cart.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="grid size-24 place-items-center rounded-full bg-accent">
            <ShoppingBag className="size-11 text-primary" />
          </div>
          <h1 className="text-xl font-bold">{t.empty}</h1>
          <Link href="/menu" className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md">
            {t.browse}
          </Link>
        </div>
      </AppShell>
    )
  }
 
  const needsProof = method === "qr" || method === "bank" || method === "wallet"
 
  return (
    <AppShell>
      <div className="px-4 pb-64 pt-4 md:pb-40">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold">{t.title}</h1>
 
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {/* Đang ngồi tại bàn (vào từ QR) */}
            {table && (
              <section className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-secondary p-4 shadow-sm">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <UtensilsCrossed className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground">{t.dineIn}</p>
                  <p className="text-xl font-extrabold">
                    {t.tableNo} {table}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.dineInDesc}</p>
                </div>
              </section>
            )}

            {/* Thông tin nhận hàng (tại bàn thì chỉ cần tên/SĐT, không bắt buộc) */}
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 font-bold">{table ? t.guestInfo : t.receiver}</h2>
              <div className="space-y-3">
                <Field icon={<UserIcon className="size-4" />} label={t.name} value={name} onChange={setName} error={errors.name} autoComplete="name" />
                <Field icon={<Phone className="size-4" />} label={t.phone} value={phone} onChange={setPhone} error={errors.phone} type="tel" autoComplete="tel" />
                {!table && (
                  <Field icon={<MapPin className="size-4" />} label={t.address} value={address} onChange={setAddress} error={errors.address} autoComplete="street-address" />
                )}
                <Field label={t.note} value={note} onChange={setNote} />
              </div>
            </section>
 
            {/* Phương thức thanh toán */}
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 font-bold">{t.method}</h2>
              <div className="space-y-2">
                {METHODS.map((m) => {
                  const Icon = m.icon
                  const active = method === m.key
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMethod(m.key)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-all active:scale-[0.99]",
                        active ? "border-primary bg-accent/60 ring-2 ring-primary/20" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{m.key === "cod" && table ? t.codTable : t[m.label]}</span>
                        <span className="block text-xs text-muted-foreground">
                          {m.key === "cod" && table ? t.codTableDesc : t[`${m.label}Desc` as "codDesc"]}
                        </span>
                      </span>
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", active ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                        {active && <Check className="size-3" />}
                      </span>
                    </button>
                  )
                })}
              </div>
 
              {/* Chi tiết theo phương thức */}
              {method === "qr" && (
                <div className="animate-scale-in mt-4 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-secondary p-4 text-center">
                  <p className="font-bold">{t.scanTitle}</p>
                  <div className="rounded-2xl bg-white p-3 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="VietQR" width={240} height={240} className="size-60 object-contain" />
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{formatPrice(cartTotal)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.content}: <b className="text-foreground">{transferNote}</b>
                  </p>
                  <p className="max-w-xs text-xs text-muted-foreground">{t.scanHint}</p>
                </div>
              )}
 
              {method === "bank" && (
                <div className="animate-scale-in mt-4 space-y-2 rounded-2xl bg-secondary p-4 text-sm">
                  <Row label={t.bankName} value={BANK_NAME} />
                  <Row label={t.accNo} value={ACCOUNT_NO} onCopy={() => copy(ACCOUNT_NO)} />
                  <Row label={t.accName} value={ACCOUNT_NAME} />
                  <Row label={t.amount} value={formatPrice(cartTotal)} onCopy={() => copy(String(cartTotal))} />
                  <Row label={t.content} value={transferNote} onCopy={() => copy(transferNote)} />
                </div>
              )}
 
              {method === "wallet" && (
                <div className="animate-scale-in mt-4 space-y-2 rounded-2xl bg-secondary p-4 text-sm">
                  <Row label={t.walletNo} value={WALLET_PHONE} onCopy={() => copy(WALLET_PHONE)} />
                  <Row label={t.accName} value={ACCOUNT_NAME} />
                  <Row label={t.amount} value={formatPrice(cartTotal)} onCopy={() => copy(String(cartTotal))} />
                  <Row label={t.content} value={transferNote} onCopy={() => copy(transferNote)} />
                </div>
              )}
            </section>
          </div>
 
          {/* Tóm tắt đơn */}
          <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-3 font-bold">{t.summary}</h2>
            <ul className="space-y-3">
              {cart.map((item) => {
                const food = getFood(item.foodId)
                if (!food) return null
                const info = food.t[lang]
                return (
                  <li key={item.foodId} className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={food.image || "/placeholder.svg"} alt={info.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{info.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatPrice(food.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{formatPrice(food.price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
 
      {/* Thanh xác nhận cố định */}
      <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 md:bottom-0">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur md:mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.total}</span>
              <span className="text-xl font-extrabold text-primary">{formatPrice(cartTotal)}</span>
            </div>
            <button
              onClick={submit}
              disabled={loading || cart.length === 0}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {t.placing}
                </>
              ) : needsProof ? (
                t.paid
              ) : (
                t.place
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
 
function Field({
  label,
  value,
  onChange,
  error,
  icon,
  type = "text",
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  icon?: React.ReactNode
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <span
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-colors focus-within:border-primary",
          error ? "border-destructive" : "border-border",
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </span>
      {error && <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>}
    </label>
  )
}
 
function Row({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-bold tabular-nums">
        {value}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label="copy"
            className="grid size-7 place-items-center rounded-full bg-background text-muted-foreground shadow-sm transition-transform hover:text-primary active:scale-90"
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}