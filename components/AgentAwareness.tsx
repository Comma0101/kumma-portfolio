"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AgentAwareness.module.css";

// Known AI-agent / automation user-agent signatures (heuristic).
const AGENT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Bytespider|CCBot|Applebot|cohere-ai|Diffbot|Amazonbot|meta-externalagent|YouBot|Scrapy|python-requests|node-fetch/i;

const DESKTOP_BANNER_QUERY = "(min-width: 768px)";

export default function AgentAwareness() {
  const pathname = usePathname();
  const [bannerEligible, setBannerEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const updateBannerEligibility = () => {
      try {
        const ua = navigator.userAgent || "";
        const webdriver = (navigator as Navigator & { webdriver?: boolean })
          .webdriver;
        const desktopViewport =
          typeof window.matchMedia === "function"
            ? window.matchMedia(DESKTOP_BANNER_QUERY).matches
            : window.innerWidth >= 768;

        setBannerEligible(
          desktopViewport && (webdriver === true || AGENT_UA.test(ua)),
        );
      } catch {
        setBannerEligible(false);
      }
    };

    updateBannerEligibility();

    try {
      if (sessionStorage.getItem("agent_banner_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* storage unavailable */
    }

    window.addEventListener("resize", updateBannerEligibility);
    return () => window.removeEventListener("resize", updateBannerEligibility);
  }, []);

  // The agent page is the protocol itself; /stories is its own experience.
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/agent" || path === "/stories" || path === "/build") return null;

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
      {bannerEligible && !dismissed && (
        <div className={styles.banner} role="status">
          <span className={styles.dot} aria-hidden="true" />
          <span>Automated visitor detected. An agent protocol is available.</span>
          <Link href="/agent" className={styles.enter}>
            Enter protocol →
          </Link>
          <button
            className={styles.x}
            aria-label="Dismiss agent protocol notice"
            onClick={dismiss}
          >
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
        <span className={styles.pillLabel}>agent protocol</span>
      </Link>
    </>
  );
}
