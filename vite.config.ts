import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        blog: resolve(__dirname, "blog/index.html"),
        projects: resolve(__dirname, "projects/index.html"),
      },
    },
  },
  plugins: [tailwindcss()],
});
