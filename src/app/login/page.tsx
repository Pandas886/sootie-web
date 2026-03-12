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
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(196,147,74,0.08), transparent 22%), linear-gradient(90deg, #0b1018 0%, #121827 48%, #f3efe6 48%, #f8f5ee 100%)",
      }}
    >
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(196,147,74,0.12), transparent 20%), radial-gradient(circle at 72% 82%, rgba(212,168,92,0.18), transparent 22%), linear-gradient(180deg, #090d15 0%, #101624 48%, #181e2d 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)",
          }}
        />
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
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.32em]"
            style={{ borderColor: "rgba(212,168,92,0.28)", color: "rgba(255,255,255,0.72)" }}>
            Sootie Cloud
          </div>
          <h1
            className="mb-6 text-5xl leading-[1.05] tracking-[-0.03em]"
            style={{ fontFamily: '"Times New Roman", "Songti SC", "Noto Serif SC", serif' }}
          >
            你的智能 AI 助手，
            <br />
            <span style={{ color: "#d4a85c" }}>无处不在</span>
          </h1>
          <p className="text-lg opacity-70 mb-12 leading-relaxed">
            连接你的本地 AI Agent 到云端，随时随地管理设备、对话和任务。
          </p>

          <div className="space-y-5 border-l pl-6" style={{ borderColor: "rgba(212,168,92,0.18)" }}>
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(196, 147, 74, 0.2)" }}
              >
                <Shield className="size-5" style={{ color: "#d4a85c" }} />
              </div>
              <div>
                <p className="font-medium">端到端加密</p>
                <p className="text-sm opacity-60">你的数据安全有保障</p>
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
                <p className="font-medium">极速响应</p>
                <p className="text-sm opacity-60">本地代理，毫秒级反馈</p>
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
                <p className="font-medium">多设备同步</p>
                <p className="text-sm opacity-60">桌面端与 Web 无缝切换</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10"
        style={{ background: "linear-gradient(180deg, rgba(248,246,241,0.98), rgba(242,239,231,0.96))" }}
      >
        <div className="w-full max-w-[34rem] animate-[fade-in-up_0.55s_ease-out]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span
              className="text-2xl tracking-[0.08em]"
              style={{ color: "#1A1D23", fontFamily: '"Times New Roman", Georgia, serif' }}
            >
              Sootie
            </span>
          </div>

          <div
            className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 shadow-[0_24px_60px_rgba(17,24,39,0.10)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,248,242,0.96) 100%)",
              border: "1px solid rgba(171, 144, 95, 0.18)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(196,147,74,0.7), transparent)" }}
            />
            <div
              className="absolute right-[-4rem] top-[-5rem] h-36 w-36 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, rgba(196,147,74,0.28), transparent 68%)" }}
            />
            <div className="mb-8">
              <h2
                className="text-[2.1rem] leading-none tracking-tight"
                style={{ color: "#1A1D23", fontFamily: '"Times New Roman", "Songti SC", "Noto Serif SC", serif' }}
              >
                微信登录
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: "#6B7280" }}>
                扫码关注后，发送登录码进入 Sootie。
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
          </div>

          <p className="mt-6 text-center text-xs tracking-wide" style={{ color: "#B2B8C2" }}>
            Sootie Cloud
          </p>
        </div>
      </div>
    </div>
  );
}
