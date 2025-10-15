import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

export const supabaseAdmin = () => {
  if (!config.supabase.url || !config.supabase.serviceRole) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createClient(config.supabase.url, config.supabase.serviceRole, {
    auth: { persistSession: false },
  });
};
