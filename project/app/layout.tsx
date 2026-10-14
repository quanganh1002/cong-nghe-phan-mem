import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import { AppProvider } from "@/lib/store"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FoodLingo — Đặt món ăn đa ngôn ngữ",
  description:
    "Hệ thống đặt món ăn đa ngôn ngữ với thuyết minh bằng giọng nói. Order delicious Vietnamese food in 10 languages.",
  generator: "v0.app",
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
