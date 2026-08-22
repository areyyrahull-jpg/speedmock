/**
 * context/AuthContext.jsx
 * Global authentication state management using React Context
 * Handles user login state, token storage, and auth operations
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import authService, { DeviceLoggedOutError } from "../services/authService";

export const AuthContext = createContext();

// How often to check with the server whether this device is still valid.
const SESSION_CHECK_INTERVAL_MS = 45_000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Set when this device got kicked out because another device signed in —
  // the UI can show this as a toast/modal, then clear it.
  const [deviceLoggedOutMessage, setDeviceLoggedOutMessage] = useState(null);

  // Initialize auth state on mount (check if user was previously logged in)
useEffect(() => {
  const initializeAuth = async () => {
    try {
      const token = authService.getAuthToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);



const login = useCallback(async (mobile, password) => {
  try {
    setLoading(true);
    setError(null);
    const data = await authService.login(mobile, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  const register = useCallback(async (name, mobile, password, email, otp, referralCode) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(name, mobile, password, email, otp, referralCode);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      
      setError(err.message);
    }
  }, []);

  // Called when the backend reports this device was evicted (plan device
  // limit exceeded, another device signed in and took this slot).
  const forceLogoutDeviceEvicted = useCallback((message) => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setDeviceLoggedOutMessage(message);
  }, []);

  const clearDeviceLoggedOutMessage = useCallback(() => setDeviceLoggedOutMessage(null), []);

  // Periodically re-validate this device with the server. If it's been
  // evicted, getMe() throws DeviceLoggedOutError — that's the trigger for
  // "another device signed in" — no websocket needed, just polling.
  useEffect(() => {
    if (!isAuthenticated) return;

    const check = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user); // also keeps plan/devicesAllowed fresh
      } catch (err) {
        if (err instanceof DeviceLoggedOutError) {
          forceLogoutDeviceEvicted(err.message);
        }
        // other errors (network blip, etc.) are ignored — don't log the
        // user out just because one poll failed
      }
    };

    const interval = setInterval(check, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, forceLogoutDeviceEvicted]);

  const resetPassword = useCallback(async (mobile, newPassword, resetToken) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.resetPassword(mobile, newPassword, resetToken);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    deviceLoggedOutMessage,
    clearDeviceLoggedOutMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}