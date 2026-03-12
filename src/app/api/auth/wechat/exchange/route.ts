import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeWechatIntent, getWechatAuthConfirmUrl } from "@/lib/wechat";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = (await request.json()) as { intentId?: string; nonce?: string };
    if (!body.intentId || !body.nonce) {
      return NextResponse.json({ error: "Missing intentId or nonce" }, { status: 400 });
    }

    const loginEmail = await consumeWechatIntent(body.intentId, body.nonce);
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: loginEmail,
      options: {
        redirectTo: getWechatAuthConfirmUrl(),
      },
    });

    if (error || !data?.properties?.action_link) {
      throw error ?? new Error("Failed to generate Supabase magic link");
    }

    return NextResponse.json({
      redirectTo: data.properties.action_link,
    });
  } catch (error) {
    console.error("Failed to exchange wechat login:", error);
    return NextResponse.json(
      { error: "登录兑换失败，请刷新登录码后重试。" },
      { status: 400 }
    );
  }
}
