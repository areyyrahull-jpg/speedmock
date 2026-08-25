const express = require("express");
const cors    = require("cors");
require('dotenv').config({ path: __dirname + '/.env' })


const testsRoutes  = require("./src/routes/tests");
const papersRoutes = require("./src/routes/papers");

const app = express();



// ─── MIDDLEWARE (MUST be first — before any routes) ───────────────
app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:5173").split(","),
  credentials: true,
}));
app.use(express.json());

// ─── REQUEST LOGGER ───────────────────────────────────────────────
app.use((req, res, next) => {
  
  next();
});

// ─── STARTUP LOG ──────────────────────────────────────────────────




// ─── CONFIG ───────────────────────────────────────────────────────
const pool  = require("./src/config/db");
const redis = require("./src/config/redis");

// ─── ROUTES ───────────────────────────────────────────────────────
const authRoutes     = require("./src/routes/auth.routes");
const paymentRoutes  = require("./src/routes/payment.routes");
const practiceRoutes = require("./src/routes/practiceRoutes");
const goalRoutes     = require("./src/routes/goal.routes");
const progressRoutes = require("./src/routes/progress.routes");
const referralRoutes = require("./src/routes/referral.routes");
const pyqDynamicTestRoutes = require("./src/routes/pyqDynamicTestRoutes");

// ─── MOUNT ROUTES ─────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/payment",  paymentRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/practice", pyqDynamicTestRoutes);
app.use("/api/goal",     goalRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/admin",    require("./src/routes/admin.routes"));  // ← ADD THIS


app.get("/", (req, res) => {
  res.json({ status: "SpeedMock API running" });
});
// ─── HEALTH CHECK ─────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
});



app.use("/api/tests",  testsRoutes);
app.use("/api/papers", papersRoutes);

// ─── 404 ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ─── START ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  
  
  
});


