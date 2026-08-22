/**
 * services/session.service.js
 * Manages per-device login sessions stored in Redis.
 *
 * Redis key structure:
 *   sessions:{userId}  →  JSON object { [deviceId]: { deviceName, deviceType, location, createdAt } }
 *
 * Used by:
 *   - auth_routes.js  → GET  /api/auth/sessions
 *   - auth_routes.js  → POST /api/auth/logout-device
 *   - auth_routes.js  → POST /api/auth/logout-all
 *   - setting.jsx     → loadDevices(), logoutDevice(), logoutAllOthers()
 */

const redis  = require("../config/redis");
const crypto = require("crypto");

// Sessions expire after 30 days of inactivity (matches the UI copy in setting.jsx)
const SESSION_TTL_SECS = 30 * 24 * 60 * 60;

// ─── helpers ────────────────────────────────────────────────────────────────

function sessionKey(userId) {
  return `sessions:${userId}`;
}

async function readSessions(userId) {
  const raw = await redis.get(sessionKey(userId));
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

async function writeSessions(userId, sessions) {
  await redis.set(sessionKey(userId), JSON.stringify(sessions), "EX", SESSION_TTL_SECS);
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * createSession
 * Called on login / register. If `deviceId` is supplied (persisted client-side
 * in localStorage), the existing entry for that device is UPDATED in place —
 * this is what prevents "history": the same browser always maps to the same
 * key instead of getting a fresh random one on every login. Only generates a
 * new id the first time a device is ever seen.
 *
 * @param {string} userId
 * @param {object} info  - { deviceId?, deviceName?, deviceType?, location? }
 * @returns {string}  deviceId
 */
async function createSession(userId, info = {}) {
  const deviceId = info.deviceId || crypto.randomUUID();
  const sessions = await readSessions(userId);

  const existing = sessions[deviceId];
  sessions[deviceId] = {
    deviceName: info.deviceName || existing?.deviceName || "Unknown Device",
    deviceType: info.deviceType || existing?.deviceType || "desktop",
    location:   info.location   || existing?.location   || "India",
    createdAt:  existing?.createdAt || new Date().toISOString(), // preserve first-seen time
    lastActive: new Date().toISOString(),
  };

  await writeSessions(userId, sessions);
  return deviceId;
}

/**
 * getSessions
 * Returns all active sessions for a user.
 * Shape: { [deviceId]: { deviceName, deviceType, location, createdAt } }
 *
 * @param {string} userId
 * @returns {object}
 */
async function getSessions(userId) {
  return readSessions(userId);
}

/**
 * validateSession
 * Returns true if a specific deviceId is still active for this user.
 * Used by authenticateToken middleware to reject revoked devices.
 *
 * @param {string} userId
 * @param {string} deviceId
 * @returns {boolean}
 */
async function validateSession(userId, deviceId) {
  const sessions = await readSessions(userId);
  return !!sessions[deviceId];
}

/**
 * removeSession
 * Logs out a single device (called from /logout-device and /logout).
 *
 * @param {string} userId
 * @param {string} deviceId
 */
async function removeSession(userId, deviceId) {
  const sessions = await readSessions(userId);
  delete sessions[deviceId];
  await writeSessions(userId, sessions);
}

/**
 * removeAllSessions
 * Logs out every device except optionally the current one.
 * Called from /logout-all.
 *
 * @param {string} userId
 * @param {string|null} exceptDeviceId  - keep this device logged in (pass null to wipe all)
 */
async function removeAllSessions(userId, exceptDeviceId = null) {
  if (!exceptDeviceId) {
    // wipe everything
    await redis.del(sessionKey(userId));
    return;
  }

  const sessions = await readSessions(userId);
  const kept = sessions[exceptDeviceId];      // keep current device
  const fresh = kept ? { [exceptDeviceId]: kept } : {};
  await writeSessions(userId, fresh);
}

/**
 * enforceDeviceLimit
 * Called right before createSession on login. If the incoming deviceId is
 * NEW (not already an active session) and adding it would push the user
 * over their plan's device limit, evicts the least-recently-active OTHER
 * device(s) to make room.
 *
 * The evicted device isn't told directly (no websocket) — instead its next
 * authenticated request will fail validateSession() in the auth middleware,
 * which is what actually forces it to log out client-side.
 *
 * @param {string} userId
 * @param {string} deviceId  - the device currently logging in
 * @param {number} limit     - max simultaneous devices for this user's plan
 * @returns {string[]}  deviceIds that were evicted (for logging)
 */
async function enforceDeviceLimit(userId, deviceId, limit) {
  if (!deviceId || !limit || limit < 1) return [];

  const sessions   = await readSessions(userId);
  const isExisting = !!sessions[deviceId];
  const otherIds   = Object.keys(sessions).filter((id) => id !== deviceId);

  // Room reserved for "this" device (new or existing) is always 1 slot.
  const maxOthers = limit - 1;
  if (otherIds.length <= maxOthers) return [];

  // Oldest-active first — those get evicted to make room.
  const sorted = otherIds.sort(
    (a, b) =>
      new Date(sessions[a].lastActive || sessions[a].createdAt) -
      new Date(sessions[b].lastActive || sessions[b].createdAt)
  );

  const evictCount = otherIds.length - maxOthers;
  const evicted = sorted.slice(0, evictCount);

  evicted.forEach((id) => delete sessions[id]);
  await writeSessions(userId, sessions);

  return evicted;
}

module.exports = {
  createSession,
  getSessions,
  validateSession,
  removeSession,
  removeAllSessions,
  enforceDeviceLimit,
};
