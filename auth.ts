import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export async function isAdminRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.getUser(token);
  return !error && !!data.user && !!process.env.ADMIN_EMAIL &&
    data.user.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
}