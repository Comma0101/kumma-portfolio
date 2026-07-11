import type { WorkVisualKey } from "../../data/workProjects";

export interface VisualDefinition {
  readonly mechanism: string;
  readonly reducedMotionLabel: string;
}

export const visualRegistry = {
  kota: {
    mechanism:
      "Input call audio is transformed through menu grounding and intent checks before order output.",
    reducedMotionLabel:
      "Call audio, grounded intent, and the completed order remain connected.",
  },
  audiobook: {
    mechanism:
      "Input documents are transformed into normalized chunks, a TTS queue, and continuous audiobook output.",
    reducedMotionLabel:
      "Document, chunk queue, waveform, and assembled timeline remain visible.",
  },
  archon: {
    mechanism:
      "Input work is transformed by a coordinator across models, tools, workers, memory, and safety guardrails.",
    reducedMotionLabel:
      "The coordinator and every routed system boundary remain connected.",
  },
  "splash-ink": {
    mechanism:
      "Input ink marks are transformed through sampled depth and point initialization into lifted splat-layer output.",
    reducedMotionLabel:
      "The flat ink plane, depth samples, and lifted splat layers remain visible.",
  },
  "spectral-world": {
    mechanism:
      "Input local audio is transformed by FFT analysis into terrain, pillars, and particles within device guardrails.",
    reducedMotionLabel:
      "The local waveform, FFT bands, and adaptive terrain remain visible.",
  },
  ledger: {
    mechanism:
      "Input CSV fills are transformed by normalization and FIFO or contract pairing into inspectable ledger output.",
    reducedMotionLabel:
      "Raw rows, the pairing gate, matched entries, and remaining entries stay visible.",
  },
} satisfies Record<WorkVisualKey, VisualDefinition>;
