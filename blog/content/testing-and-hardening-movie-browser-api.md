---
title: "Testing and Hardening My Movie Browser API Under 100 Concurrent Users"
date: "2026-11-20"
description: "How I audited, hardened, and load-tested my Express and Neon API from 10 to 100 concurrent users—what broke, how I fixed it, and the throughput trade-off I accepted."
tags: ["Technical Note", "Backend", "Security", "PostgreSQL", "Performance"]
coverImage: "/images/blog/testing-and-hardening-movie-browser-api/cover.webp"
---

**TL;DR.** After deploying my [Movie Browser API](/projects/posts/movie-browser-api/) with 24 passing Vitest integration tests, I ran a security audit, fault-injection checks, `EXPLAIN ANALYZE`, and a 10–100 virtual user (VU) load ramp against an isolated Neon branch. That surfaced two reachable `500` crashes, a 3.59× Argon2id login timing leak, unrevocable 7-day JWTs, a 20-way TMDB cache stampede, and a missing composite index. Fixing them took two commits and one additive SQL migration. Query execution on a 1,545-row user dropped 12× (`1.138 ms` to `0.095 ms`), and live warm `GET /favorites` stayed fast (`105 ms`) even with server-side session checks—at the cost of slightly lower peak write throughput at 100-VU saturation.

## Background

The baseline (`edd0ded`) was an Express 5 and TypeScript REST API backed by Prisma 7 and Neon PostgreSQL (`aws-ap-southeast-1`), deployed on Vercel Hobby at `https://movie-browser.api.haicuong.me`. Type-checking was clean and all 24 Vitest and Supertest tests passed.

Integration tests are good at confirming the happy path and expected error codes, but they rarely expose boundary overflows, timing side-channels, flaky upstreams, or how connection pools and query plans behave under load. I wanted to test the deployed stack properly, fix what broke, and re-run the exact same checks to verify the changes.

## How I tested it without breaking production

I split the verification into two tracks so high-volume load tests never touched real production data:

- **Bounded live checks (`https://movie-browser.api.haicuong.me`).** Verified OWASP response headers, HSTS, CORS origin rejection, cookie attributes, 2-user cross-tenant isolation (BOLA), `trust proxy: 1` IP anti-spoofing, and Vercel cold starts (`43` total requests, with temporary canary accounts wiped from production afterward).
- **Isolated Neon cloud branch (`0.25–2 CU`, `-pooler`).** Created a schema-only branch in the same region and ran compiled production output (`dist/server.js`, `NODE_ENV=production`) against it for timing statistics, mocked TMDB failures, `EXPLAIN (ANALYZE, BUFFERS)`, Argon2id login saturation, and a `10 → 25 → 50 → 100` VU load ramp.

Measured baseline WAN round-trip time from the test machine to the Neon branch (`SELECT 1`) was `30.67 ms` p50. That is higher than Vercel `sin1`-to-Neon regional latency, while a single local Node process has one `pg.Pool` instead of Vercel's horizontal scaling—worth keeping in mind when reading the absolute numbers below.

## What already held up

Before listing what broke, several parts of the baseline held up cleanly on the first pass:

- **HTTP hardening & tenant isolation.** All 13 OWASP REST API headers, strict CORS allowlisting (rejecting untrusted, lookalike prefix, subdomain, and `null` origins), `HttpOnly; Secure; SameSite=Lax` cookies, 2-user BOLA isolation, and Vercel Edge `trust proxy: 1` anti-spoofing all passed live.
- **Connection pooling.** Under 100 concurrent VUs, `pg.Pool` (`max: 10`) routed through Neon's PgBouncer `-pooler` kept backend Postgres sessions at `8–10` out of `901` max connections with `0%` errors.
- **Argon2id memory ceiling.** Firing `1 → 40` simultaneous `POST /login` requests stayed bounded at `~428–440 MB` peak RSS via Node's default `UV_THREADPOOL_SIZE=4` with `40/40` `200 OK` and no OOMs.

## What broke (and how I fixed it)

### 1. Loose validation and two reachable `500` crashes

Testing ugly inputs exposed two ways a caller—or an upstream hiccup—could trigger an unhandled `500`:

- **`parseInt` truncation and Postgres `INT4` overflow.** `MovieIdSchema` parsed path IDs loosely, so `GET /favorites/550abc`, `550.9`, and `550e2` all silently parsed as `550` and returned `200 OK`. Worse, `GET /favorites/2147483648` passed Zod's `.int().positive()` check and crashed in Postgres with `500 INTERNAL_SERVER_ERROR` because `tmdb_id` is a 32-bit `INT4`.
- **Unbounded pagination.** `GET /favorites?limit=1000000` and array coercion like `?page[]=1` both returned `200 OK`.
- **Non-JSON HTTP `200` from TMDB.** When a mocked TMDB upstream returned HTTP `200` with an HTML error page, `upstream.json().catch(() => null)` returned `{ success: true, body: null }`. Reading `tmdbResponse.body.title` then threw a `TypeError` (`500`) instead of `502 BAD_GATEWAY`.

The fix was rejecting non-digit strings before conversion, capping `tmdbId` at `2_147_483_647`, tightening pagination with `zod.strictObject` (`limit <= 100`, `page <= 10_000`), and rejecting `null` or non-object upstream JSON in `tmdbRequest`:

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
    .int("Movie ID must be a positive integer")
    .min(1, "Movie ID must be a positive integer")
    .max(PG_INT4_MAX, "Movie ID must be a 32-bit positive integer"),
);
```

### 2. Hung TMDB requests and a 20-way cache stampede

`fetch()` to TMDB had no timeout: a `4.5 s` mocked stall held the handler open for `4,664.9 ms` without aborting. And when 20 concurrent users favorited the same uncached movie (`tmdbId=603`), all 20 requests missed the `movies` table and fired **20 identical outbound requests** to TMDB.

I added `signal: AbortSignal.timeout(5_000)` to `tmdbRequest` and an in-flight `Map<number, Promise<Movie>>` coalescer in `create-favorite.controller.ts` so concurrent cache misses for the same `tmdbId` share one upstream lookup:

- **Hung upstream:** now aborts cleanly at `5,075.6 ms` with `502 BAD_GATEWAY`.
- **20-way stampede:** dropped from **20** outbound TMDB fetches to **1** (`-95%`), still returning `20/20` `201 Created`.

### 3. Auth gaps: a 3.59× login timing leak and unrevocable JWTs

Running 30 interleaved `POST /login` requests for an existing email (wrong password) against 30 requests for an unknown email showed a clear account-enumeration side-channel:

- **Existing email:** mean `133.17 ms` (runs Argon2id verification)
- **Unknown email:** mean `37.09 ms` (short-circuited before Argon2id)
- **Welch's two-sample t-test:** `t = 25.01` (`+96.08 ms`, **3.59×** slower on existing accounts)

Verifying against a precomputed `DUMMY_PASSWORD_HASH` (same `m=65536, t=3, p=4` Argon2id parameters) whenever `!user` closed the gap: `93.51 ms` vs `98.25 ms` (**0.95×**, Welch `t = -0.86`, `p > 0.39`).

![Before vs. after login timing distribution showing the 3.59x gap closing](/images/blog/testing-and-hardening-movie-browser-api/login-timing-comparison.webp)

Two session-lifecycle bugs also showed up:

- **Post-logout JWT replay.** `POST /logout` only cleared the browser cookie, so replaying a captured JWT still returned `200 OK` on `GET /me` for up to 7 days.
- **Deleted-user inconsistency.** Deleting a user row while a JWT was still active produced `401` on `GET /me` and `POST /favorites/:id`, `200 []` on `GET /favorites`, and `404` on `GET/DELETE /favorites/:id`.

To fix both without introducing Redis, I added a `token_version` column on `users`, embedded `{ userId, tokenVersion }` in `HS256`-pinned JWTs, incremented `tokenVersion` on `POST /logout`, and had `requireAuth` verify the user and `tokenVersion` on every protected route (clearing the cookie and returning `401` on mismatch or deletion). `requireAuth` also attaches `req.user`, so `GET /me` stays at 1 DB query.

### 4. Missing composite index and Prisma's 2-query `include`

Adding a primary-key lookup in `requireAuth` meant protected routes would pay `+1` DB round-trip unless I cut waste elsewhere. `EXPLAIN (ANALYZE, BUFFERS)` on a 1,545-row user immediately showed two problems:

1. **`favorites` had no `(user_id, created_at DESC)` index.** Postgres read all `1,544` rows for the user via a `Bitmap Heap Scan`, hash-joined `movies`, and ran a `top-N heapsort` (`Execution Time: 1.138 ms`).
2. **Prisma's `include: { movie: true }` executed two sequential queries.** At `10` VUs, single-query `GET /me` had a `35.01 ms` p50 (1 WAN RTT), while `GET /favorites` took `67.41 ms` p50 (2 WAN RTTs).

I shipped both schema changes in one additive migration—tested locally (`dev` and `test`), dry-run on an ephemeral Neon branch (`verify-mig-batch2`), and deployed to Neon production before pushing the code (`c435f2e`):

```sql
ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 1;
CREATE INDEX "favorites_user_id_created_at_idx" ON "favorites"("user_id", "created_at" DESC);
```

Then I replaced `include: { movie: true }` in `list-favorites.controller.ts` (and `get-favorite.controller.ts`) with a single parameterized SQL `INNER JOIN`:

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

Re-running `EXPLAIN (ANALYZE, BUFFERS)` on the same 1,545-row user showed the sort disappear completely:

```text
Before: Bitmap Heap Scan (1,544 rows) -> Hash Join -> Sort (top-N heapsort)  | Execution Time: 1.138 ms
After:  Index Scan (favorites_user_id_created_at_idx, 20 rows) -> Nested Loop | Execution Time: 0.095 ms
```

A **12.0×** drop in DB execution time—and because the `INNER JOIN` saved one network round-trip, `GET /favorites` stayed at 2 total DB round-trips (`0 + 2` before vs. `1 + 1` after). Live warm `GET /favorites` on Vercel + Neon actually edged down from `109.64 ms` to `105.06 ms` p50 while gaining full session revocation.

## Before vs. after: the numbers and the real trade-off

| Check | Before (`edd0ded`) | After (`c435f2e`) |
| :--- | :--- | :--- |
| Automated Vitest suite | 24 tests passing | **30 tests passing** (`+6` regression tests) |
| `/favorites/550abc` & `/favorites/2147483648` | `200` truncation / `500` crash | **`400 VALIDATION_ERROR`** |
| `?limit=1000000` & `?page[]=1` | `200 OK` | **`400 VALIDATION_ERROR`** |
| Non-JSON HTTP `200` from TMDB | `500 INTERNAL_SERVER_ERROR` | **`502 BAD_GATEWAY`** |
| Hung TMDB / 20-way cache stampede | `4.66 s` hang / `20` TMDB calls | Aborts at **`5.08 s`** (`502`) / **`1`** call (`-95%`) |
| `POST /login` timing (30+30 Welch t-test) | `133.2 ms` vs `37.1 ms` (`t = 25.01`) | **`93.5 ms` vs `98.3 ms`** (`t = -0.86`) |
| Post-logout & deleted-user JWTs | `200` replay / inconsistent `200`/`404` | **`401` + cookie clear** on all 5 routes |
| `EXPLAIN` (`GET /favorites`, 1,545 rows) | `top-N heapsort` (`1.138 ms`) | **`Index Scan`** (`0.095 ms`, **12× faster**) |
| Live warm `GET /favorites` (Vercel + Neon) | `109.64 ms` p50 | **`105.06 ms` p50** |

The isolated Neon `10 → 25 → 50 → 100` VU load ramp also exposed a real engineering trade-off:

| Stage | Before RPS | After RPS | Before p50 / p95 | After p50 / p95 | Errors |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `10 VUs` | 62.10/s | **62.75/s** | 66.49 ms / 260.67 ms | **60.24 ms / 238.10 ms** | 0 |
| `25 VUs` | 131.32/s | **146.22/s** | 91.90 ms / 278.77 ms | **77.17 ms / 233.68 ms** | 0 |
| `50 VUs` | 133.48/s | **140.23/s** | 296.12 ms / 429.77 ms | **245.49 ms / 475.85 ms** | 0 |
| `100 VUs` | 150.07/s | **114.18/s** | 623.93 ms / 770.11 ms | **793.81 ms / 1206.86 ms** | 0 |

![Before vs. after p50 and p95 latency across 10 to 100 virtual users](/images/blog/testing-and-hardening-movie-browser-api/load-ramp-latency.webp)

At `10–50` VUs, the indexed single-query `INNER JOIN` won outright (`+11.3%` RPS at 25 VUs, `-17%` p50 at 50 VUs). At `100`-VU single-process saturation against `pg.Pool({ max: 10 })`, peak throughput shifted from `150.07` to `114.18 req/s` (`0%` errors). The reason is Little's Law: write routes (`POST` and `DELETE /favorites/:id`, 15% of the traffic mix) now run `+1` DB query for the `tokenVersion` check, which adds slight pool queuing once all 10 connections are saturated. That is a trade-off I am comfortable accepting for immediate server-side logout revocation without adding Redis.

## Trade-offs and what I left as-is

- **Serverless `MemoryStore` rate limiting.** During a live 10-request parallel burst against Vercel Hobby, 2 requests hit warm instances (`~355–377 ms`) and 8 spawned cold instances (`~1.7 s`), each resetting its `express-rate-limit` counter to `r=99`. I kept `MemoryStore` intentionally to avoid adding an external Redis service on a free-tier portfolio backend, and documented Upstash Redis as the upgrade path in `README.md` and `API_CONTRACT.md`.
- **Raw SQL for hot reads.** Using `prisma.$queryRaw` on `/favorites` halved DB round-trips, at the cost of maintaining typed SQL manually instead of relying on Prisma's generated query builder.
- **Per-instance coalescing.** The in-flight `Map` eliminates stampedes inside one warm serverless instance, not across concurrent cold starts.

## Takeaways

1. Passing integration tests does not catch 32-bit integer overflows, timing leaks, or missing composite indexes.
2. Security fixes have measurable performance costs—adding `tokenVersion` cost one DB lookup per request, and measuring the whole pipeline showed where a single-query `INNER JOIN` could win that round-trip back.
3. Ephemeral database branches make destructive testing, `EXPLAIN` profiling, and migration dry-runs cheap enough to run before every risky deploy.
4. Leaving a free-tier limitation (like serverless `MemoryStore` rate limiting) is fine as long as you verify how it behaves under concurrency and document it explicitly.
