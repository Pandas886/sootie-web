"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2, MessageSquareText, RefreshCcw } from "lucide-react";

type LoginIntent = {
  intentId: string;
  browserNonce: string;
  loginCode: string;
  expiresAt: string;
};

type LoginStatus =
  | "idle"
  | "loading"
  | "pending"
  | "approved"
  | "redirecting"
  | "expired"
  | "error";

export function WechatLoginClient() {
  const [intent, setIntent] = useState<LoginIntent | null>(null);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasExchangedRef = useRef(false);

  async function loadLoginCode() {
    setStatus("loading");
    setError(null);
    setCopied(false);
    hasExchangedRef.current = false;

    try {
      const response = await fetch("/api/wechat/qr", { cache: "no-store" });
      const payload = (await response.json()) as LoginIntent & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "暂时无法生成登录码");
      }

      setIntent(payload);
      setStatus("pending");
    } catch (error) {
      setIntent(null);
      setStatus("error");
      setError(error instanceof Error ? error.message : "暂时无法生成登录码");
    }
  }

  async function copyCode() {
    if (!intent?.loginCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(intent.loginCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("复制失败，请手动输入登录码。");
    }
  }

  useEffect(() => {
    void loadLoginCode();
  }, []);

  useEffect(() => {
    if (!intent) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/auth/wechat/status?intentId=${encodeURIComponent(intent.intentId)}&nonce=${encodeURIComponent(intent.browserNonce)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("状态检查失败");
        }

        const payload = (await response.json()) as { status: LoginStatus };

        if (payload.status === "approved" && !hasExchangedRef.current) {
          hasExchangedRef.current = true;
          setStatus("redirecting");

          const exchangeResponse = await fetch("/api/auth/wechat/exchange", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              intentId: intent.intentId,
              nonce: intent.browserNonce,
            }),
          });

          const exchangePayload = (await exchangeResponse.json()) as { redirectTo?: string; error?: string };
          if (!exchangeResponse.ok || !exchangePayload.redirectTo) {
            throw new Error(exchangePayload.error ?? "登录兑换失败");
          }

          window.location.assign(exchangePayload.redirectTo);
          return;
        }

        if (payload.status === "expired") {
          setStatus("expired");
          window.clearInterval(timer);
          return;
        }

        setStatus("pending");
      } catch (error) {
        console.error("Failed to poll wechat login status:", error);
        setStatus("error");
        setError(error instanceof Error ? error.message : "登录状态检查失败");
        window.clearInterval(timer);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [intent]);

  const expiresText = useMemo(() => {
    if (!intent?.expiresAt) {
      return "登录码将在 10 分钟后过期";
    }

    const expiresAt = new Date(intent.expiresAt);
    return `请在 ${expiresAt.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })} 前发送到公众号`;
  }, [intent?.expiresAt]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: "#1A1D23" }}>
          扫码关注后发送登录码
        </p>
        <p className="text-sm leading-6" style={{ color: "#6B7280" }}>
          先用下面的二维码关注公众号“涂个AI”，再把网页登录码发送到公众号，当前页面会自动完成登录。
        </p>
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: "#E0E2E7",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(196, 147, 74, 0.12)", color: "#a87a3a" }}
          >
            <MessageSquareText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1A1D23" }}>
              先扫码关注公众号
            </p>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              固定公众号二维码，扫码后即可关注
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="rounded-[28px] border bg-white p-4 shadow-sm" style={{ borderColor: "#ECEEF2" }}>
            <Image
              src="/wechat-follow-qr.jpg"
              alt="涂个AI公众号二维码"
              width={220}
              height={220}
              className="h-[220px] w-[220px] rounded-[20px]"
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{
          borderColor: "#E0E2E7",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(196, 147, 74, 0.12)", color: "#a87a3a" }}
            >
              <MessageSquareText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1A1D23" }}>
                再发送这串登录码
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                {expiresText}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadLoginCode()}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              background: "rgba(196, 147, 74, 0.08)",
              color: "#a87a3a",
            }}
          >
            <RefreshCcw className="size-3.5" />
            刷新登录码
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border p-6 shadow-sm" style={{ borderColor: "#ECEEF2", background: "#fff" }}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: "#9CA3AF" }}>
              WeChat Login Code
            </p>
            <div className="mt-4 min-h-16 flex items-center justify-center">
              {intent?.loginCode ? (
                <p className="text-4xl font-black tracking-[0.28em]" style={{ color: "#1A1D23" }}>
                  {intent.loginCode}
                </p>
              ) : (
                <Loader2 className="size-8 animate-spin" style={{ color: "#a87a3a" }} />
              )}
            </div>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{
                background: copied ? "rgba(34, 197, 94, 0.1)" : "rgba(196, 147, 74, 0.1)",
                color: copied ? "#15803D" : "#a87a3a",
              }}
            >
              {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
              {copied ? "已复制" : "复制登录码"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl px-4 py-3 text-sm" style={{ background: "#F3F4F6", color: "#4B5563" }}>
          <div className="font-medium" style={{ color: "#1A1D23" }}>
            使用方式
          </div>
          <p className="mt-2">1. 用上面的二维码先关注公众号“涂个AI”</p>
          <p className="mt-1">2. 把这里的 6 位登录码发送到公众号聊天框</p>
          <p className="mt-1">3. 当前页面会自动完成登录</p>
        </div>
      </div>

      {status === "redirecting" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(196, 147, 74, 0.1)",
            color: "#a87a3a",
            border: "1px solid rgba(196, 147, 74, 0.2)",
          }}
        >
          已收到公众号确认，正在完成登录…
        </div>
      )}

      {status === "expired" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            color: "#DC2626",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          登录码已过期，请刷新后重新发送。
        </div>
      )}

      {status === "error" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            color: "#DC2626",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          {error ?? "登录暂时不可用，请稍后再试。"}
        </div>
      )}

      <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#c4934a" }}>
        发送后当前页面会自动轮询并跳转到控制台
        <ArrowRight className="size-4" />
      </div>
    </div>
  );
}
