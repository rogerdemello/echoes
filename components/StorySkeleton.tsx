export function StorySkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-6 pb-24 pt-28">
      <div className="mb-8 h-4 w-32 rounded bg-white/10" />
      <div className="rounded-3xl glass p-12">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/10" />
        </div>
        <div className="mt-6 h-10 w-3/4 rounded bg-white/10" />
        <div className="mt-8 h-16 rounded bg-white/5" />
        <div className="mt-8 space-y-2">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
          <div className="h-4 w-4/6 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
