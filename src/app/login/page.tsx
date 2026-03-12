import { Globe, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { WechatLoginClient } from "./WechatLoginClient";

export const metadata: Metadata = {
  title: "登录",
  description: "关注涂个AI公众号并发送登录码，自动登录 Sootie Cloud 云端账号。",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    url: absoluteUrl("/login"),
    title: "登录 Sootie Cloud",
    description: "关注公众号后发送登录码，自动登录并远程管理你的本地 AI Agent。",
    images: [absoluteUrl(siteConfig.socialImage)],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0F1117 0%, #1A1D27 40%, #2A2E38 70%, #c4934a 100%)",
        }}
      >
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #c4934a, transparent)" }}
        />
        <div
          className="absolute bottom-32 right-16 w-48 h-48 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #d4a85c, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-10 w-32 h-32 rounded-full opacity-6"
          style={{ background: "radial-gradient(circle, #a87a3a, transparent)" }}
        />

        <div className="relative z-10 max-w-lg px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-bold tracking-tight">Sootie</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            发送登录码后，
            <br />
            <span style={{ color: "#d4a85c" }}>公众号即登录</span>
          </h1>
          <p className="text-lg opacity-70 mb-12 leading-relaxed">
            用微信公众号作为唯一身份入口，关注并发送登录码后即可进入 Sootie Cloud。
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(196, 147, 74, 0.2)" }}
              >
                <Shield className="size-5" style={{ color: "#d4a85c" }} />
              </div>
              <div>
                <p className="font-medium">唯一身份入口</p>
                <p className="text-sm opacity-60">统一微信账号与云端设备权限</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(196, 147, 74, 0.2)" }}
              >
                <Zap className="size-5" style={{ color: "#d4a85c" }} />
              </div>
              <div>
                <p className="font-medium">首次关注，后续秒进</p>
                <p className="text-sm opacity-60">关注一次，后面发送登录码即可进入控制台</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(196, 147, 74, 0.2)" }}
              >
                <Globe className="size-5" style={{ color: "#d4a85c" }} />
              </div>
              <div>
                <p className="font-medium">公众号沉淀用户</p>
                <p className="text-sm opacity-60">把关注、私信触达与 Web 登录打通成一个漏斗</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10"
        style={{ background: "#F8F9FB" }}
      >
        <div className="w-full max-w-md animate-[fade-in-up_0.5s_ease-out]">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#1A1D23" }}>
              Sootie
            </span>
          </div>

          <div
            className="rounded-2xl p-8 md:p-10 shadow-xl"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(224, 226, 231, 0.6)",
            }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#1A1D23" }}>
                微信登录
              </h2>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                通过公众号“涂个AI”发送登录码完成唯一登录
              </p>
            </div>

            {resolvedSearchParams?.error && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-sm font-medium"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "#DC2626",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                登录确认失败，请刷新登录码后重试。
              </div>
            )}

            <WechatLoginClient />

            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: "#6B7280" }}>
                这是当前站点的唯一登录方式。
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
            继续即表示你同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
