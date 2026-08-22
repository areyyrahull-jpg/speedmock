/**
 * context/GoalContext.jsx
 * Single source of truth for daily goal target + today's progress.
 * Reads from  GET  /api/goal/today
 * Updates via POST /api/goal/target
 * Increments via POST /api/goal/increment  (call from practice screens)
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService"; // ← adjust path to match your project structure

const GoalContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  // "speedmock_auth_token" was never actually written anywhere else in the
  // app — every request here was silently going out with no Authorization
  // header at all. Use the same shared authService (+ fallback keys) that
  // testApi.js already uses successfully, so the token always matches
  // whatever's currently logged in.
  const token = authService.getAuthToken()
    || localStorage.getItem("token")
    || localStorage.getItem("speedmock_token")
    || localStorage.getItem("authToken");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export function GoalProvider({ children }) {
  const [goalTarget, setGoalTarget] = useState(50);
  const [goalDone,   setGoalDone]   = useState(0);
  const [loading,    setLoading]    = useState(true);

  const refresh = useCallback(async () => {
    const token = authService.getAuthToken()
      || localStorage.getItem("token")
      || localStorage.getItem("speedmock_token")
      || localStorage.getItem("authToken");
    if (!token) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API}/goal/today`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setGoalTarget(data.target ?? 50);
        setGoalDone(data.done   ?? 0);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Change the daily target (navbar goal buttons / custom input)
  const updateGoalTarget = async (n) => {
    setGoalTarget(n); // optimistic
    try {
      const res  = await fetch(`${API}/goal/target`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ target: n }),
      });
      const data = await res.json();
      if (!data.success) setGoalTarget(goalTarget); // revert on failure
    } catch (err) {
      
      setGoalTarget(goalTarget);
    }
  };

  // Call from practice/typing screens after each question answered
  const incrementGoal = async (count = 1) => {
    setGoalDone(prev => prev + count); // optimistic
    try {
      const res  = await fetch(`${API}/goal/increment`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ count }),
      });
      const data = await res.json();
      // Sync with server value (server is authoritative)
      if (data.success) {
        setGoalDone(data.done);
        setGoalTarget(data.target);
      }
    } catch (err) {
      
    }
  };

  return (
    <GoalContext.Provider value={{
      goalTarget, goalDone,
      setGoalDone, updateGoalTarget, incrementGoal,
      loading, refresh,
    }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error("useGoal must be used inside <GoalProvider>");
  return ctx;
}
