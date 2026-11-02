import type { Metadata } from "next";
import { NotesIndex } from "@/components/personal/NoteViews";
import { notes, readNote } from "@/components/personal/notes";

const description = "Essays by Kumma Wu on emotion, faith and awareness, and Camus.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "https://kumma.me/notes" },
  openGraph: { title: "Writing | Kumma", description, url: "https://kumma.me/notes", images: ["/og/portrait.png"] },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", title: "Writing | Kumma", description, images: ["/og/portrait.png"] },
};

export default async function NotesPage() {
  return <NotesIndex notes={await Promise.all(notes.map((note) => readNote(note.slug)))} />;
}
