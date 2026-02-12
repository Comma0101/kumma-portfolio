"use client";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/techConstellation.module.css";

type NodeCategory = "interface" | "motion" | "systems" | "delivery";

interface SkillNode {
    id: string;
    label: string;
    x: number;
    y: number;
    category: NodeCategory;
}

interface Connection {
    from: string;
    to: string;
}

interface CategoryMeta {
    title: string;
    note: string;
}

const nodes: SkillNode[] = [
    { id: "react", label: "React", x: 18, y: 28, category: "interface" },
    { id: "next", label: "Next.js", x: 30, y: 20, category: "interface" },
    { id: "typescript", label: "TypeScript", x: 26, y: 42, category: "interface" },
    { id: "javascript", label: "JavaScript", x: 14, y: 52, category: "interface" },
    { id: "css", label: "CSS", x: 21, y: 70, category: "interface" },

    { id: "gsap", label: "GSAP", x: 44, y: 23, category: "motion" },
    { id: "framer", label: "Framer", x: 40, y: 38, category: "motion" },
    { id: "three", label: "Three.js", x: 56, y: 16, category: "motion" },
    { id: "figma", label: "Figma", x: 52, y: 34, category: "motion" },

    { id: "node", label: "Node.js", x: 68, y: 46, category: "systems" },
    { id: "api", label: "API Design", x: 80, y: 36, category: "systems" },
    { id: "postgres", label: "PostgreSQL", x: 78, y: 60, category: "systems" },
    { id: "mongo", label: "MongoDB", x: 66, y: 67, category: "systems" },

    { id: "git", label: "Git", x: 55, y: 78, category: "delivery" },
    { id: "docker", label: "Docker", x: 70, y: 82, category: "delivery" },
    { id: "aws", label: "AWS", x: 85, y: 74, category: "delivery" },
];

const connections: Connection[] = [
    { from: "react", to: "next" },
    { from: "react", to: "typescript" },
    { from: "react", to: "javascript" },
    { from: "javascript", to: "typescript" },
    { from: "javascript", to: "css" },
    { from: "next", to: "figma" },
    { from: "css", to: "framer" },

    { from: "react", to: "framer" },
    { from: "react", to: "gsap" },
    { from: "gsap", to: "framer" },
    { from: "gsap", to: "three" },
    { from: "figma", to: "framer" },

    { from: "javascript", to: "node" },
    { from: "typescript", to: "node" },
    { from: "node", to: "api" },
    { from: "node", to: "postgres" },
    { from: "node", to: "mongo" },
    { from: "api", to: "aws" },

    { from: "git", to: "docker" },
    { from: "docker", to: "aws" },
    { from: "node", to: "docker" },
    { from: "postgres", to: "docker" },
    { from: "figma", to: "git" },
];

const categoryMeta: Record<NodeCategory, CategoryMeta> = {
    interface: {
        title: "Interface",
        note: "Readable UI systems, semantic structure, responsive behavior.",
    },
    motion: {
        title: "Motion",
        note: "Narrative pacing, transitions, and spatial feedback.",
    },
    systems: {
        title: "Systems",
        note: "Service design, data models, and reliable architecture.",
    },
    delivery: {
        title: "Delivery",
        note: "Versioned workflow, deployment quality, and runtime care.",
    },
};

const categoryOrder: NodeCategory[] = ["interface", "motion", "systems", "delivery"];

const nodeCategoryClassMap: Record<NodeCategory, string> = {
    interface: styles.nodeInterface,
    motion: styles.nodeMotion,
    systems: styles.nodeSystems,
    delivery: styles.nodeDelivery,
};

const swatchClassMap: Record<NodeCategory, string> = {
    interface: styles.swatchInterface,
    motion: styles.swatchMotion,
    systems: styles.swatchSystems,
    delivery: styles.swatchDelivery,
};

const TechConstellation = () => {
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [hasEntered, setHasEntered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                    setHasEntered(true);
                    observer.disconnect();
                }
            },
            {
                threshold: [0.15, 0.25, 0.4],
            }
        );

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const nodeMap = useMemo(() => {
        return new Map(nodes.map((node) => [node.id, node]));
    }, []);

    const activeNode = activeNodeId ? (nodeMap.get(activeNodeId) ?? null) : null;

    const activeConnectionCount =
        activeNodeId === null
            ? 0
            : connections.filter(
                  (connection) =>
                      connection.from === activeNodeId || connection.to === activeNodeId
              ).length;

    const isConnectionActive = (connection: Connection) => {
        if (!activeNodeId) return false;
        return connection.from === activeNodeId || connection.to === activeNodeId;
    };

    const isNodeConnected = (nodeId: string) => {
        if (!activeNodeId) return false;
        if (activeNodeId === nodeId) return true;

        return connections.some(
            (connection) =>
                (connection.from === activeNodeId && connection.to === nodeId) ||
                (connection.to === activeNodeId && connection.from === nodeId)
        );
    };

    return (
        <div className={styles.constellationContainer} ref={containerRef}>
            <div className={`${styles.constellationFrame} ${hasEntered ? styles.frameActive : ""}`}>
                <div className={styles.graphHeader}>
                    <p className={styles.graphCaption}>Capability Map / Chapter 04</p>
                    <p className={styles.graphHint}>
                        {activeNode
                            ? `${activeNode.label} connects to ${activeConnectionCount} adjacent capabilities.`
                            : "Hover or focus a node to trace how capabilities combine across the work."}
                    </p>
                </div>

                <div className={styles.graphStage}>
                    <svg className={styles.connectionsLayer} aria-hidden="true">
                        {connections.map((connection, index) => {
                            const fromNode = nodeMap.get(connection.from);
                            const toNode = nodeMap.get(connection.to);
                            if (!fromNode || !toNode) return null;

                            const isActiveConnection = isConnectionActive(connection);
                            const lineClasses = [styles.connectionLine];

                            if (hasEntered) lineClasses.push(styles.connectionVisible);
                            if (activeNodeId && !isActiveConnection) {
                                lineClasses.push(styles.connectionMuted);
                            }
                            if (isActiveConnection) {
                                lineClasses.push(styles.connectionActive);
                            }

                            return (
                                <line
                                    key={`${connection.from}-${connection.to}`}
                                    x1={`${fromNode.x}%`}
                                    y1={`${fromNode.y}%`}
                                    x2={`${toNode.x}%`}
                                    y2={`${toNode.y}%`}
                                    className={lineClasses.join(" ")}
                                    style={{ "--line-delay": `${index * 32}ms` } as CSSProperties}
                                />
                            );
                        })}
                    </svg>

                    {nodes.map((node, index) => {
                        const isConnected = isNodeConnected(node.id);
                        const nodeClasses = [styles.node, nodeCategoryClassMap[node.category]];

                        if (hasEntered) nodeClasses.push(styles.nodeVisible);
                        if (activeNodeId && !isConnected) {
                            nodeClasses.push(styles.nodeMuted);
                        }
                        if (isConnected) {
                            nodeClasses.push(styles.nodeConnected);
                        }
                        if (activeNodeId === node.id) {
                            nodeClasses.push(styles.nodeActive);
                        }

                        return (
                            <button
                                key={node.id}
                                type="button"
                                className={nodeClasses.join(" ")}
                                style={{
                                    left: `${node.x}%`,
                                    top: `${node.y}%`,
                                    "--node-delay": `${index * 34}ms`,
                                } as CSSProperties}
                                onMouseEnter={() => setActiveNodeId(node.id)}
                                onMouseLeave={() => setActiveNodeId(null)}
                                onFocus={() => setActiveNodeId(node.id)}
                                onBlur={() => setActiveNodeId(null)}
                                aria-label={`${node.label}, ${categoryMeta[node.category].title}`}
                            >
                                <span className={styles.nodeDot} aria-hidden="true" />
                                <span className={styles.nodeLabel}>{node.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.legend}>
                    {categoryOrder.map((category) => {
                        const legendClasses = [styles.legendItem];
                        if (activeNode && activeNode.category === category) {
                            legendClasses.push(styles.legendItemActive);
                        }

                        return (
                            <article key={category} className={legendClasses.join(" ")}>
                                <span
                                    className={`${styles.legendSwatch} ${swatchClassMap[category]}`}
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className={styles.legendTitle}>{categoryMeta[category].title}</p>
                                    <p className={styles.legendNote}>{categoryMeta[category].note}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TechConstellation;
