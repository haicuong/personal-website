---
title: "Movie Browser: A Movie Discovery App"
date: "2026-10-04"
description: "Movie Browser lets you browse current movie collections, search for titles, and open detailed information for any movie. It is a single-page app that uses The Movie Database (TMDB) API, deployed on Vercel."
techStack: ["React", "TypeScript", "Vite", "TailwindCSS", "TanStack Query", "Zustand", "React Router", "Motion"]
repoUrl: "https://github.com/haicuong/movie-browser"
liveUrl: "https://movie-browser.haicuong.me"
coverImage: "/images/projects/movie-browser/cover.webp"
---

## ✨ Features

- **Collections** — Browse trending, popular, now-playing, upcoming, and your saved favorites
- **Search** — Debounced input, with the search query kept in the URL so links and back/forward navigation work
- **Movie Details** — A router-backed modal with ratings, release date, genres, runtime, overview, trailer, cast, and crew when available
- **Favorites** — Add or remove movies, saved in the browser
- **Light/Dark Theme** — Preference saved in the browser
- **Resilient States** — Loading, empty, offline, and API error states
- **Accessible Motion** — Animations follow the system's reduced-motion setting

Screenshots:
![Homepage showing this week's trending movies](/images/projects/movie-browser/screenshot-1.webp)

![Search results for the query "spider"](/images/projects/movie-browser/screenshot-2.webp)

## 🧩 How It Works

```text
browser -> /src/api/tmdb.ts -> /api/tmdb-proxy.ts -> TMDB
```

Requests go through a small proxy instead of calling TMDB directly, and TanStack Query manages fetching and retries. Loading, error, and success each have their own display.

## 🔍 Things I Worked Through

- **Keeping the API token out of the browser.** A Vercel serverless function holds the TMDB token and forwards only a short list of allowed paths (movie, trending, search), so it cannot be used as an open relay on my token and quota. During local development, a Vite proxy does the same job.
- **A history bug in search.** While testing back/forward navigation, I found that `setSearchParams` was called three times per navigation, pushing three identical history entries and breaking the back button. A custom hook, `useSearchQuery`, now handles user input and URL changes (including back/forward) separately, so the URL is the single source of truth for search. A blog post about this is coming soon.
- **Favorites saved as snapshots.** Each favorite stores its id, poster path, title, and overview in localStorage instead of only its id. This avoids extra requests to TMDB and speeds up loading, at the cost of possibly showing outdated information.
- **Typed errors.** Three custom errors (`MovieNotFoundError`, `TooManyRequestsError`, `NetworkError`) separate the expected failures of TMDB requests, and failed network requests are retried twice before the error is shown.

The full list of design decisions and trade-offs is in [ARCHITECTURE.md](https://github.com/haicuong/movie-browser/blob/main/ARCHITECTURE.md).

## 🛠 Tech Stack

- **UI:** React 19, TypeScript, Tailwind CSS v4, Base UI, Motion
- **Routing:** React Router
- **Data fetching:** TanStack React Query
- **Client state:** Zustand
- **Build:** Vite
- **Hosting:** Vercel (static site plus one serverless function)

## 📌 TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata, images, and videos are provided by [TMDB](https://www.themoviedb.org/).