import { resolve } from "path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { globSync } from "glob";

const THEME_SCRIPT = `
<script>
  (function() {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  })();
</script>
`;

function injectThemeScript(): Plugin {
  return {
    name: "inject-theme-script",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>${THEME_SCRIPT}`);
    },
  };
}

const htmlEntries = globSync(["**/index.html", "404.html"], {
  ignore: ["node_modules/**", "dist/**", "packages/**"],
}).reduce(
  (acc, file) => {
    const name =
      file === "404.html"
        ? "404"
        : file.replace(/\/index\.html$/, "").replace(/\//g, "_") || "main";
    acc[name] = resolve(import.meta.dirname, file);
    return acc;
  },
  {} as Record<string, string>,
);

export default defineConfig({
  appType: "mpa",
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
  plugins: [tailwindcss(), injectThemeScript()],
});
