import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,24}$/.test(code)) return NextResponse.json({ error: "Please enter a valid coupon code." }, { status: 400 });
    const db = adminDb();
    const { data, error } = await db.from("coupons")
      .select("code,status,customer_id,customers(customer_id,full_name)")
      .eq("code", code).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "We couldn't find that coupon. Please check the code and try again." }, { status: 404 });
    if (data.status === "generated") return NextResponse.json({ error: "This coupon hasn't been approved yet. Please contact us after submitting your feedback." }, { status: 403 });
    if (data.status === "deactivated") return NextResponse.json({ error: "This coupon is not active. Please contact AssignmentWriters.com." }, { status: 403 });
    if (data.status === "redeemed") return NextResponse.json({ error: "This reward has already been used." }, { status: 409 });
    if (data.status !== "approved" || !data.customer_id) return NextResponse.json({ error: "This coupon is not ready to redeem yet." }, { status: 403 });
    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;
    return NextResponse.json({ success: true, customerId: data.customer_id, firstName: customer?.full_name?.trim()?.split(/\s+/)[0] || "" });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}