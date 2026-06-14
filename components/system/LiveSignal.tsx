import styles from "./LiveSignal.module.css";

export default function LiveSignal({ children }: { children: React.ReactNode }) {
  return <span className={styles.live}>{children}</span>;
}
