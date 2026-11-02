import type { Metadata } from "next";
import { NoteView } from "@/components/personal/NoteViews";
import { notes, readNote } from "@/components/personal/notes";

export const dynamicParams = false;
export const generateStaticParams = () => notes.map(({ slug }) => ({ slug }));

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await readNote(params.slug);
  const url = `https://kumma.me/notes/${note.slug}`;
  return {
    title: note.title,
    description: note.excerpt,
    alternates: {
      canonical: url,
      languages: note.zh ? { en: url, "zh-Hans": `${url}/zh` } : undefined,
    },
    openGraph: { title: `${note.title} | Kumma`, description: note.excerpt, url, type: "article", images: ["/og/portrait.png"] },
    twitter: { card: "summary_large_image", site: "@Comma_9fie", title: `${note.title} | Kumma`, description: note.excerpt, images: ["/og/portrait.png"] },
  };
}

export default async function NotePage({ params }: Props) {
  const at = notes.findIndex((note) => note.slug === params.slug);
  const next = notes[(at + 1) % notes.length];
  return <NoteView note={await readNote(params.slug)} lang="en" next={await readNote(next.slug)} />;
}
