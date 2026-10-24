// The page is a life compressed to eight characters, each a chapter the
// one line passes through. The margin nav writes them; each chapter's
// running head writes its own; the colophon prints them as contents.
//
// Each character is itself a compressed picture. `parts` and `reading`
// follow the Shuowen Jiezi (c. 100 CE), with Duan Yucai's commentary for
// the arrow in 知; the source lines are in docs/chapters-shuowen.md (kept
// out of this file so the font subset carries only what the page shows).
export const chapters = [
  {
    mark: "名",
    label: "Name",
    target: '[data-thread="opening"]',
    id: "name",
    parts: "夕 口",
    reading: "Dusk and a mouth: in the dark, where no one can see you, you call out your own name.",
  },
  {
    mark: "主",
    label: "Agency",
    target: '[data-thread="agency"]',
    id: "agency",
    parts: "丶",
    reading: "A lamp, and the flame that stands in it.",
  },
  {
    mark: "知",
    label: "Understanding",
    target: '[data-thread="catch"]',
    id: "catch-up",
    parts: "矢 口",
    reading: "An arrow and a mouth: knowing comes quick as an arrow. The body is slower.",
  },
  {
    mark: "步",
    label: "Steps",
    target: '[data-thread="steps"]',
    id: "steps",
    parts: "止 止",
    reading: "Two feet, one ahead of the other.",
  },
  {
    mark: "習",
    label: "Practice",
    target: '[data-thread="practice"]',
    id: "practice",
    parts: "羽",
    reading: "Wings: a young bird flying, again and again.",
  },
  {
    mark: "律",
    label: "Measure",
    target: '[data-thread="rules"]',
    id: "rules",
    parts: "彳 聿",
    reading: "The road, and a hand holding a brush: to keep things even.",
  },
  {
    mark: "理",
    label: "Reason",
    target: '[data-thread="reason"]',
    id: "reason",
    parts: "玉 里",
    reading: "Jade, worked along its grain.",
  },
  {
    mark: "道",
    label: "The way",
    target: "#dao",
    id: "dao",
    parts: "首 辶",
    reading: "A head, walking: the road you walk.",
  },
] as const;

export const chapterOf = (mark: string) => chapters.find((chapter) => chapter.mark === mark);
