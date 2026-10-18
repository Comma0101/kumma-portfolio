import type { Metadata } from "next";
import { NoteView } from "@/components/personal/NoteViews";
import { notes, readNote } from "@/components/personal/notes";

export const dynamicParams = false;
export const generateStaticParams = () => notes.filter((note) => note.zh).map(({ slug }) => ({ slug }));

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await readNote(params.slug, "zh");
  const url = `https://kumma.me/notes/${note.slug}`;
  return {
    title: note.title,
    description: note.excerpt,
    alternates: { canonical: `${url}/zh`, languages: { en: url, "zh-Hans": `${url}/zh` } },
    openGraph: { title: `${note.title} | Kumma`, description: note.excerpt, url: `${url}/zh`, type: "article", locale: "zh_CN", images: ["/og/portrait.png"] },
    twitter: { card: "summary_large_image", site: "@Comma_9fie", images: ["/og/portrait.png"] },
  };
}

export default async function NoteZhPage({ params }: Props) {
  return <NoteView note={await readNote(params.slug, "zh")} lang="zh" />;
}
