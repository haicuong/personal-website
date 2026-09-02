import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { globSync } from "glob";

const htmlEntries = globSync("**/index.html", {
  ignore: ["node_modules/**", "dist/**"],
}).reduce(
  (acc, file) => {
    const name =
      file.replace(/\/index\.html$/, "").replace(/\//g, "_") || "main";
    acc[name] = resolve(import.meta.dirname, file);
    return acc;
  },
  {} as Record<string, string>,
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
  plugins: [tailwindcss()],
});
