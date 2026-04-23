import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./configs/query-client.ts";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={getQueryClient()}>
      <AppProvider>
        <App />
        <Toaster position="top-right" duration={5000} richColors />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
