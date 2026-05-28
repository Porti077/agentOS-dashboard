"use client";
/**
 * OverviewDashboard.jsx
 * AI Agent Management Dashboard — Overview screen
 * Stack: React 19, Recharts, Custom Design System
 *
 * Usage:
 *   import OverviewDashboard from './OverviewDashboard'
 *   <OverviewDashboard data={dashboardData} />
 *
 * Props:
 *   data  — DashboardData object (see MOCK_DATA at bottom)
 */

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";
import { C, cardStyle, monoLabel, chartTooltip, space } from "./theme/tokens";
import { useBreakpoint, grid, responsivePadding } from "./theme/responsive";

// ─── Mock data ────────────────────────────────────────────────────────────────

const last14Days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 13 + i);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

export const MOCK_DATA = {
  workspace: "acme-prod",
  kpis: {
    activeAgents:  { value: 12,      delta: "+3 this week",        trend: "up"   },
    runsToday:     { value: 347,     delta: "+18% vs yesterday",   trend: "up"   },
    tokensUsed:    { value: 2840000, delta: "+12% vs last week",   trend: "up"   },
    costMonth:     { value: 15.4,    delta: "↓ $3.20 under budget",trend: "down" },
  },
  runsChart: last14Days.map((label, i) => ({
    label,
    runs: [12,19,8,24,31,17,22,28,15,33,41,29,38,44][i],
  })),
  costChart: last14Days.map((label, i) => ({
    label,
    cost: [0.8,1.9,2.4,3.1,4.2,4.9,6.1,7.4,8.0,9.8,11.2,12.1,13.7,15.4][i],
  })),
  recentRuns: [
    { id: "run_7f3a", agent: "Research Agent",  status: "done",    cost: "$0.024", duration: "4.2s" },
    { id: "run_9c1b", agent: "Code Reviewer",   status: "done",    cost: "$0.011", duration: "2.1s" },
    { id: "run_2e8d", agent: "Data Extractor",  status: "error",   cost: "$0.003", duration: "0.8s" },
    { id: "run_4a7f", agent: "Email Drafter",   status: "done",    cost: "$0.018", duration: "3.4s" },
    { id: "run_6b2c", agent: "Research Agent",  status: "running", cost: "—",      duration: "—"    },
  ],
  activityFeed: [
    { color: C.green, message: "Research Agent completed run #347",      time: "just now" },
    { color: C.red,   message: "Data Extractor failed — timeout 800ms",  time: "2m ago"   },
    { color: C.accent,message: "New agent 'SQL Analyzer' created",       time: "14m ago"  },
    { color: C.amber, message: "Cost alert: 80% of monthly budget hit",  time: "1h ago"   },
    { color: C.green, message: "Code Reviewer completed 12 runs today",  time: "2h ago"   },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, icon, value, delta, trend, isCurrency }) {
  const [displayed, setDisplayed] = useState(value);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplayed(0);
    const dur = 900, step = 16;
    const inc = value / Math.ceil(dur / step);
    let cur   = 0;
    const t   = setInterval(() => {
      cur = Math.min(cur + inc, value);
      setDisplayed(cur);
      if (cur >= value) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [value]);

  const fmt = isCurrency
    ? `$${displayed.toFixed(2)}`
    : displayed >= 1_000_000
    ? `${(displayed / 1_000_000).toFixed(1)}M`
    : Math.round(displayed).toLocaleString();

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "14px 16px", cursor: "pointer", transition: "border-color .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: C.text, marginBottom: 4, fontFamily: C.mono }}>{fmt}</div>
      <div style={{ fontSize: 11, fontFamily: C.mono, color: trend === "up" ? C.green : C.red }}>{delta}</div>
    </div>
  );
}

const STATUS_BADGE = {
  done:    { bg: "rgba(16,185,129,.1)",  color: C.green,  border: "rgba(16,185,129,.2)",  label: "done"    },
  error:   { bg: "rgba(239,68,68,.1)",   color: C.red,    border: "rgba(239,68,68,.2)",   label: "error"   },
  running: { bg: "rgba(59,130,246,.1)",  color: C.blue,   border: "rgba(59,130,246,.2)",  label: "running" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.done;
  return (
    <span style={{
      fontSize: 10, padding: "2px 7px", borderRadius: 20, fontFamily: C.mono,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

// chartTooltip imported from theme/tokens

function RunsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="grad-runs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.accent} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={C.accent} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.04)" vertical={false}/>
        <XAxis dataKey="label" tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false} interval={3}/>
        <YAxis tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false}/>
        <Tooltip contentStyle={chartTooltip} labelStyle={{ color: C.muted }} itemStyle={{ color: C.accent2 }} cursor={{ stroke: C.border }}/>
        <Area type="monotone" dataKey="runs" stroke={C.accent} strokeWidth={1.5} fill="url(#grad-runs)" dot={false} activeDot={{ r: 3, fill: C.accent }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CostChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="grad-cost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.amber} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.04)" vertical={false}/>
        <XAxis dataKey="label" tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false} interval={3}/>
        <YAxis tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`}/>
        <Tooltip contentStyle={chartTooltip} labelStyle={{ color: C.muted }} itemStyle={{ color: C.amber }} formatter={v => [`$${v}`, "cost"]} cursor={{ stroke: C.border }}/>
        <Area type="monotone" dataKey="cost" stroke={C.amber} strokeWidth={1.5} fill="url(#grad-cost)" dot={false} activeDot={{ r: 3, fill: C.amber }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV = [
  { section: "Overview", items: [
    { label: "Dashboard",     icon: "🗂",  active: true  },
    { label: "Agents",        icon: "🤖",  active: false },
    { label: "Runs",          icon: "▶",   active: false },
  ]},
  { section: "Tools", items: [
    { label: "Tool registry", icon: "🔧",  active: false },
    { label: "Prompts",       icon: "📝",  active: false },
  ]},
  { section: "Analytics", items: [
    { label: "Cost tracker",  icon: "💰",  active: false },
    { label: "Alerts",        icon: "🔔",  active: false },
  ]},
];

function Sidebar({ activeItem, onNavigate }) {
  return (
    <div style={{ background: C.surface, borderRight: `1px solid ${C.border}`, padding: "16px 0", width: 180, flexShrink: 0 }}>
      {NAV.map(group => (
        <div key={group.section} style={{ padding: "0 12px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.muted2, letterSpacing: ".1em", textTransform: "uppercase", fontFamily: C.mono, padding: "0 8px", marginBottom: 6 }}>
            {group.section}
          </div>
          {group.items.map(item => (
            <div key={item.label}
              onClick={() => onNavigate && onNavigate(item.label)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 8px", borderRadius: 6, fontSize: 12,
                color: item.label === activeItem ? C.accent2 : C.muted,
                background: item.label === activeItem ? "rgba(99,102,241,.12)" : "transparent",
                cursor: "pointer", transition: "all .15s", marginBottom: 1,
              }}
              onMouseEnter={e => { if (item.label !== activeItem) { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.text; }}}
              onMouseLeave={e => { if (item.label !== activeItem) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}}
            >
              <span style={{ width: 16, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OverviewDashboard({ data = MOCK_DATA }) {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const { isMobile, isTablet } = useBreakpoint();
  const pad = responsivePadding(isMobile);
  const { kpis, runsChart, costChart, recentRuns, activityFeed, workspace } = data;

  const sectionLabel = { ...monoLabel, marginBottom: 4 };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: C.sans, borderRadius: 12, overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444","#f59e0b","#10b981"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>
          ))}
        </div>
        <span style={{ fontSize: 13, color: C.muted }}>AgentOS — Dashboard</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontFamily: C.mono }}>
            Last 30 days ▾
          </button>
          <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(99,102,241,.3)", background: "transparent", color: C.accent2, cursor: "pointer", fontFamily: C.mono }}>
            + New agent
          </button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: "flex", minHeight: isMobile ? "auto" : 580 }}>
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav}/>

        {/* Main */}
        <div style={{ flex: 1, padding: 24, overflow: "hidden" }}>

          {/* Page header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Overview</div>
            <div style={{ fontSize: 12, color: C.muted, fontFamily: C.mono, marginTop: 3 }}>
              All agents · workspace: {workspace}
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: grid.kpi(isMobile, isTablet), gap: 10, marginBottom: 20 }}>
            <KpiCard label="Active agents" icon="🤖" value={kpis.activeAgents.value}  delta={kpis.activeAgents.delta}  trend={kpis.activeAgents.trend}/>
            <KpiCard label="Runs today"    icon="▶"   value={kpis.runsToday.value}     delta={kpis.runsToday.delta}     trend={kpis.runsToday.trend}/>
            <KpiCard label="Tokens used"   icon="📊"  value={kpis.tokensUsed.value}    delta={kpis.tokensUsed.delta}    trend={kpis.tokensUsed.trend}/>
            <KpiCard label="Cost (month)"  icon="💰"  value={kpis.costMonth.value}     delta={kpis.costMonth.delta}     trend={kpis.costMonth.trend} isCurrency/>
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: grid.twoCol(isMobile, isTablet), gap: 12, marginBottom: 14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Runs per day</div>
              <div style={{ ...sectionLabel, marginBottom: 14 }}>Last 14 days</div>
              <RunsChart data={runsChart}/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Token cost</div>
              <div style={{ ...sectionLabel, marginBottom: 14 }}>Accumulated this month</div>
              <CostChart data={costChart}/>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: grid.twoCol(isMobile, isTablet), gap: 12 }}>

            {/* Recent runs table */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Recent runs</span>
                <span style={{ fontSize: 10, color: C.accent2, cursor: "pointer", fontFamily: C.mono }}>see all →</span>
              </div>
              {recentRuns.map(run => (
                <div key={run.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, width: 70 }}>{run.id}</span>
                  <span style={{ flex: 1 }}>{run.agent}</span>
                  <StatusBadge status={run.status}/>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, width: 42, textAlign: "right" }}>{run.cost}</span>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, width: 32, textAlign: "right" }}>{run.duration}</span>
                </div>
              ))}
            </div>

            {/* Activity feed */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Activity feed</span>
                <span style={{ fontSize: 10, color: C.green, fontFamily: C.mono }}>live ●</span>
              </div>
              {activityFeed.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: i < activityFeed.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, marginTop: 4, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>{item.message}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginTop: 2 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

