import type { Metadata } from "next";
import Link from "next/link";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioteca Comunitária",
  description: "Acervo, empréstimos e relatórios da Biblioteca Comunitária.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b">
          <div className="mx-auto flex max-w-5xl gap-6 p-4 text-sm">
            <Link href="/">Acervo</Link>
            <Link href="/relatorios">Relatórios</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
