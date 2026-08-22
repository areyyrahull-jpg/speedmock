const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

if (typeof globalThis.WebSocket === "undefined") {
  try {
    globalThis.WebSocket = require("ws");
  } catch (error) {
    console.warn("WebSocket polyfill not available for Supabase client initialization.");
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "SUPABASE_URL or Supabase service key missing. Set SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
};