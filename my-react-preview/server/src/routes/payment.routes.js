/**
 * routes/payment.routes.js
 * Payment and subscription endpoints
 *
 * Mounted at: /api/payment   (note: singular — match all fetch() calls in frontend)
 */

const express           = require("express");
const paymentController = require("../controllers/payment.controller");
const { authenticateToken } = require("../middleware/validate.middleware");

const router = express.Router();

/**
 * GET /api/payment/subscription
 * Get the authenticated user's current subscription.
 * userId is read from req.userId (set by authenticateToken), NOT from params.
 */
router.get("/subscription", authenticateToken, paymentController.getSubscription);

/**
 * GET /api/payment/history
 * Get the authenticated user's payment history.
 * userId is read from req.userId (set by authenticateToken), NOT from params.
 */
router.get("/history", authenticateToken, paymentController.getPaymentHistory);

/**
 * POST /api/payment/create-order
 * Create a Razorpay order.
 * Body: { planId }
 * Returns: { orderId, amount, keyId }
 */
router.post("/create-order", authenticateToken, paymentController.createPaymentOrder);

/**
 * POST /api/payment/verify
 * Verify Razorpay signature, activate subscription, record payment.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }
 */
router.post("/verify", authenticateToken, paymentController.verifyPayment);

module.exports = router;
