import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        blogs: resolve(import.meta.dirname, "blogs/index.html"),
        projects: resolve(import.meta.dirname, "projects/index.html"),
      },
    },
  },
  plugins: [tailwindcss()],
});
