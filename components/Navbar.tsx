import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-cinema-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-cinema-accent-light" />
          Echoes
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-cinema-muted md:flex">
          <Link href="/#how-it-works" className="hover:text-cinema-text transition-colors">
            How it works
          </Link>
          <Link href="/demo" className="hover:text-cinema-text transition-colors">
            Demo
          </Link>
          <Link href="/gallery" className="hover:text-cinema-text transition-colors">
            Gallery
          </Link>
          <Link href="/constellation" className="hover:text-cinema-text transition-colors">
            Constellation
          </Link>
          <Link href="/#features" className="hover:text-cinema-text transition-colors">
            Features
          </Link>
        </nav>
        <Link href="/create">
          <Button size="sm">Create Your Story</Button>
        </Link>
      </div>
    </header>
  );
}
