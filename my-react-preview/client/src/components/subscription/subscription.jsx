import { useState, useEffect } from "react";
import { useSubscription } from "./usesubscription";
import { useAuth } from "../../context/AuthContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import Footer from "../common/footer";

/* ─── PLANS CONFIG ─────────────────────────────────────────────── */
// Every plan gets the same core feature set — plans only differ by
// duration and how many devices can be logged in at once.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CORE_PERKS = [
  "Analytical Dashboard",
  "PYQ Test Series",
  "Practice Question Bank",
  "No Ads on Typing",
  "Detailed Explanations",
];

const PLANS = [
  {
    id: "monthly", name: "1 Month", price: 30, days: 30, devices: 1,
    tag: null,
    perks: CORE_PERKS,
  },
  {
    id: "quarterly", name: "3 Months", price: 70, days: 90, devices: 2,
    tag: "MOST POPULAR",
    perks: CORE_PERKS,
  },
  {
    id: "yearly", name: "6 Months", price: 100, days: 180, devices: 3,
    tag: "BEST VALUE",
    perks: CORE_PERKS,
  },
];

/* ─── CSS ──────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:#0b0b10;color:#f0f0f0}

:root{
  --bg:#0b0b10;--bg2:#13131a;--bg3:#1a1a24;--b:#1e1e2c;
  --f:#e91e8c;--fl:#ff3aaa;--green:#22c55e;--amber:#f59e0b;--red:#ef4444;
  --t:#f0f0f0;--m:#7a7a90;--m2:#3a3a50;
}

@keyframes sub-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes sub-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
@keyframes sub-spin{to{transform:rotate(360deg)}}
@keyframes sub-pop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
@keyframes sub-checkmark{0%{stroke-dashoffset:48}100%{stroke-dashoffset:0}}

.sub-page{min-height:100vh;background:var(--bg);padding-bottom:60px}

/* ── EXPIRY BANNER ── */
.sub-banner{
  margin:24px 40px 0; padding:16px 22px; border-radius:14px;
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:16px; animation:sub-rise .4s ease both;
  border:1px solid;
}
.sub-banner.active{ background:rgba(34,197,94,.06); border-color:rgba(34,197,94,.25); }
.sub-banner.warning{ background:rgba(245,158,11,.07); border-color:rgba(245,158,11,.3); }
.sub-banner.expired{ background:rgba(239,68,68,.07); border-color:rgba(239,68,68,.3); }
.sub-banner.none{ background:rgba(233,30,140,.06); border-color:rgba(233,30,140,.22); }

.sub-banner-left{display:flex;align-items:center;gap:14px}
.sub-banner-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
}
.sub-banner.active .sub-banner-icon{background:rgba(34,197,94,.12)}
.sub-banner.warning .sub-banner-icon{background:rgba(245,158,11,.12)}
.sub-banner.expired .sub-banner-icon{background:rgba(239,68,68,.12)}
.sub-banner.none .sub-banner-icon{background:rgba(233,30,140,.12)}

.sub-banner-title{font-size:14px;font-weight:700;color:var(--t)}
.sub-banner-sub{font-size:12px;color:var(--m);margin-top:2px}

/* countdown chips */
.sub-countdown{display:flex;gap:8px}
.sub-cd-chip{
  background:var(--bg2);border:1px solid var(--b);border-radius:10px;
  padding:8px 12px;text-align:center;min-width:54px;
}
.sub-cd-val{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--t);line-height:1}
.sub-cd-lbl{font-size:9px;color:var(--m);letter-spacing:1px;margin-top:2px;text-transform:uppercase}

.sub-banner-dot{
  width:7px;height:7px;border-radius:50%;flex-shrink:0;
  animation:sub-pulse 2s infinite;
}
.sub-banner.active .sub-banner-dot{background:var(--green);box-shadow:0 0 6px var(--green)}
.sub-banner.warning .sub-banner-dot{background:var(--amber);box-shadow:0 0 6px var(--amber)}
.sub-banner.expired .sub-banner-dot{background:var(--red);box-shadow:0 0 6px var(--red)}
.sub-banner.none .sub-banner-dot{background:var(--f);box-shadow:0 0 6px var(--f)}

/* ── HEADER ── */
.sub-header{padding:36px 40px 8px;animation:sub-rise .4s ease both}
.sub-header-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:6px}
.sub-eyebrow{
  font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;
  color:var(--f);display:flex;align-items:center;gap:7px;margin-bottom:0;
}
.sub-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--f);box-shadow:0 0 6px var(--f);animation:sub-pulse 2s infinite}
.sub-h1-wrapper{text-align:center;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.sub-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4vw,3.2rem);letter-spacing:3px;color:var(--t);line-height:1;margin:0}
.sub-h1-sub{font-size:13px;color:var(--m);margin-top:6px}

/* ── DASHBOARD BUTTON ── */
.sub-dashboard-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 16px;border-radius:10px;border:none;
  background:linear-gradient(135deg,var(--f),var(--fl));
  color:#fff;font-size:11px;font-weight:700;
  cursor:pointer;font-family:'Outfit',sans-serif;
  transition:all .3s ease;margin:0;
  box-shadow:0 4px 16px rgba(233,30,140,.3);
  letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;
}
.sub-dashboard-btn:hover{
  transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(233,30,140,.5);
}
.sub-dashboard-btn:active{
  transform:translateY(-1px);
}
.sub-dashboard-btn-icon{
  font-size:12px;display:flex;align-items:center;
}

/* ── PLAN CARDS ── */
.sub-body{padding:24px 40px}
.sub-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:36px}

.sub-card{
  background:var(--bg2);border:1px solid var(--b);border-radius:18px;
  padding:26px;position:relative;overflow:hidden;
  transition:transform .25s,border-color .25s;
  animation:sub-rise .5s ease both;
}
.sub-card:hover{transform:translateY(-4px);border-color:rgba(233,30,140,.3)}
.sub-card.popular{border-color:rgba(233,30,140,.4);background:linear-gradient(160deg,rgba(233,30,140,.07),var(--bg2) 60%)}
.sub-card.current{border-color:rgba(34,197,94,.4)}

.sub-card-tag{
  position:absolute;top:0;right:0;
  background:linear-gradient(135deg,var(--f),var(--fl));
  color:#fff;font-size:10px;font-weight:800;letter-spacing:1.5px;
  padding:6px 14px;border-radius:0 18px 0 14px;
}
.sub-card-tag.current-tag{background:linear-gradient(135deg,var(--green),#16a34a)}

.sub-card-name{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:2px;color:var(--m);margin-bottom:8px}
.sub-card-price{display:flex;align-items:flex-end;gap:6px;margin-bottom:4px}
.sub-card-price-val{font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--t);line-height:1}
.sub-card-price-cur{font-size:1.2rem;color:var(--m);font-weight:600}
.sub-card-price-period{font-size:12px;color:var(--m);margin-bottom:4px}
.sub-card-days{font-size:11px;color:var(--m2);margin-bottom:6px}
.sub-card-devices{font-size:11px;color:var(--m2);margin-bottom:18px;display:flex;align-items:center;gap:6px}

.sub-perks{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:22px}
.sub-perk{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:var(--t)}
.sub-perk-check{
  width:16px;height:16px;border-radius:50%;background:rgba(34,197,94,.15);
  color:var(--green);display:flex;align-items:center;justify-content:center;
  font-size:9px;flex-shrink:0;margin-top:1px;
}

.sub-btn{
  width:100%;padding:13px;border-radius:10px;border:none;
  font-size:13px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;
  transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;
}
.sub-btn-primary{background:linear-gradient(135deg,var(--f),var(--fl));color:#fff}
.sub-btn-primary:hover{box-shadow:0 8px 24px rgba(233,30,140,.35);transform:translateY(-1px)}
.sub-btn-current{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.3);cursor:default}
.sub-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* ── PAYMENT HISTORY ── */
.sub-section-label{
  font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;
  color:var(--m);margin-bottom:16px;display:flex;align-items:center;gap:10px;
}
.sub-section-label::after{content:'';flex:1;height:1px;background:var(--b)}

.sub-history{background:var(--bg2);border:1px solid var(--b);border-radius:16px;overflow:hidden}
.sub-history-row{
  display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:12px;
  padding:14px 22px;align-items:center;border-bottom:1px solid var(--b);
  font-size:12px;
}
.sub-history-row:last-child{border-bottom:none}
.sub-history-row.head{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--m);background:var(--bg3)}
.sub-history-id{font-family:'DM Mono',monospace;color:var(--m)}
.sub-history-status{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;width:fit-content;
}
.sub-history-status.success{background:rgba(34,197,94,.12);color:var(--green)}
.sub-history-status.failed{background:rgba(239,68,68,.12);color:var(--red)}
.sub-history-status.pending{background:rgba(245,158,11,.12);color:var(--amber)}

.sub-empty{padding:40px;text-align:center;color:var(--m);font-size:12px}

/* ── PAYMENT MODAL ── */
.sub-modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;z-index:1000;
  animation:sub-rise .2s ease both;padding:20px;
}
.sub-modal{
  background:var(--bg2);border:1px solid var(--b);border-radius:20px;
  padding:36px;max-width:380px;width:100%;text-align:center;
  animation:sub-pop .3s cubic-bezier(.34,1.56,.64,1) both;
}
.sub-modal-icon{
  width:72px;height:72px;border-radius:50%;margin:0 auto 20px;
  display:flex;align-items:center;justify-content:center;font-size:32px;
}
.sub-modal.processing .sub-modal-icon{background:rgba(233,30,140,.1)}
.sub-modal.success .sub-modal-icon{background:rgba(34,197,94,.1)}
.sub-modal.failed .sub-modal-icon{background:rgba(239,68,68,.1)}

.sub-modal-spinner{
  width:32px;height:32px;border:3px solid rgba(233,30,140,.2);
  border-top-color:var(--f);border-radius:50%;
  animation:sub-spin .8s linear infinite;
}
.sub-modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:2px;color:var(--t);margin-bottom:8px}
.sub-modal-sub{font-size:13px;color:var(--m);line-height:1.6;margin-bottom:24px}
.sub-modal-detail{
  background:var(--bg3);border:1px solid var(--b);border-radius:12px;
  padding:14px;margin-bottom:20px;text-align:left;
}
.sub-modal-detail-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 0}
.sub-modal-detail-row .k{color:var(--m)}
.sub-modal-detail-row .v{color:var(--t);font-weight:600;font-family:'DM Mono',monospace}

@media(max-width:900px){
  .sub-plans{grid-template-columns:1fr}
  .sub-header,.sub-body,.sub-banner{padding-left:20px;padding-right:20px;margin-left:20px;margin-right:20px}
  .sub-banner{margin-left:20px;margin-right:20px}
  .sub-history-row{grid-template-columns:1fr 1fr;gap:8px}
  .sub-history-row > :nth-child(3),
  .sub-history-row > :nth-child(4){display:none}
}
`;

const inject = () => {
  if (document.getElementById("sub-css")) return;
  const s = document.createElement("style");
  s.id = "sub-css"; s.textContent = CSS;
  document.head.appendChild(s);
};

/* ─── COUNTDOWN HOOK ───────────────────────────────────────────── */
function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });
        return;
      }
      setTime({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

/* ─── EXPIRY BANNER ────────────────────────────────────────────── */
function ExpiryBanner({ subscription }) {
  const status = subscription?.status || "none";
  const cd = useCountdown(subscription?.expires_at);

  const config = {
    active:  { icon: "✅", title: "Subscription Active",
      sub: subscription?.plan_name ? `${subscription.plan_name} plan · auto-renew off` : "" },
    warning: { icon: "⏳", title: "Subscription Expiring Soon",
      sub: "Renew now to avoid losing access to mock tests & analytics" },
    expired: { icon: "🔒", title: "Subscription Expired",
      sub: "Renew your plan to regain access to all features" },
    none:    { icon: "🎁", title: "You're on the Free Plan",
      sub: "Upgrade now to unlock unlimited mock tests, PYQs & typing practice" },
  };
  const c = config[status];

  return (
    <div className={`sub-banner ${status}`}>
      <div className="sub-banner-left">
        <div className="sub-banner-icon">{c.icon}</div>
        <div>
          <div className="sub-banner-title">
            <span className="sub-banner-dot" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }}/>
            {c.title}
          </div>
          <div className="sub-banner-sub">{c.sub}</div>
        </div>
      </div>

      {(status === "active" || status === "warning") && !cd.expired && (
        <div className="sub-countdown">
          <div className="sub-cd-chip"><div className="sub-cd-val">{cd.days}</div><div className="sub-cd-lbl">Days</div></div>
          <div className="sub-cd-chip"><div className="sub-cd-val">{cd.hours}</div><div className="sub-cd-lbl">Hrs</div></div>
          <div className="sub-cd-chip"><div className="sub-cd-val">{cd.mins}</div><div className="sub-cd-lbl">Min</div></div>
          <div className="sub-cd-chip"><div className="sub-cd-val">{cd.secs}</div><div className="sub-cd-lbl">Sec</div></div>
        </div>
      )}
    </div>
  );
}

/* ─── PAYMENT MODAL ────────────────────────────────────────────── */
function PaymentModal({ status, plan, onClose, onRetry }) {
  if (!status) return null;

  if (status === "processing") {
    return (
      <div className="sub-modal-overlay">
        <div className="sub-modal processing">
          <div className="sub-modal-icon"><div className="sub-modal-spinner"/></div>
          <div className="sub-modal-title">Processing...</div>
          <div className="sub-modal-sub">
            Please don't close this window.<br/>Confirming your payment with Razorpay.
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="sub-modal-overlay">
        <div className="sub-modal success">
          <div className="sub-modal-icon">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.25"/>
              <path d="M10 18l5 5 11-11" fill="none" stroke="#22c55e" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="48" style={{ animation: "sub-checkmark .6s ease forwards" }}/>
            </svg>
          </div>
          <div className="sub-modal-title">Payment Successful!</div>
          <div className="sub-modal-sub">Your {plan?.name} plan is now active.</div>
          <div className="sub-modal-detail">
            <div className="sub-modal-detail-row"><span className="k">Plan</span><span className="v">{plan?.name}</span></div>
            <div className="sub-modal-detail-row"><span className="k">Amount</span><span className="v">₹{plan?.price}</span></div>
            <div className="sub-modal-detail-row"><span className="k">Valid for</span><span className="v">{plan?.days} days</span></div>
          </div>
          <button className="sub-btn sub-btn-primary" onClick={onClose}>Continue →</button>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="sub-modal-overlay">
        <div className="sub-modal failed">
          <div className="sub-modal-icon">❌</div>
          <div className="sub-modal-title">Payment Failed</div>
          <div className="sub-modal-sub">
            Your payment could not be processed.<br/>No amount has been deducted.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="sub-btn" style={{ background: "var(--bg3)", color: "var(--m)" }} onClick={onClose}>Cancel</button>
            <button className="sub-btn sub-btn-primary" onClick={onRetry}>Try Again →</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── MAIN COMPONENT ───────────────────────────────────────────── */
export default function Subscription() {
  useEffect(() => { inject(); }, []);
  const navigate = useNavigate();

  // ── Pull user from AuthContext — no props needed ──────────────
  const { user } = useAuth();
  const userId    = user?.id;
  const userEmail  = user?.email;
  const userMobile = user?.mobile;

  const {
    billingStatus: subscription,
    creditsRemaining,
    payments,
    loading,
    refetch,
  } = useSubscription(userId);

  const [paymentStatus, setPaymentStatus] = useState(null); // null | processing | success | failed
  const [activePlan, setActivePlan]       = useState(null);

  const currentPlanId = subscription?.plan_id;

  /* ── RAZORPAY CHECKOUT ── */
  const handleSubscribe = async (plan) => {
    setActivePlan(plan);
    setPaymentStatus("processing");

    // Retrieve the JWT token stored by authService at login/register
    const token = localStorage.getItem("speedmock_auth_token");

    const authHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    try {
      // ── 1. Create Razorpay order on backend ─────────────────
     const res = await fetch(`${API_URL}/payment/create-order`, { // singular — matches payment_routes.js
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ planId: plan.id }), // userId comes from JWT on backend
      });
      const order = await res.json();

      if (!order.success) throw new Error(order.message);

      // ── 2. Open Razorpay checkout UI ─────────────────────────
      const rzp = new window.Razorpay({
        key:         order.keyId,   // RAZORPAY_KEY_ID returned by backend
        amount:      order.amount,  // in paise
        currency:    "INR",
        name:        "SpeedMock",
        description: `${plan.name} Subscription`,
        order_id:    order.orderId,
        prefill: {
          email:   userEmail  || "",
          contact: userMobile ? `+91${userMobile}` : "",
        },
        theme: { color: "#e91e8c" },

        handler: async function (response) {
          // ── 3. Verify payment signature on backend ───────────
          const verifyRes = await fetch(`${API_URL}/payment/verify`, {  // singular — matches payment_routes.js
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              planId: plan.id, // needed to look up plan days / price for DB insert
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setPaymentStatus("success");
            refetch(); // refresh subscription state
          } else {
            setPaymentStatus("failed");
          }
        },

        modal: {
          ondismiss: () => setPaymentStatus(null), // user closed checkout — reset quietly
        },
      });

      rzp.on("payment.failed", () => setPaymentStatus("failed"));
      rzp.open();
      setPaymentStatus(null); // Razorpay's own UI takes over — dismiss our processing modal

    } catch (err) {
      
      setPaymentStatus("failed");
    }
  };

  if (loading) {
    return (
      <div className="sub-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: 40, animation: "sub-pulse 1.4s infinite" }}>💳</div>
      </div>
    );
  }

  return (
    <div className="sub-page">

      {/* ── HEADER ── */}
      <div className="sub-header">
        <div className="sub-header-top">
          <div className="sub-eyebrow"><span className="sub-eyebrow-dot"/>Billing & Plans</div>
          <button className="sub-dashboard-btn" onClick={() => navigate("/dashboard")}>
            <span className="sub-dashboard-btn-icon">📊</span>
            Go to Dashboard
          </button>
        </div>
        <div className="sub-h1-wrapper">
          <div>
            <h1 className="sub-h1">Subscription</h1>
            <div className="sub-h1-sub">Manage your plan, view payment history & renew anytime</div>
          </div>
        </div>
      </div>

      {/* ── EXPIRY BANNER ── */}
      <ExpiryBanner subscription={subscription} />

      <div className="sub-body">

        {/* ── PLAN CARDS ── */}
        <div className="sub-section-label">Choose Your Plan</div>
        <div className="sub-plans">
          {PLANS.map((plan, i) => {
            const isCurrent = currentPlanId === plan.id && subscription?.status_raw === "active";
            return (
              <div key={plan.id}
                className={`sub-card ${plan.tag ? "popular" : ""} ${isCurrent ? "current" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}>

                {isCurrent && <div className="sub-card-tag current-tag">CURRENT PLAN</div>}
                {!isCurrent && plan.tag && <div className="sub-card-tag">{plan.tag}</div>}

                <div className="sub-card-name">{plan.name.toUpperCase()}</div>
                <div className="sub-card-price">
                  <span className="sub-card-price-cur">₹</span>
                  <span className="sub-card-price-val">{plan.price}</span>
                </div>
                <div className="sub-card-price-period">one-time payment</div>
                <div className="sub-card-days">Valid for {plan.days} days from purchase</div>
                <div className="sub-card-devices">📱 Login on {plan.devices} device{plan.devices > 1 ? "s" : ""} at once</div>

                <ul className="sub-perks">
                  {plan.perks.map((perk, j) => (
                    <li className="sub-perk" key={j}>
                      <span className="sub-perk-check">✓</span>{perk}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button className="sub-btn sub-btn-current" disabled>✓ Active Plan</button>
                ) : (
                  <button className="sub-btn sub-btn-primary" onClick={() => handleSubscribe(plan)}>
                    {subscription?.status_raw === "active" ? "Switch Plan" : "Subscribe Now"} →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PAYMENT HISTORY ── */}
        <div className="sub-section-label">Payment History</div>
        <div className="sub-history">
          {payments?.length > 0 ? (
            <>
              <div className="sub-history-row head">
                <div>Plan</div><div>Amount</div><div>Date</div><div>Order ID</div><div>Status</div>
              </div>
              {payments.map(p => (
                <div className="sub-history-row" key={p.id}>
                  <div style={{ fontWeight: 600, color: "var(--t)" }}>{p.plan_name}</div>
                  <div style={{ fontFamily: "'DM Mono',monospace" }}>₹{p.amount}</div>
                  <div style={{ color: "var(--m)" }}>
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                  <div className="sub-history-id">{p.razorpay_order_id?.slice(-10)}</div>
                  <div>
                    <span className={`sub-history-status ${p.status}`}>
                      {p.status === "success" ? "✓ Paid" : p.status === "failed" ? "✕ Failed" : "⏳ Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="sub-empty">No payment history yet. Subscribe to a plan to get started!</div>
          )}
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      <PaymentModal
        status={paymentStatus}
        plan={activePlan}
        onClose={() => setPaymentStatus(null)}
        onRetry={() => handleSubscribe(activePlan)}
      />

      <Footer />
    </div>
  );
}
