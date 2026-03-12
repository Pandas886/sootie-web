import { NextRequest } from "next/server";
import {
  buildWechatTextReply,
  extractWechatMessage,
  issueReplyCodeForScene,
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

    if ((message.event === "SCAN" || message.event === "SUBSCRIBE") && message.openid && message.eventKey) {
      const result = await issueReplyCodeForScene({
        openid: message.openid,
        sceneStr: message.eventKey,
      });

      const replyText = result
        ? `你的网页登录验证码是：${result.verificationCode}\n请返回 Sootie Cloud 登录页输入该验证码完成登录。`
        : "当前二维码已失效，请回到网页刷新后重新扫码。";

      return new Response(buildWechatTextReply(message, replyText), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      });
    }

    if (message.msgType === "text") {
      return new Response(
        buildWechatTextReply(
          message,
          "请先打开 Sootie Cloud 登录页扫码，再把公众号回复给你的验证码填回网页。"
        ),
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }
      );
    }

    return new Response("success");
  } catch (error) {
    console.error("Failed to process wechat callback:", error);
    return new Response("success");
  }
}
