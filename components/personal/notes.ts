import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// What "Study." leaves behind: essays written slowly, for himself first.
// Only these three — the reading, not the work (that is /work). Two also
// exist in Chinese, written alongside, not translated after.
export const notes = [
  { slug: "on-emotions", file: "On-Emotions", zh: true },
  { slug: "same-light", file: "Same-Light", zh: true },
  {
    slug: "the-stranger",
    file: "camus-the-stranger-analysis",
    zh: false,
    // The post's own title and summary were written for search, not
    // for a reader.
    title: "The outsider’s truth",
    excerpt: "On Camus’s The Stranger: a man who will not tell the story society needs, and the freedom he finds in refusing.",
  },
] as const satisfies readonly { slug: string; file: string; zh: boolean; title?: string; excerpt?: string }[];

export type Lang = "en" | "zh";

// The Chinese the notes' chrome sets (kept here so the subset script sees
// it with the essays; see typeSC.ts).
export const label = { notes: "笔记", zh: "中文", edition: "中文版" };
export type Note = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  zh: boolean;
  html: string;
};

const posts = path.join(process.cwd(), "_posts");

export async function readNote(slug: string, lang: Lang = "en"): Promise<Note> {
  const entry = notes.find((note) => note.slug === slug);
  if (!entry || (lang === "zh" && !entry.zh)) throw new Error(`No note ${slug} (${lang})`);
  const file = path.join(posts, lang === "zh" ? "zh" : "", `${entry.file}.md`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const body = await remark().use(html).process(content);
  return {
    slug,
    title: "title" in entry ? entry.title : String(data.title),
    excerpt: "excerpt" in entry ? entry.excerpt : String(data.excerpt ?? ""),
    date: String(data.date),
    zh: entry.zh,
    html: String(body),
  };
}

export const noteDate = (date: string, lang: Lang = "en") => {
  const [y, m, d] = date.split("-").map(Number);
  if (lang === "zh") return `${y}年${m}月${d}日`;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};
