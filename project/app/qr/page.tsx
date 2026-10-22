"use client"

import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"
import { Download, Printer, TriangleAlert } from "lucide-react"
import { SHOPS } from "@/lib/shops"

/**
 * Trang tạo mã QR của từng quán (bán trên web, không có QR theo bàn).
 * Mỗi quán 1 mã → /shop/<mã quán>. Mở /qr → nhập link web đã deploy → bấm In.
 */

type Card = { key: string; title: string; subtitle: string; url: string }

export default function QrPage() {
  const [base, setBase] = useState("")
  const [images, setImages] = useState<Record<string, string>>({})

  // Mặc định lấy đúng tên miền đang mở trang này
  useEffect(() => {
    setBase(window.location.origin)
  }, [])

  const cleanBase = base.trim().replace(/\/+$/, "")
  const validBase = /^https?:\/\/[^\s/]+/.test(cleanBase)
  const isLocal = /\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(cleanBase)

  const cards = useMemo<Card[]>(() => {
    if (!validBase) return []
    return [
      { key: "home", title: "Trang chủ", subtitle: "Quét để vào web FoodLingo", url: cleanBase },
      ...SHOPS.map((s) => ({
        key: s.id,
        title: s.name,
        subtitle: "Quét để xem quán và đặt món",
        url: `${cleanBase}/shop/${s.id}`,
      })),
    ]
  }, [cleanBase, validBase])

  // Vẽ QR ngay trên trình duyệt (không phụ thuộc web ngoài)
  useEffect(() => {
    let cancelled = false
    Promise.all(
      cards.map(async (c) => {
        const img = await QRCode.toDataURL(c.url, {
          width: 600,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#2b1a12", light: "#ffffff" },
        })
        return [c.key, img] as const
      }),
    )
      .then((entries) => {
        if (!cancelled) setImages(Object.fromEntries(entries))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [cards])

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:p-0">
      {/* Bảng điều khiển — ẩn khi in */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm print:hidden">
        <h1 className="text-2xl font-extrabold">Tạo mã QR của quán</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mỗi quán có 1 mã QR dẫn tới trang quán trên web. Dán ngoài cửa hoặc đăng Facebook, khách quét để xem quán và đặt món.
        </p>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted-foreground">Link web</span>
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              placeholder="https://ten-quan.vercel.app"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        {!validBase && cleanBase && (
          <p className="mt-3 text-sm font-semibold text-destructive">Link phải bắt đầu bằng http:// hoặc https://</p>
        )}
        {isLocal && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Link đang là localhost — điện thoại của khách quét sẽ không vào được. Hãy nhập link đã deploy (vd Vercel)
            hoặc IP mạng LAN của máy (vd http://192.168.1.10:3000).
          </p>
        )}

        <button
          onClick={() => window.print()}
          disabled={cards.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform active:scale-95 disabled:opacity-60"
        >
          <Printer className="size-5" />
          In tất cả ({cards.length} mã)
        </button>
      </section>

      {/* Lưới thẻ QR — mỗi thẻ là 1 quán */}
      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:mt-0 print:grid-cols-3 print:gap-3">
        {cards.map((c) => (
          <article
            key={c.key}
            className="flex break-inside-avoid flex-col items-center rounded-3xl border-2 border-dashed border-border bg-white p-4 text-center text-[#2b1a12] print:rounded-xl print:p-3"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#e2562f]">FoodLingo</p>
            <p className="mt-1 text-2xl font-extrabold">{c.title}</p>
            <div className="mt-2 aspect-square w-full max-w-48">
              {images[c.key] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[c.key]} alt={`QR ${c.title}`} className="size-full" />
              ) : (
                <div className="shimmer size-full rounded-xl bg-muted" />
              )}
            </div>
            <p className="mt-2 text-sm font-semibold">{c.subtitle}</p>
            <p className="mt-0.5 break-all text-[10px] text-neutral-500">{c.url}</p>
            {images[c.key] && (
              <a
                href={images[c.key]}
                download={`qr-${c.key}.png`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-neutral-200 print:hidden"
              >
                <Download className="size-3.5" />
                Tải PNG
              </a>
            )}
          </article>
        ))}
      </section>
    </main>
  )
}
