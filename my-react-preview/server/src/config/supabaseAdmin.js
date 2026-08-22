// server/supabaseAdmin.js
//
// Service-role client — only ever imported in backend code. Requires:
//   SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...
// in your server's .env. This key bypasses RLS, which is fine here because
// every route that uses it checks req.userId from your own auth middleware
// before touching the database.

const { createClient } = require("@supabase/supabase-js");

if (typeof globalThis.WebSocket === "undefined") {
  try {
    globalThis.WebSocket = require("ws");
  } catch (error) {
    console.warn("WebSocket polyfill not available for Supabase admin client initialization.");
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or Supabase service key in environment. Set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

module.exports = { supabaseAdmin };
