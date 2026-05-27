# ⚡ AgentOS — AI Agent Management Dashboard

> Production-ready React dashboard template for AI agent products.
> Built with Next.js 15 · Recharts · Custom Design System · No backend required.

![AgentOS Dashboard Preview](https://via.placeholder.com/1280x720/0a0c10/6366f1?text=AgentOS+Dashboard+Preview)

---

## 🖥 Live Demo

👉 **[View live demo](https://YOUR-VERCEL-URL.vercel.app)** ← replace with your Vercel URL after deploying

---

## ✨ What's included

| Screen | Features |
|--------|----------|
| **Overview Dashboard** | KPI cards, area charts, runs table, live activity feed |
| **Agent Builder** | System prompt editor, model selector, tool toggles, live playground |
| **Execution Log** | Animated execution graph, step timeline, token tracker |
| **Tool Registry** | Tool cards (builtin/api/mcp), config modals, usage stats |
| **Cost Tracker** | Cost charts vs budget, breakdown by model & agent, CSV export |

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 File structure

```
agentOS-dashboard/
├── app/
│   ├── layout.jsx              ← root layout
│   └── page.jsx                ← entry point
├── components/
│   └── dashboard/
│       ├── theme/
│       │   ├── tokens.js       ← all design tokens (colors, spacing, typography)
│       │   └── responsive.js   ← breakpoints + responsive grid helpers
│       ├── ClientWrapper.jsx   ← Next.js client boundary
│       ├── AgentOSDashboard.jsx
│       ├── OverviewDashboard.jsx
│       ├── AgentBuilder.jsx
│       ├── ExecutionLog.jsx
│       ├── ToolRegistry.jsx
│       └── CostTracker.jsx
├── next.config.js
├── package.json
└── README.md
```

---

## 🎨 Customization

All colors, spacing and typography live in one file:

```js
// components/dashboard/theme/tokens.js
export const C = {
  accent: "#6366f1",   // ← change this to your brand color
  bg:     "#0a0c10",   // ← change this for light mode
  ...
}
```

---

## 📦 Tech stack

- **Next.js 15** — framework
- **React 19** — UI
- **Recharts** — charts
- **Custom Design System** — `theme/tokens.js` + `theme/responsive.js`

---

## 📄 License

Extended ThemeForest license. See LICENSE.md.

---

Made with ⚡ by [your name here]
