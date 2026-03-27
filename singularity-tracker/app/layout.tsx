import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Singularity Tracker — Live Falsification Engine",
  description: "Real-time dashboard testing whether the AI singularity thesis holds against live data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-[#2a2a3e] bg-[#12121a]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4c6ef5] to-[#7950f2] flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <div>
                  <span className="text-lg font-semibold text-white">Singularity Tracker</span>
                  <span className="ml-2 text-xs text-[#8888a0]">Falsification Engine</span>
                </div>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm text-[#8888a0] hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/add-data" className="text-sm text-[#8888a0] hover:text-white transition-colors">
                  Add Data
                </Link>
                <div className="badge-blue text-xs">
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
