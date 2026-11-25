---
title: "Movie Browser API: Auth & Favorites Backend"
date: "2026-11-20"
description: "A REST API for user authentication and per-user favorite movies, built with Express 5, TypeScript, Prisma, and Neon PostgreSQL, deployed on Vercel."
techStack:
  [
    "Node.js",
    "TypeScript",
    "Express",
    "PostgreSQL",
    "Prisma",
    "Zod",
    "Vitest",
    "Vercel",
  ]
repoUrl: "https://github.com/haicuong/movie-browser-api"
liveUrl: "https://movie-browser.api.haicuong.me/health"
coverImage: "/images/projects/movie-browser-api/cover.webp"
---

## ✨ Features

- **Cookie-Based JWT Auth** — Registration, login, logout, and profile lookup (`/register`, `/login`, `/logout`, `/me`) using Argon2id password hashing (with constant-time dummy verification on unknown emails) and `HS256`-pinned JWTs in `HttpOnly` cookies
- **Server-Side Session Revocation** — Tokens embed a `tokenVersion` checked against PostgreSQL on every protected route, so logout revokes prior JWTs immediately and deleted users receive a consistent `401`
- **User-Scoped Favorites CRUD** — Paginated listing, single-item lookup, creation, and deletion (`/favorites`, `/favorites/:tmdbId`), scoped to the authenticated user
- **Shared TMDB Metadata Cache** — First favorite for a movie fetches metadata from TMDB with a `5s` timeout and in-flight request cache, validates the response with Zod, and caches it in PostgreSQL for all users
- **Security & Input Validation** — Strict Zod schemas for payloads, 32-bit movie IDs, and bounded pagination, plus OWASP response headers, allowlisted CORS with credentials, a `10KB` JSON body limit, and IP rate limiting
- **Automated Integration Tests** — 30 Vitest and Supertest tests running against an isolated local test database with mocked TMDB calls and a safety guard that refuses to run against Neon URLs

## 🧩 How It Works

```text
client -> Vercel (Express 5) -> headers / CORS / rate limit / auth
       -> controllers -> Neon PostgreSQL (Prisma + pg.Pool)
                      -> TMDB API (cache miss only, 5s timeout)
```

This service is the backend for [Movie Browser](/projects/posts/movie-browser/), moving favorites out of browser `localStorage` into persistent, per-user PostgreSQL storage. Protected routes verify the `HttpOnly` `token` cookie against the user's `tokenVersion`, then read favorites via a single-query parameterized SQL `INNER JOIN` backed by a composite `(user_id, created_at DESC)` index. When a user adds a movie that is not in the `movies` table yet, the API fetches it from TMDB once, validates the fields, and caches it.

## 📡 Endpoints

| Method   | Path                 | Auth     | Description                                       |
| -------- | -------------------- | -------- | ------------------------------------------------- |
| `GET`    | `/health`            | No       | Service health check                              |
| `POST`   | `/register`          | No       | Create account and set auth cookie                |
| `POST`   | `/login`             | No       | Verify credentials and set auth cookie            |
| `POST`   | `/logout`            | Optional | Increment `tokenVersion` and clear auth cookie    |
| `GET`    | `/me`                | Yes      | Return current user profile                       |
| `GET`    | `/favorites`         | Yes      | List paginated favorites (`page`, `limit <= 100`) |
| `GET`    | `/favorites/:tmdbId` | Yes      | Retrieve one favorite movie                       |
| `POST`   | `/favorites/:tmdbId` | Yes      | Cache movie metadata if needed and add favorite   |
| `DELETE` | `/favorites/:tmdbId` | Yes      | Remove a movie from favorites                     |

Full request/response schemas and error codes are documented in [API_CONTRACT.md](https://github.com/haicuong/movie-browser-api/blob/main/API_CONTRACT.md).

## 🔍 Things I Worked Through

- **Hardening after the first deploy.** After shipping the initial CRUD endpoints, I used an AI to security and pressure audit. It caughts two reachable `500` crashes (`parseInt` truncation and `INT4` overflow on `:tmdbId`, plus non-JSON HTTP `200` responses from TMDB), a Argon2id login timing side-channel, unbounded pagination limits, and duplicate identical requests to TMDB. All of them were fixed and covered by tests. The full write-up is in [Testing and Hardening My Movie Browser API Under 100 Concurrent Users](/blog/posts/testing-and-hardening-movie-browser-api/).
- **Revocable JWTs without hurting read latency.** Adding a `tokenVersion` lookup in `requireAuth` closed post-logout JWT replay and made deleted-user handling consistent across all protected routes, at the cost of one extra DB query per request. Replacing Prisma's two-query `include: { movie: true }` on `/favorites` with a single parameterized SQL `INNER JOIN` and a composite `(user_id, created_at DESC)` index won that round-trip back, keeping live warm `GET /favorites` around `105 ms` and cutting the 1,545-row query plan execution time from `1.138 ms` to `0.095 ms`.
- **Manual OWASP headers instead of `helmet`.** Loading `helmet` cleanly across ESM and Vercel's CommonJS runtime caused deploy-time import issues. Replacing it with a small `securityHeaders` middleware kept all 13 OWASP REST API headers explicit and dependency-free.
- **Serverless rate-limit trade-off.** `express-rate-limit` uses its default `MemoryStore`. During a live 10-request parallel burst on Vercel Hobby, newly spawned cold instances started with fresh counters. Keeping `MemoryStore` is an intentional free-tier choice to avoid adding a separate Redis service; swapping in Upstash Redis is the documented upgrade path for strict global rate limiting.

## 🛠 Tech Stack

- **Runtime & HTTP:** Node.js (ESM), TypeScript, Express 5, `cors`, `cookie-parser`, `express-rate-limit`
- **Auth & Validation:** Argon2id (`argon2`), `jsonwebtoken` (`HS256`), Zod 4
- **Database & ORM:** PostgreSQL (Neon with PgBouncer `-pooler`), Prisma 7 (`@prisma/adapter-pg`, `pg`, `@vercel/functions`)
- **Testing:** Vitest, Supertest
- **Hosting:** Vercel Serverless Functions

## 📌 TMDB Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata is provided by [TMDB](https://www.themoviedb.org/).
