import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from "next";
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Monitor, Cloud, Zap, Shield } from 'lucide-react';
import './landing.css';
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Sootie Cloud 官网",
    description:
        "Sootie Cloud 提供 7×24 小时桌面级 AI 助手体验，支持本地 AI Agent 云端管控、远程任务执行与多模型能力接入。",
    alternates: {
        canonical: "/landing",
    },
    openGraph: {
        url: absoluteUrl("/landing"),
        title: "Sootie Cloud 官网",
        description:
            "连接你的本地 AI Agent 到云端，随时随地管理设备、对话和任务。",
        images: [
            {
                url: absoluteUrl(siteConfig.socialImage),
                width: 1200,
                height: 630,
                alt: "Sootie Cloud",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Sootie Cloud 官网",
        description:
            "连接你的本地 AI Agent 到云端，随时随地管理设备、对话和任务。",
        images: [absoluteUrl(siteConfig.socialImage)],
    },
};

const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Sootie Cloud",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, macOS, Windows",
    description:
        "Sootie Cloud 是用于远程管理本地 AI Agent 的云端控制台，支持 7×24 小时任务协同与多模型能力接入。",
    url: absoluteUrl("/landing"),
    image: absoluteUrl(siteConfig.socialImage),
    sameAs: [siteConfig.githubUrl],
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    publisher: {
        "@type": "Organization",
        name: "SootieAI",
        url: absoluteUrl("/"),
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Sootie Cloud 是什么？",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sootie Cloud 是连接本地 AI Agent 与云端的管理控制台，可用于远程下发任务、管理设备状态和查看 AI 对话记录。",
            },
        },
        {
            "@type": "Question",
            name: "Sootie 是否支持 7×24 小时运行？",
            acceptedAnswer: {
                "@type": "Answer",
                text: "支持。Sootie 以桌面应用形态在本地常驻运行，结合云端控制台可提供 7×24 小时在线可达能力。",
            },
        },
        {
            "@type": "Question",
            name: "Sootie 可以接入哪些模型？",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sootie 支持接入主流大语言模型，例如 Claude、Gemini、GPT 等，以满足不同任务的推理和生成需求。",
            },
        },
    ],
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-brand/20 selection:text-brand flex flex-col font-sans">
            <Script
                id="schema-software-application"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <Script
                id="schema-faq-page"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* 顶部导航 */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-brand/10">
                            <Image
                                src="/sootie-logo-transparent.png"
                                alt="Sootie Logo"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                        <span className="font-semibold text-lg tracking-tight">SootieAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button className="bg-brand hover:bg-brand-hover text-primary-foreground rounded-full px-6 shadow-sm">
                                进入 Sootie Cloud
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col pt-12 pb-24 lg:pt-24">
                {/* Hero Section */}
                <section className="container mx-auto max-w-6xl px-4 flex flex-col items-center text-center space-y-10">
                    <div className="relative w-32 h-32 md:w-48 md:h-48 mb-4 animate-float">
                        <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse" />
                        <Image
                            src="/sootie-logo-transparent.png"
                            alt="Sootie Sprite"
                            fill
                            className="object-contain drop-shadow-2xl relative z-10"
                            priority
                        />
                    </div>

                    <div className="space-y-6 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                            你的 <span className="text-brand">7×24</span> 桌面级
                            <br className="hidden md:block" /> AI 智能伙伴
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            随时待命的小煤球，常驻你的电脑桌面。无论是信息检索、任务处理还是远程操控，Sootie 始终为你提供温暖而强大的帮助。
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <a href="https://github.com/Pandas886/sootie-web/releases/latest" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="bg-brand hover:bg-brand-hover text-primary-foreground rounded-full h-14 px-8 text-base shadow-sm w-full sm:w-auto">
                                <Download className="mr-2 w-5 h-5" />
                                下载 macOS 版
                            </Button>
                        </a>
                        <a href="https://github.com/Pandas886/sootie-web/releases/latest" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border hover:bg-secondary w-full sm:w-auto">
                                <Monitor className="mr-2 w-5 h-5" />
                                下载 Windows 版
                            </Button>
                        </a>
                    </div>
                </section>

                {/* Feature Section */}
                <section className="container mx-auto max-w-6xl px-4 mt-32">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Monitor className="w-6 h-6 text-brand" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">桌面级常驻</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                7×24 小时运行在你的电脑后台，随时呼出，无需打开网页，提供深度系统的桌面级集成体验。
                            </p>
                        </div>

                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Cloud className="w-6 h-6 text-brand" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">云端与移动管控</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                即使在外出时，也能通过 Sootie Cloud 或连接飞书、钉钉等 IM 平台，远程向家里的电脑下达指令。
                            </p>
                        </div>

                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-brand" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">多模型驱动</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                支持对接各类前沿大语言模型（如 Claude, Gemini, GPT 等），让你的小煤球拥有最顶尖的大脑。
                            </p>
                        </div>

                        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-brand" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">安全与隐私</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                作为本地应用运行，确保你的核心数据和执行权限掌握在自己手中，安心使用各项智能功能。
                            </p>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto max-w-6xl px-4 mt-20 space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">常见问题</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <article className="rounded-2xl border border-border/60 bg-card p-6">
                            <h3 className="text-lg font-semibold mb-3">Sootie Cloud 是什么？</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Sootie Cloud 是连接本地 AI Agent 与云端的管理控制台，用于远程下发任务、查看设备状态与统一管理 AI 工作流。
                            </p>
                        </article>
                        <article className="rounded-2xl border border-border/60 bg-card p-6">
                            <h3 className="text-lg font-semibold mb-3">是否支持 7×24 小时运行？</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                支持。Sootie 以桌面应用形态常驻本地设备，结合云端控制台，提供全天候在线管理能力。
                            </p>
                        </article>
                        <article className="rounded-2xl border border-border/60 bg-card p-6">
                            <h3 className="text-lg font-semibold mb-3">支持哪些模型？</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                可以接入 Claude、Gemini、GPT 等主流模型，按任务场景灵活选择能力与成本。
                            </p>
                        </article>
                    </div>
                </section>

                <section className="container mx-auto max-w-6xl px-4 mt-16">
                    <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-10">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">深入阅读</h2>
                        <p className="mt-3 text-muted-foreground">想系统了解 Sootie 的部署、远程控制与多模型策略，可以从以下指南开始。</p>
                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            <Link href="/guides/local-ai-agent" className="rounded-xl border border-border/60 px-4 py-3 hover:bg-secondary/60 transition-colors">
                                本地 AI Agent 7×24 运行指南
                            </Link>
                            <Link href="/guides/remote-control" className="rounded-xl border border-border/60 px-4 py-3 hover:bg-secondary/60 transition-colors">
                                远程控制与设备协同指南
                            </Link>
                            <Link href="/guides/model-integration" className="rounded-xl border border-border/60 px-4 py-3 hover:bg-secondary/60 transition-colors">
                                多模型接入策略与选型
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 py-8 bg-card/30">
                <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
                    <div className="flex items-center gap-2">
                        <Image src="/sootie-logo-transparent.png" alt="Logo" width={20} height={20} />
                        <span>© {new Date().getFullYear()} SootieAI. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="https://github.com/Pandas886/sootie-web" target="_blank" className="hover:text-foreground transition-colors">
                            GitHub
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
