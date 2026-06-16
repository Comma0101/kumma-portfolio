"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AgentAwareness.module.css";

// Known AI-agent / automation user-agent signatures (heuristic).
const AGENT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Bytespider|CCBot|Applebot|cohere-ai|Diffbot|Amazonbot|meta-externalagent|YouBot|Scrapy|HeadlessChrome|python-requests|node-fetch/i;

export default function AgentAwareness() {
  const pathname = usePathname();
  const [detected, setDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      const webdriver = (navigator as Navigator & { webdriver?: boolean })
        .webdriver;
      if (AGENT_UA.test(ua) || webdriver === true) setDetected(true);
      if (sessionStorage.getItem("agent_banner_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* navigator unavailable */
    }
  }, []);

  // The agent page is the protocol itself; /stories is its own experience.
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/agent" || path === "/stories") return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("agent_banner_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {detected && !dismissed && (
        <div className={styles.banner} role="status">
          <span className={styles.dot} aria-hidden="true" />
          <span>Automated visitor detected. An agent protocol is available.</span>
          <Link href="/agent" className={styles.enter}>
            Enter protocol →
          </Link>
          <button className={styles.x} aria-label="Dismiss" onClick={dismiss}>
            ×
          </button>
        </div>
      )}
      <Link
        href="/agent"
        className={styles.pill}
        aria-label="View the agent protocol"
      >
        <span className={styles.pillDot} aria-hidden="true" />
        agent protocol
      </Link>
    </>
  );
}
