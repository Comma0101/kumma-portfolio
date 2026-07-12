import { workProjects } from "./workProjects";

export const corePaths: readonly string[] = [
  "",
  "/about",
  "/contact",
  "/call",
  "/agent",
  "/blog",
  "/gallery",
  "/stories",
  "/build",
];

export const workSitemapPaths: readonly string[] = [
  "/work",
  ...workProjects.map((project) => project.href),
];

export const researchPaths: readonly string[] = [
  "/benchmark",
  "/latency",
  "/patterns",
  "/patterns/barge-in",
  "/patterns/endpointing",
  "/patterns/vad-tuning",
  "/patterns/streaming-stt",
  "/patterns/menu-grounding",
  "/patterns/clarify-before-commit",
  "/patterns/human-handoff",
  "/patterns/telephony-failure-modes",
  "/patterns/eval-harness",
  "/patterns/latency-budgets",
  "/blog",
];

const uniquePaths = (paths: readonly string[]): readonly string[] => [
  ...new Set(paths),
];

export const discoveryPaths: readonly string[] = uniquePaths([
  ...corePaths,
  ...workSitemapPaths,
  ...researchPaths,
]);
