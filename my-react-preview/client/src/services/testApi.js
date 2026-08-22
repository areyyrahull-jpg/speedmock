// src/api/testsApi.js
//
// Talks to your Express backend (server/routes/tests.js), not Supabase
// directly — your backend holds the service role key, the browser never
// should. Uses the same authService your AuthContext already calls, so
// the token always matches whatever's currently logged in.

import authService from "../services/authService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  // Try the current key first, then fall back to the old "token" key
  const token = authService.getAuthToken()
    || localStorage.getItem("token")
    || localStorage.getItem("speedmock_token")
    || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const FETCH_OPTS = {
  credentials: "include", // ← sends the httpOnly session cookie your other routes use
};

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function fetchTestHistory() {
  return fetch(`${API_BASE}/tests/history`, { ...FETCH_OPTS, headers: authHeaders() }).then(handle);
}

export function fetchAttemptDetail(attemptId, lang = "en") {
  return fetch(`${API_BASE}/tests/attempts/${attemptId}?lang=${lang}`, { ...FETCH_OPTS, headers: authHeaders() }).then(handle);
}

export function reattemptTest(testId, testType) {
  return fetch(`${API_BASE}/tests/reattempt`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ testId, testType }),
  }).then(handle);
}

export function submitAttempt(attemptId, payload) {
  return fetch(`${API_BASE}/tests/attempts/${attemptId}/submit`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}

export function pauseAttempt(attemptId, payload) {
  return fetch(`${API_BASE}/tests/attempts/${attemptId}/pause`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handle);
}

export function resumeAttempt(attemptId) {
  return fetch(`${API_BASE}/tests/attempts/${attemptId}/resume`, {
    ...FETCH_OPTS,
    headers: authHeaders(),
  }).then(handle);
}
