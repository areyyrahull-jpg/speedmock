// ════════════════════════════════════════════════════════
//  app.js — snippet showing how to mount routes correctly
//  The webhook route NEEDS the raw request body for signature
//  verification, so it must be registered BEFORE express.json()
//  or with its own raw body parser.
// ════════════════════════════════════════════════════════
const express = require("express");
const app = express();

// 1. Webhook route FIRST, with raw body parser
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body; // Buffer — used for signature check
    next();
  },
  require("./routes/payment.webhook.routes") // separate router with just /webhook
);

// 2. Normal JSON parsing for everything else
app.use(express.json());

// 3. Other routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/payments", require("./routes/payment.routes")); // create-order, verify
// ... other routes

module.exports = app;
