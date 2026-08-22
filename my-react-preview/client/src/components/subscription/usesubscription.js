// useSubscription.js
// ════════════════════════════════════════════════════════
//  Single source of truth for a user's subscription/trial state.
//  Fetches once, derives two separate views:
//
//    dashboardStatus → used by Dashboard.jsx for the trial-gating
//                       banner ({ status: "trial"|"active"|"expired",
//                       testsLocked, practiceLocked, ... }).
//                       testsLocked and practiceLocked are independent —
//                       Test Series locks the moment the 2 free tests
//                       are used, Practice Question Bank stays open for
//                       the full 3-day trial window regardless of test
//                       count. Only once the 3-day window itself ends
//                       do both lock together (status becomes "expired").
//
//    billingStatus   → used by the Subscription page's plan banner
//                       ({ status: "none"|"active"|"warning"|"expired", ... })
//
//  Also returns:
//    payments        → used by Subscription page's payment history table
//
//  Tables used:
//    subscriptions  (id, user_id, plan_id, plan_name, status,
//                    starts_at, end_date, amount)
//    free_credits   (user_id, credits_remaining, created_at)
//    payments       (id, user_id, plan_name, amount, status,
//                    razorpay_order_id, created_at)
//
//  Trial lock rule: locked when EITHER the 3-day window (from
//  free_credits.created_at) OR the free credits have run out —
//  not both at once.
//
//  Caching: results are cached in-memory per userId (module-level
//  Map) so navigating back to the dashboard renders instantly from
//  cache instead of re-running 3 queries on every mount. A
//  background silent refresh kicks in if the cached data is older
//  than CACHE_TTL_MS. Call `refetch()` for a guaranteed fresh fetch
//  (e.g. right after a successful payment).
// ════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../services/supabaseClient"; // adjust path if needed

const FREE_TESTS_LIMIT = 2;
const TRIAL_DAYS       = 3;

// ── In-memory cache, keyed by userId ──────────────────────────────
// Every previous version of this hook re-ran 3 sequential Supabase
// queries on EVERY mount (e.g. every time the user navigated back to
// the dashboard) with nothing remembered between mounts. That round
// trip was the actual cause of the dashboard feeling laggy on return
// visits. Caching the last known result lets a remount render
// INSTANTLY from cache while a fresh fetch quietly runs in the
// background (stale-while-revalidate) — only the very first load in
// a session pays the full network cost.
const cache = new Map(); // userId -> raw payload
const CACHE_TTL_MS = 60_000; // background-refresh if cache entry older than this

export function useSubscription(userId) {
  const [raw, setRaw]         = useState(() => cache.get(userId)?.data ?? null);
  const [loading, setLoading] = useState(() => !cache.has(userId));
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async (opts = {}) => {
    const { silent = false } = opts; // silent=true → background refresh, don't flip loading=true

    if (!userId) {
      setRaw({ row: null, creditsRemaining: 0, creditsCreatedAt: null, payments: [] });
      setLoading(false);
      setError("No user ID available");
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      // Run all 3 independent queries in parallel instead of one-after-
      // another — cuts the network round-trip time roughly to that of
      // the single slowest query instead of the sum of all three.
      const [
        { data: row, error: subErr },
        { data: creditsRow, error: creditsErr },
        { data: paymentsData, error: paymentsErr },
      ] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", userId)
          .order("starts_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("free_credits").select("credits_remaining, created_at")
          .eq("user_id", userId).maybeSingle(),
        supabase.from("payments").select("id, plan_name, amount, status, razorpay_order_id, created_at")
          .eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      ]);

      if (subErr) throw subErr;
      if (creditsErr) throw creditsErr;
      if (paymentsErr) throw paymentsErr;

      const result = {
        row,
        creditsRemaining: creditsRow?.credits_remaining ?? FREE_TESTS_LIMIT,
        creditsCreatedAt: creditsRow?.created_at ?? null,
        payments:         paymentsData ?? [],
      };

      cache.set(userId, { data: result, fetchedAt: Date.now() });
      setRaw(result);
    } catch (err) {
      console.error("Subscription fetch error:", err);
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const cached = cache.get(userId);
    if (cached) {
      // Have cached data — render instantly, then silently refresh
      // in the background if it's gotten stale (e.g. > 60s old).
      setRaw(cached.data);
      setLoading(false);
      if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) {
        fetchAll({ silent: true });
      }
    } else {
      fetchAll();
    }
  }, [userId, fetchAll]);

  // ── Derived view #1: Dashboard trial-gating banner ──────────────
  const dashboardStatus = !raw ? null : (() => {
    const { row, creditsRemaining, creditsCreatedAt } = raw;
    if (!row) return { status: "expired", testsLocked: true, practiceLocked: true }; // fail closed if no row at all

    const now = Date.now();

    // Paid plan, currently active.
    // NOTE: previously also checked `row.payment_status === "paid"`,
    // but `subscriptions` has no such column (only `status`) — that
    // check was always false, so this branch was unreachable and the
    // dashboard could never show "active" even after a real purchase.
    // `payment.controller.js` only ever writes `status: "active"` once
    // a payment is verified, so checking `status` alone is correct
    // and sufficient.
    if (row.status === "active") {
      // NOTE: was `row.end_at`, then briefly `row.expires_at` — neither
      // matched the real schema. The actual column written by
      // payment.controller.js is `end_date`. Confirmed with the user
      // directly against their live table, since this had been wrong
      // twice already from incorrect assumptions about the schema.
      const expired = row.end_date && new Date(row.end_date).getTime() <= now;
      return expired
        ? { status: "expired", testsLocked: true, practiceLocked: true }
        : { status: "active", planName: row.plan_name, expiresAt: row.end_date, testsLocked: false, practiceLocked: false };
    }

    // Explicitly expired / cancelled paid plan
    if (row.status === "expired" || row.status === "cancelled") {
      return { status: "expired", testsLocked: true, practiceLocked: true };
    }

    // Trial — timer runs from when free credits were granted (signup),
    // not subscriptions.starts_at. If starts_at was ever null, JS reads
    // that as the Unix epoch (1970), which silently made the trial look
    // permanently expired — this avoids that entirely.
    const trialStart  = creditsCreatedAt || row.starts_at || new Date().toISOString();
    const trialEndsAt = new Date(new Date(trialStart).getTime() + TRIAL_DAYS * 86400000).toISOString();

    const freeTestsUsed   = Math.max(0, FREE_TESTS_LIMIT - (creditsRemaining ?? 0));
    const trialOver       = new Date(trialEndsAt).getTime() <= now;
    const creditsExhausted = (creditsRemaining ?? 0) <= 0;

    // Deliberately independent, not an OR-into-one-status like before:
    //   - Practice Question Bank stays open for the full 3-day trial
    //     window regardless of how many free tests have been used.
    //   - Test Series (PYQ/subject/topic) locks the moment the 2 free
    //     tests are used up, even if trial days remain.
    // Only once the 3-day window itself ends does everything lock —
    // that's the only case `status` becomes "expired" from trial.
    if (trialOver) {
      return {
        status: "expired",
        trialDaysLeft: 0,
        freeTestsUsed,
        freeTestsLimit: FREE_TESTS_LIMIT,
        testsLocked: true,
        practiceLocked: true,
      };
    }

    return {
      status: "trial",
      trialEndsAt,
      freeTestsUsed,
      freeTestsLimit: FREE_TESTS_LIMIT,
      testsLocked: creditsExhausted, // locks independently once 2 tests are used
      practiceLocked: false,          // stays open for the whole trial window
    };
  })();

  // ── Derived view #2: Subscription/billing page banner ───────────
  const billingStatus = !raw ? null : (() => {
    const { row } = raw;
    if (!row) return { status: "none", status_raw: null };

    let bannerStatus = "none";
    if (row.status === "active") {
      const daysLeft = row.end_date ? (new Date(row.end_date) - Date.now()) / 86400000 : null;
      if (daysLeft === null)  bannerStatus = "active";
      else if (daysLeft <= 0) bannerStatus = "expired";
      else if (daysLeft <= 3) bannerStatus = "warning";
      else                    bannerStatus = "active";
    } else if (row.status === "expired" || row.status === "cancelled") {
      bannerStatus = "expired";
    } else if (row.status === "trial") {
      bannerStatus = "none"; // nothing to show on billing page for free trial
    }

    return {
      status:         bannerStatus,
      status_raw:     row.status,
      plan_id:        row.plan_id ?? null, // for isCurrent check in plan cards
      plan_name:      row.plan_name,
      expires_at:     row.end_date,
      amount:         row.amount,
    };
  })();

  return {
    dashboardStatus,
    billingStatus,
    payments:         raw?.payments         ?? [],   // ← payment history for the billing page
    creditsRemaining: raw?.creditsRemaining ?? null,
    loading,
    error,
    refetch: fetchAll,
  };
}
