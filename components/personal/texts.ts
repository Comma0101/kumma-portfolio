// Study: five passages, each in its own script and direction, kept apart —
// they may meet; they are not the same. The notes are his own words.
export type Text = {
  id: string;
  tradition: string;
  source: string;
  original: string;
  lang: string;
  // Chinese is set as it was written: in columns, right to left.
  vertical?: boolean;
  translation?: string;
  note: string;
};

export const texts: Text[] = [
  {
    id: "diamond",
    tradition: "The Diamond Sutra",
    source: "§10 · tr. Kumārajīva",
    original: "應無所住而生其心",
    lang: "zh-Hant",
    vertical: true,
    translation: "Let the mind arise, dwelling on nothing.",
    note: "One should act without being attached to fixed identities, expectations, or outcomes. For me, this is about learning to act without constantly needing external confirmation. Nonattachment shouldn’t mean passivity; it means taking action without letting the outcome define the person taking it.",
  },
  {
    id: "daodejing",
    tradition: "The Daodejing",
    source: "Chapter 48",
    original: "為道日損，損之又損，以至於無為。",
    lang: "zh-Hant",
    vertical: true,
    translation: "Following the way, each day something is let go — let go, and let go again, until nothing is forced.",
    note: "The pursuit of understanding isn’t always about accumulating more knowledge, methods, or rules. Sometimes it means removing unnecessary interference. I’ve become increasingly interested in the difference between acting with intention and forcing things to happen.",
  },
  {
    id: "zhuangzi",
    tradition: "Zhuangzi",
    source: "Cook Ding carves an ox · 庖丁解牛",
    original: "依乎天理……因其固然。",
    lang: "zh-Hant",
    vertical: true,
    translation: "I go along the natural grain … following what is already so.",
    note: "Cook Ding works with the natural structure of the ox rather than forcing his blade through it. I relate this to learning to recognize the structure of things instead of imposing my will on everything. This applies to art, trading, practice, and life: understanding a structure intellectually is different from developing the sensitivity to act within it.",
  },
  {
    id: "mark",
    tradition: "The Gospels",
    source: "Mark 8:36 · King James Version",
    original: "For what shall it profit a man, if he shall gain the whole world, and lose his own soul?",
    lang: "en",
    note: "I don’t interpret this as a rejection of money or worldly achievement. It asks whether external success is worth pursuing if the process costs you your sense of self. I’m interested in building a life in the real world without allowing the world’s measures of success to become my only measures of value.",
  },
  {
    id: "apology",
    tradition: "The Greeks",
    source: "Plato, Apology 38a · tr. Jowett",
    original: "ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ",
    lang: "grc",
    translation: "The unexamined life is not worth living.",
    note: "Reflection should serve life, not replace it. I want to understand why I believe what I believe, distinguish my own judgment from inherited assumptions, and then put that understanding into practice. The point of examining life is ultimately to live it more deliberately.",
  },
];
