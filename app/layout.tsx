import { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Providers } from "./providers"
import { Suspense } from "react"
import "./globals.css"
import { LayoutWrapper } from "@/components/layout-wrapper"

export const metadata: Metadata = {
  title: "SPEET Admin Dashboard",
  description: "Admin dashboard for SPEET social platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster position="top-right" />
          </Providers>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}