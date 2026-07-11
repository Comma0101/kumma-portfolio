import styles from "@/styles/about.module.css";

const principles = [
  {
    k: "Systems over labels.",
    v: "The work is building real-time voice systems and the structure around them, not defending a title.",
  },
  {
    k: "Structure over willpower.",
    v: "Reliable behavior comes from architecture, guardrails, and feedback loops, not from motivation.",
  },
  {
    k: "Mechanism over hype.",
    v: "Every claim traces back to something observable in how the system runs.",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>
            Independent voice AI systems, <em>built in Los Angeles.</em>
          </h1>
          <p className={styles.lead}>
            I am Wu, an independent builder of real-time voice AI systems. I work
            directly with the teams that need them, from the problem and the
            call flow through the real-time infrastructure, guardrails, and
            failure handling, to something running in production.
          </p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>How I work</p>
          <h2 className={styles.h2}>Working principles</h2>
          <ul className={styles.principles}>
            {principles.map((p) => (
              <li key={p.k}>
                <em className={styles.pKey}>{p.k}</em>
                <span className={styles.pVal}>{p.v}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>Personal work</p>
          <h2 className={styles.h2}>Market Systems</h2>
          <p className={styles.body}>
            Market Systems is a personal decision-systems practice, applied to
            futures trading. It is the same interest in structure turned inward:
            written rules, defined risk, and a review of decision quality rather
            than outcome. It lives here, off the main site, because it is about
            process and discipline, not tactics, forecasts, or returns.
          </p>
          <p className={styles.body}>
            The one part worth showing is a build, not a trade: a dashboard that
            turns a messy brokerage export into a correct per-trade ledger, which
            is a data-correctness problem more than a market one. It is written up
            as a <a href="/work/robinhood-dashboard">case study</a>.
          </p>
          <p className={styles.aside}>Personal practice — not a service.</p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>Personal work</p>
          <h2 className={styles.h2}>Visual practice</h2>
          <p className={styles.body}>
            Away from the systems work, I keep a visual practice: photography and
            generative studies. It is personal work, a way to think about
            structure, light, and constraint without a screen full of logs.
          </p>
        </section>
      </div>
    </div>
  );
}
