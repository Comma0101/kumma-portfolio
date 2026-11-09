"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { mapArtStudies, type MapArtStudy } from "./mapArt";
import styles from "./MapArt.module.css";

// Only the small arrival choreography runs in the client. The four images are
// committed renders of the source project's real street/handwriting geometry.
export default function MapArtPrint({ study }: { study: MapArtStudy }) {
  const ref = useRef<HTMLDivElement>(null);
  const artwork = mapArtStudies[study];

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const element = host;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function finish() {
      element.dataset.mapArrival = "complete";
      observer?.disconnect();
      clearTimeout(timer);
    }

    function arrive() {
      if (preference.matches) {
        finish();
        return;
      }
      element.dataset.mapArrival = "revealing";
      observer?.disconnect();
      timer = setTimeout(finish, 2000);
    }

    function handlePreference(event: MediaQueryListEvent) {
      if (event.matches) finish();
    }

    if (preference.matches || !("IntersectionObserver" in window)) {
      finish();
    } else {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) arrive();
      }, { threshold: 0.2 });
      observer.observe(host);
    }
    preference.addEventListener("change", handlePreference);
    return () => {
      observer?.disconnect();
      clearTimeout(timer);
      preference.removeEventListener("change", handlePreference);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={styles.print}
      style={{ aspectRatio: `${artwork.width} / ${artwork.height}` }}
      role="img"
      aria-label={artwork.description}
      data-map-study={study}
    >
      <div className={styles.impressions} aria-hidden="true">
        {artwork.layers.map((layer) => (
          <div
            key={layer.city}
            className={styles.impression}
            style={{
              left: `${100 * layer.x / artwork.width}%`,
              top: `${100 * layer.y / artwork.height}%`,
              width: `${100 * layer.size / artwork.width}%`,
              opacity: layer.opacity,
            }}
          >
            <Image
              src={`/art/map-art/${layer.city}.webp`}
              width={1000}
              height={1000}
              alt=""
              className={styles.city}
              data-arrival={layer.arrival}
              priority={layer.city === "amsterdam" || layer.city === "los-angeles"}
              sizes="(max-width: 760px) 85vw, 55vw"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <svg className={styles.connections} viewBox={`0 0 ${artwork.width} ${artwork.height}`} aria-hidden="true" focusable="false">
        {artwork.threads.map((d) => <path key={d} d={d} pathLength={1} />)}
      </svg>
      <div className={styles.placeNames} aria-hidden="true">
        {artwork.labels.map((label) => (
          <span key={label.name} data-anchor={label.anchor} className={label.red ? styles.redName : undefined} style={{ left: `${100 * label.x / artwork.width}%`, top: `${100 * label.y / artwork.height}%` }}>
            {label.name}
          </span>
        ))}
      </div>
    </div>
  );
}
