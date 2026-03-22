import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client public (auth cÃ´tÃ© browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin avec service_role (uniquement cÃ´tÃ© serveur)
// Falls back to anon key client-side to prevent bundle errors
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey ?? supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
