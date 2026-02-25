"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface TransitionContextType {
    isTransitioning: boolean;
    isComplete: boolean;
    triggerTransition: () => void;
    setTransitionComplete: () => void;
    closeTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const triggerTransition = useCallback(() => {
        setIsTransitioning(true);
        setIsComplete(false);
    }, []);

    const setTransitionComplete = useCallback(() => {
        setIsComplete(true);
    }, []);

    const closeTransition = useCallback(() => {
        setIsTransitioning(false);
        setIsComplete(false);
    }, []);

    return (
        <TransitionContext.Provider value={{ isTransitioning, isComplete, triggerTransition, setTransitionComplete, closeTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransition() {
    const context = useContext(TransitionContext);
    if (context === undefined) {
        throw new Error("useTransition must be used within a TransitionProvider");
    }
    return context;
}
