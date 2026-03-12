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
  const redirectDelayRef = useRef<number | null>(null);

  function logClientTiming(event: string, detail?: Record<string, unknown>) {
    console.log("[wechat-login]", event, {
      intentId: intent?.intentId ?? null,
      status,
      at: new Date().toISOString(),
      ...detail,
    });
  }

  async function loadLoginCode() {
    const startedAt = performance.now();
    setStatus("loading");
    setError(null);
    setCopied(false);
    hasExchangedRef.current = false;
    logClientTiming("load_login_code_start");

    try {
      const response = await fetch("/api/wechat/qr", { cache: "no-store" });
      const payload = (await response.json()) as LoginIntent & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "暂时无法生成登录码");
      }

      setIntent(payload);
      setStatus("pending");
      console.log("[wechat-login]", "load_login_code_success", {
        intentId: payload.intentId,
        costMs: Math.round(performance.now() - startedAt),
        expiresAt: payload.expiresAt,
      });
    } catch (error) {
      setIntent(null);
      setStatus("error");
      setError(error instanceof Error ? error.message : "暂时无法生成登录码");
      console.log("[wechat-login]", "load_login_code_error", {
        costMs: Math.round(performance.now() - startedAt),
        message: error instanceof Error ? error.message : "unknown",
      });
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
        const pollStartedAt = performance.now();
        const response = await fetch(
          `/api/auth/wechat/status?intentId=${encodeURIComponent(intent.intentId)}&nonce=${encodeURIComponent(intent.browserNonce)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("状态检查失败");
        }

        const payload = (await response.json()) as { status: LoginStatus };
        console.log("[wechat-login]", "poll_status", {
          intentId: intent.intentId,
          polledStatus: payload.status,
          costMs: Math.round(performance.now() - pollStartedAt),
        });

        if (payload.status === "approved" && !hasExchangedRef.current) {
          hasExchangedRef.current = true;
          window.clearInterval(timer);
          setStatus("approved");
          logClientTiming("approved_received");

          await new Promise((resolve) => {
            redirectDelayRef.current = window.setTimeout(resolve, 850);
          });

          setStatus("redirecting");
          const exchangeStartedAt = performance.now();
          logClientTiming("exchange_start");

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

          console.log("[wechat-login]", "exchange_success", {
            intentId: intent.intentId,
            costMs: Math.round(performance.now() - exchangeStartedAt),
            redirectTo: exchangePayload.redirectTo,
          });

          await new Promise((resolve) => {
            redirectDelayRef.current = window.setTimeout(resolve, 420);
          });

          logClientTiming("redirect_assign");
          window.location.assign(exchangePayload.redirectTo);
          return;
        }

        if (hasExchangedRef.current) {
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
        console.log("[wechat-login]", "poll_or_exchange_error", {
          intentId: intent.intentId,
          message: error instanceof Error ? error.message : "unknown",
        });
        setStatus("error");
        setError(error instanceof Error ? error.message : "登录状态检查失败");
        window.clearInterval(timer);
      }
    }, 2000);

    return () => {
      window.clearInterval(timer);

      if (redirectDelayRef.current) {
        window.clearTimeout(redirectDelayRef.current);
      }
    };
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

  const isTransitioning = status === "approved" || status === "redirecting";

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[1.9rem] border"
        style={{
          borderColor: "rgba(171, 144, 95, 0.16)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(249,245,236,0.96) 100%)",
          boxShadow: "0 24px 48px rgba(148, 116, 56, 0.07)",
        }}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-10 transition-all duration-500 ${
            isTransitioning ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(180deg, rgba(250,248,242,0.66) 0%, rgba(248,245,237,0.9) 100%)",
            backdropFilter: isTransitioning ? "blur(6px)" : "blur(0px)",
          }}
        >
          <div className="flex h-full items-center justify-center px-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(196,147,74,0.14)" }}
                />
                <div
                  className="absolute inset-[10px] rounded-full animate-pulse"
                  style={{ background: "rgba(196,147,74,0.1)" }}
                />
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white"
                  style={{ boxShadow: "0 10px 28px rgba(196,147,74,0.2)" }}
                >
                  {status === "approved" ? (
                    <CheckCircle2 className="size-7" style={{ color: "#b9812f" }} />
                  ) : (
                    <Loader2 className="size-7 animate-spin" style={{ color: "#b9812f" }} />
                  )}
                </div>
              </div>
              <p className="mt-5 text-xl font-semibold tracking-[0.01em]" style={{ color: "#1A1D23" }}>
                {status === "approved" ? "已收到公众号确认" : "正在进入 Sootie"}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-6" style={{ color: "#6B7280" }}>
                {status === "approved"
                  ? "正在校验身份并建立会话。"
                  : "即将完成跳转，请稍候。"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-7">
          <div className="flex flex-col items-center text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                color: "#8D6A2F",
                background: "rgba(196,147,74,0.08)",
                border: "1px solid rgba(196,147,74,0.12)",
              }}
            >
              <MessageSquareText className="size-3.5" />
              公众号“涂个AI”
            </div>

            <div className="mt-5 flex justify-center">
              <Image
                src="/wechat-follow-qr.jpg"
                alt="涂个AI公众号二维码"
                width={220}
                height={220}
                className="h-[188px] w-[188px] rounded-[1rem] border border-[#e8dcc9] bg-white p-2 md:h-[204px] md:w-[204px]"
              />
            </div>

            <div
              className="mt-6 w-full border-t pt-6"
              style={{ borderColor: "rgba(171, 144, 95, 0.14)" }}
            >
              <div className="flex items-center justify-between gap-3 text-left">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.42em]" style={{ color: "#A28A5E" }}>
                    Login Code
                  </p>
                  <p className="mt-2 text-xs leading-5" style={{ color: "#7A7A7A" }}>
                    {expiresText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadLoginCode()}
                  disabled={isTransitioning}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: "rgba(196, 147, 74, 0.08)",
                    color: "#8D6A2F",
                  }}
                >
                  <RefreshCcw className="size-3.5" />
                  刷新
                </button>
              </div>

              <div
                className={`mt-4 min-h-16 flex items-center justify-center rounded-[1rem] bg-white px-4 py-5 transition-all duration-500 ${
                  isTransitioning ? "scale-[0.985]" : "scale-100"
                }`}
                style={{
                  boxShadow: isTransitioning
                    ? "inset 0 0 0 1px rgba(232,220,201,0.9), 0 0 0 8px rgba(196,147,74,0.06)"
                    : "inset 0 0 0 1px rgba(232,220,201,0.9)",
                }}
              >
                {intent?.loginCode ? (
                  <p
                    className={`text-[2.3rem] font-black tracking-[0.2em] transition-all duration-500 sm:text-[2.75rem] sm:tracking-[0.28em] ${
                      isTransitioning ? "opacity-30 blur-[1px]" : "opacity-100"
                    }`}
                    style={{ color: "#151821" }}
                  >
                    {intent.loginCode}
                  </p>
                ) : (
                  <Loader2 className="size-8 animate-spin" style={{ color: "#a87a3a" }} />
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => void copyCode()}
                  disabled={isTransitioning}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: copied ? "rgba(34, 197, 94, 0.1)" : "rgba(196, 147, 74, 0.1)",
                    color: copied ? "#15803D" : "#8D6A2F",
                  }}
                >
                  {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "已复制" : "复制登录码"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === "approved" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            color: "#15803D",
            border: "1px solid rgba(34, 197, 94, 0.14)",
          }}
        >
          已感知到公众号回执，正在准备登录。
        </div>
      )}

      {status === "redirecting" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(196, 147, 74, 0.1)",
            color: "#a87a3a",
            border: "1px solid rgba(196, 147, 74, 0.2)",
          }}
        >
          正在建立会话，即将跳转…
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

      <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#9B7B46" }}>
        发送后将自动登录
        <ArrowRight className="size-4" />
      </div>
    </div>
  );
}
