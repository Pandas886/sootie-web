import { NextRequest, NextResponse } from "next/server";
import { getWechatIntentStatus } from "@/lib/wechat";

export async function GET(request: NextRequest) {
  const intentId = request.nextUrl.searchParams.get("intentId");
  const browserNonce = request.nextUrl.searchParams.get("nonce");

  if (!intentId || !browserNonce) {
    return NextResponse.json({ error: "Missing intentId or nonce" }, { status: 400 });
  }

  try {
    const status = await getWechatIntentStatus(intentId, browserNonce);
    if (!status) {
      return NextResponse.json({ error: "Login session not found" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to get wechat login status:", error);
    return NextResponse.json({ error: "Failed to check login status" }, { status: 500 });
  }
}
