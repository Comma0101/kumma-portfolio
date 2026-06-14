interface EyebrowProps {
  children: React.ReactNode;
  color?: "sand" | "signal";
}

export default function Eyebrow({ children, color = "sand" }: EyebrowProps) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-mono)",
        fontSize: "0.66rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: color === "signal" ? "var(--signal)" : "var(--sand)",
      }}
    >
      {children}
    </p>
  );
}
