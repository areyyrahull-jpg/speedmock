import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://sfrjyzkmzvpkdbofdmcr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcmp5emttenZwa2Rib2ZkbWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDU3MTMsImV4cCI6MjA5NjQyMTcxM30.vK_Kbjr8qAI29bPPQ0sEMlMGEQ0OQo6rItxG2Jxo-Xw";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);