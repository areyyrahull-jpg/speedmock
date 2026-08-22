/**
 * ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────
 * Route guard for SpeedMock. Wraps any page that requires login.
 * Optionally also checks for an active subscription.
 *
 * Setup in App.jsx / router.jsx:
 *
 *   import ProtectedRoute from "../common/ProtectedRoute";
 *
 *   // Public routes — no wrapper needed
 *   <Route path="/"        element={<Home />} />
 *   <Route path="/pricing" element={<Pricing />} />
 *   <Route path="/login"   element={<Login />} />
 *
 *   // Private routes — wrap with ProtectedRoute
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   } />
 *
 *   // Subscription-gated routes
 *   <Route path="/test/:id" element={
 *     <ProtectedRoute requireSubscription>
 *       <TestAttempt />
 *     </ProtectedRoute>
 *   } />
 *
 * What it does:
 *   1. Shows a loader while auth is being checked (e.g. on page refresh)
 *   2. If NOT logged in → redirects to /login, saves current URL
 *      so after login the user comes back to where they were
 *   3. If logged in but no active subscription (and requireSubscription=true)
 *      → redirects to /subscription with an upgrade prompt
 *   4. If all checks pass → renders the child page normally
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// ─── LOADER (inline — no external dep needed) ─────────────────────
function AuthLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0e0e0e",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, zIndex: 999,
    }}>
      {/* spinning ring */}
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid rgba(217,70,239,0.15)",
        borderTopColor: "#d946ef",
        animation: "pr-spin 0.75s linear infinite",
      }} />
      <style>{`@keyframes pr-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12, color: "#555", letterSpacing: 1,
      }}>
        Checking session...
      </span>
    </div>
  );
}

// ─── SUBSCRIPTION GATE PAGE ───────────────────────────────────────
function SubscriptionGate({ onUpgrade }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0e0e0e",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#141414",
        border: "1px solid rgba(217,70,239,0.2)",
        borderRadius: 20, padding: "48px 40px",
        maxWidth: 440, width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 3, color: "#f0f0f0", marginBottom: 10,
        }}>
          SUBSCRIPTION REQUIRED
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 28,
        }}>
          This content is available to subscribed members only.
          Unlock unlimited PYQs, mock tests and more — starting at just ₹30.
        </p>
        <button
          onClick={onUpgrade}
          style={{
            width: "100%", padding: 14,
            background: "linear-gradient(135deg,#d946ef,#a21caf)",
            color: "#fff", border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 20px rgba(217,70,239,0.35)",
          }}
        >
          View Plans — from ₹30 →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
/**
 * @param {node}    children
 * @param {boolean} requireSubscription  — also checks for active plan
 *
 * Reads from a simple auth object you pass or from your AuthContext.
 * Replace the mock `useAuth()` below with your real context hook.
 */

// ── MOCK AUTH HOOK — replace with your real AuthContext ──────────
// In your real app this will be:
//   import { useAuth } from "../../context/AuthContext";
//
// The hook must return:
//   {
//     user:          null | { name, mobile, ... }
//     isLoading:     boolean   — true while checking session on refresh
//     subscription:  null | { plan, status, expiryDate }
//   }



// ─────────────────────────────────────────────────────────────────
export default function ProtectedRoute({ children, requireSubscription = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  

  const { user, loading: isLoading, isAuthenticated, subscription } = auth;

  // ── 1. Loading state — show spinner while checking session
  if (isLoading) {
    return <AuthLoader />;
  }

  // ── 2. Not authenticated — redirect to login
  if (!isAuthenticated || !user) {
    
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ── 3. Logged in but subscription required and not subscribed
  if (requireSubscription && (!subscription || subscription.status !== "active")) {
    return (
      <SubscriptionGate
        onUpgrade={() => window.location.href = "/subscription"}
      />
    );
  }

  // ── 4. All checks pass — render the protected page
  return children;
}
