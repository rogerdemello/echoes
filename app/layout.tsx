import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";

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
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
