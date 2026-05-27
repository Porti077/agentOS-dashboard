/**
 * ExecutionLog.jsx
 * AI Agent Management Dashboard — Execution Log screen
 * Stack: React 19, Custom Design System, no external graph lib needed
 *
 * Usage:
 *   import ExecutionLog from './ExecutionLog'
 *   <ExecutionLog run={runData} onExport={handleExport} />
 *
 * Props:
 *   run        — RunData object (see mock at bottom)
 *   onExport   — (log: RunData) => void
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { C, space } from "./theme/tokens";
import { useBreakpoint, grid } from "./theme/responsive";

// ─── Types ────────────────────────────────────────────────────────────────────

const NodeType = { LLM: "llm", TOOL: "tool", IO: "io" };
const NodeState = { IDLE: "idle", RUNNING: "running", DONE: "done", ERROR: "error" };

// ─── Mock data (replace with your API) ───────────────────────────────────────

const MOCK_RUN = {
  id: "run_7f3a2b91",
  agentName: "Research Agent",
  model: "claude-sonnet-4",
  task: 'Research LLM pricing 2026 and summarize key findings',
  nodes: [
    { id: "start", x: 180, y: 28,  w: 130, h: 38, label: "User input",   sub: "task received",   type: NodeType.IO  },
    { id: "plan",  x: 125, y: 108, w: 240, h: 46, label: "Planner",      sub: "decompose task",  type: NodeType.LLM },
    { id: "tool1", x: 30,  y: 210, w: 170, h: 46, label: "web_search",   sub: "tool call",       type: NodeType.TOOL},
    { id: "tool2", x: 290, y: 210, w: 170, h: 46, label: "code_exec",    sub: "tool call",       type: NodeType.TOOL},
    { id: "synth", x: 125, y: 312, w: 240, h: 46, label: "Synthesizer",  sub: "merge results",   type: NodeType.LLM },
    { id: "out",   x: 180, y: 410, w: 130, h: 38, label: "Output",       sub: "task complete",   type: NodeType.IO  },
  ],
  edges: [
    { from: "start", to: "plan",  points: [{ x: 245, y: 66 }, { x: 245, y: 108 }] },
    { from: "plan",  to: "tool1", points: [{ x: 195, y: 154}, { x: 115, y: 210 }] },
    { from: "plan",  to: "tool2", points: [{ x: 295, y: 154}, { x: 375, y: 210 }] },
    { from: "tool1", to: "synth", points: [{ x: 115, y: 256}, { x: 195, y: 312 }] },
    { from: "tool2", to: "synth", points: [{ x: 375, y: 256}, { x: 295, y: 312 }] },
    { from: "synth", to: "out",   points: [{ x: 245, y: 358}, { x: 245, y: 410 }] },
  ],
  steps: [
    { nodeId: "start", message: "Received task", detail: "Input tokens queued",                 tokens: { prompt: 120, completion: 0   }, durationMs: 400  },
    { nodeId: "plan",  message: "Planning",       detail: "Decomposed into 2 parallel calls",   tokens: { prompt: 340, completion: 180 }, durationMs: 1200 },
    { nodeId: "tool1", message: "web_search",     detail: 'Query: "LLM API pricing 2026"',      tokens: { prompt: 0,   completion: 0   }, durationMs: 900  },
    { nodeId: "tool2", message: "code_exec",      detail: "Parsing & ranking 8 results",        tokens: { prompt: 0,   completion: 0   }, durationMs: 700  },
    { nodeId: "synth", message: "Synthesizing",   detail: "Merging results into final report",  tokens: { prompt: 680, completion: 420 }, durationMs: 1400 },
    { nodeId: "out",   message: "Complete",       detail: "3 paragraphs, 412 words generated",  tokens: { prompt: 0,   completion: 0   }, durationMs: 300  },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NODE_STYLES = {
  [NodeType.LLM]:  { idle: "#1a1f35", active: "rgba(99,102,241,.35)",  done: "rgba(99,102,241,.18)",  border_idle: "#1e2330", border_active: "#6366f1", border_done: "#6366f1", text: "#818cf8" },
  [NodeType.TOOL]: { idle: "#1a2820", active: "rgba(16,185,129,.25)",  done: "rgba(16,185,129,.15)",  border_idle: "#1e2330", border_active: "#10b981", border_done: "#10b981", text: "#34d399" },
  [NodeType.IO]:   { idle: "#111318", active: "rgba(249,115,22,.2)",   done: "rgba(249,115,22,.12)",  border_idle: "#1e2330", border_active: "#f97316", border_done: "#f97316", text: "#6b7280" },
};

function edgePath(e) {
  const [p1, p2] = e.points;
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  return `M${p1.x} ${p1.y} C${p1.x} ${my} ${p2.x} ${my} ${p2.x} ${p2.y}`;
}

function calcCost(prompt, completion) {
  return ((prompt * 0.000003) + (completion * 0.000015)).toFixed(4);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NodeEl({ node, state, onClick }) {
  const s = NODE_STYLES[node.type];
  const bg      = state === NodeState.RUNNING ? s.active : state === NodeState.DONE ? s.done : s.idle;
  const border  = state === NodeState.RUNNING ? s.border_active : state === NodeState.DONE ? s.border_done : s.border_idle;
  const sw      = state === NodeState.RUNNING ? 1.5 : 1;

  return (
    <g style={{ cursor: "pointer" }} onClick={() => onClick(node)}>
      {state === NodeState.RUNNING && (
        <circle
          cx={node.x + node.w / 2} cy={node.y + node.h / 2}
          r={Math.max(node.w, node.h) / 2 + 6}
          fill="none" stroke={s.border_active} strokeWidth="1" opacity="0.3"
        />
      )}
      <rect
        x={node.x} y={node.y} width={node.w} height={node.h} rx={8}
        fill={bg} stroke={border} strokeWidth={sw}
        style={{ transition: "fill .3s, stroke .3s" }}
      />
      <text
        x={node.x + node.w / 2}
        y={node.y + node.h / 2 - (node.sub ? 8 : 0)}
        textAnchor="middle" dominantBaseline="central"
        fill={s.text} fontSize={12}
        fontFamily="'Courier New', monospace" fontWeight={500}
      >{node.label}</text>
      {node.sub && (
        <text
          x={node.x + node.w / 2} y={node.y + node.h / 2 + 9}
          textAnchor="middle" dominantBaseline="central"
          fill={s.text} fontSize={9} opacity={0.55}
          fontFamily="'Courier New', monospace"
        >{node.sub}</text>
      )}
    </g>
  );
}

function EdgeEl({ edge, state }) {
  const colors = { idle: "#1e2330", active: "#6366f1", done: "#6366f1" };
  const color  = colors[state] || colors.idle;
  const isDone   = state === NodeState.DONE;
  const isActive = state === NodeState.RUNNING;

  return (
    <>
      <defs>
        <marker id={`arr-${state}`} viewBox="0 0 8 8" refX={6} refY={4} markerWidth={5} markerHeight={5} orient="auto">
          <path d="M1 1L7 4L1 7" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>
      <path
        d={edgePath(edge)}
        fill="none" stroke={color} strokeWidth={1.5}
        strokeDasharray={isActive ? "4 4" : "none"}
        markerEnd={`url(#arr-${state})`}
        style={{ transition: "stroke .3s" }}
      />
    </>
  );
}

function LogEntry({ msg, type }) {
  const colors = { active: "#818cf8", done: "#10b981", error: "#ef4444", idle: "#4b5563" };
  const borders = { active: "#6366f1", done: "rgba(16,185,129,.3)", error: "#ef4444", idle: "transparent" };
  return (
    <div style={{
      fontSize: 11, fontFamily: "'Courier New', monospace", color: colors[type] || colors.idle,
      borderLeft: `2px solid ${borders[type] || borders.idle}`, paddingLeft: 8,
      lineHeight: 1.5, padding: "2px 0 2px 8px",
    }}>
      {">"} {msg.length > 38 ? msg.slice(0, 38) + "…" : msg}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExecutionLog({ run = MOCK_RUN, onExport }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [nodeStates, setNodeStates] = useState({});
  const [edgeStates, setEdgeStates] = useState({});
  const [logs, setLogs]             = useState([]);
  const [tokens, setTokens]         = useState({ prompt: 0, completion: 0 });
  const [elapsed, setElapsed]       = useState(0);
  const [stepsComplete, setSteps]   = useState(0);
  const [status, setStatus]         = useState("idle"); // idle | running | done
  const [selected, setSelected]     = useState(null);

  const timerRef  = useRef(null);
  const startRef  = useRef(null);
  const stepQueue = useRef([]);

  const resetAll = useCallback(() => {
    clearInterval(timerRef.current);
    setNodeStates({});
    setEdgeStates({});
    setLogs([]);
    setTokens({ prompt: 0, completion: 0 });
    setElapsed(0);
    setSteps(0);
    setStatus("idle");
    setSelected(null);
    stepQueue.current = [];
  }, []);

  const addLog = (msg, type) => setLogs(prev => [...prev.slice(-7), { msg, type }]);

  const activateEdgesTo = (nodeId, state) => {
    setEdgeStates(prev => {
      const next = { ...prev };
      run.edges.filter(e => e.to === nodeId).forEach(e => {
        next[`${e.from}-${e.to}`] = state;
      });
      return next;
    });
  };

  const executeStep = useCallback((steps, idx, tokAcc) => {
    if (idx >= steps.length) {
      clearInterval(timerRef.current);
      setStatus("done");
      return;
    }
    const step = steps[idx];

    setNodeStates(prev => ({ ...prev, [step.nodeId]: NodeState.RUNNING }));
    activateEdgesTo(step.nodeId, NodeState.RUNNING);
    addLog(step.message + " — " + step.detail, "active");

    setTimeout(() => {
      setNodeStates(prev => ({ ...prev, [step.nodeId]: NodeState.DONE }));
      activateEdgesTo(step.nodeId, NodeState.DONE);
      addLog(step.message, "done");

      const newAcc = {
        prompt:     tokAcc.prompt + step.tokens.prompt,
        completion: tokAcc.completion + step.tokens.completion,
      };
      setTokens(newAcc);
      setSteps(idx + 1);

      executeStep(steps, idx + 1, newAcc);
    }, step.durationMs);
  }, [run]);

  const startRun = useCallback(() => {
    if (status === "running") return;
    resetAll();
    setStatus("running");
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - startRef.current) / 1000).toFixed(1));
    }, 100);
    setTimeout(() => executeStep(run.steps, 0, { prompt: 0, completion: 0 }), 50);
  }, [status, resetAll, executeStep, run]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const cost = calcCost(tokens.prompt, tokens.completion);
  const tokenPct = Math.min(100, Math.round((tokens.prompt + tokens.completion) / 20));
  const isDone    = status === "done";
  const isRunning = status === "running";

  // ── Colors from theme/tokens (imported at top)
  const panelLabel = { fontSize: 10, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8, fontFamily: C.mono };
  const metricRow  = { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 };
  const metricKey  = { fontSize: 12, color: C.muted };
  const metricVal  = { fontSize: 13, color: C.text, fontFamily: C.mono };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Georgia', serif", borderRadius: 12, overflow: "hidden", minHeight: 600 }}>

      {/* Top bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ef4444","#f59e0b","#10b981"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>)}
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>{run.agentName} — Execution Log</span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginLeft: 4 }}>{run.id}</span>
        <span style={{
          marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 20,
          fontFamily: C.mono, letterSpacing: ".03em",
          background: isDone ? "rgba(16,185,129,.12)" : "rgba(99,102,241,.15)",
          color: isDone ? C.green : "#818cf8",
          border: `1px solid ${isDone ? "rgba(16,185,129,.25)" : "rgba(99,102,241,.3)"}`,
        }}>
          {isDone ? "✓ completed" : isRunning ? "● running" : "○ idle"}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", minHeight: isMobile ? "auto" : 530 }}>

        {/* Graph */}
        <div style={{ borderRight: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ ...panelLabel, marginBottom: 16 }}>Execution graph</div>
          <svg width="100%" viewBox="0 0 490 470" style={{ overflow: "visible" }}>
            <defs>
              <marker id="arr-idle"    viewBox="0 0 8 8" refX={6} refY={4} markerWidth={5} markerHeight={5} orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#1e2330"  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker>
              <marker id="arr-running" viewBox="0 0 8 8" refX={6} refY={4} markerWidth={5} markerHeight={5} orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#6366f1"  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker>
              <marker id="arr-done"    viewBox="0 0 8 8" refX={6} refY={4} markerWidth={5} markerHeight={5} orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#10b981"  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker>
            </defs>

            {/* Edges */}
            {run.edges.map(e => {
              const key   = `${e.from}-${e.to}`;
              const state = edgeStates[key] || NodeState.IDLE;
              const edgeColors = { idle: "#1e2330", running: "#6366f1", done: "#6366f1" };
              const color = edgeColors[state] || edgeColors.idle;
              const isAct = state === NodeState.RUNNING;
              return (
                <path key={key} d={edgePath(e)} fill="none" stroke={color} strokeWidth={1.5}
                  strokeDasharray={isAct ? "4 4" : undefined}
                  markerEnd={`url(#arr-${state === NodeState.RUNNING ? "running" : state === NodeState.DONE ? "done" : "idle"})`}
                  style={{ transition: "stroke .3s" }}
                />
              );
            })}

            {/* Nodes */}
            {run.nodes.map(n => (
              <NodeEl key={n.id} node={n} state={nodeStates[n.id] || NodeState.IDLE} onClick={setSelected}/>
            ))}
          </svg>
        </div>

        {/* Side panel */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Tokens */}
          <div style={{ paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={panelLabel}>Token usage</div>
            <div style={metricRow}><span style={metricKey}>prompt</span><span style={metricVal}>{tokens.prompt.toLocaleString()}</span></div>
            <div style={metricRow}><span style={metricKey}>completion</span><span style={{ ...metricVal, color: C.green }}>{tokens.completion.toLocaleString()}</span></div>
            <div style={{ height: 4, background: C.border, borderRadius: 2, margin: "8px 0 4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${tokenPct}%`, background: C.accent, borderRadius: 2, transition: "width 1s ease" }}/>
            </div>
            <div style={metricRow}><span style={metricKey}>est. cost</span><span style={{ ...metricVal, color: C.amber }}>${cost}</span></div>
          </div>

          {/* Timing */}
          <div style={{ paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={panelLabel}>Timing</div>
            <div style={metricRow}><span style={metricKey}>elapsed</span><span style={metricVal}>{elapsed}s</span></div>
            <div style={metricRow}><span style={metricKey}>steps done</span><span style={{ ...metricVal, color: C.green }}>{stepsComplete} / {run.steps.length}</span></div>
            <div style={metricRow}><span style={metricKey}>model</span><span style={{ ...metricVal, fontSize: 11 }}>{run.model}</span></div>
          </div>

          {/* Live log */}
          <div style={{ flex: 1, marginBottom: 10 }}>
            <div style={panelLabel}>Live log</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {logs.map((l, i) => <LogEntry key={i} msg={l.msg} type={l.type}/>)}
              {logs.length === 0 && <span style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>_ waiting for run…</span>}
            </div>
          </div>

          {/* Selected node info */}
          {selected && (
            <div style={{ background: "#181b22", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: C.mono, color: C.muted, lineHeight: 1.8 }}>
              <div style={{ color: C.text, fontSize: 12, marginBottom: 4 }}>{selected.label}</div>
              <span style={{ color: "#818cf8" }}>type:</span> {selected.type}<br/>
              <span style={{ color: "#818cf8" }}>id:</span> node_{selected.id}<br/>
              <span style={{ color: "#818cf8" }}>state:</span> {nodeStates[selected.id] || "idle"}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={isDone ? undefined : startRun}
          disabled={isDone}
          style={{
            fontSize: 12, padding: "6px 14px", borderRadius: 6, cursor: isDone ? "default" : "pointer",
            fontFamily: C.mono, border: "none", background: C.accent, color: "#fff",
            opacity: isDone ? .6 : 1, transition: "opacity .15s",
          }}
        >
          {isDone ? "✓ Done" : isRunning ? "● Running…" : "▶ Run agent"}
        </button>
        <button
          onClick={resetAll}
          style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: C.mono, border: `1px solid ${C.border}`, background: "transparent", color: C.muted }}
        >
          ↺ Reset
        </button>
        {onExport && (
          <button
            onClick={() => onExport(run)}
            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: C.mono, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, marginLeft: "auto" }}
          >
            Export JSON
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Dev preview (remove before submitting to ThemeForest) ───────────────────
// export function DevPreview() { return <ExecutionLog />; }
