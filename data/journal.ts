// Trades as posted on X (@Comma_9fie). Newest first. Dollar amounts are
// whole-position totals, exactly as shown in the receipt.

export type JournalEntry = {
  date: string;
  title: string;
  contract: string;
  cost: number;
  exits: number[];
  plan: string;
  // What happened, then what I did about it.
  fact: string;
  admission: string;
  lesson: string;
  after?: string;
  url?: string;
};

export const journal: JournalEntry[] = [
  {
    date: "2026-10-09",
    title: "Lotto Friday.",
    contract: "2 × TSLA 385C, 10/9",
    cost: 75,
    exits: [170, 197],
    plan: "One pays for the trade. The other stays on unless the low breaks.",
    fact: "The low did not break.",
    admission: "I sold it anyway.",
    lesson: "Did not want to give the profit back.",
    after: "It later traded 388.",
  },
];

export function net({ cost, exits }: Pick<JournalEntry, "cost" | "exits">) {
  return exits.reduce((sum, exit) => sum + exit, 0) - cost;
}
