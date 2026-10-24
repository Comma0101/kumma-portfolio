import { notes, readNote, type Lang } from "@/components/personal/notes";

export const dynamic = "force-static";

function escapeXml(s: string) {
  return s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string,
  );
}

// The notes, in both their languages: what the site publishes over time.
export async function GET() {
  const base = "https://kumma.me";
  const editions: { slug: string; lang: Lang }[] = notes.flatMap((note) => [
    { slug: note.slug, lang: "en" as const },
    ...(note.zh ? [{ slug: note.slug, lang: "zh" as const }] : []),
  ]);
  const items = (
    await Promise.all(
      editions.map(async ({ slug, lang }) => {
        const note = await readNote(slug, lang);
        const link = `${base}/notes/${slug}/${lang === "zh" ? "zh/" : ""}`;
        return (
          `<item><title>${escapeXml(note.title)}</title>` +
          `<link>${link}</link><guid>${link}</guid>` +
          `<pubDate>${new Date(note.date).toUTCString()}</pubDate>` +
          `<description>${escapeXml(note.excerpt)}</description></item>`
        );
      }),
    )
  ).join("");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
    `<title>Kumma — Notes</title><link>${base}/notes/</link>` +
    `<description>Notes by Kumma Wu: what the reading leaves.</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
