"use client";
// components/dashboard/ClientWrapper.jsx
//
// Next.js App Router runs Server Components by default.
// Recharts + useState + useEffect require the browser — this wrapper
// marks the entire dashboard subtree as a Client Component.
//
// All dashboard components import from here automatically because
// AgentOSDashboard.jsx re-exports through this boundary.

export { default } from "./AgentOSDashboard";
