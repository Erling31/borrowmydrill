import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import SessionProvider from "@/components/SessionProvider";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BorrowMyDrill – Del verktøy med naboene",
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
    <html lang="nb" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between"
               style={{ paddingLeft: "max(1rem, env(safe-area-inset-left))", paddingRight: "max(1rem, env(safe-area-inset-right))" }}>
            <Link href="/" className="font-bold text-lg tracking-tight text-orange-600">
              BorrowMyDrill
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-600">
              <Link href="/tools" className="hover:text-zinc-900 transition-colors">Se verktøy</Link>
              {session?.user ? (
                <>
                  <span className="text-zinc-400">Hei, {session.user.name?.split(" ")[0]}</span>
                  <Link href="/tools/new" className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors">
                    Legg ut verktøy
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="hover:text-zinc-900 transition-colors">Logg inn</Link>
                  <Link href="/auth/signup" className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors">
                    Registrer deg
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="relative sm:hidden">
              <MobileNav user={session?.user} />
            </div>
          </nav>
        </header>

        <SessionProvider>
          <main className="flex-1">{children}</main>
        </SessionProvider>

        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-400"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          BorrowMyDrill — holder verktøy i nabolaget
        </footer>
      </body>
    </html>
  );
}
