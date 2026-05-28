"use client";
/**
 * AgentBuilder.jsx
 * AI Agent Management Dashboard — Agent Builder screen
 * Stack: React 19, Custom Design System
 *
 * Usage:
 *   import AgentBuilder from './AgentBuilder'
 *   <AgentBuilder agent={agentData} onSave={handleSave} onDeploy={handleDeploy} />
 *
 * Props:
 *   agent     — AgentConfig object (see MOCK_AGENT)
 *   onSave    — (config: AgentConfig) => void
 *   onDeploy  — (config: AgentConfig) => void
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { C, inputStyle } from "./theme/tokens";
import { useBreakpoint, grid } from "./theme/responsive";

// ─── Mock data ────────────────────────────────────────────────────────────────

export const AVAILABLE_MODELS = [
  { id: "claude-sonnet", name: "claude-sonnet-4", provider: "Anthropic", ctx: "200k ctx" },
  { id: "gpt4o",         name: "gpt-4o",          provider: "OpenAI",    ctx: "128k ctx" },
  { id: "gemini",        name: "gemini-2.0-flash", provider: "Google",   ctx: "1M ctx"   },
  { id: "llama",         name: "llama-3.3-70b",    provider: "Meta",     ctx: "128k ctx" },
];

export const AVAILABLE_TOOLS = [
  { id: "web_search",   icon: "🔍", name: "web_search",   description: "Search the web for recent info"          },
  { id: "code_exec",    icon: "💻", name: "code_exec",    description: "Execute Python/JS snippets"               },
  { id: "file_reader",  icon: "📄", name: "file_reader",  description: "Read and parse uploaded documents"        },
  { id: "email_sender", icon: "📧", name: "email_sender", description: "Send emails via configured SMTP"          },
  { id: "sql_query",    icon: "🗄", name: "sql_query",    description: "Run read-only queries on connected DB"    },
];

export const MOCK_AGENT = {
  id:           "agent_7f3a",
  name:         "Research Agent",
  description:  "Researches topics and returns structured summaries",
  systemPrompt: `You are a research assistant. When given a topic, you:\n1. Search for recent, reliable information\n2. Identify the 3–5 most important points\n3. Return a structured summary with sources\n\nAlways cite your sources. Be concise and factual.`,
  modelId:      "claude-sonnet",
  temperature:  0.3,
  maxTokens:    1024,
  enabledTools: ["web_search", "code_exec"],
  versions: [
    { v: "v3", note: "Improved search instructions", time: "just now",  current: true  },
    { v: "v2", note: "Added code_exec tool",          time: "2h ago",    current: false },
    { v: "v1", note: "Initial version",               time: "yesterday", current: false },
  ],
};

// Fake responses for playground demo — replace with real API call
const PLAYGROUND_RESPONSES = [
  "Based on my research, here are the key findings:\n\n1. AI agents are increasingly used for autonomous task execution\n2. Multi-agent orchestration is the dominant pattern in 2026\n3. Cost per task has dropped ~60% vs 2024\n\nSources: TechCrunch, Anthropic blog, a16z State of AI 2026",
  "I searched for recent information on this topic. The main trends:\n\n• Tool use has become standard in production LLMs\n• Latency improvements make real-time agents viable\n• Enterprise adoption grew 3x in 12 months\n\nWould you like me to dig deeper into any of these?",
  "Here's a structured summary:\n\nKey points:\n- The market is consolidating around 3–4 major providers\n- Open-source models are now competitive with proprietary ones\n- Regulatory frameworks are emerging in EU and US\n\nEstimated confidence: high (multiple corroborating sources)",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: C.mono, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: C.muted, fontFamily: C.mono, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}


function ModelCard({ model, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: selected ? "rgba(99,102,241,.08)" : C.surface2,
        border: `1px solid ${selected ? C.accent : C.border}`,
        borderRadius: 8, padding: "10px 12px", cursor: "pointer",
        transition: "all .15s",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: C.mono }}>{model.name}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{model.provider}</div>
      <div style={{ fontSize: 10, fontFamily: C.mono, color: C.muted2, marginTop: 4 }}>{model.ctx}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 32, height: 18, borderRadius: 9, flexShrink: 0,
        background: on ? C.accent : C.border, cursor: "pointer",
        position: "relative", transition: "background .2s",
      }}
    >
      <div style={{
        width: 12, height: 12, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: on ? 17 : 3,
        transition: "left .2s",
      }}/>
    </div>
  );
}

function ToolRow({ tool, enabled, onToggle }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: 7,
        marginBottom: 6, cursor: "pointer", transition: "border-color .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.muted}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{tool.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: C.text }}>{tool.name}</div>
        <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginTop: 1 }}>{tool.description}</div>
      </div>
      <Toggle on={enabled} onChange={onToggle}/>
    </div>
  );
}

function ChatMessage({ role, content }) {
  const isUser    = role === "user";
  const isThinking = role === "thinking";
  return (
    <div style={{
      maxWidth: "85%", padding: "8px 11px", borderRadius: 8,
      fontSize: 12, lineHeight: 1.5, alignSelf: isUser ? "flex-end" : "flex-start",
      background:   isThinking ? "transparent" : isUser ? "rgba(99,102,241,.15)" : C.surface,
      border:       isThinking ? "none" : `1px solid ${isUser ? "rgba(99,102,241,.2)" : C.border}`,
      color:        isThinking ? C.muted : C.text,
      fontStyle:    isThinking ? "italic" : "normal",
      fontFamily:   isThinking ? C.mono : C.sans,
      borderBottomRightRadius: isUser ? 2 : 8,
      borderBottomLeftRadius:  isUser ? 8 : 2,
      whiteSpace: "pre-wrap",
    }}>
      {content}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AgentBuilder({ agent = MOCK_AGENT, onSave, onDeploy }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [name,         setName]        = useState(agent.name);
  const [description,  setDescription] = useState(agent.description);
  const [systemPrompt, setSystemPrompt]= useState(agent.systemPrompt);
  const [modelId,      setModelId]     = useState(agent.modelId);
  const [temperature,  setTemperature] = useState(agent.temperature);
  const [maxTokens,    setMaxTokens]   = useState(agent.maxTokens);
  const [enabledTools, setEnabledTools]= useState(new Set(agent.enabledTools));
  const [saveStatus,   setSaveStatus]  = useState("saved"); // saved | unsaved | saving

  // Playground state
  const [messages,    setMessages]  = useState([{ role: "agent", content: "👋 Ready. Send a message to test the agent with the current configuration." }]);
  const [pgInput,     setPgInput]   = useState("");
  const [pgStatus,    setPgStatus]  = useState("ready"); // ready | thinking
  const [stats,       setStats]     = useState({ latency: null, tokens: 0, cost: 0 });
  const chatRef      = useRef(null);
  const responseIdx  = useRef(0);

  // Token count estimate
  const tokenCount = Math.round(systemPrompt.length / 4);
  const tokenColor = tokenCount > 600 ? C.red : tokenCount > 300 ? C.amber : C.green;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const toggleTool = useCallback((toolId) => {
    setEnabledTools(prev => {
      const next = new Set(prev);
      next.has(toolId) ? next.delete(toolId) : next.add(toolId);
      return next;
    });
    setSaveStatus("unsaved");
  }, []);

  const sendMessage = useCallback(async () => {
    if (!pgInput.trim() || pgStatus === "thinking") return;
    const userMsg = pgInput.trim();
    setPgInput("");
    setPgStatus("thinking");
    setMessages(prev => [...prev, { role: "user", content: userMsg }, { role: "thinking", content: "⟳ Thinking…" }]);

    const start = Date.now();
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const latency = ((Date.now() - start) / 1000).toFixed(1);
    const tokens  = 180 + Math.floor(Math.random() * 220);

    setMessages(prev => [
      ...prev.filter(m => m.role !== "thinking"),
      { role: "agent", content: PLAYGROUND_RESPONSES[responseIdx.current % PLAYGROUND_RESPONSES.length] },
    ]);
    responseIdx.current++;

    setStats(prev => ({
      latency,
      tokens:  prev.tokens + tokens,
      cost:    prev.cost + tokens * 0.000015,
    }));
    setPgStatus("ready");
  }, [pgInput, pgStatus]);

  const handleSave = () => {
    setSaveStatus("saving");
    const config = { name, description, systemPrompt, modelId, temperature, maxTokens, enabledTools: [...enabledTools] };
    setTimeout(() => {
      setSaveStatus("saved");
      onSave?.(config);
    }, 800);
  };

  const handleDeploy = () => {
    const config = { name, description, systemPrompt, modelId, temperature, maxTokens, enabledTools: [...enabledTools] };
    onDeploy?.(config);
  };

  const statusLabel = { saved: { text: "✓ saved", color: C.green }, unsaved: { text: "● unsaved", color: C.amber }, saving: { text: "⟳ saving…", color: C.muted } }[saveStatus];

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: C.sans, borderRadius: 12, overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444","#f59e0b","#10b981"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>AgentOS — Agent Builder</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: C.mono, color: statusLabel.color }}>{statusLabel.text}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {agent.versions.map(v => (
              <span key={v.v} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20, fontFamily: C.mono, cursor: "pointer",
                border: `1px solid ${v.current ? C.accent : C.border}`,
                color:       v.current ? C.accent2 : C.muted,
                background:  v.current ? "rgba(99,102,241,.08)" : "transparent",
              }}>{v.v}{v.current ? " (current)" : ""}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: grid.twoCol(isMobile, isTablet), minHeight: isMobile ? "auto" : 600 }}>

        {/* LEFT — Config */}
        <div style={{ padding: 24, borderRight: `1px solid ${C.border}`, overflowY: "auto", maxHeight: 600 }}>

          <div style={{ marginBottom: 22 }}>
            <SectionLabel>🤖 Identity</SectionLabel>
            <Field label="Agent name">
              <input style={inputStyle} value={name} onChange={e => { setName(e.target.value); setSaveStatus("unsaved"); }}/>
            </Field>
            <Field label="Description">
              <input style={inputStyle} value={description} onChange={e => { setDescription(e.target.value); setSaveStatus("unsaved"); }} placeholder="What does this agent do?"/>
            </Field>
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionLabel>📝 System prompt</SectionLabel>
            <textarea
              value={systemPrompt}
              onChange={e => { setSystemPrompt(e.target.value); setSaveStatus("unsaved"); }}
              rows={5}
              style={{ ...inputStyle, resize: "none", fontSize: 11 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>system prompt</span>
              <span style={{ fontSize: 10, fontFamily: C.mono, color: tokenColor }}>~{tokenCount} tokens</span>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <SectionLabel>🧠 Model</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
              {AVAILABLE_MODELS.map(m => (
                <ModelCard key={m.id} model={m} selected={modelId === m.id} onSelect={() => { setModelId(m.id); setSaveStatus("unsaved"); }}/>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              {[
                { label: "Temperature", id: "temp",   value: temperature,  min: 0,   max: 1,    step: 0.01, fmt: v => v.toFixed(2), set: setTemperature },
                { label: "Max tokens",  id: "maxtok", value: maxTokens,    min: 256, max: 4096, step: 128,  fmt: v => v,            set: setMaxTokens   },
              ].map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: C.mono, width: 90, flexShrink: 0 }}>{s.label}</span>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => { s.set(parseFloat(e.target.value)); setSaveStatus("unsaved"); }}
                    style={{ flex: 1, accentColor: C.accent, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 11, fontFamily: C.mono, color: C.accent2, width: 40, textAlign: "right" }}>{s.fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>🔧 Tools</SectionLabel>
            {AVAILABLE_TOOLS.map(tool => (
              <ToolRow key={tool.id} tool={tool} enabled={enabledTools.has(tool.id)} onToggle={() => toggleTool(tool.id)}/>
            ))}
          </div>
        </div>

        {/* RIGHT — Playground */}
        <div style={{ padding: 24, overflowY: "auto", maxHeight: 600 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Playground</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20, fontFamily: C.mono,
              background: pgStatus === "thinking" ? "rgba(245,158,11,.1)" : "rgba(16,185,129,.1)",
              color:      pgStatus === "thinking" ? C.amber : C.green,
              border:     `1px solid ${pgStatus === "thinking" ? "rgba(245,158,11,.2)" : "rgba(16,185,129,.2)"}`,
            }}>
              {pgStatus === "thinking" ? "thinking…" : "ready"}
            </span>
          </div>

          <div ref={chatRef} style={{
            background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: 12, minHeight: 200, maxHeight: 240, overflowY: "auto",
            marginBottom: 10, display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content}/>)}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={pgInput}
              onChange={e => setPgInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="e.g. Research the latest trends in AI agents..."
            />
            <button
              onClick={sendMessage}
              disabled={pgStatus === "thinking"}
              style={{
                padding: "8px 16px", background: C.accent, color: "#fff",
                border: "none", borderRadius: 7, fontSize: 12, fontFamily: C.mono,
                cursor: pgStatus === "thinking" ? "default" : "pointer",
                opacity: pgStatus === "thinking" ? .5 : 1, whiteSpace: "nowrap",
              }}
            >Send ↗</button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Avg latency", value: stats.latency ? stats.latency + "s" : "—" },
              { label: "Total tokens", value: stats.tokens > 0 ? stats.tokens.toLocaleString() : "—" },
              { label: "Est. cost",    value: stats.tokens > 0 ? "$" + stats.cost.toFixed(4) : "—" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: 10 }}>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: C.mono }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Version history */}
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Version history</div>
            {agent.versions.map(v => (
              <div key={v.v} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontFamily: C.mono, color: v.current ? C.accent2 : C.muted, width: 20 }}>{v.v}</span>
                <span style={{ flex: 1, color: C.muted }}>{v.note}</span>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted2 }}>{v.time}</span>
                {v.current && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "rgba(99,102,241,.1)", color: C.accent2, fontFamily: C.mono }}>current</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <button onClick={handleSave}   style={{ fontSize: 12, padding: "7px 16px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, border: "none", background: C.accent, color: "#fff" }}>💾 Save agent</button>
        <button onClick={handleDeploy} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 7, cursor: "pointer", fontFamily: C.mono, border: `1px solid ${C.border}`, background: "transparent", color: C.muted }}>🚀 Deploy</button>
      </div>
    </div>
  );
}

