import type { Metadata } from "next";

export const metadata: Metadata = { title: "ARCHON" };

export default function ArchonPage() {
  return (
    <main
      style={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        padding: "9rem 1.5rem 6rem",
      }}
    >
      <div style={{ maxWidth: "46ch", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--sand)",
            margin: 0,
          }}
        >
          02 / ARCHON
        </p>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            letterSpacing: "-0.03em",
            color: "var(--paper)",
            margin: "1rem 0",
            lineHeight: 1.02,
          }}
        >
          Personal AI orchestration.
        </h1>
        <p style={{ color: "var(--steel)", lineHeight: 1.7, margin: 0 }}>
          The full chapter is in development. Agents, tools, memory, and model
          routing coordinated into one inspectable system.
        </p>
      </div>
    </main>
  );
}
