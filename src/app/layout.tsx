import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";
import MobileNav from "@/components/MobileNav";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "Naboverktøy – Del verktøy med naboene",
  description: "Lån og del elektroverktøy med naboene dine.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="nb" className={`${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-warm-50 text-[#1e1f21]">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <nav
            className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between"
            style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
          >
            <Link href="/" className="font-bold text-lg tracking-tight text-coral-500">
              Naboverktøy
            </Link>

            {/* Hamburger menu — same on mobile and desktop */}
            <div className="relative">
              <MobileNav user={session?.user} />
            </div>
          </nav>
        </header>

        <SessionProvider>
          <main className={`flex-1 ${session?.user ? "pb-[4.5rem]" : ""}`}>{children}</main>
          {session?.user && <BottomNav />}
        </SessionProvider>

        {!session?.user && (
          <footer className="bg-white border-t border-warm-200 py-6 text-center text-sm text-zinc-400">
            Naboverktøy — del verktøy med naboene
          </footer>
        )}
      </body>
    </html>
  );
}
