import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { absoluteUrl } from "@/lib/seo";
import { verifyWechatReplyCode } from "@/lib/wechat";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      intentId?: string;
      nonce?: string;
      verificationCode?: string;
    };

    if (!body.intentId || !body.nonce || !body.verificationCode) {
      return NextResponse.json({ error: "Missing verification payload" }, { status: 400 });
    }

    const loginEmail = await verifyWechatReplyCode({
      intentId: body.intentId,
      browserNonce: body.nonce,
      verificationCode: body.verificationCode,
    });

    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: "magiclink",
      email: loginEmail,
      options: {
        redirectTo: absoluteUrl("/dashboard"),
      },
    });

    const hashedToken = data?.properties?.hashed_token;
    if (error || !hashedToken) {
      throw error ?? new Error("Failed to generate Supabase magic link");
    }

    return NextResponse.json({
      redirectTo: absoluteUrl(
        `/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=/dashboard`
      ),
    });
  } catch (error) {
    console.error("Failed to verify wechat reply code:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "验证码校验失败，请重新扫码。" },
      { status: 400 }
    );
  }
}
