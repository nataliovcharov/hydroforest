import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, send /api and /images requests to the Express backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5005",
    },
  },
});
