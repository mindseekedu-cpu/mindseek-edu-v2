import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindSeek.edu – Belajar Matematika Seru!",
  description:
    "Platform belajar matematika interaktif untuk anak-anak dengan petunjuk bertahap dan pendampingan AI.",
  keywords: ["matematika", "belajar", "anak", "pendidikan", "interaktif"],
  authors: [{ name: "MindSeek.edu" }],
  openGraph: {
    title: "MindSeek.edu – Belajar Matematika Seru!",
    description:
      "Platform belajar matematika interaktif untuk anak-anak dengan petunjuk bertahap.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen`}>
        <header className="w-full bg-white shadow-sm border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <div>
              <span className="font-bold text-blue-700 text-lg tracking-tight">
                MindSeek
              </span>
              <span className="text-purple-500 font-bold text-lg">.edu</span>
            </div>
            <span className="ml-auto text-xs text-gray-400 font-medium">
              Sprint 1 – Beta
            </span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        <footer className="w-full text-center py-4 text-xs text-gray-400 border-t border-gray-100 mt-8">
          © {new Date().getFullYear()} MindSeek.edu – Belajar itu menyenangkan!
        </footer>
      </body>
    </html>
  );
}