import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BorrowMyDrill – Neighborhood Tool Sharing",
  description: "Share and borrow power tools with your neighbors.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

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
              {session?.user ? (
                <>
                  <span className="text-zinc-400">Hi, {session.user.name?.split(" ")[0]}</span>
                  <Link href="/tools/new" className="bg-orange-600 text-white px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors">
                    List a Tool
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="hover:text-zinc-900 transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="bg-orange-600 text-white px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <SessionProvider>
          <main className="flex-1">{children}</main>
        </SessionProvider>
        <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-400">
          BorrowMyDrill — keeping tools in the neighborhood
        </footer>
      </body>
    </html>
  );
}
