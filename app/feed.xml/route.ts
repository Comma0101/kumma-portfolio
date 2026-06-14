import { getSortedPostsData } from "@/lib/posts";

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

export function GET() {
  const base = "https://kumma.me";
  const items = (["en", "zh"] as const)
    .flatMap((locale) =>
      getSortedPostsData(locale).map(
        (p) =>
          `<item><title>${escapeXml(p.title)}</title>` +
          `<link>${base}/blog/${locale}/${p.slug}</link>` +
          `<guid>${base}/blog/${locale}/${p.slug}</guid>` +
          `<pubDate>${new Date(p.publishedDate).toUTCString()}</pubDate>` +
          `<description>${escapeXml(p.excerpt)}</description></item>`,
      ),
    )
    .join("");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
    `<title>Kumma</title><link>${base}</link>` +
    `<description>Essays by Kumma</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
