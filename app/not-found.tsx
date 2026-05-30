import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <p className="font-display text-6xl font-bold text-cinema-accent-light/40">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold">
        This Echo faded away
      </h1>
      <p className="mt-2 max-w-md text-cinema-muted">
        The story you are looking for does not exist or was removed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
        <Link href="/create">
          <Button>Create a memory</Button>
        </Link>
        <Link href="/demo">
          <Button variant="ghost">Try demo</Button>
        </Link>
      </div>
    </div>
  );
}
