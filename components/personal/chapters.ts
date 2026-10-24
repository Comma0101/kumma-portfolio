// The page is a life compressed to eight characters, each a chapter the
// one line passes through. The margin nav writes them; the colophon
// prints them as the page's table of contents.
export const chapters = [
  { mark: "名", label: "Name", target: '[data-thread="opening"]', id: "name" },
  { mark: "主", label: "Agency", target: '[data-thread="agency"]', id: "agency" },
  { mark: "知", label: "Understanding", target: '[data-thread="catch"]', id: "catch-up" },
  { mark: "步", label: "Steps", target: '[data-thread="steps"]', id: "steps" },
  { mark: "習", label: "Practice", target: '[data-thread="practice"]', id: "practice" },
  { mark: "律", label: "Rules", target: '[data-thread="rules"]', id: "rules" },
  { mark: "理", label: "Reason", target: '[data-thread="reason"]', id: "reason" },
  { mark: "道", label: "The way", target: "#dao", id: "dao" },
] as const;
