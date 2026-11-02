"use client";

import Link from "next/link";
import { useEffect } from "react";
import Shell from "./Shell";
import front from "./Front.module.css";

// An old address: say where the page went, and go there.
export default function Moved({ to, label }: { to: string; label: string }) {
  useEffect(() => {
    window.location.replace(to + window.location.hash);
  }, [to]);
  return (
    <Shell>
      <h1 className={front.workTitle}>Moved.</h1>
      <p className={front.workLede}>
        This page has moved. Continue to <Link href={to}>{label}</Link>.
      </p>
    </Shell>
  );
}
