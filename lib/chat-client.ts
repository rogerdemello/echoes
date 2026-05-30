import { geminiGenerate, getGeminiConfig } from "./gemini";

/**
 * Minimal OpenAI-compatible chat client backed by Gemini. Keeps the existing
 * `chat.client.chat.completions.create(...)` call sites (openai.ts, emotion.ts,
 * memory-dna.ts, translate.ts) working unchanged while running on Gemini.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCreateOptions {
  model?: string;
  messages: ChatMessage[];
  response_format?: { type: string };
  temperature?: number;
}

export interface ChatCompletion {
  choices: { message: { content: string | null } }[];
}

export interface ChatClient {
  client: {
    chat: {
      completions: {
        create: (opts: ChatCreateOptions) => Promise<ChatCompletion>;
      };
    };
  };
  model: string;
}

export function getChatClient(): ChatClient | null {
  const cfg = getGeminiConfig();
  if (!cfg) return null;

  return {
    model: cfg.model,
    client: {
      chat: {
        completions: {
          create: async (opts: ChatCreateOptions): Promise<ChatCompletion> => {
            const system = opts.messages
              .filter((m) => m.role === "system")
              .map((m) => m.content)
              .join("\n\n");
            const userText = opts.messages
              .filter((m) => m.role !== "system")
              .map((m) => m.content)
              .join("\n\n");

            const text = await geminiGenerate({
              parts: [{ text: userText }],
              system: system || undefined,
              json: opts.response_format?.type === "json_object",
              temperature: opts.temperature,
              model: opts.model,
            });

            return { choices: [{ message: { content: text } }] };
          },
        },
      },
    },
  };
}
