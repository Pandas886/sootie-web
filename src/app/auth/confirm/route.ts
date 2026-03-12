import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "magiclink",
  });

  if (error) {
    console.error("Failed to verify Supabase OTP:", error);
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await getSupabaseAdmin()
      .from("wechat_accounts")
      .update({
        auth_user_id: user.id,
        last_login_at: new Date().toISOString(),
      })
      .eq("login_email", user.email);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
