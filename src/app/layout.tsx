import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ApifyProvider } from '@/contexts/ApifyContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Content Strategist",
  description: "Web crawler and content analysis tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-background text-foreground`}>
        <ThemeProvider>
          <ApifyProvider>{children}</ApifyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
