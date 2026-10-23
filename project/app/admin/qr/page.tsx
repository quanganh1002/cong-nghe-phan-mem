"use client"

import { useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"
import { Download, Printer, TriangleAlert } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { DISHES } from "@/lib/dishes"

/**
 * Tạo mã QR cho trang chủ và từng món ăn. Link trong QR có thêm ?src=qr
 * để trang thống kê biết khách vào bằng cách quét mã (còn mở link thường thì tính là "link").
 */

type Card = { key: string; title: string; subtitle: string; url: string }

function QrCards() {
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
      { key: "home", title: "Trang chủ", subtitle: "Quét để khám phá ẩm thực Việt", url: `${cleanBase}/?src=qr` },
      ...DISHES.map((d) => ({
        key: d.id,
        title: d.vi.name,
        subtitle: "Quét để nghe thuyết minh",
        url: `${cleanBase}/dishes/${d.id}?src=qr`,
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
    <div className="print:max-w-none">
      {/* Bảng điều khiển — ẩn khi in */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm print:hidden">
        <p className="text-sm text-muted-foreground">
          Mỗi món có một mã QR dẫn thẳng tới trang thuyết minh của món đó. In ra dán cạnh hiện vật, bảng giới thiệu hoặc đăng lên mạng xã hội.
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">Link web</span>
          <input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="https://foodlingo.vercel.app"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        {!validBase && cleanBase && (
          <p className="mt-3 text-sm font-semibold text-destructive">Link phải bắt đầu bằng http:// hoặc https://</p>
        )}
        {isLocal && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Link đang là localhost — điện thoại quét sẽ không vào được. Hãy nhập link đã deploy hoặc IP mạng LAN của máy
            (vd http://192.168.1.10:3000).
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

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:mt-0 print:grid-cols-3 print:gap-3">
        {cards.map((c) => (
          <article
            key={c.key}
            className="flex break-inside-avoid flex-col items-center rounded-3xl border-2 border-dashed border-border bg-white p-4 text-center text-[#2b1a12] print:rounded-xl print:p-3"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#e2562f]">Vị Việt</p>
            <p className="mt-1 text-xl font-extrabold leading-tight">{c.title}</p>
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
    </div>
  )
}

export default function AdminQrPage() {
  return <AdminShell title="Mã QR">{() => <QrCards />}</AdminShell>
}
