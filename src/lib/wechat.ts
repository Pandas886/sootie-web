import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { absoluteUrl } from "@/lib/seo";

const LOGIN_TTL_SECONDS = 600;

export type WechatIntentStatus = "pending" | "scanned" | "approved" | "consumed" | "expired";

function getWechatEnv(name: "WECHAT_TOKEN") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function buildWechatLoginEmail(openid: string) {
  return `wx_${openid}@auth.sootie.local`;
}

export function generateLoginCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function generateBrowserNonce() {
  return crypto.randomBytes(18).toString("hex");
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

export function extractWechatMessage(rawXml: string) {
  return {
    event: extractXmlValue(rawXml, "Event").toUpperCase(),
    msgType: extractXmlValue(rawXml, "MsgType").toLowerCase(),
    openid: extractXmlValue(rawXml, "FromUserName"),
    eventKey: normalizeSceneKey(extractXmlValue(rawXml, "EventKey")),
    content: extractXmlValue(rawXml, "Content").trim().toUpperCase(),
  };
}

export async function createWechatLoginIntent() {
  const supabaseAdmin = getSupabaseAdmin();
  let loginCode = generateLoginCode();
  const browserNonce = generateBrowserNonce();
  const expiresAt = new Date(Date.now() + LOGIN_TTL_SECONDS * 1000).toISOString();
  let data: { id: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await supabaseAdmin
      .from("wechat_login_intents")
      .insert({
        scene_str: loginCode,
        browser_nonce: browserNonce,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (!result.error && result.data) {
      data = result.data as { id: string };
      break;
    }

    if (result.error?.code !== "23505") {
      throw new Error(result.error?.message ?? "Failed to persist WeChat login intent");
    }

    loginCode = generateLoginCode();
  }

  if (!data) {
    throw new Error("Failed to generate a unique WeChat login code");
  }

  return {
    intentId: data.id as string,
    browserNonce,
    loginCode,
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

export async function approveWechatLoginByCode({
  openid,
  loginCode,
}: {
  openid: string;
  loginCode: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const normalizedCode = loginCode.trim().toUpperCase();
  if (!normalizedCode) {
    return false;
  }

  const loginEmail = await ensureWechatAuthUser({ openid });

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

  const { data: intent, error: intentError } = await supabaseAdmin
    .from("wechat_login_intents")
    .update({
      status: "approved",
      openid,
      login_email: loginEmail,
      nickname: null,
      avatar_url: null,
    })
    .eq("scene_str", normalizedCode)
    .in("status", ["pending", "scanned"])
    .select("id");

  if (intentError) {
    throw intentError;
  }

  return Array.isArray(intent) ? intent.length > 0 : true;
}

export async function getWechatIntentStatus(intentId: string, browserNonce: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("wechat_login_intents")
    .select("status, expires_at, nickname, avatar_url")
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
    nickname: (data.nickname as string | null) ?? null,
    avatarUrl: (data.avatar_url as string | null) ?? null,
  };
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
    throw new Error("This login code is unavailable. Please refresh and try again.");
  }

  return data.login_email as string;
}
