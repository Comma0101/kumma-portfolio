"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/techConstellation.module.css";

// Define the graph data
interface SkillNode {
    id: string;
    label: string;
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
    category: "frontend" | "backend" | "design" | "tools";
}

interface Connection {
    from: string;
    to: string;
}

const nodes: SkillNode[] = [
    // Frontend (Left/Top)
    { id: "react", label: "React", x: 20, y: 30, category: "frontend" },
    { id: "next", label: "Next.js", x: 30, y: 20, category: "frontend" },
    { id: "ts", label: "TypeScript", x: 25, y: 45, category: "frontend" },
    { id: "js", label: "JavaScript", x: 15, y: 55, category: "frontend" },
    { id: "html", label: "HTML5", x: 10, y: 40, category: "frontend" },
    { id: "css", label: "CSS3", x: 10, y: 70, category: "frontend" },

    // Design/Animation (Center/Top)
    { id: "gsap", label: "GSAP", x: 45, y: 25, category: "design" },
    { id: "three", label: "Three.js", x: 55, y: 15, category: "design" },
    { id: "framer", label: "Framer Motion", x: 40, y: 40, category: "design" },
    { id: "tailwind", label: "Tailwind", x: 35, y: 60, category: "design" },

    // Backend (Right/Bottom)
    { id: "node", label: "Node.js", x: 65, y: 50, category: "backend" },
    { id: "express", label: "Express", x: 75, y: 40, category: "backend" },
    { id: "postgres", label: "PostgreSQL", x: 80, y: 60, category: "backend" },
    { id: "mongo", label: "MongoDB", x: 70, y: 70, category: "backend" },

    // Tools (Far Right)
    { id: "git", label: "Git", x: 85, y: 30, category: "tools" },
    { id: "docker", label: "Docker", x: 90, y: 50, category: "tools" },
    { id: "aws", label: "AWS", x: 85, y: 75, category: "tools" },
];

const connections: Connection[] = [
    // Frontend Cluster
    { from: "react", to: "next" },
    { from: "react", to: "ts" },
    { from: "react", to: "js" },
    { from: "js", to: "ts" },
    { from: "js", to: "html" },
    { from: "html", to: "css" },
    { from: "js", to: "css" },

    // Design Cluster
    { from: "react", to: "framer" },
    { from: "react", to: "gsap" },
    { from: "gsap", to: "three" },
    { from: "next", to: "tailwind" },
    { from: "css", to: "tailwind" },

    // Backend Cluster
    { from: "js", to: "node" },
    { from: "ts", to: "node" },
    { from: "node", to: "express" },
    { from: "node", to: "mongo" },
    { from: "node", to: "postgres" },

    // Tools Cluster
    { from: "node", to: "docker" },
    { from: "node", to: "git" },
    { from: "postgres", to: "docker" },
    { from: "docker", to: "aws" },
];

const TechConstellation = () => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Helper to check if a line should be highlighted
    const isConnectionActive = (conn: Connection) => {
        if (!hoveredNode) return false;
        return conn.from === hoveredNode || conn.to === hoveredNode;
    };

    // Helper to check if a node is connected to the hovered node
    const isNodeConnected = (nodeId: string) => {
        if (!hoveredNode) return false;
        if (nodeId === hoveredNode) return true;
        return connections.some(
            (c) =>
                (c.from === hoveredNode && c.to === nodeId) ||
                (c.to === hoveredNode && c.from === nodeId)
        );
    };

    return (
        <div className={styles.constellationContainer} ref={containerRef}>
            <div className={styles.constellationWrapper}>
                <h2 className={styles.title}>
                    <span className={styles.titleAccent}>{"<"}</span>
                    Knowledge Graph
                    <span className={styles.titleAccent}>{" />"}</span>
                </h2>

                <div className={styles.graphArea}>
                    {/* SVG Layer for Lines */}
                    <svg className={styles.connectionsLayer}>
                        {connections.map((conn, i) => {
                            const fromNode = nodes.find((n) => n.id === conn.from);
                            const toNode = nodes.find((n) => n.id === conn.to);
                            if (!fromNode || !toNode) return null;

                            const isActive = isConnectionActive(conn);
                            const isDimmed = hoveredNode && !isActive;

                            return (
                                <motion.line
                                    key={`${conn.from}-${conn.to}`}
                                    x1={`${fromNode.x}%`}
                                    y1={`${fromNode.y}%`}
                                    x2={`${toNode.x}%`}
                                    y2={`${toNode.y}%`}
                                    stroke={isActive ? "#00d4ff" : "rgba(255, 255, 255, 0.1)"}
                                    strokeWidth={isActive ? 2 : 1}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: isDimmed ? 0.05 : 1 }}
                                    transition={{ duration: 1.5, delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                    className={styles.connectionLine}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map((node, i) => {
                        const isConnected = isNodeConnected(node.id);
                        const isDimmed = hoveredNode && !isConnected;

                        return (
                            <motion.div
                                key={node.id}
                                className={`${styles.node} ${styles[node.category]}`}
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: isDimmed ? 0.2 : 1 }}
                                viewport={{ once: true }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    y: {
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: Math.random() * 2,
                                    },
                                    default: {
                                        type: "spring",
                                        duration: 1,
                                        delay: i * 0.1
                                    }
                                }}
                            >
                                <div className={styles.nodeDot} />
                                <div className={styles.nodeLabel}>{node.label}</div>

                                {/* Glow Effect */}
                                <div className={styles.nodeGlow} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TechConstellation;
