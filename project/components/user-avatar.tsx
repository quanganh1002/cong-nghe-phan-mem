"use client"

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react"
import { Camera, User as UserIcon, X } from "lucide-react"
import { isImageAvatar } from "@/components/shop-avatar"
import { squareImage } from "@/lib/image"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

/** Ảnh đại diện người dùng; chưa chọn ảnh thì hiện chữ viết tắt của tên (mặc định). `className` sets size/colors. */
export function UserAvatar({ name, avatar, className }: { name: string; avatar?: string; className: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full font-extrabold", className)} aria-hidden>
      {isImageAvatar(avatar) ? (
        <img src={avatar} alt="" className="size-full object-cover" />
      ) : (
        initials(name) || <UserIcon className="size-1/2" />
      )}
    </span>
  )
}

/** Chọn ảnh từ máy (tùy chọn); `value` undefined = dùng ảnh mặc định. */
export function AvatarPicker({ name, value, onChange }: { name: string; value?: string; onChange: (v: string | undefined) => void }) {
  const { dict, lang } = useApp()
  const input = useRef<HTMLInputElement>(null)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      onChange(await squareImage(file))
    } catch {
      alert(lang === "vi" ? "Không đọc được ảnh này, hãy thử ảnh khác." : "Could not read this image, please try another one.")
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label={dict.avatar}
        className="relative rounded-full transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <UserAvatar name={name} avatar={value} className="size-20 bg-accent text-2xl text-primary" />
        <span className="absolute -bottom-0.5 -end-0.5 grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
          <Camera className="size-3.5" />
        </span>
      </button>
      <span className="text-xs font-semibold text-muted-foreground">
        {dict.avatar} · {dict.optional}
      </span>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
        >
          <X className="size-3.5" />
          {dict.removeAvatar}
        </button>
      )}
      <input ref={input} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  )
}
