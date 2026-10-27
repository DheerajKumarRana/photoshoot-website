#!/usr/bin/env node
/**
 * Gives someone access to the website editor at /admin.
 *
 *   npm run admin -- you@example.com              new login (prints a password) or
 *                                                  makes an existing login an editor
 *   npm run admin -- you@example.com "NewPass123" sets that password
 *   npm run admin -- you@example.com --remove      takes editor access away
 *
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env. Runs on your
 * computer only.
 */
import { readFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";

const args = process.argv.slice(2);
const remove = args.includes("--remove");
const [email, password] = args.filter((a) => a !== "--remove");
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
  fail("Give the editor's email: npm run admin -- you@example.com");
if (password && password.length < 8) fail("Passwords need at least 8 characters.");

if (!existsSync(".env")) fail("No .env file. Copy .env.example to .env and fill it in.");
const env = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_ = (env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) fail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in .env.");

const call = async (path, { method = "GET", body, prefer } = {}) => {
  const res = await fetch(`${URL_}${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
};

// Find the login by email (Supabase lists users a page at a time).
async function findUser() {
  for (let page = 1; page < 50; page++) {
    const r = await call(`/auth/v1/admin/users?page=${page}&per_page=200`);
    if (!r.ok) fail(`Couldn't list users (${r.status}): ${JSON.stringify(r.data).slice(0, 200)}`);
    const users = r.data.users || [];
    const u = users.find((x) => (x.email || "").toLowerCase() === email.toLowerCase());
    if (u || users.length < 200) return u || null;
  }
  return null;
}

let user = await findUser();

if (remove) {
  if (!user) fail(`No login exists for ${email}.`);
  const r = await call(`/rest/v1/admins?user_id=eq.${user.id}`, { method: "DELETE" });
  if (!r.ok) fail(`Couldn't remove editor access (${r.status}).`);
  console.log(`✔ ${email} is no longer an editor. (The login still exists but can't change anything.)`);
  process.exit(0);
}

let newPassword = password;
if (!user) {
  newPassword ||= randomBytes(9).toString("base64url");
  const r = await call("/auth/v1/admin/users", { method: "POST", body: { email, password: newPassword, email_confirm: true } });
  if (!r.ok) fail(`Couldn't create the login (${r.status}): ${r.data?.msg || r.data?.message || JSON.stringify(r.data)}`);
  user = r.data;
  console.log(`✔ Created a login for ${email}`);
} else if (password) {
  const r = await call(`/auth/v1/admin/users/${user.id}`, { method: "PUT", body: { password, email_confirm: true } });
  if (!r.ok) fail(`Couldn't set the password (${r.status}): ${r.data?.msg || r.data?.message || ""}`);
  console.log(`✔ Password updated for ${email}`);
}

const r = await call("/rest/v1/admins?on_conflict=user_id", {
  method: "POST", body: [{ user_id: user.id, email }], prefer: "resolution=merge-duplicates,return=minimal",
});
if (!r.ok) fail(`Couldn't add editor access (${r.status}): ${JSON.stringify(r.data).slice(0, 200)}`);

console.log(`✔ ${email} can now edit the website.`);
console.log(`  Sign in at  /admin  (locally: http://localhost:3000/admin)`);
if (newPassword && !password) console.log(`  Password:   ${newPassword}   (change it any time: npm run admin -- ${email} "new password")`);

function fail(msg) { console.error(`\x1b[31m✖\x1b[0m ${msg}`); process.exit(1); }
