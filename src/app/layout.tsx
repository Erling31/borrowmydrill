import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BorrowMyDrill – Neighborhood Tool Sharing",
  description: "Share and borrow power tools with your neighbors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="bg-white border-b border-zinc-200">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight text-orange-600">
              BorrowMyDrill
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
              <Link href="/tools" className="hover:text-zinc-900 transition-colors">Browse Tools</Link>
              <Link href="/tools/new" className="bg-orange-600 text-white px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors">
                List a Tool
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-400">
          BorrowMyDrill — keeping tools in the neighborhood
        </footer>
      </body>
    </html>
  );
}
