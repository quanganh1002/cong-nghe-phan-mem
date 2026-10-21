/* eslint-disable @next/next/no-img-element */
export const isImageAvatar = (v: string | undefined): v is string => !!v && v.startsWith("data:image/")

/** Shop avatar: an emoji or an uploaded image (data URL). `className` sets size, background and emoji font size. */
export function ShopAvatar({ value, className }: { value: string | undefined; className: string }) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${className}`} aria-hidden>
      {isImageAvatar(value) ? <img src={value} alt="" className="size-full object-cover" /> : value}
    </span>
  )
}
