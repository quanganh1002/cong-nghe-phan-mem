import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { AppProvider } from "@/lib/store"
import { PresenceBeacon } from "@/components/presence-beacon"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vị Việt — Văn hóa ẩm thực truyền thống Việt Nam",
  description:
    "Thuyết minh bằng giọng nói về các món ăn truyền thống và văn hóa ẩm thực Việt Nam trong 10 ngôn ngữ. Discover the stories behind traditional Vietnamese dishes.",
}

export const viewport: Viewport = {
  themeColor: "#e2562f",
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
    <html lang="vi" className={`light ${nunito.variable}`} style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("foodlingo:theme")==="dark"){var r=document.documentElement;r.classList.replace("light","dark");r.style.colorScheme="dark"}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${nunito.className} antialiased`}>
        <AppProvider>
          {children}
          <PresenceBeacon />
        </AppProvider>
      </body>
    </html>
  )
}
