import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mvlqqrixsvbwdkpbbtar.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_tbnbFaLNX45-7Kemdre2XA_lnfTELTv";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
