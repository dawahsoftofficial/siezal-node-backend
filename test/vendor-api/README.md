# Vendor Integration API — test harness

Exercises the vendor-facing product endpoints (`src/module/vendor/controller/vendor-integration.controller.ts`).
No build step, no dependencies — just Node 18+ (uses the built-in `fetch`).

## Quick start

```bash
cd apis/test/vendor-api

# Read-only suite — safe, no data changes (login + branches + products list/search)
node run.mjs

# Full suite — ALSO creates + updates a product on the live catalog
node run.mjs --write
```

Credentials and target URL live in `.env.local` (gitignored). Edit that file to point at
local/staging instead of production. Environment variables of the same name override it.

## CLI options

| Flag | Meaning |
|------|---------|
| _(none)_ | Read-only suite only |
| `--write` | Run create → update → verify cycle (writes to the catalog) |
| `--update <sku>` | Update an existing product only (no create) |
| `--branch <id>` | Branch for write tests (default `TEST_BRANCH_ID`, or `1`) |
| `--category <slug>` | Category slug for the created product (default `soft-drinks`) |

## Endpoints

Base URL: `https://apis.siezal.com` (no global prefix; routes are at the root).

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/v1/integrations/vendor/auth/login` | none | Body `{clientId, clientSecret}` → `data.accessToken` (JWT, default 1d) |
| `GET` | `/v1/integrations/vendor/branches` | Bearer | Active branches |
| `GET` | `/v1/integrations/vendor/products` | Bearer | Query: `page`, `limit`, `q`, `branchId` |
| `POST` | `/v1/integrations/vendor/products` | Bearer | Create — see rules below |
| `PATCH` | `/v1/integrations/vendor/products/:sku` | Bearer | Partial update, matched by path SKU + body `branchId` |

Auth is a Bearer JWT: `Authorization: Bearer <accessToken>`. Missing token → `400`,
invalid/expired → `401`.

## Create / update rules (server-side)

- `(sku, branchId)` must be **unique** → duplicate create returns **409 Conflict**.
- `categorySlug` must resolve to an existing category (e.g. `soft-drinks`, `feminine-care`).
- `branchId` must reference an existing branch (live: `1` Ghauri VIP, `2` Bhatta Chowk, `3` DHA-1, `4` Bahria Phase 7).
- `stockQuantity: 0` **forces** `status` to `out_of_stock`, regardless of the `status` sent.
- `gstFee` is stored only when `isGstEnabled: true`; otherwise nulled.
- `image` defaults to a placeholder URL if omitted.
- Update (`PATCH`) is partial; `branchId` is **required** in the body to locate the product. Unknown (sku, branch) → **404**.

### Create payload (required fields)

```jsonc
{
  "sku": "SZ-001",            // single value, no commas
  "title": "Imported Product",
  "categorySlug": "soft-drinks",
  "price": 100,
  "stockQuantity": 12,
  "status": "available",     // available | out_of_stock | discontinued
  "branchId": 1,
  "unit": "piece",           // piece|pack|box|dozen|gram|kilogram|ton|milliliter|liter|inch|foot|meter|centimeter
  "isGstEnabled": true,
  "gstFee": 18               // required only when isGstEnabled is true
  // optional: slug, shortDescription, description, seoTitle, seoDescription, salePrice, inventoryId, image
}
```

## ⚠️ Production note

`.env.local` currently points at **production** (`apis.siezal.com`) with live vendor
credentials. `--write` creates **real** catalog products and there is **no vendor delete
endpoint** — created test products persist (clean up via the admin panel / product-admin API).
The harness uses timestamped `TEST-VENDOR-<ts>` SKUs so test data is easy to spot.

## Other formats

- `vendor.http` — same requests for the VS Code **REST Client** extension / JetBrains HTTP client.
- Live Swagger docs: `https://apis.siezal.com/vendor-docs`.
