export type WorkTier = "featured" | "lab";

export type WorkStatus =
  | "live"
  | "open-source"
  | "active-r-and-d"
  | "case-study";

export type WorkVisualKey =
  | "kota"
  | "audiobook"
  | "archon"
  | "splash-ink"
  | "spectral-world"
  | "ledger";

export interface WorkProject {
  slug: string;
  no: string;
  title: string;
  href: `/work/${string}`;
  tier: WorkTier;
  status: WorkStatus;
  statusLabel: string;
  summary: string;
  tags: readonly string[];
  artifact: string;
  evidence: {
    input: string;
    transform: string;
    output: string;
    guardrail: string;
  };
  visualKey: WorkVisualKey;
  layout: "feature" | "flip" | "band";
  primaryAction?: { label: string; href: string };
  externalUrl?: string;
}

export const workVisualKeys = [
  "kota",
  "audiobook",
  "archon",
  "splash-ink",
  "spectral-world",
  "ledger",
] as const satisfies readonly WorkVisualKey[];

export const workProjects = [
  {
    slug: "kota",
    no: "01",
    title: "KOTA",
    href: "/work/kota",
    tier: "featured",
    status: "live",
    statusLabel: "Live system",
    summary:
      "Turns messy restaurant phone speech into a kitchen-ready order through streaming speech recognition, menu grounding, and a confidence and clarification loop.",
    tags: ["real-time voice", "LLM orchestration", "menu grounding"],
    artifact: "live voice/order flow",
    evidence: {
      input: "messy restaurant phone speech",
      transform: "streaming STT, menu grounding, confidence and clarification loop",
      output: "kitchen-ready order",
      guardrail: "clarify ambiguity before commit",
    },
    visualKey: "kota",
    layout: "feature",
    primaryAction: { label: "Hear the demo →", href: "/call" },
    externalUrl: "https://kota.kummalabs.com",
  },
  {
    slug: "audiobook",
    no: "02",
    title: "Audiobook AI",
    href: "/work/audiobook",
    tier: "featured",
    status: "live",
    statusLabel: "Live product",
    summary:
      "Turns PDF, EPUB, DOCX, web, and text inputs into continuous audiobook files through normalization, chunking, Kokoro TTS, and assembly.",
    tags: ["text-to-speech", "Kokoro", "production pipeline"],
    artifact: "live TTS product",
    evidence: {
      input: "PDF, EPUB, DOCX, web, or text",
      transform: "normalize, chunk, Kokoro TTS, assemble",
      output: "continuous audiobook files",
      guardrail: "queue limits and stale-job recovery",
    },
    visualKey: "audiobook",
    layout: "flip",
    externalUrl: "https://listen.kummalabs.com",
  },
  {
    slug: "archon",
    no: "03",
    title: "ARCHON",
    href: "/work/archon",
    tier: "featured",
    status: "open-source",
    statusLabel: "Open source · active R&D",
    summary:
      "Routes multi-step development work across models, tools, memory, workers, and approvals into an inspectable agent session.",
    tags: ["orchestration", "coding workers", "active R&D"],
    artifact: "open-source control plane",
    evidence: {
      input: "multi-step development task",
      transform: "model routing, tools, memory, workers, and approvals",
      output: "inspectable agent session",
      guardrail: "trace, policy, and recovery",
    },
    visualKey: "archon",
    layout: "band",
    externalUrl: "https://github.com/Comma0101/archon",
  },
  {
    slug: "splash-ink",
    no: "04",
    title: "Splash Ink",
    href: "/work/splash-ink",
    tier: "featured",
    status: "active-r-and-d",
    statusLabel: "Active R&D",
    summary:
      "Explores how one classical ink image can become a navigable spatial scene through preprocessing, depth and point initialization, and 3D Gaussian Splatting.",
    tags: ["Gaussian Splatting", "computer vision", "Three.js"],
    artifact: "AI-to-3D research prototype",
    evidence: {
      input: "single classical ink image",
      transform: "preprocessing, depth and point initialization, 3D Gaussian Splatting",
      output: "explorable spatial scene prototype",
      guardrail:
        "research prototype; results depend on model and source-image suitability",
    },
    visualKey: "splash-ink",
    layout: "feature",
  },
  {
    slug: "spectral-world",
    no: "L1",
    title: "Spectral World Player",
    href: "/work/spectral-world",
    tier: "lab",
    status: "active-r-and-d",
    statusLabel: "Active R&D",
    summary:
      "Transforms local audio into an audio-reactive 3D world through Web Audio FFT, beat, and onset analysis.",
    tags: ["Web Audio", "Three.js", "real-time graphics"],
    artifact: "interactive audio-visual lab",
    evidence: {
      input: "local audio",
      transform: "Web Audio FFT, beat, and onset analysis",
      output: "audio-reactive 3D world",
      guardrail:
        "local-file privacy with adaptive quality for browser and device performance limits",
    },
    visualKey: "spectral-world",
    layout: "band",
  },
  {
    slug: "robinhood-dashboard",
    no: "L2",
    title: "Robinhood Data Correctness",
    href: "/work/robinhood-dashboard",
    tier: "lab",
    status: "case-study",
    statusLabel: "Case study",
    summary:
      "Normalizes a messy brokerage CSV and pairs transactions with FIFO and contract-level logic to produce a correct, inspectable per-trade ledger.",
    tags: ["data correctness", "transaction matching", "D3"],
    artifact: "data-correctness case study",
    evidence: {
      input: "messy brokerage CSV",
      transform: "normalization and FIFO/contract-level transaction pairing",
      output: "correct, inspectable per-trade ledger",
      guardrail:
        "closed-quantity correctness with no trading-performance claims",
    },
    visualKey: "ledger",
    layout: "band",
  },
] as const satisfies readonly WorkProject[];

export const featuredWork: readonly WorkProject[] = workProjects.filter(
  (project) => project.tier === "featured",
);

export const labWork: readonly WorkProject[] = workProjects.filter(
  (project) => project.tier === "lab",
);

export function getWorkProject(slug: string): WorkProject | undefined {
  return workProjects.find((project) => project.slug === slug);
}

const workTiers: readonly WorkTier[] = ["featured", "lab"];
const workStatuses: readonly WorkStatus[] = [
  "live",
  "open-source",
  "active-r-and-d",
  "case-study",
];
const evidenceFields = [
  "input",
  "transform",
  "output",
  "guardrail",
] as const;
const publicTextFields = ["statusLabel", "artifact", "summary"] as const;

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function validateIdentity(
  project: WorkProject,
  seenSlugs: Set<string>,
  errors: string[],
): void {
  if (seenSlugs.has(project.slug)) {
    errors.push(`Duplicate work project slug "${project.slug}".`);
  }
  seenSlugs.add(project.slug);

  const expectedHref = `/work/${project.slug}`;
  if (project.href !== expectedHref) {
    errors.push(
      `Project "${project.slug}" href must be "${expectedHref}"; received "${project.href}".`,
    );
  }

  if (!workVisualKeys.includes(project.visualKey)) {
    errors.push(
      `Project "${project.slug}" visual key "${project.visualKey}" is not recognized.`,
    );
  }
}

function validateRequiredText(project: WorkProject, errors: string[]): void {
  for (const field of evidenceFields) {
    if (isBlank(project.evidence[field])) {
      errors.push(
        `Project "${project.slug}" evidence.${field} must not be blank.`,
      );
    }
  }

  for (const field of publicTextFields) {
    if (isBlank(project[field])) {
      errors.push(`Project "${project.slug}" ${field} must not be blank.`);
    }
  }
}

function validateClassification(project: WorkProject, errors: string[]): void {
  if (!workTiers.includes(project.tier)) {
    errors.push(`Project "${project.slug}" tier "${project.tier}" is not public.`);
  }

  if (!workStatuses.includes(project.status)) {
    errors.push(
      `Project "${project.slug}" status "${project.status}" is not public.`,
    );
  }
}

export function validateWorkProjects(
  projects: readonly WorkProject[],
): string[] {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();

  for (const project of projects) {
    validateIdentity(project, seenSlugs, errors);
    validateRequiredText(project, errors);
    validateClassification(project, errors);
  }

  return errors;
}
