import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hjrayrxteuopswkxwzkb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcmF5cnh0ZXVvcHN3a3h3emtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTA3ODUsImV4cCI6MjA4ODk2Njc4NX0.xJDTdgP6RTIsQhvRkY0dy5un9kWxQgvCoYAd7spjTgg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
