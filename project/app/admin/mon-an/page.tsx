"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { useStats } from "@/hooks/use-admin-data"
import { CATEGORIES, DISHES } from "@/lib/dishes"

const REGION = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" } as const
const CATEGORY = { main: "Món chính", snack: "Món ăn nhẹ", drink: "Đồ uống", dessert: "Tráng miệng", festival: "Lễ hội & Tết" } as const

/** Danh sách món ăn và số lượt xem. Nội dung món nằm trong lib/dishes.ts (thêm/sửa món ở đó). */
function DishTable({ pin }: { pin: string }) {
  const stats = useStats(pin)
  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {DISHES.length} món · {CATEGORIES.length} nhóm. Để thêm hoặc sửa nội dung món, chỉnh file <code>lib/dishes.ts</code>.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Món</th>
              <th className="px-2 py-3 font-semibold">Vùng</th>
              <th className="px-2 py-3 font-semibold">Loại</th>
              <th className="px-2 py-3 text-right font-semibold">Lượt xem</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {DISHES.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-3">
                    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent text-xl">
                      {d.image ? <Image src={d.image} alt="" fill sizes="40px" className="object-cover" /> : d.emoji}
                    </span>
                    <span className="font-semibold">{d.vi.name}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 text-muted-foreground">{REGION[d.region]}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{CATEGORY[d.category]}</td>
                <td className="px-2 py-2.5 text-right font-bold tabular-nums">{stats ? (stats.dishes[d.id] ?? 0) : "–"}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/dishes/${d.id}`} target="_blank" aria-label="Mở trang món" className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function AdminDishesPage() {
  return <AdminShell title="Món ăn">{(pin) => <DishTable pin={pin} />}</AdminShell>
}
