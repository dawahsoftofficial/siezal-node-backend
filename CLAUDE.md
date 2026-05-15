# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev        # watch mode
npm run start:debug      # debug + watch

# Build & production
npm run build
npm run start:prod

# Database
npm run migration:generate src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert
npm run migration:show
npm run seed             # seed initial data

# Code quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier

# Tests
npm test                 # all tests
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Architecture

This is a NestJS REST API using TypeORM (MySQL) with Redis session caching.

### Route Namespacing

All routes are versioned via custom controller decorators in `src/common/decorators/app.decorator.ts`:

- `@AdminRouteController('path')` → `v1/admin/path`
- `@UserRouteController('path')` → `v1/user/path`
- `@PublicRouteController('path')` → `v1/path`

Each domain module (e.g. `src/module/auth`) typically has two controllers: one for admin routes and one for user routes.

### Auth & Guards

`JwtAuthGuard` is registered as a **global guard** in `AppModule`. Every route is protected by default. Opt out with:

- `@NoGuard()` — disables all auth for a route
- `@UseGuards(PublicAuthGuard)` — switches to AES payload validation instead of JWT

The JWT validation flow (`src/common/helpers/guard.helper.ts`):
1. Verify Bearer token signature against `JWT_ACCESS_SECRET`
2. Look up session in Redis; if not found, fall back to the `user_sessions` DB table
3. Attach decoded payload to `request.user`

In `dev` mode (`NODE_ENV=dev`): Redis errors are silent (no crash if Redis is down) and the `PublicAuthGuard` AES payload check is bypassed entirely.

Extract the authenticated user in controllers with `@AuthUser()`:
```ts
async myRoute(@AuthUser() { id, role, sessionId }: IAuthRequest) {}
```

### Base Service Pattern

All services extend `BaseSqlService<Entity, Interface>` from `src/core/base/services/sql.base.service.ts`, which provides `findOne`, `findById`, `findAll`, `create`, `updateById`, `paginate`, `softDelete`, etc. Only add methods to a service that aren't already covered by the base class.

### Response Shape

Always use `SuccessResponse()` from `src/common/utils/api-response.util.ts`. The top-level token fields (`accessToken`, `refreshToken`) are spread directly into the response root — not nested under `data`.

```ts
return SuccessResponse("Message", dataObject, tokenObject);
// → { success, message, data, accessToken?, refreshToken?, timestamp }
```

### Session Storage (Redis)

Sessions are stored in Redis with a 7-day TTL (matching the refresh token lifespan). The Redis key format is:
```
<NODE_ENV_UPPERCASE>:USER_ACCESS:<role>:<userId>:<sessionId>
```

The `accessToken` refresh endpoint (`POST v1/admin/auth/access-token` and `POST v1/user/auth/access-token`) uses a DB fallback when the Redis session is missing, then re-stores in Redis.

### AES Encryption

Used for two purposes:
1. **Refresh token encryption** — the raw refresh JWT is AES-encrypted before sending to clients; decrypted server-side when refreshing
2. **Public route payload header** — clients encrypt a URL+method+secret string and send it as a `payload` header; bypassed in `dev` mode

The AES keys (`AES_OPEN` as key, `AES_IV` as IV) must match across API and clients. Note: `admin/.env` and `web-app/.env` must use the same key/IV order as the API's `AES_OPEN`/`AES_IV`.

### Adding a New Module

Follow the pattern in any existing module under `src/module/`:
1. Create `module/`, `controller/`, `dto/`, `interface/` directories
2. Service extends `BaseSqlService<Entity, Interface>`
3. Register entity in `TypeOrmModule.forFeature([Entity])` in the module
4. Import the module in `AppModule`
5. Use `@AdminRouteController` / `@UserRouteController` on controllers

### Database Migrations

The migration CLI targets `src/core/data-source/app.data-source.ts`. Always generate migrations (don't write them manually) and run them before deploying schema changes.

### Environment

The API connects to a **remote MySQL database** (DigitalOcean staging) and **local Redis** at `127.0.0.1:6379`. Redis is optional in dev — the JWT guard falls back to DB if Redis is unavailable.
