import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { absoluteUrl } from "@/lib/seo";
import { consumeWechatIntent } from "@/lib/wechat";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = (await request.json()) as { intentId?: string; nonce?: string };
    if (!body.intentId || !body.nonce) {
      return NextResponse.json({ error: "Missing intentId or nonce" }, { status: 400 });
    }

    console.log("[wechat-exchange] start", {
      intentId: body.intentId,
      at: new Date().toISOString(),
    });

    const consumeStartedAt = Date.now();
    const loginEmail = await consumeWechatIntent(body.intentId, body.nonce);
    console.log("[wechat-exchange] consume_intent_done", {
      intentId: body.intentId,
      costMs: Date.now() - consumeStartedAt,
      loginEmail,
    });

    const generateLinkStartedAt = Date.now();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: loginEmail,
      options: {
        redirectTo: absoluteUrl("/dashboard"),
      },
    });
    console.log("[wechat-exchange] generate_link_done", {
      intentId: body.intentId,
      costMs: Date.now() - generateLinkStartedAt,
      hasError: Boolean(error),
    });

    const hashedToken = data?.properties?.hashed_token;
    if (error || !hashedToken) {
      throw error ?? new Error("Failed to generate Supabase magic link");
    }

    console.log("[wechat-exchange] success", {
      intentId: body.intentId,
      totalCostMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      redirectTo: absoluteUrl(
        `/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=/dashboard`
      ),
    });
  } catch (error) {
    console.error("[wechat-exchange] failed", {
      costMs: Date.now() - startedAt,
      error,
    });
    return NextResponse.json(
      { error: "登录兑换失败，请刷新登录码后重试。" },
      { status: 400 }
    );
  }
}
