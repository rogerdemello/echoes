import type { Metadata } from "next";
import { getStoryById } from "@/lib/stories";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStoryById(params.id);
  const title = story?.title ?? "A memory on Echoes";
  const description =
    story?.enhancedStory?.slice(0, 160) ??
    "Listen to a cinematic memory story created with Murf AI voices.";

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    title: `${title} | Echoes`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Echoes",
      url: `${baseUrl}/share/${params.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ShareLayout({ children }: Props) {
  return children;
}
