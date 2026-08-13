import type { Metadata } from "next";
import { Inter, Playfair_Display, Antonio } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Homero Clock Relojóias — Gestão de Ordens de Serviço",
  description:
    "Sistema de gestão de ordens de serviço para a Homero Clock Relojóias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} ${antonio.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col print:p-0 print:max-w-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
