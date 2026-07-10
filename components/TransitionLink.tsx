"use client";

import React from "react";
import { usePageTransition } from "./PageTransition";
import { shouldAnimateNavigation } from "./navigationBehavior";

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
  ariaCurrent?: "page";
}

const TransitionLink: React.FC<TransitionLinkProps> = ({
  href,
  children,
  className,
  onNavigate,
  ariaCurrent,
}) => {
  const { animatePageOut } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      !shouldAnimateNavigation({
        button: e.button,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        target: e.currentTarget.target,
        download: e.currentTarget.hasAttribute("download"),
      })
    ) {
      return;
    }

    e.preventDefault();
    onNavigate?.();
    animatePageOut(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
};

export default TransitionLink;
