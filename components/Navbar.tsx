import Link from "next/link";
import { Button } from "./ui/button";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/demo", label: "Demo" },
  { href: "/gallery", label: "Gallery" },
  { href: "/constellation", label: "Constellation" },
  { href: "/#features", label: "Features" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-cinema-text/10 bg-cinema-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Echoes
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cinema-accent transition-transform group-hover:scale-125" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-cinema-muted transition-colors hover:text-cinema-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/create">
          <Button size="sm">Create</Button>
        </Link>
      </div>
    </header>
  );
}
