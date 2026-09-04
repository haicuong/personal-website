---
title: "Type-Safe Data Fetching in TypeScript"
date: "2026-09-01"
description: "Exploring how to strictly type standard browser fetch requests for a more robust frontend architecture."
tags: ["Typescript", "Webdev", "Javascript", "Frontend"]
coverImage: "/images/blog/ts-data-fetching/cover.png"
---

# Type-Safe Data Fetching in TypeScript

(This post is AI generated to test Blog page)

When building modern web applications, interacting with external APIs is inevitable. While the native `fetch` API is incredibly powerful, it defaults to returning `any` when parsing JSON. This completely defeats the purpose of using a strictly typed language.

---

## 1. The Problem with Standard Fetch

When you execute `await response.json()`, the TypeScript compiler has no idea what shape the data actually is. It trusts you blindly. If the API changes, your frontend won't throw an error until runtime, leading to silent failures and broken UI components.

We can fix this by wrapping our fetch calls in a reusable generic function.

---

## 2. Building a Generic Fetcher

By utilizing TypeScript Generics (`<T>`), we can create a utility function that enforces strict types on the returned payload.

### The Utility Function
```typescript
/**
 * A strongly-typed wrapper around the native fetch API.
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  // We cast the result to T, asserting the API matches our interface
  const data = await response.json();
  return data as T;
}
```