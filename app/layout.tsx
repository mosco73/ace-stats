import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ace Stats",
  description: "Estadísticas avanzadas de tenis",
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
      <body className="min-h-full flex flex-col">
          {children}
          <footer className="border-t border-zinc-800 px-6 py-4 text-center text-xs text-zinc-600">
           Datos: <a href="https://stats.tennismylife.org" className="hover:text-zinc-400 underline" target="_blank">TennisMyLife</a> · base histórica inspirada en el trabajo de <a href="https://www.tennis-abstract.com" className="hover:text-zinc-400 underline" target="_blank">Jeff Sackmann / Tennis Abstract</a> · uso no comercial
          </footer>
        </body>
    </html>
  );
}
