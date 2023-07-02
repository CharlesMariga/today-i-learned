import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gajnzssamsfzbdnbopoz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdham56c3NhbXNmemJkbmJvcG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODcxMjUxMzAsImV4cCI6MjAwMjcwMTEzMH0.MTlQobRHROu-FLoVhO_gv4WjYcrBk_np4el2P23HssI";
// const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
