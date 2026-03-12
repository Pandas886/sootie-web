import { NextRequest } from "next/server";
import {
  approveWechatLoginByCode,
  extractWechatMessage,
  verifyWechatSignature,
} from "@/lib/wechat";

export async function GET(request: NextRequest) {
  const isValid = verifyWechatSignature({
    signature: request.nextUrl.searchParams.get("signature"),
    timestamp: request.nextUrl.searchParams.get("timestamp"),
    nonce: request.nextUrl.searchParams.get("nonce"),
  });

  if (!isValid) {
    return new Response("invalid signature", { status: 403 });
  }

  return new Response(request.nextUrl.searchParams.get("echostr") ?? "");
}

export async function POST(request: NextRequest) {
  const isValid = verifyWechatSignature({
    signature: request.nextUrl.searchParams.get("signature"),
    timestamp: request.nextUrl.searchParams.get("timestamp"),
    nonce: request.nextUrl.searchParams.get("nonce"),
  });

  if (!isValid) {
    return new Response("invalid signature", { status: 403 });
  }

  try {
    const rawXml = await request.text();
    const message = extractWechatMessage(rawXml);

    if (message.msgType === "text" && message.openid && message.content) {
      await approveWechatLoginByCode({
        openid: message.openid,
        loginCode: message.content,
      });
    }

    return new Response("success");
  } catch (error) {
    console.error("Failed to process wechat callback:", error);
    return new Response("success");
  }
}
