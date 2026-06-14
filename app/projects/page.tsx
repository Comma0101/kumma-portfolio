"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProjectsPage() {
  useEffect(() => {
    window.location.replace("/#work");
  }, []);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "9rem 1.5rem",
      }}
    >
      <p style={{ color: "var(--steel)" }}>
        Redirecting to{" "}
        <Link href="/#work" style={{ color: "var(--signal)" }}>
          the work index
        </Link>
        .
      </p>
    </main>
  );
}
