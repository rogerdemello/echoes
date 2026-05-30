import { Suspense } from "react";
import { CreateStoryForm } from "@/components/CreateStoryForm";
import { ServiceHealth } from "@/components/ServiceHealth";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-24 pt-28">
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        Create your Echo
      </h1>
      <p className="mt-2 text-cinema-muted">
        Share a memory. We&apos;ll transform it into a cinematic narrated story.
      </p>
      <div className="mt-4">
        <ServiceHealth />
      </div>
      <div className="mt-10">
        <Suspense fallback={<div className="text-cinema-muted">Loading...</div>}>
          <CreateStoryForm />
        </Suspense>
      </div>
    </div>
  );
}
