import { NextResponse } from "next/server";
import { createWechatLoginIntent } from "@/lib/wechat";

export async function GET() {
  try {
    const intent = await createWechatLoginIntent();
    return NextResponse.json(intent, { status: 200 });
  } catch (error) {
    console.error("Failed to create wechat login QR:", error);
    return NextResponse.json(
      { error: "暂时无法生成公众号登录二维码，请稍后再试。" },
      { status: 500 }
    );
  }
}
