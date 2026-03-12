import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/dashboard";
  console.log("[auth-confirm] start", {
    at: new Date().toISOString(),
    hasTokenHash: Boolean(tokenHash),
    type,
    next,
  });

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  const supabase = await createClient();
  const verifyStartedAt = Date.now();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "magiclink",
  });
  console.log("[auth-confirm] verify_otp_done", {
    costMs: Date.now() - verifyStartedAt,
    hasError: Boolean(error),
  });

  if (error) {
    console.error("Failed to verify Supabase OTP:", error);
    return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
  }

  const getUserStartedAt = Date.now();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("[auth-confirm] get_user_done", {
    costMs: Date.now() - getUserStartedAt,
    userId: user?.id ?? null,
    email: user?.email ?? null,
  });

  if (user?.email) {
    const updateStartedAt = Date.now();
    await getSupabaseAdmin()
      .from("wechat_accounts")
      .update({
        auth_user_id: user.id,
        last_login_at: new Date().toISOString(),
      })
      .eq("login_email", user.email);
    console.log("[auth-confirm] update_wechat_account_done", {
      costMs: Date.now() - updateStartedAt,
      userId: user.id,
    });
  }

  console.log("[auth-confirm] success", {
    totalCostMs: Date.now() - startedAt,
    redirectTo: next,
  });

  return NextResponse.redirect(new URL(next, url.origin));
}
