import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";
import { FilmGrain } from "@/components/FilmGrain";

// Editorial display serif — elegant, timeless, magazine headlines.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

// Clean humanist body.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Archival catalog labels (Exhibit #001, plate numbers).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Echoes — Preserve emotions, not just memories",
  description:
    "A digital memory-preservation platform powered by emotionally intelligent voice AI. Transform moments into cinematic narrated stories with Murf.",
  keywords: [
    "Echoes",
    "Murf AI",
    "memory preservation",
    "cinematic storytelling",
    "emotional AI",
    "voice narration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">
        <Providers>
          <FilmGrain />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
