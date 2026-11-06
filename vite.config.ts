import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [react(), {
    name: "development-csp",
    transformIndexHtml(html) {
      // React Refresh injects an inline preamble only in the local dev server.
      return command === "serve"
        ? html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
        : html;
    },
  }],
}));
