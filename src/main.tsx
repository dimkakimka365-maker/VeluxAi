import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Swallowing benign WebSocket / HMR errors arising in sandbox proxies or frame containers
window.addEventListener("unhandledrejection", (event) => {
  const reason = String(event.reason || "");
  if (
    reason.includes("WebSocket") || 
    reason.includes("websocket") || 
    reason.includes("vite") || 
    reason.includes("hmr")
  ) {
    event.preventDefault();
    console.warn("Swallowed benign WebSocket/HMR unhandled rejection:", event.reason);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
