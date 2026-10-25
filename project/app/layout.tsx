import type React from "react"
import type { Metadata, Viewport } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { AppProvider } from "@/lib/store"
import { PresenceBeacon } from "@/components/presence-beacon"
import "./globals.css"

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans-app",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vị Việt — Văn hóa ẩm thực truyền thống Việt Nam",
  description:
    "Thuyết minh bằng giọng nói về các món ăn truyền thống và văn hóa ẩm thực Việt Nam bằng nhiều ngôn ngữ khác nhau. Discover the stories behind traditional Vietnamese dishes.",
}

export const viewport: Viewport = {
  themeColor: "#6d4aff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`light ${sans.variable}`} style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("foodlingo:theme")==="dark"){var r=document.documentElement;r.classList.replace("light","dark");r.style.colorScheme="dark"}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${sans.className} antialiased`}>
        <AppProvider>
          {children}
          <PresenceBeacon />
        </AppProvider>
      </body>
    </html>
  )
}
