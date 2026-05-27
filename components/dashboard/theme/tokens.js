/**
 * theme/tokens.js
 * Centralized design tokens for AgentOS Dashboard
 * ─────────────────────────────────────────────────
 * Import in any component:
 *   import { C, radius, shadow, font } from "@/theme/tokens"
 */

// ─── Color palette ────────────────────────────────────────────────────────────

export const C = {
  // Backgrounds
  bg:       "#0a0c10",
  surface:  "#111318",
  surface2: "#181b22",
  surface3: "#1e2330",

  // Borders
  border:   "#1e2330",
  borderHover: "#2e3448",

  // Text
  text:     "#e8eaf0",
  textSub:  "#9ca3af",
  muted:    "#6b7280",
  muted2:   "#4b5563",

  // Brand
  accent:   "#6366f1",
  accent2:  "#818cf8",
  accentBg: "rgba(99,102,241,.12)",
  accentBorder: "rgba(99,102,241,.3)",

  // Semantic
  green:    "#10b981",
  greenBg:  "rgba(16,185,129,.12)",
  greenBorder: "rgba(16,185,129,.25)",

  amber:    "#f59e0b",
  amberBg:  "rgba(245,158,11,.1)",
  amberBorder: "rgba(245,158,11,.25)",

  red:      "#ef4444",
  redBg:    "rgba(239,68,68,.1)",
  redBorder:"rgba(239,68,68,.2)",

  blue:     "#3b82f6",
  blueBg:   "rgba(59,130,246,.1)",
  blueBorder:"rgba(59,130,246,.2)",

  // Typography
  mono: "'Courier New', monospace",
  sans: "'Georgia', serif",
};

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   4,
  md:   7,
  lg:   10,
  xl:   12,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
  sm:  "0 1px 3px rgba(0,0,0,.4)",
  md:  "0 4px 12px rgba(0,0,0,.5)",
  lg:  "0 8px 32px rgba(0,0,0,.6)",
};

// ─── Spacing scale (px) ───────────────────────────────────────────────────────

export const space = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
};

// ─── Typography scale ─────────────────────────────────────────────────────────

export const font = {
  xs:   10,
  sm:   11,
  base: 12,
  md:   13,
  lg:   15,
  xl:   18,
  xxl:  22,
};

// ─── Reusable style objects ───────────────────────────────────────────────────

/** Standard card surface */
export const cardStyle = {
  background:   C.surface,
  border:       `1px solid ${C.border}`,
  borderRadius: radius.lg,
  padding:      space[4],
};

/** Monospace label (section headers, badges) */
export const monoLabel = {
  fontSize:      font.xs,
  color:         C.muted,
  fontFamily:    C.mono,
  letterSpacing: ".08em",
  textTransform: "uppercase",
};

/** Standard text input */
export const inputStyle = {
  width:        "100%",
  background:   C.surface2,
  border:       `1px solid ${C.border}`,
  color:        C.text,
  fontFamily:   C.mono,
  fontSize:     font.base,
  padding:      "8px 10px",
  borderRadius: radius.md,
  outline:      "none",
};

/** Primary button */
export const btnPrimary = {
  fontSize:     font.base,
  padding:      "7px 14px",
  borderRadius: radius.md,
  cursor:       "pointer",
  fontFamily:   C.mono,
  background:   C.accent,
  color:        "#fff",
  border:       "none",
  transition:   "background .15s",
};

/** Ghost button */
export const btnGhost = {
  fontSize:     font.base,
  padding:      "7px 14px",
  borderRadius: radius.md,
  cursor:       "pointer",
  fontFamily:   C.mono,
  background:   "transparent",
  color:        C.muted,
  border:       `1px solid ${C.border}`,
  transition:   "all .15s",
};

/** Recharts tooltip style — use in contentStyle prop */
export const chartTooltip = {
  backgroundColor: C.surface2,
  border:          `1px solid ${C.border}`,
  borderRadius:    radius.md,
  fontSize:        font.sm,
  fontFamily:      C.mono,
};

/** Recharts axis tick style — use in tick prop */
export const chartTick = {
  fill:       C.muted2,
  fontSize:   font.xs,
  fontFamily: C.mono,
};

// ─── Status config (shared across screens) ───────────────────────────────────

export const STATUS = {
  connected:    { color: C.green,  bg: C.greenBg,  border: C.greenBorder,  label: "connected"     },
  error:        { color: C.red,    bg: C.redBg,    border: C.redBorder,    label: "error"         },
  disconnected: { color: C.muted2, bg: "transparent", border: C.border,    label: "not connected" },
  running:      { color: C.blue,   bg: C.blueBg,   border: C.blueBorder,   label: "running"       },
  done:         { color: C.green,  bg: C.greenBg,  border: C.greenBorder,  label: "done"          },
  idle:         { color: C.muted2, bg: "transparent", border: C.border,    label: "idle"          },
};

// ─── Navigation items (shared between AgentOSDashboard and Sidebar) ───────────

export const NAV_SCREENS = [
  { id: "overview",  label: "Overview",      icon: "🗂"  },
  { id: "builder",   label: "Agent Builder", icon: "🤖"  },
  { id: "execution", label: "Execution Log", icon: "▶"   },
  { id: "tools",     label: "Tool Registry", icon: "🔧"  },
  { id: "costs",     label: "Cost Tracker",  icon: "💰"  },
];
