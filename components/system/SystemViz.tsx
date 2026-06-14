import styles from "./SystemViz.module.css";

interface SystemVizProps {
  label: string;
  live?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function SystemViz({
  label,
  live,
  children,
  className,
}: SystemVizProps) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <div className={styles.toolbar}>
        <span>{label}</span>
        {live && <span className={styles.dot} aria-hidden="true" />}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
