#!/usr/bin/env node
/**
 * Siezal Vendor Integration API – test harness
 * Zero dependencies. Requires Node 18+ (uses global fetch).
 *
 *   node run.mjs                 # read-only suite (safe: login + branches + products list/search)
 *   node run.mjs --write         # also runs create + update + verify (WRITES to the live catalog)
 *   node run.mjs --write --branch 2 --category soft-drinks
 *   node run.mjs --update SKU-123 --branch 1   # update an existing product only
 *
 * Config is read from environment variables, falling back to ./.env.local:
 *   SIEZAL_BASE_URL, VENDOR_CLIENT_ID, VENDOR_CLIENT_SECRET,
 *   TEST_BRANCH_ID, TEST_CATEGORY_SLUG
 *
 * Endpoints under test (no global prefix on the server):
 *   POST  /v1/integrations/vendor/auth/login
 *   GET   /v1/integrations/vendor/branches
 *   GET   /v1/integrations/vendor/products
 *   POST  /v1/integrations/vendor/products
 *   PATCH /v1/integrations/vendor/products/:sku
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------------
// Config loading (.env.local -> process.env, without clobbering real env vars)
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(__dirname, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (val.startsWith("#")) continue;
      val = val.replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* no .env.local – rely on process.env */
  }
}
loadEnvLocal();

const BASE_URL = (process.env.SIEZAL_BASE_URL || "https://apis.siezal.com").replace(/\/+$/, "");
const CLIENT_ID = process.env.VENDOR_CLIENT_ID;
const CLIENT_SECRET = process.env.VENDOR_CLIENT_SECRET;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const DO_WRITE = has("--write") || has("--create") || has("--update");
const UPDATE_ONLY_SKU = opt("--update", null);
const BRANCH_ID = Number(opt("--branch", process.env.TEST_BRANCH_ID || 1));
const CATEGORY_SLUG = opt("--category", process.env.TEST_CATEGORY_SLUG || "soft-drinks");

// ---------------------------------------------------------------------------
// Tiny test framework
// ---------------------------------------------------------------------------
const C = {
  reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m",
  yellow: "\x1b[33m", cyan: "\x1b[36m", dim: "\x1b[2m", bold: "\x1b[1m",
};
const results = [];
let TOKEN = null;

function maskSecret(s) {
  if (!s) return "(missing)";
  return s.length <= 8 ? "****" : `${s.slice(0, 4)}…${s.slice(-4)}`;
}

async function api(method, path, { token, body, query } = {}) {
  let url = `${BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null),
    ).toString();
    if (qs) url += `?${qs}`;
  }
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const started = Date.now();
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const ms = Date.now() - started;
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, ok: res.ok, json, ms, url, method };
}

async function test(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, pass: true });
    console.log(`  ${C.green}✓${C.reset} ${name}${detail ? ` ${C.dim}— ${detail}${C.reset}` : ""}`);
  } catch (err) {
    results.push({ name, pass: false, err });
    console.log(`  ${C.red}✗ ${name}${C.reset}`);
    console.log(`    ${C.red}${err.message}${C.reset}`);
    if (err.response) {
      console.log(`    ${C.dim}HTTP ${err.response.status} ${JSON.stringify(err.response.json)?.slice(0, 400)}${C.reset}`);
    }
  }
}

function assert(cond, msg, response) {
  if (!cond) {
    const e = new Error(msg);
    if (response) e.response = response;
    throw e;
  }
}

function section(title) {
  console.log(`\n${C.bold}${C.cyan}${title}${C.reset}`);
}

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------
async function authSuite() {
  section("Auth");

  await test("rejects bad credentials (401)", async () => {
    const r = await api("POST", "/v1/integrations/vendor/auth/login", {
      body: { clientId: CLIENT_ID, clientSecret: "definitely-wrong-secret" },
    });
    assert(r.status === 401, `expected 401, got ${r.status}`, r);
    return `${r.ms}ms`;
  });

  await test("login returns an access token", async () => {
    const r = await api("POST", "/v1/integrations/vendor/auth/login", {
      body: { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    assert(r.json?.data?.accessToken, "no accessToken in response", r);
    TOKEN = r.json.data.accessToken;
    const v = r.json.data.vendor;
    return `vendor=${v?.name} (id ${v?.id}, code ${v?.code}), expiresIn=${r.json.data.expiresIn}, ${r.ms}ms`;
  });

  await test("protected route rejects missing token (400)", async () => {
    const r = await api("GET", "/v1/integrations/vendor/branches");
    assert(r.status === 400 || r.status === 401, `expected 400/401, got ${r.status}`, r);
    return `status ${r.status}`;
  });
}

async function readSuite() {
  section("Read-only");

  await test("GET /branches returns active branches", async () => {
    const r = await api("GET", "/v1/integrations/vendor/branches", { token: TOKEN });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    assert(Array.isArray(r.json?.data), "data is not an array", r);
    const names = r.json.data.map((b) => `${b.id}:${b.name.trim()}`).join(", ");
    return `${r.json.data.length} branches [${names}], ${r.ms}ms`;
  });

  await test("GET /products is paginated", async () => {
    const r = await api("GET", "/v1/integrations/vendor/products", {
      token: TOKEN, query: { page: 1, limit: 5 },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    assert(Array.isArray(r.json?.data), "data is not an array", r);
    const p = r.json.pagination;
    assert(p, "no pagination block", r);
    return `page ${p.currentPage}/${p.totalPages}, ${p.totalItems} total, ${r.json.data.length} on page, ${r.ms}ms`;
  });

  await test("GET /products?q= filters", async () => {
    const r = await api("GET", "/v1/integrations/vendor/products", {
      token: TOKEN, query: { page: 1, limit: 5, q: "a" },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    return `${r.json?.data?.length ?? 0} match(es), ${r.ms}ms`;
  });
}

async function writeSuite() {
  section("Write (live catalog mutations)");

  // ----- Update an existing SKU only -----
  if (UPDATE_ONLY_SKU) {
    await test(`PATCH /products/${UPDATE_ONLY_SKU}`, async () => {
      const r = await api("PATCH", `/v1/integrations/vendor/products/${encodeURIComponent(UPDATE_ONLY_SKU)}`, {
        token: TOKEN,
        body: { branchId: BRANCH_ID, price: 199, stockQuantity: 5 },
      });
      assert(r.status === 200, `expected 200, got ${r.status}`, r);
      return `updated product id ${r.json?.data?.id}, ${r.ms}ms`;
    });
    return;
  }

  // ----- Full create -> update -> verify cycle on a fresh test SKU -----
  const sku = `TEST-VENDOR-${Date.now()}`;
  console.log(`  ${C.dim}using test SKU ${sku} on branch ${BRANCH_ID}, category "${CATEGORY_SLUG}"${C.reset}`);

  await test("POST /products creates a product", async () => {
    const r = await api("POST", "/v1/integrations/vendor/products", {
      token: TOKEN,
      body: {
        sku,
        title: `Vendor API Test ${sku}`,
        categorySlug: CATEGORY_SLUG,
        price: 100,
        salePrice: 90,
        stockQuantity: 12,
        status: "available",
        branchId: BRANCH_ID,
        unit: "piece",
        isGstEnabled: true,
        gstFee: 18,
        shortDescription: "Created by vendor-api test harness",
      },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    assert(r.json?.data?.id, "no product id returned", r);
    return `id ${r.json.data.id}, ${r.ms}ms`;
  });

  await test("POST same SKU+branch is rejected (409 conflict)", async () => {
    const r = await api("POST", "/v1/integrations/vendor/products", {
      token: TOKEN,
      body: {
        sku, title: "dup", categorySlug: CATEGORY_SLUG, price: 1, stockQuantity: 1,
        status: "available", branchId: BRANCH_ID, unit: "piece", isGstEnabled: false,
      },
    });
    assert(r.status === 409, `expected 409, got ${r.status}`, r);
    return `status ${r.status}`;
  });

  await test("PATCH /products/:sku updates price & stock", async () => {
    const r = await api("PATCH", `/v1/integrations/vendor/products/${encodeURIComponent(sku)}`, {
      token: TOKEN,
      body: { branchId: BRANCH_ID, price: 150, stockQuantity: 0 },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    // stockQuantity 0 must force status -> out_of_stock
    assert(
      r.json?.data?.status === "out_of_stock",
      `expected status out_of_stock after stock=0, got "${r.json?.data?.status}"`,
      r,
    );
    return `price=${r.json.data.price}, status=${r.json.data.status}, ${r.ms}ms`;
  });

  await test("PATCH unknown SKU returns 404", async () => {
    const r = await api("PATCH", `/v1/integrations/vendor/products/NOPE-${Date.now()}`, {
      token: TOKEN, body: { branchId: BRANCH_ID, price: 1 },
    });
    assert(r.status === 404, `expected 404, got ${r.status}`, r);
    return `status ${r.status}`;
  });

  await test("created product is findable via GET /products?q=", async () => {
    const r = await api("GET", "/v1/integrations/vendor/products", {
      token: TOKEN, query: { page: 1, limit: 10, q: sku },
    });
    assert(r.status === 200, `expected 200, got ${r.status}`, r);
    const found = (r.json?.data || []).some((p) => (p.sku || []).includes(sku));
    assert(found, `created SKU ${sku} not found in search results`, r);
    return `found ${sku}, ${r.ms}ms`;
  });

  console.log(`  ${C.yellow}note: created product "${sku}" remains in the catalog (no vendor delete endpoint).${C.reset}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log(`${C.bold}Siezal Vendor API test harness${C.reset}`);
  console.log(`${C.dim}base    ${BASE_URL}`);
  console.log(`client  ${CLIENT_ID || "(missing!)"}`);
  console.log(`secret  ${maskSecret(CLIENT_SECRET)}`);
  console.log(`mode    ${DO_WRITE ? "READ + WRITE" : "read-only"}${C.reset}`);

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(`\n${C.red}Missing VENDOR_CLIENT_ID / VENDOR_CLIENT_SECRET (set in .env.local or env).${C.reset}`);
    process.exit(2);
  }

  await authSuite();
  if (!TOKEN) {
    console.error(`\n${C.red}Login failed – cannot continue.${C.reset}`);
    process.exit(1);
  }
  await readSuite();
  if (DO_WRITE) await writeSuite();
  else console.log(`\n${C.dim}(write tests skipped – pass --write to exercise POST/PATCH)${C.reset}`);

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\n${C.bold}Summary:${C.reset} ${C.green}${passed} passed${C.reset}` +
    (failed ? `, ${C.red}${failed} failed${C.reset}` : "") + ` of ${results.length}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(`${C.red}Fatal:${C.reset} ${e.stack || e.message}`);
  process.exit(1);
});
