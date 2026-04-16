import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30000,
  },
  resolve: {
    alias: [
      { find: "@/ui", replacement: path.resolve(__dirname, "./src/components/ui") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
