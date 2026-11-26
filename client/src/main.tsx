
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AuthProvider from "./context/AuthProvider";

import "./styles/main.scss";

/**
 * Initializes the Walo application.
 *
 * Responsibilities:
 * - Mounts React into the root HTML element.
 * - Enables React development checks.
 * - Provides client-side routing.
 * - Initializes global authentication state.
 *
 * Authentication sessions are managed through
 * secure HTTP-only cookies by the backend.
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Walo root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
