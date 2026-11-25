---
title: "Testing and Hardening My Movie Browser API Under 100 Concurrent Users"
date: "2026-11-20"
lastEditedDate: "2026-11-25"
description: "How I audited, hardened, and load-tested my Express and Neon API from 10 to 100 concurrent users—what broke, how I fixed it, and the throughput trade-off I accepted."
tags: ["Technical Note", "Backend", "Security", "PostgreSQL", "Performance"]
coverImage: "/images/blog/testing-and-hardening-movie-browser-api/cover.webp"
---

**TL;DR.** After deploying my [Movie Browser API](/projects/posts/movie-browser-api/) with Vitest tests, I used an AI to help me ran a security audit, fault-injection checks, `EXPLAIN ANALYZE`, and a 10–100 virtual user load ramp against an isolated Neon branch. That surfaced two reachable `500` crashes, a login timing leak, unrevocable 7-day JWTs, 20 identical TMDB requests simultaneously, and a missing composite index. I fixed them with two commits and one additive SQL migration. Query execution on a large user table dropped from `1.138 ms` to `0.095 ms`, `GET` methods stay fast even though latency at peak 100 VUs is slower.

## Background

The project was an Express 5 and TypeScript REST API backed by Prisma 7 and Neon PostgreSQL, deployed on Vercel at [movie-browser.api.haicuong.me](https://movie-browser.api.haicuong.me/health). It had strict TypeScript checking and 24 Vitest and Supertest tests.

It performed well at happy paths and expected error codes, but it exposes several issues after the AI security audit. I followed suggested fixes with my final decision and trade-offs.

## How I tested it without breaking production

I split the verification into two tracks so high-volume load tests never touched real production data:

- **Live checks in `https://movie-browser.api.haicuong.me`:** Verified OWASP response headers, origin rejection, cookie attributes and Vercel cold starts, `43` total requests, with temporary accounts wiped from production afterward.
- **Isolated Neon branch:** Create a branch in the same region and ran local production output against it for timing statistics, mocked TMDB failures, and `10 → 25 → 50 → 100` VU tests.

Measured baseline WAN round-trip time from the test machine to the Neon branch was `30.67 ms` p50. That is higher than Vercel to Neon regional latency, while a single local Node process has one `pg.Pool` with 10-connection cap instead of Vercel's horizontal scaling, worth keeping in mind when reading the absolute numbers below.

## What already held up

Before listing what broke, several parts of the baseline held up cleanly on the first pass:

- **HTTP hardening & tenant isolation.** Security headers, strict CORS origin checks, `HttpOnly; Secure; SameSite=Lax` cookies and verifying User A can't access or delete User B's data.
- **Connection pooling.** Under 100 concurrent VUs, 1 `pg.Pool` with 10-connection cap handled all requests with `0%` errors.

## What broke (and how I fixed it)

### 1. Loose validation and two reachable `500` crashes

Testing ugly inputs exposed ways to trigger an unhandled `500`:

- **`parseInt` truncation and Postgres `INT4` overflow.** `MovieIdSchema` parsed path IDs loosely, so `GET /favorites/550abc`, `550.9`, and `550e2` all silently parsed as `550` and returned `200 OK`. Worse, `GET /favorites/2147483648` passed Zod's `.int().positive()` check and crashed in Postgres with `500 INTERNAL_SERVER_ERROR` because `tmdb_id` is a 32-bit `INT4`.
- **Unbounded pagination.** `GET /favorites?limit=1000000` and array coercion like `?page[]=1` both returned `200 OK`.
- **Non-JSON HTTP `200` from TMDB.** When a mocked TMDB upstream returned HTTP `200` with an HTML error page, `upstream.json().catch(() => null)` returned `{ success: true, body: null }`. Reading `tmdbResponse.body.title` then threw a `TypeError` (`500`) instead of `502 BAD_GATEWAY`.

The fix was rejecting non-digit strings before conversion, capping `tmdbId` at `2_147_483_647`, tightening pagination with `zod.strictObject` with `limit <= 100`, `page <= 10_000`, and rejecting `null` or non-object upstream JSON in `tmdbRequest`:

```typescript
const PG_INT4_MAX = 2_147_483_647;

export const MovieIdSchema = zod.preprocess(
  (value) => {
    if (typeof value === "string") {
      return /^\d+$/.test(value) ? Number(value) : NaN;
    }
    return value;
  },
  zod
    .number()
    .int()
    .min(1, "Movie ID must be a positive integer")
    .max(PG_INT4_MAX, "Movie ID must be a 32-bit positive integer"),
);
```

### 2. Hung TMDB requests and a 20-way cache stampede

`fetch()` to TMDB had no timeout: a `4.5 s` mocked held the handler open for `4,664.9 ms` without aborting. And when 20 concurrent users favorited the same uncached movie, all 20 requests fired 20 identical requests to TMDB.

I added `signal: AbortSignal.timeout(5_000)` to `tmdbRequest` and an in-flight `Map<number, Promise<Movie>>` in `create-favorite.controller.ts` so concurrent request for the same `tmdbId` share one upstream lookup:

- **Hung upstream:** now aborts cleanly at `5,075.6 ms` with `502 BAD_GATEWAY`.
- **Concurrent requests:** dropped from 20 outbound TMDB fetches to 1, still returning `20/20` `201 Created`.

### 3. Auth gaps: a login timing leak and unrevocable JWTs

Running 30 interleaved `POST /login` requests for an existing email (wrong password) against 30 requests for an unknown email showed a clear timing gap:

- **Existing email:** took `133.17 ms` (runs Argon2id verification)
- **Unknown email:** took `37.09 ms` (skips Argon2id)

Using a precomputed `DUMMY_PASSWORD_HASH` whenever `!user` closed the gap: `93.51 ms` vs `98.25 ms`.

![Before vs. after login timing showing the gap closing](/images/blog/testing-and-hardening-movie-browser-api/login-timing-comparison.webp)

Two session bugs also showed up:

- **Post-logout JWT replay.** `POST /logout` only cleared the browser cookie, so replaying a captured JWT still worked for up to 7 days.
- **Deleted-user inconsistency.** Deleting a user row while a JWT was still active produced `401` on `GET /me` and `POST /favorites/:id`, `200 []` on `GET /favorites`, and `404` on `GET/DELETE /favorites/:id`.

To fix both, I added a `token_version` column on `users`, embedded `{ userId, tokenVersion }` in JWTs, incremented `tokenVersion` on `POST /logout`, and had `requireAuth` verify the user and `tokenVersion` on every protected route, clearing the cookie and returning `401` on mismatch or deletion. `requireAuth` also attaches `req.user`, so `GET /me` stays at 1 DB query.

### 4. Missing composite index and Prisma's 2-query `include`

Protected requests have +1 DB round-trip and an unindexed 1,545-row user immediately showed two problems:

1. **`favorites` had no `(user_id, created_at DESC)` index.** Postgres read all `1,545` rows for the user, joined `movies`, and sorted them by created_at DESC, taking `1.138 ms`.
2. **Prisma's `include: { movie: true }` executed two sequential queries.** At `10` VUs, single-query `GET /me` had a `35.01 ms` p50 (1 WAN RTT), while `GET /favorites` took `67.41 ms` p50 (2 WAN RTTs).

I changed the schema with 1 additive migration, tested locally in `dev` and `test` environments, and deployed to Neon production before pushing the code:

```sql
ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 1;
CREATE INDEX "favorites_user_id_created_at_idx" ON "favorites"("user_id", "created_at" DESC);
```

Then I replaced `include: { movie: true }` in `list-favorites.controller.ts` and `get-favorite.controller.ts` with a single SQL `INNER JOIN`:

```typescript
const movies = await prisma.$queryRaw<FavoriteMovieRow[]>`
  SELECT
    m.tmdb_id AS "tmdbId",
    m.title,
    m.overview,
    m.poster_path AS "posterPath"
  FROM favorites f
  INNER JOIN movies m ON m.tmdb_id = f.tmdb_id
  WHERE f.user_id = ${userId}
  ORDER BY f.created_at DESC
  LIMIT ${limit}
  OFFSET ${offset}
`;
```

For the same 1,545-row user, query execution time dropped from `1.138 ms` to `0.095 ms`, ~12× faster.

Because the `INNER JOIN` saved one network round-trip, `GET /favorites` stayed at 2 total DB round-trips even with the new `tokenVersion` check. Live warm `GET /favorites` on Vercel + Neon actually edged down from `109.64 ms` to `105.06 ms` p50 while gaining full session revocation.

## Before vs. after: the numbers and the real trade-off

| Check                                         | Before                                  | After                                  |
| :-------------------------------------------- | :-------------------------------------- | :------------------------------------- |
| `/favorites/550abc` & `/favorites/2147483648` | `200` truncation / `500` crash          | **`400 VALIDATION_ERROR`**             |
| `?limit=1000000` & `?page[]=1`                | `200 OK`                                | **`400 VALIDATION_ERROR`**             |
| Non-JSON HTTP `200` from TMDB                 | `500 INTERNAL_SERVER_ERROR`             | **`502 BAD_GATEWAY`**                  |
| Hung TMDB / 20 concurrent requests            | `4.66 s` hang / `20` TMDB calls         | Aborts at **`5.08 s`** / **`1`** call  |
| `POST /login` timing                          | `133.2 ms` vs `37.1 ms`                 | **`93.5 ms` vs `98.3 ms`**             |
| Post-logout & deleted-user JWTs               | `200` replay / inconsistent `200`/`404` | **`401` + cookie clear** on all routes |
| `GET /favorites` with 1,545 rows              | Manual sorting (`1.138 ms`)             | **`Index Scan`** (`0.095 ms`)          |
| Live warm `GET /favorites`                    | `109.64 ms` p50                         | **`105.06 ms` p50**                    |

The isolated Neon `10 → 25 → 50 → 100` VU load ramp also exposed a real engineering trade-off:

| Stage     | Before RPS |  After RPS   |   Before p50 / p95    |      After p50 / p95       |
| :-------- | :--------: | :----------: | :-------------------: | :------------------------: |
| `10 VUs`  |  62.10/s   | **62.75/s**  | 66.49 ms / 260.67 ms  |  **60.24 ms / 238.10 ms**  |
| `25 VUs`  |  131.32/s  | **146.22/s** | 91.90 ms / 278.77 ms  |  **77.17 ms / 233.68 ms**  |
| `50 VUs`  |  133.48/s  | **140.23/s** | 296.12 ms / 429.77 ms | **245.49 ms / 475.85 ms**  |
| `100 VUs` |  150.07/s  | **114.18/s** | 623.93 ms / 770.11 ms | **793.81 ms / 1206.86 ms** |

![Before vs. after p50 and p95 latency across 10 to 100 virtual users](/images/blog/testing-and-hardening-movie-browser-api/load-ramp-latency.webp)

At `10–50` VUs, the indexed single-query `INNER JOIN` won (`+11.3%` RPS at 25 VUs, `-17%` p50 at 50 VUs). At `100`-VU single-process saturation with 10-connection cap, peak throughput shifted from `150.07` to `114.18 req/s`. The reason is: write routes (`POST` and `DELETE /favorites/:id`, 15% of the traffic mix) now run `+1` DB query for the `tokenVersion` check, which adds slight pool queuing once all 10 connections are saturated. That is a trade-off I am comfortable accepting for immediate server-side logout revocation without adding external store like Redis.

## Trade-offs and what I left as-is

- **Serverless `MemoryStore` rate limiting.** During a live 10-request parallel burst against Vercel, 2 requests hit warm instances and 8 spawned cold instances, each resetting its `express-rate-limit` counter to 99. I kept `MemoryStore` intentionally to avoid adding an external store service, and documented Upstash Redis as the upgrade path in `README.md` and `API_CONTRACT.md`.
- **Raw SQL for hot reads.** Using `prisma.$queryRaw` on `/favorites` halved DB round-trips, at the cost of maintaining typed SQL manually instead of relying on Prisma's generated query builder.
- **Per-instance concurrent requests.** The in-flight `Map` eliminates duplicate TMDB requests inside one warm serverless instance, not across concurrent cold starts.

## Takeaways

1. Passing integration tests does not catch 32-bit integer overflows, timing leaks, or missing composite indexes.
2. Security fixes have measurable performance costs: adding `tokenVersion` cost one DB lookup per request, but the single-query `INNER JOIN` could win that round-trip back.
3. Leaving a free-tier limitation (like serverless `MemoryStore` rate limiting) is fine as long as you verify how it behaves under concurrency and document it explicitly.

## Author's Note

This blog post documents my process of learning API testing. I used AI as a learning companion to explain complex concepts and help draft parts of this article, though all code and final edits were tested and verified by me.
