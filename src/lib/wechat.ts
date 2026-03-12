import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { absoluteUrl } from "@/lib/seo";

const LOGIN_TTL_SECONDS = 600;
const WECHAT_API_BASE = "https://api.weixin.qq.com";

export type WechatIntentStatus = "pending" | "scanned" | "approved" | "consumed" | "expired";

type WechatEventMessage = {
  event: string;
  msgType: string;
  openid: string;
  eventKey: string;
  content: string;
  createTime: string;
  toUserName: string;
};

function getWechatEnv(name: "WECHAT_TOKEN" | "WECHAT_APPID" | "WECHAT_APPSECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function buildWechatLoginEmail(openid: string) {
  return `wx_${openid}@auth.sootie.local`;
}

export function generateSceneStr() {
  return `wxlogin_${crypto.randomBytes(12).toString("hex")}`;
}

export function generateBrowserNonce() {
  return crypto.randomBytes(18).toString("hex");
}

export function generateVerificationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function getWechatAuthConfirmUrl() {
  return absoluteUrl("/auth/confirm?next=/dashboard");
}

export function verifyWechatSignature({
  signature,
  timestamp,
  nonce,
}: {
  signature: string | null;
  timestamp: string | null;
  nonce: string | null;
}) {
  if (!signature || !timestamp || !nonce) {
    return false;
  }

  const token = getWechatEnv("WECHAT_TOKEN");
  const digest = crypto
    .createHash("sha1")
    .update([token, timestamp, nonce].sort().join(""))
    .digest("hex");

  return digest === signature;
}

export function extractXmlValue(xml: string, tag: string) {
  const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "s"));
  if (cdataMatch?.[1]) {
    return cdataMatch[1];
  }

  const plainMatch = xml.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "s"));
  return plainMatch?.[1]?.trim() ?? "";
}

export function normalizeSceneKey(rawEventKey: string) {
  if (!rawEventKey) {
    return "";
  }

  return rawEventKey.replace(/^qrscene_/, "").trim();
}

export function extractWechatMessage(rawXml: string): WechatEventMessage {
  return {
    event: extractXmlValue(rawXml, "Event").toUpperCase(),
    msgType: extractXmlValue(rawXml, "MsgType").toLowerCase(),
    openid: extractXmlValue(rawXml, "FromUserName"),
    eventKey: normalizeSceneKey(extractXmlValue(rawXml, "EventKey")),
    content: extractXmlValue(rawXml, "Content").trim().toUpperCase(),
    createTime: extractXmlValue(rawXml, "CreateTime"),
    toUserName: extractXmlValue(rawXml, "ToUserName"),
  };
}

export function buildWechatTextReply(message: WechatEventMessage, content: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  return `<xml>
<ToUserName><![CDATA[${message.openid}]]></ToUserName>
<FromUserName><![CDATA[${message.toUserName}]]></FromUserName>
<CreateTime>${timestamp}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
}

export async function getWechatAccessToken() {
  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: cached } = await supabaseAdmin
    .from("wechat_runtime_cache")
    .select("value")
    .eq("key", "access_token")
    .gt("expires_at", now)
    .maybeSingle();

  if (cached?.value) {
    return cached.value as string;
  }

  const appid = getWechatEnv("WECHAT_APPID");
  const secret = getWechatEnv("WECHAT_APPSECRET");
  const response = await fetch(
    `${WECHAT_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
    { cache: "no-store" }
  );
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    errmsg?: string;
    errcode?: number;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(`Failed to fetch WeChat access token: ${payload.errmsg ?? payload.errcode ?? "unknown error"}`);
  }

  const expiresAt = new Date(Date.now() + Math.max((payload.expires_in ?? 7200) - 300, 60) * 1000).toISOString();
  await supabaseAdmin.from("wechat_runtime_cache").upsert({
    key: "access_token",
    value: payload.access_token,
    expires_at: expiresAt,
  });

  return payload.access_token;
}

export async function createWechatLoginIntent() {
  const supabaseAdmin = getSupabaseAdmin();
  const sceneStr = generateSceneStr();
  const browserNonce = generateBrowserNonce();
  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000).toISOString();
  const accessToken = await getWechatAccessToken();

  const response = await fetch(`${WECHAT_API_BASE}/cgi-bin/qrcode/create?access_token=${accessToken}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expire_seconds: LOGIN_TTL_SECONDS,
      action_name: "QR_STR_SCENE",
      action_info: {
        scene: {
          scene_str: sceneStr,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    ticket?: string;
    errmsg?: string;
    errcode?: number;
  };

  if (!response.ok || !payload.ticket) {
    throw new Error(`Failed to create WeChat QR code: ${payload.errmsg ?? payload.errcode ?? "unknown error"}`);
  }

  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .insert({
      scene_str: sceneStr,
      browser_nonce: browserNonce,
      expires_at: expiresAt,
      ticket: payload.ticket,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to persist WeChat login intent");
  }

  return {
    intentId: data.id as string,
    browserNonce,
    sceneStr,
    qrUrl: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(payload.ticket)}`,
    expiresAt,
  };
}

export async function ensureWechatAuthUser({
  openid,
}: {
  openid: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const email = buildWechatLoginEmail(openid);
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      provider: "wechat",
      openid,
      display_name: "微信用户",
      avatar_url: null,
    },
    app_metadata: {
      provider: "wechat",
    },
  });

  if (error && !/already|registered|exists/i.test(error.message)) {
    throw error;
  }

  return email;
}

export async function issueReplyCodeForScene({
  openid,
  sceneStr,
}: {
  openid: string;
  sceneStr: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const loginEmail = await ensureWechatAuthUser({ openid });
  const verificationCode = generateVerificationCode();

  const accountPayload = {
    openid,
    login_email: loginEmail,
    nickname: null,
    avatar_path: null,
    avatar_url: null,
    avatar_source_url: null,
    subscribed: true,
    subscribed_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  };

  const { error: accountError } = await supabaseAdmin
    .from("wechat_accounts")
    .upsert(accountPayload, { onConflict: "openid" });

  if (accountError) {
    throw accountError;
  }

  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .update({
      status: "scanned",
      openid,
      login_email: loginEmail,
      verification_code: verificationCode,
    })
    .eq("scene_str", sceneStr)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    verificationCode,
    loginEmail,
  };
}

export async function getWechatIntentStatus(intentId: string, browserNonce: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .select("status, expires_at, verification_code")
    .eq("id", intentId)
    .eq("browser_nonce", browserNonce)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const now = Date.now();
  const expiresAtMs = new Date(data.expires_at as string).getTime();
  const status = (expiresAtMs <= now && data.status === "pending" ? "expired" : data.status) as WechatIntentStatus;

  if (status === "expired" && data.status !== "expired") {
    await supabaseAdmin
      .from("wechat_login_intents")
      .update({ status: "expired" })
      .eq("id", intentId)
      .eq("browser_nonce", browserNonce);
  }

  return {
    status,
    expiresAt: data.expires_at as string,
    hasReplyCode: Boolean(data.verification_code),
  };
}

export async function verifyWechatReplyCode({
  intentId,
  browserNonce,
  verificationCode,
}: {
  intentId: string;
  browserNonce: string;
  verificationCode: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const normalizedCode = verificationCode.trim().toUpperCase();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .update({
      status: "approved",
    })
    .eq("id", intentId)
    .eq("browser_nonce", browserNonce)
    .eq("status", "scanned")
    .eq("verification_code", normalizedCode)
    .gt("expires_at", nowIso)
    .select("login_email")
    .single();

  if (error || !data?.login_email) {
    throw new Error("验证码不正确或已过期，请重新扫码获取。");
  }

  return data.login_email as string;
}

export async function consumeWechatIntent(intentId: string, browserNonce: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .update({
      status: "consumed",
      consumed_at: nowIso,
    })
    .eq("id", intentId)
    .eq("browser_nonce", browserNonce)
    .eq("status", "approved")
    .gt("expires_at", nowIso)
    .select("login_email")
    .single();

  if (error || !data?.login_email) {
    throw new Error("This login session is unavailable. Please refresh and try again.");
  }

  return data.login_email as string;
}
