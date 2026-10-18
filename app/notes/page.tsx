import type { Metadata } from "next";
import { NotesIndex } from "@/components/personal/NoteViews";
import { notes, readNote } from "@/components/personal/notes";

const description = "Notes from Kumma's reading: on emotion, on faith and awareness, on Camus.";

export const metadata: Metadata = {
  title: "Notes",
  description,
  alternates: { canonical: "https://kumma.me/notes" },
  openGraph: { title: "Notes | Kumma", description, url: "https://kumma.me/notes", images: ["/og/portrait.png"] },
  twitter: { card: "summary_large_image", site: "@Comma_9fie", images: ["/og/portrait.png"] },
};

export default async function NotesPage() {
  return <NotesIndex notes={await Promise.all(notes.map((note) => readNote(note.slug)))} />;
}
