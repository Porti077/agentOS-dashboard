// app/page.jsx
// Entry point — renders the full AgentOS dashboard

import AgentOSDashboard from "../components/dashboard/ClientWrapper";

export const metadata = {
  title: "AgentOS — AI Agent Management Dashboard",
  description: "Production-ready React dashboard template for AI agent products.",
};

export default function Page() {
  return <AgentOSDashboard />;
}
