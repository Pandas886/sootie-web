"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, QrCode, RefreshCcw } from "lucide-react";

type LoginIntent = {
  intentId: string;
  browserNonce: string;
  qrUrl: string;
  expiresAt: string;
};

type LoginStatus =
  | "idle"
  | "loading"
  | "pending"
  | "scanned"
  | "verifying"
  | "redirecting"
  | "expired"
  | "error";

export function WechatLoginClient() {
  const [intent, setIntent] = useState<LoginIntent | null>(null);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [scanConfirmed, setScanConfirmed] = useState(false);
  const isMountedRef = useRef(true);

  async function loadQrCode() {
    setStatus("loading");
    setError(null);
    setVerificationCode("");
    setScanConfirmed(false);

    try {
      const response = await fetch("/api/wechat/qr", { cache: "no-store" });
      const payload = (await response.json()) as LoginIntent & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "暂时无法生成登录二维码");
      }

      setIntent(payload);
      setStatus("pending");
    } catch (error) {
      setIntent(null);
      setStatus("error");
      setError(error instanceof Error ? error.message : "暂时无法生成登录二维码");
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!intent || !verificationCode.trim()) {
      setError("请输入公众号回复给你的验证码。");
      return;
    }

    setStatus("verifying");
    setError(null);

    try {
      const response = await fetch("/api/auth/wechat/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intentId: intent.intentId,
          nonce: intent.browserNonce,
          verificationCode,
        }),
      });

      const payload = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !payload.redirectTo) {
        throw new Error(payload.error ?? "验证码校验失败");
      }

      setStatus("redirecting");
      window.location.assign(payload.redirectTo);
    } catch (error) {
      setStatus("scanned");
      setError(error instanceof Error ? error.message : "验证码校验失败");
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void loadQrCode();

    return () => {
      isMountedRef.current = false;
    };
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

        const payload = (await response.json()) as {
          status: LoginStatus;
          hasReplyCode?: boolean;
        };

        if (!isMountedRef.current) {
          return;
        }

        if (payload.status === "expired") {
          setStatus("expired");
          window.clearInterval(timer);
          return;
        }

        if (payload.status === "scanned" || payload.hasReplyCode) {
          setScanConfirmed(true);
          setStatus((current) => (current === "verifying" || current === "redirecting" ? current : "scanned"));
          return;
        }

        setStatus((current) => (current === "verifying" || current === "redirecting" ? current : "pending"));
      } catch (error) {
        console.error("Failed to poll wechat login status:", error);
        if (isMountedRef.current) {
          setStatus("error");
          setError(error instanceof Error ? error.message : "登录状态检查失败");
        }
        window.clearInterval(timer);
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [intent]);

  const expiresText = useMemo(() => {
    if (!intent?.expiresAt) {
      return "二维码将在 10 分钟后过期";
    }

    const expiresAt = new Date(intent.expiresAt);
    return `请在 ${expiresAt.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })} 前完成扫码`;
  }, [intent?.expiresAt]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: "#1A1D23" }}>
          扫码关注并接收验证码
        </p>
        <p className="text-sm leading-6" style={{ color: "#6B7280" }}>
          打开微信扫一扫，关注公众号“涂个AI”后，公众号会自动回复网页登录验证码。把验证码填回当前页面即可登录。
        </p>
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
              <QrCode className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1A1D23" }}>
                扫这个二维码
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                {expiresText}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadQrCode()}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              background: "rgba(196, 147, 74, 0.08)",
              color: "#a87a3a",
            }}
          >
            <RefreshCcw className="size-3.5" />
            刷新二维码
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="rounded-[28px] border bg-white p-4 shadow-sm" style={{ borderColor: "#ECEEF2" }}>
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[20px]" style={{ background: "#F7F8FA" }}>
              {intent?.qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={intent.qrUrl} alt="微信登录二维码" className="h-[200px] w-[200px] rounded-2xl" />
              ) : (
                <Loader2 className="size-8 animate-spin" style={{ color: "#a87a3a" }} />
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="mt-6 space-y-3">
          <label className="block text-sm font-medium" style={{ color: "#1A1D23" }}>
            公众号回复给你的验证码
          </label>
          <input
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.toUpperCase())}
            placeholder={scanConfirmed ? "输入公众号回复的 6 位验证码" : "扫码后等待公众号回复验证码"}
            className="w-full rounded-xl border px-4 py-3 text-center text-lg font-bold tracking-[0.28em] outline-none"
            style={{
              borderColor: scanConfirmed ? "#c4934a" : "#E0E2E7",
              background: scanConfirmed ? "#fffaf2" : "#F3F4F6",
              color: "#1A1D23",
            }}
            maxLength={6}
          />
          <button
            type="submit"
            disabled={!scanConfirmed || status === "verifying" || status === "redirecting"}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200"
            style={{
              background:
                !scanConfirmed || status === "verifying" || status === "redirecting"
                  ? "#D1D5DB"
                  : "linear-gradient(135deg, #c4934a, #a87a3a)",
            }}
          >
            {status === "verifying" ? "校验中…" : "验证并登录"}
          </button>
        </form>

        <div className="mt-5 rounded-2xl px-4 py-3 text-sm" style={{ background: "#F3F4F6", color: "#4B5563" }}>
          <div className="font-medium" style={{ color: "#1A1D23" }}>
            使用方式
          </div>
          <p className="mt-2">1. 微信扫码并关注公众号“涂个AI”</p>
          <p className="mt-1">2. 公众号会自动回复 6 位网页登录验证码</p>
          <p className="mt-1">3. 把验证码填回这里完成登录</p>
        </div>
      </div>

      {scanConfirmed && status !== "redirecting" && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            color: "#2563EB",
            border: "1px solid rgba(59, 130, 246, 0.16)",
          }}
        >
          扫码已确认，请查看公众号回复并输入验证码。
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
          验证成功，正在完成登录…
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
          二维码已过期，请刷新后重新扫码。
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
        扫码后公众号会回一个网页登录验证码
        <ArrowRight className="size-4" />
      </div>
    </div>
  );
}
