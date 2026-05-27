/**
 * CostTracker.jsx
 * AI Agent Management Dashboard — Cost Tracker screen
 * Stack: React 19, Recharts, Custom Design System
 *
 * Usage:
 *   import CostTracker from './CostTracker'
 *   <CostTracker data={costData} budget={budgetConfig} onBudgetSave={handleBudgetSave} />
 *
 * Props:
 *   data           — CostData object (see MOCK_DATA)
 *   budget         — { limit: number, alertPct: number }
 *   onBudgetSave   — (budget: { limit, alertPct }) => void
 */

import { useState, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { C, cardStyle, chartTooltip } from "./theme/tokens";
import { useBreakpoint, grid } from "./theme/responsive";

// ─── Mock data ────────────────────────────────────────────────────────────────

const buildDays = (n) => Array.from({ length: n }, (_, i) => {
  const d = new Date("2026-05-22");
  d.setDate(d.getDate() - (n - 1) + i);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

const COST_30 = [0.6,1.2,1.9,2.8,3.4,4.1,5.2,6.0,6.8,7.9,9.1,10.0,11.2,12.4,13.8,15.1,16.6,18.2,19.8,21.5,23.4,25.6,28.1,30.4,32.9,35.5,37.2,38.8,40.1,41.2];
const DAYS_30  = buildDays(30);

export const MOCK_DATA = {
  kpis: {
    monthToDate:  { value: 41.20, budget: 50.00 },
    today:        { value: 2.84,  delta: -12, deltaLabel: "↓ 12% vs yesterday"  },
    totalTokens:  { value: "12.4M",            label: "prompt + completion"     },
    avgCostPerRun:{ value: 0.019,               prevMonth: 0.024                },
  },
  dailyCost: DAYS_30.map((label, i) => ({
    label,
    actual:       COST_30[i],
    budgetPace:   parseFloat(((i + 1) / 30 * 50).toFixed(2)),
  })),
  byModel: [
    { name: "claude-sonnet-4", color: C.accent2, tokens: "5.2M", pct: 65, cost: 26.80 },
    { name: "gpt-4o",          color: C.green,   tokens: "2.1M", pct: 26, cost: 10.50 },
    { name: "gemini-2.0-flash",color: C.blue,    tokens: "0.8M", pct: 9,  cost:  3.90 },
  ],
  byAgent: [
    { name: "Research Agent", color: C.accent2, pct: 48, cost: 19.80 },
    { name: "Code Reviewer",  color: C.green,   pct: 28, cost: 11.50 },
    { name: "Email Drafter",  color: C.amber,   pct: 14, cost:  5.80 },
    { name: "SQL Analyzer",   color: C.blue,    pct: 10, cost:  4.10 },
  ],
};

export const DEFAULT_BUDGET = { limit: 50, alertPct: 80 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exportToCSV(data, range) {
  const slice = data.dailyCost.slice(-range);
  const rows  = [
    ["Date", "Actual Cost ($)", "Budget Pace ($)"],
    ...slice.map(d => [d.label, d.actual, d.budgetPace]),
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const a   = document.createElement("a");
  a.href    = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "cost_tracker.csv";
  a.click();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, children, subColor }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

// tooltipStyle → use chartTooltip from theme/tokens

function CostAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="grad-actual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={C.amber} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.03)" vertical={false}/>
        <XAxis dataKey="label" tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 6)}/>
        <YAxis tick={{ fill: C.muted2, fontSize: 9, fontFamily: C.mono }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`}/>
        <Tooltip contentStyle={chartTooltip} labelStyle={{ color: C.muted }} formatter={(v, name) => [`$${v.toFixed(2)}`, name]}/>
        <Area  type="monotone" dataKey="actual"     name="Actual"      stroke={C.amber}               strokeWidth={1.5} fill="url(#grad-actual)" dot={false} activeDot={{ r: 3 }}/>
        <Line  type="monotone" dataKey="budgetPace" name="Budget pace" stroke="rgba(99,102,241,.45)"  strokeWidth={1}   strokeDasharray="4 4"    dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BudgetDonut({ spent, total }) {
  const pct  = Math.min(100, Math.round((spent / total) * 100));
  const data = [{ value: spent }, { value: Math.max(0, total - spent) }];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <PieChart width={130} height={130}>
        <Pie data={data} cx={60} cy={60} innerRadius={46} outerRadius={60} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
          <Cell fill={C.amber}/>
          <Cell fill="rgba(255,255,255,.06)"/>
        </Pie>
      </PieChart>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 500, fontFamily: C.mono, color: C.amber }}>{pct}%</div>
        <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>${spent.toFixed(2)} / ${total.toFixed(2)}</div>
      </div>
    </div>
  );
}

function BreakdownTable({ rows, columns }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: columns.map(c => c.width || "1fr").join(" "), gap: 8, marginBottom: 4 }}>
        {columns.map(c => (
          <div key={c.key} style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".06em", textTransform: "uppercase", textAlign: c.align || "left" }}>{c.label}</div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: columns.map(c => c.width || "1fr").join(" "), gap: 8, alignItems: "center", padding: "7px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
          {columns.map(col => (
            <div key={col.key} style={{ textAlign: col.align || "left" }}>
              {col.render ? col.render(row) : <span style={{ fontSize: 12, fontFamily: col.mono ? C.mono : C.sans, color: C.text }}>{row[col.key]}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BudgetModal({ budget, onSave, onClose }) {
  const [limit,    setLimit]    = useState(budget.limit);
  const [alertPct, setAlertPct] = useState(budget.alertPct);
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 320, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Set monthly budget</div>
        {[
          { label: "Budget limit (USD)", value: limit,    set: setLimit,    min: 1 },
          { label: "Alert at (%)",       value: alertPct, set: setAlertPct, min: 1, max: 100 },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: C.mono, marginBottom: 5 }}>{f.label}</label>
            <input
              type="number" value={f.value} min={f.min} max={f.max}
              onChange={e => f.set(parseFloat(e.target.value))}
              style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: 14, padding: "8px 10px", borderRadius: 7, outline: "none" }}
            />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}>Cancel</button>
          <button onClick={() => { onSave({ limit, alertPct }); onClose(); }} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: C.accent, color: "#fff", border: "none" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CostTracker({ data = MOCK_DATA, budget: initialBudget = DEFAULT_BUDGET, onBudgetSave }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [range,        setRange]       = useState(14);
  const [budget,       setBudget]      = useState(initialBudget);
  const [showModal,    setShowModal]   = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const chartData = useMemo(() => data.dailyCost.slice(-range), [data, range]);
  const spent     = data.kpis.monthToDate.value;
  const usagePct  = Math.round((spent / budget.limit) * 100);
  const showAlert = !alertDismissed && usagePct >= budget.alertPct;

  const handleBudgetSave = (b) => {
    setBudget(b);
    setAlertDismissed(false);
    onBudgetSave?.(b);
  };

  const cardStyle  = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 };
  const rangeBtns  = [7, 14, 30];

  // Columns for model table
  const modelCols = [
    { key: "name",   label: "Model",  width: "1fr",    render: r => <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }}/><span style={{ fontSize: 12, fontFamily: C.mono }}>{r.name}</span></div> },
    { key: "tokens", label: "Tokens", width: "auto",   align: "right", mono: true },
    { key: "bar",    label: "",       width: "60px",   render: r => <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 2 }}/></div> },
    { key: "cost",   label: "Cost",   width: "auto",   align: "right", render: r => <span style={{ fontSize: 12, fontFamily: C.mono }}>${r.cost.toFixed(2)}</span> },
  ];

  const agentCols = [
    { key: "name",  label: "Agent", width: "1fr",  render: r => <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }}/><span style={{ fontSize: 12 }}>{r.name}</span></div> },
    { key: "bar",   label: "",      width: "60px", render: r => <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 2 }}/></div> },
    { key: "cost",  label: "Cost",  width: "auto", align: "right", render: r => <span style={{ fontSize: 12, fontFamily: C.mono }}>${r.cost.toFixed(2)}</span> },
  ];

  return (
    <>
      <div style={{ background: C.bg, color: C.text, fontFamily: C.sans, borderRadius: 12, overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#ef4444","#f59e0b","#10b981"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>)}
          </div>
          <span style={{ fontSize: 12, color: C.muted }}>AgentOS — Cost Tracker</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {rangeBtns.map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 7, cursor: "pointer",
                fontFamily: C.mono, background: "transparent", transition: "all .15s",
                color:  range === r ? C.accent2 : C.muted,
                border: `1px solid ${range === r ? "rgba(99,102,241,.3)" : C.border}`,
              }}>{r}d</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 24 }}>

          {/* Budget alert */}
          {showAlert && (
            <div style={{ background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 12 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <span style={{ color: C.amber, fontWeight: 500 }}>Budget alert</span>
                <span style={{ color: C.muted, marginLeft: 6 }}>
                  You've used <strong style={{ color: C.amber }}>{usagePct}%</strong> of your monthly budget of <strong style={{ color: C.text }}>${budget.limit.toFixed(2)}</strong>
                </span>
              </div>
              <button onClick={() => setAlertDismissed(true)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: grid.kpi(isMobile, isTablet), gap: 10, marginBottom: 20 }}>
            <KpiCard label="Month to date">
              <div style={{ fontSize: 22, fontWeight: 500, fontFamily: C.mono, color: C.amber, marginBottom: 3 }}>${data.kpis.monthToDate.value.toFixed(2)}</div>
              <div style={{ fontSize: 11, fontFamily: C.mono, color: C.muted }}>of ${data.kpis.monthToDate.budget.toFixed(2)} budget</div>
            </KpiCard>
            <KpiCard label="Today">
              <div style={{ fontSize: 22, fontWeight: 500, fontFamily: C.mono, marginBottom: 3 }}>${data.kpis.today.value.toFixed(2)}</div>
              <div style={{ fontSize: 11, fontFamily: C.mono, color: C.green }}>{data.kpis.today.deltaLabel}</div>
            </KpiCard>
            <KpiCard label="Total tokens">
              <div style={{ fontSize: 22, fontWeight: 500, fontFamily: C.mono, marginBottom: 3 }}>{data.kpis.totalTokens.value}</div>
              <div style={{ fontSize: 11, fontFamily: C.mono, color: C.muted }}>{data.kpis.totalTokens.label}</div>
            </KpiCard>
            <KpiCard label="Avg cost / run">
              <div style={{ fontSize: 22, fontWeight: 500, fontFamily: C.mono, marginBottom: 3 }}>${data.kpis.avgCostPerRun.value.toFixed(3)}</div>
              <div style={{ fontSize: 11, fontFamily: C.mono, color: C.green }}>↓ vs ${data.kpis.avgCostPerRun.prevMonth} last month</div>
            </KpiCard>
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: grid.chartSide(isMobile, isTablet), gap: 12, marginBottom: 14 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Accumulated cost</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 14 }}>Last {range} days vs budget</div>
              <CostAreaChart data={chartData}/>
            </div>
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Budget usage</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 8 }}>May 2026</div>
              <BudgetDonut spent={spent} total={budget.limit}/>
            </div>
          </div>

          {/* Bottom tables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Cost by model</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 14 }}>This month</div>
              <BreakdownTable rows={data.byModel} columns={modelCols}/>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Cost by agent</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 14 }}>This month</div>
              <BreakdownTable rows={data.byAgent} columns={agentCols}/>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", gap: 8, padding: "12px 20px", background: C.surface, borderTop: `1px solid ${C.border}`, alignItems: "center" }}>
          <button onClick={() => exportToCSV(data, range)} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: C.accent, color: "#fff", border: "none" }}>
            ⬇ Export CSV
          </button>
          <button onClick={() => setShowModal(true)} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}>
            ⚙ Set budget
          </button>
          <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted, fontFamily: C.mono }}>Last updated: just now</span>
        </div>
      </div>

      {showModal && <BudgetModal budget={budget} onSave={handleBudgetSave} onClose={() => setShowModal(false)}/>}
    </>
  );
}
