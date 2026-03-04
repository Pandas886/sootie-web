import { signup } from "./actions";
import Link from "next/link";
import { ArrowRight, Sparkles, Cpu, MessageSquare } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
    title: "注册",
    description: "注册 Sootie Cloud 账号，快速连接本地 AI Agent 并开启远程智能协同。",
    alternates: {
        canonical: "/signup",
    },
    openGraph: {
        url: absoluteUrl("/signup"),
        title: "注册 Sootie Cloud",
        description: "创建账号后即可接入 Sootie 的云端管理与 AI 自动化能力。",
        images: [absoluteUrl(siteConfig.socialImage)],
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const resolvedSearchParams = await searchParams;

    return (
        <div className="flex min-h-screen">
            {/* 左侧注册表单区 */}
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
                                创建账号
                            </h2>
                            <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                                注册 Sootie 云端账号，开启智能之旅
                            </p>
                        </div>

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
                                        placeholder="至少 6 位密码"
                                        required
                                        minLength={6}
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
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium"
                                        style={{ color: "#1A1D23" }}
                                    >
                                        确认密码
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="再次输入密码"
                                        required
                                        minLength={6}
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
                                        注册失败，请检查邮箱格式和密码长度（至少 6 位）。
                                    </div>
                                )}

                                <SubmitButton
                                    formAction={signup}
                                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                                    style={{
                                        background: "linear-gradient(135deg, #c4934a, #a87a3a)",
                                        boxShadow: "0 4px 14px rgba(196, 147, 74, 0.3)",
                                    }}
                                >
                                    创建账号
                                    <ArrowRight className="size-4" />
                                </SubmitButton>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm" style={{ color: "#6B7280" }}>
                                已有账号？{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold transition-colors hover:underline"
                                    style={{ color: "#c4934a" }}
                                >
                                    立即登录
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
                        继续即表示你同意我们的服务条款和隐私政策
                    </p>
                </div>
            </div>

            {/* 右侧品牌展示区（与登录页镜像对称 + 不同渐变） */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
                style={{
                    background:
                        "linear-gradient(225deg, #0F1117 0%, #1A1D27 35%, #242830 60%, #a87a3a 100%)",
                }}
            >
                {/* 装饰性浮动圆圈 */}
                <div
                    className="absolute top-32 right-20 w-64 h-64 rounded-full opacity-10"
                    style={{
                        background: "radial-gradient(circle, #d4a85c, transparent)",
                    }}
                />
                <div
                    className="absolute bottom-20 left-24 w-56 h-56 rounded-full opacity-8"
                    style={{
                        background: "radial-gradient(circle, #c4934a, transparent)",
                    }}
                />
                <div
                    className="absolute top-16 left-1/3 w-40 h-40 rounded-full opacity-6"
                    style={{
                        background: "radial-gradient(circle, #a87a3a, transparent)",
                    }}
                />

                {/* 品牌内容 */}
                <div className="relative z-10 max-w-lg px-12 text-white">

                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        加入 Sootie，
                        <br />
                        <span style={{ color: "#d4a85c" }}>释放 AI 潜能</span>
                    </h1>
                    <p className="text-lg opacity-70 mb-12 leading-relaxed">
                        几秒钟完成注册，立刻开始使用你的私人 AI Agent。
                    </p>

                    {/* 功能亮点 */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: "rgba(212, 168, 92, 0.2)" }}
                            >
                                <Sparkles className="size-5" style={{ color: "#d4a85c" }} />
                            </div>
                            <div>
                                <p className="font-medium">AI 技能市场</p>
                                <p className="text-sm opacity-60">丰富的技能库，一键安装</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: "rgba(212, 168, 92, 0.2)" }}
                            >
                                <Cpu className="size-5" style={{ color: "#d4a85c" }} />
                            </div>
                            <div>
                                <p className="font-medium">本地运行</p>
                                <p className="text-sm opacity-60">数据不出设备，隐私无忧</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: "rgba(212, 168, 92, 0.2)" }}
                            >
                                <MessageSquare
                                    className="size-5"
                                    style={{ color: "#d4a85c" }}
                                />
                            </div>
                            <div>
                                <p className="font-medium">自然对话</p>
                                <p className="text-sm opacity-60">
                                    像朋友一样交流，完成复杂任务
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
