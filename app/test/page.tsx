"use client";
import Link from "next/link";
import styles from "../../styles/test.module.css";

const TestPage = () => {
  return (
    <div className={styles.testContainer}>
      <div className={styles.box}></div>
      <Link href="/">Back to Home</Link>
    </div>
  );
};

export default TestPage;
