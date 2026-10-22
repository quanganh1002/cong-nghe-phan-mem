import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Back one page; if the visitor landed here directly (e.g. scanned a QR), there is nothing to go back to, so go home */
export function goBack(router: { back: () => void; push: (href: string) => void }) {
  const cameFromApp = document.referrer.startsWith(window.location.origin) && window.history.length > 1
  if (cameFromApp) router.back()
  else router.push("/")
}
