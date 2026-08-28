/**
 * services/otp.services.js
 * Sends SMS via MSG91 (Send SMS API — flow-based, matches your existing
 * generateOTP()-in-Redis pattern in auth.controller.js).
 *
 * Required in .env:
 *   MSG91_AUTHKEY=your_auth_key
 *   MSG91_FLOW_ID=your_flow_id      (create a Flow in MSG91 dashboard with
 *                                    a template var, e.g. ##OTP##)
 *   MSG91_SENDER_ID=your_6char_id   (e.g. SPDMCK)
 */

const axios = require("axios");

const MSG91_AUTHKEY   = process.env.MSG91_AUTHKEY;
const MSG91_FLOW_ID   = process.env.MSG91_FLOW_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

/**
 * sendSMS(mobile, message)
 * Kept the exact same signature your auth_controller.js already calls,
 * so no changes needed there. `message` is the full OTP text you already
 * build (e.g. "123456 is your SpeedMock verification OTP...").
 *
 * MSG91's Flow API sends templated messages, so we extract the OTP digits
 * out of your message string and pass them as the template variable.
 */
const sendSMS = async (mobile, message) => {
  try {
    // Pull the OTP (first run of digits) out of the message you already built
    const otpMatch = message.match(/\d{4,8}/);
    const otp = otpMatch ? otpMatch[0] : null;

    const payload = {
      flow_id: MSG91_FLOW_ID,
      sender: MSG91_SENDER_ID,
      mobiles: `91${mobile}`,
      num: otp, // must match the variable name used inside your MSG91 flow template
    };

    const res = await axios.post(
      "https://control.msg91.com/api/v5/flow",
      payload,
      {
        headers: {
          authkey: MSG91_AUTHKEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (res.data?.type !== "success") {
      console.error("[MSG91] send failed:", res.data);
      throw new Error(res.data?.message || "SMS provider error");
    }

    return { sent: true, requestId: res.data.request_id };
  } catch (err) {
    console.error("[MSG91] sendSMS error:", err.response?.data || err.message);
    throw new Error("Failed to send SMS. Please try again.");
  }
};

module.exports = { sendSMS };
