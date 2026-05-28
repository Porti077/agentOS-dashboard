"use client";
/**
 * ToolRegistry.jsx
 * AI Agent Management Dashboard — Tool Registry screen
 * Stack: React 19, Custom Design System
 *
 * Usage:
 *   import ToolRegistry from './ToolRegistry'
 *   <ToolRegistry tools={toolsData} onSave={handleSave} />
 *
 * Props:
 *   tools   — Tool[] (see MOCK_TOOLS)
 *   onSave  — (tool: Tool, config: object) => void
 */

import { useState, useMemo } from "react";
import { C, STATUS } from "./theme/tokens";
import { useBreakpoint } from "./theme/responsive";

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_TOOLS = [
  {
    id: "web_search", icon: "🔍", iconBg: "rgba(99,102,241,.15)",
    name: "web_search", type: "builtin",
    description: "Search the web for recent information using a configured search engine.",
    status: "connected", usagePct: 78, usageLabel: "2,341 calls",
    stats: { calls: 2341, errors: 12, errRate: "0.5%", avgLatency: "820ms", lastUsed: "2 min ago" },
    fields: [],
    config: {},
  },
  {
    id: "code_exec", icon: "💻", iconBg: "rgba(16,185,129,.15)",
    name: "code_exec", type: "builtin",
    description: "Execute Python and JavaScript snippets in an isolated sandbox.",
    status: "connected", usagePct: 54, usageLabel: "1,621 calls",
    stats: { calls: 1621, errors: 43, errRate: "2.6%", avgLatency: "1,240ms", lastUsed: "14 min ago" },
    fields: [],
    config: {},
  },
  {
    id: "email_sender", icon: "📧", iconBg: "rgba(245,158,11,.15)",
    name: "email_sender", type: "api",
    description: "Send transactional emails via SMTP or SendGrid API.",
    status: "error", usagePct: 22, usageLabel: "654 calls",
    stats: { calls: 654, errors: 89, errRate: "13.6%", avgLatency: "430ms", lastUsed: "1h ago" },
    fields: [
      { key: "apiKey",    label: "API Key",     type: "password", placeholder: "SG.xxxxxxxxxxxx" },
      { key: "fromEmail", label: "From email",  type: "text",     placeholder: "agent@yourdomain.com" },
      { key: "endpoint",  label: "SMTP host",   type: "text",     placeholder: "smtp.sendgrid.net" },
    ],
    config: { apiKey: "SG.••••••••", fromEmail: "agent@acme.io", endpoint: "smtp.sendgrid.net" },
  },
  {
    id: "sql_query", icon: "🗄", iconBg: "rgba(59,130,246,.15)",
    name: "sql_query", type: "api",
    description: "Run read-only SQL queries on a connected PostgreSQL or MySQL database.",
    status: "connected", usagePct: 35, usageLabel: "1,048 calls",
    stats: { calls: 1048, errors: 7, errRate: "0.7%", avgLatency: "95ms", lastUsed: "5 min ago" },
    fields: [
      { key: "endpoint", label: "Connection URL",   type: "text",     placeholder: "postgresql://user:pass@host:5432/db" },
      { key: "apiKey",   label: "Read-only token",  type: "password", placeholder: "readonly_user_token" },
    ],
    config: { endpoint: "db.acme.io:5432", apiKey: "••••••••" },
  },
  {
    id: "file_reader", icon: "📄", iconBg: "rgba(129,140,248,.15)",
    name: "file_reader", type: "builtin",
    description: "Read and parse uploaded files: PDF, DOCX, CSV, JSON, TXT.",
    status: "connected", usagePct: 41, usageLabel: "1,234 calls",
    stats: { calls: 1234, errors: 18, errRate: "1.5%", avgLatency: "340ms", lastUsed: "30 min ago" },
    fields: [],
    config: {},
  },
  {
    id: "slack_mcp", icon: "💬", iconBg: "rgba(74,144,226,.15)",
    name: "slack_mcp", type: "mcp",
    description: "Read channels, post messages, and search Slack history via MCP.",
    status: "disconnected", usagePct: 0, usageLabel: "0 calls",
    stats: { calls: 0, errors: 0, errRate: "—", avgLatency: "—", lastUsed: "never" },
    fields: [
      { key: "apiKey",   label: "Bot token",     type: "password", placeholder: "xoxb-xxxxxxxxxxxx" },
      { key: "endpoint", label: "Workspace URL", type: "text",     placeholder: "https://yourteam.slack.com" },
    ],
    config: {},
  },
  {
    id: "github_mcp", icon: "🐙", iconBg: "rgba(140,140,140,.15)",
    name: "github_mcp", type: "mcp",
    description: "Read repos, create issues, review PRs and search code via MCP.",
    status: "connected", usagePct: 29, usageLabel: "874 calls",
    stats: { calls: 874, errors: 4, errRate: "0.5%", avgLatency: "210ms", lastUsed: "22 min ago" },
    fields: [
      { key: "apiKey",   label: "Personal access token", type: "password", placeholder: "ghp_xxxxxxxxxxxx" },
      { key: "endpoint", label: "Default org/repo",      type: "text",     placeholder: "org/repo" },
    ],
    config: { apiKey: "ghp_••••••••", endpoint: "acme/main-repo" },
  },
  {
    id: "openapi_import", icon: "📥", iconBg: "rgba(16,185,129,.1)",
    name: "import_from_url", type: "api",
    description: "Import any REST API as a tool by pasting its OpenAPI spec URL.",
    status: "disconnected", usagePct: 0, usageLabel: "0 calls",
    stats: { calls: 0, errors: 0, errRate: "—", avgLatency: "—", lastUsed: "never" },
    fields: [
      { key: "endpoint", label: "OpenAPI spec URL",         type: "text",     placeholder: "https://api.example.com/openapi.json" },
      { key: "apiKey",   label: "Bearer token (optional)",  type: "password", placeholder: "Bearer xxxx" },
    ],
    config: {},
  },
];

// Status config imported from theme/tokens as STATUS

const FILTER_OPTIONS = ["all", "api", "mcp", "builtin"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolCard({ tool, selected, onClick }) {
  const s = STATUS[tool.status];
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "rgba(99,102,241,.04)" : C.surface,
        border: `1px solid ${selected ? C.accent : C.border}`,
        borderRadius: 10, padding: 14, cursor: "pointer",
        transition: "all .2s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = C.muted; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border; }}
    >
      {/* Top */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: tool.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {tool.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.text, fontFamily: C.mono }}>{tool.name}</div>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginTop: 2 }}>{tool.type}</div>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{tool.description}</div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }}/>
        <span style={{ fontSize: 10, fontFamily: C.mono, color: s.color }}>{s.label}</span>
        <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${tool.usagePct}%`, background: s.color, borderRadius: 2 }}/>
        </div>
        <span style={{ fontSize: 10, fontFamily: C.mono, color: C.muted2 }}>{tool.usageLabel}</span>
      </div>
    </div>
  );
}

function Modal({ tool, onClose, onSave }) {
  const [config,    setConfig]   = useState({ ...tool.config });
  const [saveState, setSaveState]= useState("idle"); // idle | saving | saved
  const [retryState,setRetry]    = useState("idle");
  const s = STATUS[tool.status];

  const handleSave = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      onSave(tool, config);
      setTimeout(onClose, 700);
    }, 800);
  };

  const handleRetry = () => {
    setRetry("testing");
    setTimeout(() => setRetry("done"), 1200);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 420, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{tool.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, fontFamily: C.mono }}>{tool.name}</div>
            <div style={{ fontSize: 10, color: s.color, marginTop: 2, fontFamily: C.mono }}>{tool.type} · {s.label}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>

          {/* Stats */}
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Usage stats</div>
            {[
              ["Total calls",  tool.stats.calls.toLocaleString()],
              ["Error rate",   tool.stats.errRate],
              ["Avg latency",  tool.stats.avgLatency],
              ["Last used",    tool.stats.lastUsed],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ fontFamily: C.mono, color: C.text }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Config fields */}
          {tool.fields.length > 0 ? (
            <>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>Configuration</div>
              {tool.fields.map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: C.mono, marginBottom: 5 }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={config[f.key] || ""}
                    onChange={e => setConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, fontFamily: C.mono, fontSize: 12, padding: "7px 10px", borderRadius: 7, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e  => e.target.style.borderColor = C.border}
                  />
                </div>
              ))}
            </>
          ) : (
            <div style={{ fontSize: 12, color: C.muted, fontFamily: C.mono, textAlign: "center", padding: "8px 0" }}>
              Built-in tool · no configuration required
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}>
            Close
          </button>

          {tool.status === "error" && (
            <button onClick={handleRetry} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: C.accent, color: "#fff", border: "none" }}>
              {retryState === "idle" ? "↺ Retry connection" : retryState === "testing" ? "⟳ Testing…" : "✓ Connected"}
            </button>
          )}

          {tool.fields.length > 0 && tool.status !== "error" && (
            <button onClick={handleSave} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, background: C.accent, color: "#fff", border: "none" }}>
              {saveState === "idle"   ? (tool.status === "disconnected" ? "⚡ Connect" : "💾 Save config") :
               saveState === "saving" ? "⟳ Saving…" : "✓ Saved!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolRegistry({ tools: initialTools = MOCK_TOOLS, onSave }) {
  const { isMobile } = useBreakpoint();
  const [tools,       setTools]      = useState(initialTools);
  const [filter,      setFilter]     = useState("all");
  const [search,      setSearch]     = useState("");
  const [selectedId,  setSelectedId] = useState(null);

  const filtered = useMemo(() => tools.filter(t => {
    const matchFilter = filter === "all" || t.type === filter;
    const matchSearch = !search || t.name.includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [tools, filter, search]);

  const selectedTool = tools.find(t => t.id === selectedId);
  const connectedCount = tools.filter(t => t.status === "connected").length;

  const handleSave = (tool, config) => {
    setTools(prev => prev.map(t => t.id === tool.id ? { ...t, status: "connected", config } : t));
    onSave?.(tool, config);
    setSelectedId(null);
  };

  return (
    <>
      <div style={{ background: C.bg, color: C.text, fontFamily: C.sans, borderRadius: 12, overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#ef4444","#f59e0b","#10b981"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>)}
          </div>
          <span style={{ fontSize: 12, color: C.muted }}>AgentOS — Tool Registry</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: C.mono, color: C.muted }}>
            {tools.length} tools · {connectedCount} connected
          </span>
        </div>

        {/* Main */}
        <div style={{ padding: 24 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>Tool Registry</div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: C.mono, marginTop: 3 }}>Manage tools available to your agents</div>
            </div>
            <input
              style={{ flex: 1, maxWidth: 260, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, color: C.text, fontFamily: C.mono, outline: "none" }}
              placeholder="🔍 Search tools…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border}
            />
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: 11, padding: "6px 12px", borderRadius: 7, cursor: "pointer",
                    fontFamily: C.mono, transition: "all .15s",
                    background: filter === f ? "rgba(99,102,241,.1)" : "transparent",
                    color:      filter === f ? C.accent2 : C.muted,
                    border:     `1px solid ${filter === f ? "rgba(99,102,241,.3)" : C.border}`,
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 160 : 230}px, 1fr))`, gap: 10 }}>
            {filtered.map(tool => (
              <ToolCard key={tool.id} tool={tool} selected={selectedId === tool.id} onClick={() => setSelectedId(tool.id)}/>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTool && (
        <Modal tool={selectedTool} onClose={() => setSelectedId(null)} onSave={handleSave}/>
      )}
    </>
  );
}
