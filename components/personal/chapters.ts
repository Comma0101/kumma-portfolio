// Questions, observations, and commitments in Kumma's own account.
// The character marks organize the page's existing visual vocabulary.
// The running heads, margin navigation, ending and contents share this data.
export const chapters = [
  {
    mark: "名",
    label: "Name",
    target: '[data-thread="opening"]',
    id: "name",
    reflection: "What do I mean when I say “I”?",
  },
  {
    mark: "主",
    label: "Agency",
    target: '[data-thread="agency"]',
    id: "agency",
    reflection: "I listen to the world and answer for my own choices.",
  },
  {
    mark: "知",
    label: "Understanding",
    target: '[data-thread="catch"]',
    id: "catch-up",
    reflection: "Some things I understand long before I can live them.",
  },
  {
    mark: "步",
    label: "Steps",
    target: '[data-thread="steps"]',
    id: "steps",
    reflection: "What changes when I return?",
  },
  {
    mark: "習",
    label: "Practice",
    target: '[data-thread="practice"]',
    id: "practice",
    reflection: "Reading, making, trying again.",
  },
  {
    mark: "律",
    label: "Measure",
    target: '[data-thread="rules"]',
    id: "rules",
    reflection: "What is enough, and when should I stop?",
  },
  {
    mark: "理",
    label: "Reason",
    target: '[data-thread="reason"]',
    id: "reason",
    reflection: "I can observe the person I call myself.",
  },
  {
    mark: "道",
    label: "The way",
    target: "#dao",
    id: "dao",
    reflection: "To find my true self, and let that change how I live.",
  },
] as const;

export const chapterOf = (mark: string) => chapters.find((chapter) => chapter.mark === mark);
