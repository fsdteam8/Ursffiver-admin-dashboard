import { Metadata } from "next"
import { Poppins } from "next/font/google"
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

// ✅ Import Poppins from Google Fonts
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // pick the weights you’ll use
  variable: "--font-poppins",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
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
