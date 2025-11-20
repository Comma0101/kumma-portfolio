"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/miniConstellation.module.css";

interface MiniConstellationProps {
    technologies: string[];
    accentColor?: string;
}

// Predefined positions for up to 6 nodes (in percentage)
const positions = [
    { x: 50, y: 20 }, // Top
    { x: 80, y: 40 }, // Top Right
    { x: 80, y: 70 }, // Bottom Right
    { x: 50, y: 90 }, // Bottom
    { x: 20, y: 70 }, // Bottom Left
    { x: 20, y: 40 }, // Top Left
];

const MiniConstellation: React.FC<MiniConstellationProps> = ({
    technologies,
    accentColor = "#00d4ff"
}) => {
    // Limit to 6 techs for the visual
    const displayTechs = technologies.slice(0, 6);

    // Generate connections (connect each node to the next, and maybe center)
    const connections = displayTechs.map((_, i) => {
        const nextIndex = (i + 1) % displayTechs.length;
        return {
            from: i,
            to: nextIndex
        };
    });

    // Add some cross connections for complexity if enough nodes
    if (displayTechs.length > 3) {
        connections.push({ from: 0, to: 2 });
        if (displayTechs.length > 4) connections.push({ from: 0, to: 3 });
    }

    return (
        <div className={styles.container}>
            <svg className={styles.svgLayer}>
                {connections.map((conn, i) => (
                    <motion.line
                        key={i}
                        x1={`${positions[conn.from].x}%`}
                        y1={`${positions[conn.from].y}%`}
                        x2={`${positions[conn.to].x}%`}
                        y2={`${positions[conn.to].y}%`}
                        stroke={accentColor}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ duration: 1.5, delay: 0.2 + (i * 0.1) }}
                        viewport={{ once: true }}
                    />
                ))}
            </svg>

            {displayTechs.map((tech, i) => (
                <motion.div
                    key={i}
                    className={styles.node}
                    style={{
                        left: `${positions[i].x}%`,
                        top: `${positions[i].y}%`,
                        borderColor: accentColor
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        duration: 0.8,
                        delay: i * 0.1
                    }}
                    viewport={{ once: true }}
                >
                    <div className={styles.nodeDot} style={{ backgroundColor: accentColor }} />
                    <div className={styles.tooltip}>{tech}</div>
                </motion.div>
            ))}
        </div>
    );
};

export default MiniConstellation;
