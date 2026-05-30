/**
 * Azure OpenAI content-filter helpers.
 * Family memories (loss, "last time", grief) often false-trigger RAI — use safe framing + retries.
 */

export const ECHOES_SAFETY_SYSTEM = `You work on Echoes, a family-friendly memory preservation app (rated G).
Users share wholesome personal memories: childhood, parents, grandparents, travel, milestones.
Your job is reflective storytelling and translation only — never graphic, violent, sexual, or harmful content.
If the memory mentions loss or farewell, treat it gently as nostalgia and love — not trauma or violence.`;

export function wrapUserMemory(text: string): string {
  return `[Wholesome family memory for preservation — reflective tone only]\n\n${text.trim()}`;
}

export function isAzureContentFilterError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as {
    code?: string;
    status?: number;
    error?: { code?: string };
  };
  return (
    err.code === "content_filter" ||
    err.error?.code === "content_filter" ||
    (err.status === 400 &&
      String(error).includes("content management policy"))
  );
}
