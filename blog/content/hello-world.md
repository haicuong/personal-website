---
title: "Hello World: Testing the Markdown Engine"
date: "2026-09-03"
description: "A comprehensive test post verifying frontmatter parsing, Shiki code syntax highlighting, and Tailwind Typography styling."
tags: ["test", "vite", "typescript", "markdown"]
coverImage: "/images/blog/hello-world/cover.jpg"
---

# Hello World: Testing the Markdown Engine


Welcome to the initial test post for the blog system. This article contains various Markdown elements to verify that **frontmatter metadata**, **inline formatting**, **lists**, **blockquotes**, and **Shiki code blocks** render as expected.


<!-- Cover image:
![Cover image](/images/blog/hello-world/cover.jpg)
 -->
---

## 1. Typography & Inline Elements

This paragraph tests basic text formatting. You can write **bold text**, *italicized text*, or combine them into ***bold italics***. 

You can also include `inline code snippets` using single backticks to verify that code spans pick up custom styling cleanly without breaking layout flow.

---

## 2. Lists & Hierarchy

### Unordered Features Checklist
* **Frontmatter Parsing**: Converts YAML into JavaScript objects via `gray-matter`.
* **HTML Generation**: Compiles Markdown to native semantic elements via `marked`.
* **Code Highlighting**: Injects VS Code themes at build-time using `shiki`.
* **Clean URLs**: Outputs structured `index.html` files into distinct slug folders.

### Sequential Step Test
1. Save the `.md` content into `blog/content/`.
2. Execute `npm run dev` to invoke `scripts/build-posts.ts`.
3. Open `http://localhost:5173/blog/posts/hello-world/` in your browser.

---

## 3. Syntax Highlighting Tests

### TypeScript Example
```typescript
interface Article {
  slug: string;
  title: string;
  publishDate: string;
  draft: boolean;
}

const formatTitle = (article: Article): string => {
  return `${article.title} (${article.publishDate})`;
};

console.log(formatTitle({
  slug: "hello-world",
  title: "Hello World",
  publishDate: "2026-09-03",
  draft: false
}));
```