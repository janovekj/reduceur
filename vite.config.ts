/// <reference types="vite" />
import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "reduceur",
      fileName: (format) => `reduceur.${format}.js`,
    },
    rollupOptions: {
      external: ["immer"],
    },
  },
  plugins: [dts()],
});
