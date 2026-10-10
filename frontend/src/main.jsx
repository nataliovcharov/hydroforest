import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { SessionProvider } from "./lib/session";
import { ToastProvider } from "./lib/toast";
import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* Respect the system "Reduce motion" setting for every animation. */}
      <MotionConfig reducedMotion="user">
        <SessionProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SessionProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>
);
