"use client";
import RotatingCuboids from "../RotatingCuboids";
import styles from "../../styles/home.module.css";

const CuboidsSection = () => {
    return (
        <div id="cuboids" className={styles.cuboidsSection}>
            <div className={styles.cuboidsIntro}>
                <p className={styles.cuboidsEyebrow}>Spatial Rhythm</p>
                <p className={styles.cuboidsLead}>
                    Structure in motion, kept intentionally quiet.
                </p>
            </div>
            <RotatingCuboids />
        </div>
    );
};

export default CuboidsSection;
