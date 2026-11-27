import { defineConfig } from "vite";

export default defineConfig({
  build: {
    license: { fileName: "third-party-licenses.txt" },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/src/data/")) return "handbook-data";
          if (id.includes("/node_modules/")) return "ui";
        },
      },
    },
  },
});
