import Link from "next/link";
import { normalizeStaticAliasHref } from "@/data/workRoutes";
import styles from "./StaticAliasRedirect.module.css";

interface StaticAliasRedirectProps {
  href: string;
  destinationLabel: string;
}

export default function StaticAliasRedirect({
  href,
  destinationLabel,
}: StaticAliasRedirectProps) {
  const staticHref = normalizeStaticAliasHref(href);

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${staticHref}`} />
      <section className={styles.page} aria-labelledby="alias-heading">
        <div className={styles.panel}>
          <p className={styles.eyebrow}>Canonical route</p>
          <h1 id="alias-heading">This page moved.</h1>
          <p className={styles.copy}>
            The work now lives at its canonical address. If your browser does
            not continue automatically, use the link below.
          </p>
          <Link className={styles.link} href={staticHref}>
            Continue to {destinationLabel}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
