"use client";
/**
 * AgentOSDashboard.jsx
 * AI Agent Management Dashboard — Full template entry point
 * ─────────────────────────────────────────────────────────
 * Screens:
 *   1. OverviewDashboard  — KPIs, charts, runs table, activity feed
 *   2. AgentBuilder       — Create/edit agents with playground
 *   3. ExecutionLog       — Animated execution graph + token tracker
 *   4. ToolRegistry       — Tool cards, config modals, usage stats
 *   5. CostTracker        — Cost charts, model/agent breakdown, CSV export
 *
 * Stack: React 19 · Recharts · Custom Design System · No backend required
 *
 * ThemeForest submission checklist:
 *   ✅ Dark mode (default) — add light mode via CSS variable swap
 *   ✅ Fully responsive — mobile hamburger menu + adaptive layouts
 *   ✅ TypeScript-ready props (rename .jsx → .tsx and add types)
 *   ✅ Mock data separated — easy to replace with real API calls
 *   ✅ No hardcoded secrets
 *   ✅ Centralized design system (theme/tokens.js)
 */

import { useState } from "react";
import { C } from "./theme/tokens";
import { useBreakpoint, responsivePadding } from "./theme/responsive";
import OverviewDashboard from "./OverviewDashboard";
import AgentBuilder      from "./AgentBuilder";
import ExecutionLog      from "./ExecutionLog";
import ToolRegistry      from "./ToolRegistry";
import CostTracker       from "./CostTracker";

// ─── Screen registry ──────────────────────────────────────────────────────────

const SCREENS = [
  { id: "overview",  label: "Overview",      icon: "🗂",  component: OverviewDashboard },
  { id: "builder",   label: "Agent Builder", icon: "🤖",  component: AgentBuilder      },
  { id: "execution", label: "Execution Log", icon: "▶",   component: ExecutionLog      },
  { id: "tools",     label: "Tool Registry", icon: "🔧",  component: ToolRegistry      },
  { id: "costs",     label: "Cost Tracker",  icon: "💰",  component: CostTracker       },
];

// ─── Mobile hamburger menu ────────────────────────────────────────────────────

function MobileMenu({ activeId, onSelect, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
          zIndex: 50, backdropFilter: "blur(2px)",
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
        background: C.surface, borderRight: `1px solid ${C.border}`,
        zIndex: 51, padding: "20px 0", display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: C.mono }}>AgentOS</span>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >×</button>
        </div>

        {/* Nav items */}
        {SCREENS.map(screen => {
          const isActive = screen.id === activeId;
          return (
            <button
              key={screen.id}
              onClick={() => { onSelect(screen.id); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 20px", fontSize: 13, cursor: "pointer",
                fontFamily: C.mono, background: isActive ? C.accentBg : "transparent",
                border: "none", color: isActive ? C.accent2 : C.muted,
                textAlign: "left", transition: "all .15s",
                borderLeft: `3px solid ${isActive ? C.accent : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 16 }}>{screen.icon}</span>
              {screen.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Desktop tab bar ──────────────────────────────────────────────────────────

function DesktopNav({ activeId, onSelect }) {
  return (
    <>
      {SCREENS.map(screen => {
        const isActive = screen.id === activeId;
        return (
          <button
            key={screen.id}
            onClick={() => onSelect(screen.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "14px 16px", fontSize: 12, cursor: "pointer",
              fontFamily: C.mono, background: "transparent", border: "none",
              borderBottom: `2px solid ${isActive ? C.accent : "transparent"}`,
              color: isActive ? C.accent2 : C.muted,
              transition: "color .15s", marginBottom: -1, whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.muted; }}
          >
            <span style={{ fontSize: 14 }}>{screen.icon}</span>
            {screen.label}
          </button>
        );
      })}
    </>
  );
}

// ─── Mobile bottom tab bar ────────────────────────────────────────────────────

function MobileTabBar({ activeId, onSelect }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: "flex", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {SCREENS.map(screen => {
        const isActive = screen.id === activeId;
        return (
          <button
            key={screen.id}
            onClick={() => onSelect(screen.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "10px 4px 8px", fontSize: 9, cursor: "pointer",
              fontFamily: C.mono, background: "transparent", border: "none",
              color: isActive ? C.accent2 : C.muted,
              borderTop: `2px solid ${isActive ? C.accent : "transparent"}`,
              transition: "color .15s",
            }}
          >
            <span style={{ fontSize: 18 }}>{screen.icon}</span>
            {screen.label.split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function AgentOSDashboard() {
  const [activeId,    setActiveId]    = useState("overview");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const { isMobile, isTablet }        = useBreakpoint();
  const pad                           = responsivePadding(isMobile);

  const active          = SCREENS.find(s => s.id === activeId);
  const ActiveComponent = active.component;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.sans, color: C.text, paddingBottom: isMobile ? 72 : 0 }}>

      {/* Top bar */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: `0 ${pad}px`, display: "flex", alignItems: "center",
        gap: 0, position: "sticky", top: 0, zIndex: 30,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 0", marginRight: isMobile ? 0 : 28, flexShrink: 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
          {!isMobile && <span style={{ fontSize: 14, fontWeight: 500, fontFamily: C.mono }}>AgentOS</span>}
        </div>

        {/* Desktop nav tabs */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", flex: 1, overflowX: "auto" }}>
            <DesktopNav activeId={activeId} onSelect={setActiveId}/>
          </div>
        )}

        {/* Mobile: current screen label */}
        {isMobile && (
          <span style={{ fontSize: 13, fontFamily: C.mono, color: C.text, marginLeft: 10, flex: 1 }}>
            {active.icon} {active.label}
          </span>
        )}

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 12 }}>
          {/* Hamburger — tablet only (mobile uses bottom tabs) */}
          {isTablet && (
            <button
              onClick={() => setMenuOpen(true)}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 10px", color: C.muted, cursor: "pointer", fontFamily: C.mono, fontSize: 14 }}
              aria-label="Open menu"
            >☰</button>
          )}
          {/* Avatar */}
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.accent2, cursor: "pointer", flexShrink: 0 }}>A</div>
        </div>
      </div>

      {/* Mobile hamburger drawer (tablet) */}
      {menuOpen && (
        <MobileMenu
          activeId={activeId}
          onSelect={setActiveId}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/* Active screen */}
      <div style={{ padding: `${pad}px` }}>
        <ActiveComponent/>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && <MobileTabBar activeId={activeId} onSelect={setActiveId}/>}
    </div>
  );
}
