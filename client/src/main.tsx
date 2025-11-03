import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  root.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0a0a0a; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Failed to load application</h1>
        <p style="color: #888; margin-bottom: 2rem;">Please refresh the page or contact support if the issue persists.</p>
        <button onclick="window.location.reload()" style="background: #00d4ff; color: black; padding: 0.75rem 2rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
