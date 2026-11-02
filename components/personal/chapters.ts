// Eight personal reflections, organized around characters the page returns
// to in reading and in life. These are original English reflections informed
// by classical texts, not etymologies or translations of those texts.
// The running heads, margin navigation, ending and contents share this data.
export const chapters = [
  {
    mark: "名",
    label: "Name",
    target: '[data-thread="opening"]',
    id: "name",
    reflection: "A name is a guest in the life it describes.",
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
    reflection: "I return to familiar ground with a different way of standing.",
  },
  {
    mark: "習",
    label: "Practice",
    target: '[data-thread="practice"]',
    id: "practice",
    reflection: "I return to the work, and to what I have stopped noticing.",
  },
  {
    mark: "律",
    label: "Measure",
    target: '[data-thread="rules"]',
    id: "rules",
    reflection: "To know what is enough, and when to stop.",
  },
  {
    mark: "理",
    label: "Reason",
    target: '[data-thread="reason"]',
    id: "reason",
    reflection: "What am I experiencing, and what have I already decided it means?",
  },
  {
    mark: "道",
    label: "The way",
    target: "#dao",
    id: "dao",
    reflection: "I have to live before I have finished understanding.",
  },
] as const;

export const chapterOf = (mark: string) => chapters.find((chapter) => chapter.mark === mark);
