
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "variables" as *;
          @use "mixins" as *;
        `,
        loadPaths: [
          fileURLToPath(new URL("./src/styles", import.meta.url)),
        ],
      },
    },
  },
});
