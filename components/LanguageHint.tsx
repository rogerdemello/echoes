import { LANGUAGES } from "@/lib/constants";
import type { LanguageCode } from "@/lib/types";
import { Globe } from "lucide-react";

export function LanguageHint({ language }: { language: LanguageCode }) {
  if (language === "en") return null;

  const label = LANGUAGES.find((l) => l.id === language)?.label;

  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-cinema-accent/25 bg-cinema-accent/10 p-4 text-sm">
      <Globe className="h-5 w-5 shrink-0 text-cinema-accent-light" />
      <div>
        <p className="font-medium text-cinema-accent-light">
          {label} narration
        </p>
        <p className="mt-1 text-cinema-muted">
          Your story will be written and narrated in {label}. Requires Azure
          Azure OpenAI for translation and native Murf voices.
        </p>
      </div>
    </div>
  );
}
