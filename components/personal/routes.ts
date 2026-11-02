// The pages drawn on paper (the homepage's voice). The old site's chrome —
// its navigation, footer, agent banner, intro and dark page wipe — stays
// off them. One list, read by every piece of that chrome.
const sections = ["/work", "/notes", "/studies"];
const pages = ["/", "/call", "/benchmark", "/contact", "/view"];

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
  "/projects": { to: "/work/", label: "Build" },
  "/projects/kota": { to: "/work/kota/", label: "KOTA" },
  "/projects/archon": { to: "/work/archon/", label: "ARCHON" },
  "/projects/market-systems": { to: "/work/", label: "Work" },
  "/blog/en/On-Emotions": { to: "/notes/on-emotions/", label: "On Emotions" },
  "/blog/zh/On-Emotions": { to: "/notes/on-emotions/zh/", label: "关于情绪" },
  "/blog/en/Same-Light": { to: "/notes/same-light/", label: "We’re All Walking Toward the Same Light" },
  "/blog/zh/Same-Light": { to: "/notes/same-light/zh/", label: "我们都在走向同一束光" },
  "/blog/en/camus-the-stranger-analysis": { to: "/notes/the-stranger/", label: "The outsider’s truth" },
  "/blog/en/generative-art-with-code": { to: "/studies/", label: "Studies" },
  "/blog/zh/generative-art-with-code": { to: "/studies/", label: "Studies" },
  "/about": { to: "/", label: "Kumma" },
  "/gallery": { to: "/studies/", label: "Studies" },
  "/gallery/0": { to: "/studies/", label: "Studies" },
  "/gallery/1": { to: "/studies/", label: "Studies" },
  "/artfulcode": { to: "/studies/", label: "Studies" },
  "/stories": { to: "/studies/", label: "Studies" },
  "/latency": { to: "/benchmark/", label: "the stress suite" },
  // The voice-AI business pages: this is a personal site, not a shop
  // window. Each points at the write-up or the suite it came from.
  "/blog": { to: "/notes/", label: "Notes" },
  "/blog/en/ai-receptionists-for-small-business-explained": { to: "/work/kota/", label: "KOTA" },
  "/blog/en/does-an-ai-receptionist-actually-work": { to: "/work/kota/", label: "KOTA" },
  "/blog/en/off-the-shelf-ai-phone-tool-vs-answering-service-vs-custom-agent": { to: "/work/kota/", label: "KOTA" },
  "/blog/en/kota-real-time-voice-pipeline": { to: "/work/kota/", label: "KOTA" },
  "/blog/en/telephony-gotchas-sip-audio": { to: "/work/kota/", label: "KOTA" },
  "/blog/en/archon-agent-orchestration": { to: "/work/archon/", label: "ARCHON" },
  "/blog/en/choosing-a-speech-to-text-and-tts-stack-2026": { to: "/benchmark/", label: "the stress suite" },
  "/blog/en/latency-budget-twilio-deepgram-voice-agent": { to: "/benchmark/", label: "the stress suite" },
  "/blog/en/regression-testing-a-voice-agent": { to: "/benchmark/", label: "the stress suite" },
  "/blog/en/testing-ai-systems-like-software": { to: "/benchmark/", label: "the stress suite" },
  "/build": { to: "/work/", label: "Build" },
  "/agent": { to: "/", label: "Kumma" },
  "/patterns": { to: "/work/kota/", label: "KOTA" },
  "/patterns/barge-in": { to: "/work/kota/", label: "KOTA" },
  "/patterns/clarify-before-commit": { to: "/work/kota/", label: "KOTA" },
  "/patterns/endpointing": { to: "/work/kota/", label: "KOTA" },
  "/patterns/eval-harness": { to: "/work/kota/", label: "KOTA" },
  "/patterns/human-handoff": { to: "/work/kota/", label: "KOTA" },
  "/patterns/latency-budgets": { to: "/work/kota/", label: "KOTA" },
  "/patterns/menu-grounding": { to: "/work/kota/", label: "KOTA" },
  "/patterns/streaming-stt": { to: "/work/kota/", label: "KOTA" },
  "/patterns/telephony-failure-modes": { to: "/work/kota/", label: "KOTA" },
  "/patterns/vad-tuning": { to: "/work/kota/", label: "KOTA" },
};

export const movedFrom = (pathname: string | null | undefined) =>
  moved[(pathname || "/").replace(/\/+$/, "") || "/"];
