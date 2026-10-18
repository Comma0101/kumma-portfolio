// The pages drawn on paper (the homepage's voice). The old site's chrome —
// its navigation, footer, agent banner, intro and dark page wipe — stays
// off them. One list, read by every piece of that chrome.
const sections = ["/work", "/notes", "/studies"];
const pages = ["/", "/call", "/benchmark", "/contact"];

export function isPaperRoute(pathname: string | null | undefined) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  return (
    pages.includes(path) ||
    path in moved ||
    sections.some((root) => path === root || path.startsWith(`${root}/`))
  );
}

// Old addresses whose pages now live on paper: each still answers, and
// sends the reader on.
export const moved: Record<string, { to: string; label: string }> = {
  "/projects": { to: "/work/", label: "Systems I build" },
  "/projects/kota": { to: "/work/kota/", label: "KOTA" },
  "/projects/archon": { to: "/work/archon/", label: "ARCHON" },
  "/blog/en/On-Emotions": { to: "/notes/on-emotions/", label: "On Emotions" },
  "/blog/zh/On-Emotions": { to: "/notes/on-emotions/zh/", label: "关于情绪" },
  "/blog/en/Same-Light": { to: "/notes/same-light/", label: "We’re All Walking Toward the Same Light" },
  "/blog/zh/Same-Light": { to: "/notes/same-light/zh/", label: "我们都在走向同一束光" },
  "/blog/en/camus-the-stranger-analysis": { to: "/notes/the-stranger/", label: "The outsider’s truth" },
};

export const movedFrom = (pathname: string | null | undefined) =>
  moved[(pathname || "/").replace(/\/+$/, "") || "/"];
