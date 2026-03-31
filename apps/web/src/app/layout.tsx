import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum Ops Lab",
  description:
    "A modern workspace to design, run, compare and understand quantum experiments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center gap-8">
          <Link href="/" className="font-semibold tracking-tight text-lg">
            Quantum Ops Lab
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link className="hover:text-foreground transition-colors" href="/experiments">
              Experiments
            </Link>
            <Link className="hover:text-foreground transition-colors" href="/learn">
              Aprende
            </Link>
          </nav>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
