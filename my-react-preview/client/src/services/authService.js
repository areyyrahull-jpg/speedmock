/**
 * services/authService.js
 * Frontend authentication API client
 * Handles all auth communication with the backend
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Persistent per-browser device id. Generated once, stored forever (until
 * cleared) so the backend can recognize "this is the same device" across
 * repeated logins instead of creating a new session row every time.
 */
export const getOrCreateDeviceId = () => {
  let id = localStorage.getItem("speedmock_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("speedmock_device_id", id);
  }
  return id;
};

const getDeviceType = () =>
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";

const getDeviceName = () => {
  const ua = navigator.userAgent;
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "Browser";
  const os =
    /Windows/.test(ua) ? "Windows" :
    /Mac OS/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
};

/**
 * Standard headers for any authenticated request. Sending X-Device-Id lets
 * the backend recognize when THIS device has been logged out because
 * another device took its slot (see validate.middleware.js).
 */
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("speedmock_auth_token")}`,
  "X-Device-Id": localStorage.getItem("speedmock_device_id") || "",
});

/**
 * Thrown by authFetch when the backend reports this device was evicted
 * because another device signed in and the plan's device limit was hit.
 */
export class DeviceLoggedOutError extends Error {}

/**
 * Wrapper around fetch for authenticated calls. Use this anywhere in the
 * app that needs an authed request — it automatically attaches the token +
 * device id, and throws DeviceLoggedOutError on eviction so callers (or a
 * single top-level handler in AuthContext) can react uniformly.
 */
export const authFetch = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && data.code === "DEVICE_LOGGED_OUT") {
    throw new DeviceLoggedOutError(data.message || "Logged out: another device signed in.");
  }
  if (!response.ok) throw new Error(data.message || "Request failed");

  return data;
};

/**
 * Check if a mobile number is already registered
 */
export const checkMobile = async (mobile) => {
  try {
    const response = await fetch(`${API_URL}/auth/check-mobile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to check mobile");
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Send OTP for registration
 */
export const sendRegistrationOTP = async (mobile) => {
  try {
    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send OTP");
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Register with OTP verification
 */
export const register = async (name, mobile, password, email, otp, referralCode) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, password, email, otp, referralCode: referralCode?.trim() || null }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    
    // Store token in localStorage (same keys used everywhere — see login())
    if (data.token) {
      localStorage.setItem("speedmock_auth_token", data.token);
      localStorage.setItem("speedmock_user", JSON.stringify(data.user));
      if (data.deviceId) localStorage.setItem("speedmock_device_id", data.deviceId);
    }
    
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Login with mobile and password
 */
export const login = async (mobile, password) => {
  try {
    
    
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile,
        password,
        deviceId:   getOrCreateDeviceId(),
        deviceName: getDeviceName(),
        deviceType: getDeviceType(),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    
    // Store token and user in localStorage
    if (data.token) {
      localStorage.setItem("speedmock_auth_token", data.token);
      localStorage.setItem("speedmock_user", JSON.stringify(data.user));
      if (data.deviceId) localStorage.setItem("speedmock_device_id", data.deviceId);
    }

    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Send recovery OTP for password reset
 */
export const sendRecoveryOTP = async (mobile) => {
  try {
    const response = await fetch(`${API_URL}/auth/send-recovery-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send OTP");
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Verify recovery OTP
 */
export const verifyRecoveryOTP = async (mobile, otp) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-recovery-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "OTP verification failed");
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (mobile, newPassword, resetToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, newPassword, resetToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Password reset failed");
    
    // Store token and user in localStorage (same keys used everywhere)
    if (data.token) {
      localStorage.setItem("speedmock_auth_token", data.token);
      localStorage.setItem("speedmock_user", JSON.stringify(data.user));
      if (data.deviceId) localStorage.setItem("speedmock_device_id", data.deviceId);
    }
    
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Get current user profile (requires auth token)
 */
export const getMe = async () => {
  try {
    const token = localStorage.getItem("speedmock_auth_token");
    if (!token) throw new Error("No auth token found");
    return await authFetch("/auth/me", { method: "GET" });
  } catch (error) {
    
    throw error;
  }
};

/**
 * Get currently active device sessions (not history — only live sessions)
 */
export const getSessions = async () => {
  return authFetch("/auth/sessions", { method: "GET" });
};

/**
 * Log out one specific device by its device_id
 */
export const logoutDevice = async (deviceId) => {
  return authFetch("/auth/logout-device", {
    method: "POST",
    body: JSON.stringify({ deviceId }),
  });
};

/**
 * Log out every device except this one
 */
export const logoutAllOthers = async () => {
  return authFetch("/auth/logout-all", {
    method: "POST",
    body: JSON.stringify({ currentDeviceId: getOrCreateDeviceId() }),
  });
};

/**
 * Logout user
 */
export const logout = () => {
  try {
    localStorage.removeItem("speedmock_auth_token");
    localStorage.removeItem("speedmock_user");
    localStorage.removeItem("speedmock_device_id");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    
    throw error;
  }
};

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem("speedmock_auth_token");
};

/**
 * Get stored user
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("speedmock_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default {
  checkMobile,
  sendRegistrationOTP,
  register,
  login,
  sendRecoveryOTP,
  verifyRecoveryOTP,
  resetPassword,
  getMe,
  logout,
  getAuthToken,
  getStoredUser,
  isAuthenticated,
  getSessions,
  logoutDevice,
  logoutAllOthers,
  getOrCreateDeviceId,
  authFetch,
  authHeaders,
  DeviceLoggedOutError,
};