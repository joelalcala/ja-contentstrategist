import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Content Strategist",
  description: "Web crawler and content analysis tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-muted/40`}>
        <Sidebar />
        <div className="flex-1 flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          {children}
        </div>
      </body>
    </html>
  );
}