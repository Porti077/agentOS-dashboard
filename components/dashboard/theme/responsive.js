/**
 * theme/responsive.js
 * Responsive utilities for AgentOS Dashboard
 * ─────────────────────────────────────────────
 * Import in any component:
 *   import { useBreakpoint, grid, show, hide } from "@/theme/responsive"
 */

import { useState, useEffect } from "react";

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const BP = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns current breakpoint info.
 * Usage:
 *   const { isMobile, isTablet, isDesktop, width } = useBreakpoint()
 */
export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    width,
    isMobile:  width < BP.md,
    isTablet:  width >= BP.md && width < BP.lg,
    isDesktop: width >= BP.lg,
  };
}

// ─── Responsive grid helpers ──────────────────────────────────────────────────

/**
 * Returns a CSS gridTemplateColumns value that adapts to screen size.
 * Usage:
 *   style={{ gridTemplateColumns: grid.kpi(isMobile, isTablet) }}
 */
export const grid = {
  /** 4-col on desktop, 2-col on tablet, 1-col on mobile */
  kpi: (isMobile, isTablet) =>
    isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)",

  /** 2-col on desktop, 1-col on mobile/tablet */
  twoCol: (isMobile, isTablet) =>
    isMobile || isTablet ? "1fr" : "1fr 1fr",

  /** Chart + sidebar: 2fr 1fr on desktop, stacked on mobile */
  chartSide: (isMobile, isTablet) =>
    isMobile || isTablet ? "1fr" : "2fr 1fr",

  /** Auto-fill cards with min width */
  autoFill: (minWidth = 200) => `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
};

// ─── Nav helpers ──────────────────────────────────────────────────────────────

/**
 * Returns nav layout mode based on screen width.
 * Usage:
 *   const navMode = navLayout(isMobile)
 *   // "tabs" | "hamburger"
 */
export const navLayout = (isMobile) => isMobile ? "hamburger" : "tabs";

// ─── Responsive padding ───────────────────────────────────────────────────────

export const responsivePadding = (isMobile) => isMobile ? 14 : 24;

// ─── Responsive font sizes ────────────────────────────────────────────────────

export const responsiveFont = {
  pageTitle: (isMobile) => isMobile ? 15 : 18,
  kpiValue:  (isMobile) => isMobile ? 18 : 22,
};
