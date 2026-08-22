// apiFetch.js
// ════════════════════════════════════════════════════════
//  Shared fetch helper for calling your Express backend with
//  the JWT from localStorage attached. Same logic AuthContext.jsx
//  uses internally — pulled out here so other files (like
//  TestRunner.jsx) can reuse it without duplicating it.
// ════════════════════════════════════════════════════════

const TOKEN_KEY = "speedmock_auth_token";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const apiFetch = async (path, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error("SESSION_EXPIRED");
  }

  return { ok: res.ok, status: res.status, data };
};
