import { login } from "./actions";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import Image from "next/image";
import { SubmitButton } from "@/components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen">
      {/* 左侧品牌展示区 */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0F1117 0%, #1A1D27 40%, #2A2E38 70%, #c4934a 100%)",
        }}
      >
        {/* 装饰性浮动圆圈 */}
        <div
          className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #c4934a, transparent)",
          }}
        />
        <div
          className="absolute bottom-32 right-16 w-48 h-48 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #d4a85c, transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-10 w-32 h-32 rounded-full opacity-6"
          style={{
            background: "radial-gradient(circle, #a87a3a, transparent)",
          }}
        />

        {/* 品牌内容 */}
        <div className="relative z-10 max-w-lg px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-bold tracking-tight">Sootie</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            你的智能 AI 助手，
            <br />
            <span style={{ color: "#d4a85c" }}>无处不在</span>
          </h1>
          <p className="text-lg opacity-70 mb-12 leading-relaxed">
            连接你的本地 AI Agent 到云端，随时随地管理设备、对话和任务。
          </p>

          {/* 特性列表 */}
          <div className="space-y-5">
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

      {/* 右侧登录表单区 */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10"
        style={{ background: "#F8F9FB" }}
      >
        <div className="w-full max-w-md animate-[fade-in-up_0.5s_ease-out]">
          {/* 移动端标题 */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#1A1D23" }}
            >
              Sootie
            </span>
          </div>

          {/* 玻璃拟态卡片 */}
          <div
            className="rounded-2xl p-8 md:p-10 shadow-xl"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(224, 226, 231, 0.6)",
            }}
          >
            <div className="mb-8">
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#1A1D23" }}
              >
                欢迎回来
              </h2>
              <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                登录你的 Sootie 云端账号
              </p>
            </div>

            {/* 成功注册提示 */}
            {resolvedSearchParams?.registered && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-sm font-medium"
                style={{
                  background: "rgba(196, 147, 74, 0.1)",
                  color: "#a87a3a",
                  border: "1px solid rgba(196, 147, 74, 0.2)",
                }}
              >
                ✅ 注册成功！请使用邮箱和密码登录。
              </div>
            )}

            <form>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium"
                    style={{ color: "#1A1D23" }}
                  >
                    邮箱地址
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="你的邮箱地址"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                    style={{
                      background: "#F3F4F6",
                      border: "1px solid #E0E2E7",
                      color: "#1A1D23",
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                    style={{ color: "#1A1D23" }}
                  >
                    密码
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="输入密码"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                    style={{
                      background: "#F3F4F6",
                      border: "1px solid #E0E2E7",
                      color: "#1A1D23",
                    }}
                  />
                </div>

                {resolvedSearchParams?.error && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      color: "#DC2626",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    登录失败，请检查邮箱和密码是否正确。
                  </div>
                )}

                <SubmitButton
                  formAction={login}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #c4934a, #a87a3a)",
                    boxShadow: "0 4px 14px rgba(196, 147, 74, 0.3)",
                  }}
                >
                  登录
                  <ArrowRight className="size-4" />
                </SubmitButton>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: "#6B7280" }}>
                还没有账号？{" "}
                <Link
                  href="/signup"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: "#c4934a" }}
                >
                  立即注册
                </Link>
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
