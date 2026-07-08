import type { CSSProperties } from "react";

type AudioSlotProps = {
  label: string;
  caption?: string;
  /**
   * When a recording exists, pass its URL here. Until then the slot renders a
   * non-interactive "recording coming" placeholder. Audio never autoplays:
   * the native element is rendered with controls and preload="none" so nothing
   * is fetched or played until the visitor asks for it.
   */
  src?: string;
};

const card: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
  height: "100%",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#e8e4e4",
};

const waveWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  height: "42px",
  opacity: 0.32,
};

const statusStyle: CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "0.64rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(163, 181, 168, 0.7)",
};

const captionStyle: CSSProperties = {
  fontSize: "0.8rem",
  lineHeight: 1.6,
  color: "rgba(220, 220, 220, 0.5)",
};

// Static, non-animated waveform silhouette. Decorative only.
const bars = [
  8, 16, 24, 14, 30, 20, 34, 18, 26, 12, 22, 30, 16, 24, 10, 20, 28, 14, 22, 12,
];

export default function AudioSlot({ label, caption, src }: AudioSlotProps) {
  return (
    <div style={card}>
      <span style={labelStyle}>{label}</span>

      {src ? (
        <audio controls preload="none" style={{ width: "100%" }}>
          <source src={src} />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <>
          <div style={waveWrap} aria-hidden="true">
            {bars.map((h, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: `${h}px`,
                  background: "var(--sand, #a3b5a8)",
                  borderRadius: "1px",
                }}
              />
            ))}
          </div>
          <span style={statusStyle}>Recording coming</span>
        </>
      )}

      {caption ? <span style={captionStyle}>{caption}</span> : null}
    </div>
  );
}
