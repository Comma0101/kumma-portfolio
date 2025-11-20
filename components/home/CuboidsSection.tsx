"use client";
import RotatingCuboids from "../RotatingCuboids";
import styles from "../../styles/home.module.css";

const CuboidsSection = () => {
    return (
        <div id="cuboids" className={styles.cuboidsSection}>
            <RotatingCuboids />
        </div>
    );
};

export default CuboidsSection;
