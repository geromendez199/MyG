import { createClient as createBrowserClient } from "@supabase/supabase-js";

import env, { flags } from "@/lib/env";

export function supabaseClient() {
  if (!flags.hasStorage) {
    throw new Error("Supabase Storage no configurado (faltan envs)");
  }

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export function supabaseServiceClient() {
  if (!flags.hasStorage) {
    throw new Error("Supabase Storage no configurado (faltan envs)");
  }

  // Dynamic require ensures the service_role client stays on the server bundle only.
  // eslint-disable-next-line global-require
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE!);
}
