/** Split narration into storybook pages (paragraphs, or sentence groups). */
export function splitStoryPages(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) return [trimmed];

  const pages: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    pages.push(sentences.slice(i, i + 3).join(" "));
  }
  return pages;
}

/** Map global sentence index to page index. */
export function sentenceIndexToPage(
  pages: string[],
  sentenceIndex: number
): number {
  let count = 0;
  for (let p = 0; p < pages.length; p++) {
    const n = pages[p].split(/(?<=[.!?])\s+/).filter(Boolean).length;
    count += n;
    if (sentenceIndex < count) return p;
  }
  return Math.max(0, pages.length - 1);
}

/** First sentence index for a page. */
export function pageToSentenceStart(pages: string[], pageIndex: number): number {
  let start = 0;
  for (let p = 0; p < pageIndex && p < pages.length; p++) {
    start += pages[p].split(/(?<=[.!?])\s+/).filter(Boolean).length;
  }
  return start;
}
