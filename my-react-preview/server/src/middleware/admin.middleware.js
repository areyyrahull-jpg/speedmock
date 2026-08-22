// middleware/admin.middleware.js
const { supabaseAdmin: supabase } = require("../config/supabaseAdmin");

const isAdmin = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", req.userId)
      .single();

    if (error || !user?.is_admin) {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }
    next();
  } catch (err) {
    
    return res.status(500).json({ success: false, message: "Failed to verify admin access." });
  }
};

module.exports = { isAdmin };
