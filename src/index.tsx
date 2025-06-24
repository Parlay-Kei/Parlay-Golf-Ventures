import './index.css'
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LoadingProvider } from "./contexts/LoadingContext";
import App from "./App";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
