import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "本地 AI Agent 7×24 运行指南",
  description: "如何让 Sootie 本地 AI Agent 保持长期在线、可维护，并通过云端安全访问。",
  alternates: { canonical: "/guides/local-ai-agent" },
  openGraph: {
    url: absoluteUrl("/guides/local-ai-agent"),
    title: "本地 AI Agent 7×24 运行指南",
    description: "部署、稳定性、故障恢复与安全策略，构建长期在线的本地 AI Agent。",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "本地 AI Agent 7×24 运行指南",
  datePublished: "2026-03-04",
  dateModified: "2026-03-04",
  author: { "@type": "Organization", name: "SootieAI" },
  mainEntityOfPage: absoluteUrl("/guides/local-ai-agent"),
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "为什么要让本地 Agent 常驻运行？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "常驻运行可降低任务响应延迟，保证远程指令可达，并避免频繁冷启动带来的上下文丢失。",
      },
    },
    {
      "@type": "Question",
      name: "如何降低常驻运行的故障风险？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "建议配置开机自启、日志轮转、心跳监控与自动重连，并定期更新模型与依赖。",
      },
    },
  ],
};

export default function LocalAgentGuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Script id="schema-local-agent-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="schema-local-agent-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight">本地 AI Agent 7×24 运行指南</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          目标是让你的 Sootie Agent 在桌面设备上保持稳定常驻，同时通过云端实现可控、可观测、可恢复。
        </p>

        <h2 className="mt-10 text-2xl font-semibold">1. 稳定运行的最小配置</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
          <li>开机自启：确保断电或重启后自动恢复服务。</li>
          <li>固定工作目录：避免临时目录导致上下文与缓存丢失。</li>
          <li>日志与监控：至少记录任务开始、结束、失败原因与重试次数。</li>
        </ul>

        <h2 className="mt-8 text-2xl font-semibold">2. 故障恢复策略</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          建议把网络断连、模型接口超时、权限不足作为三类高频故障。每类故障都要有明确的重试次数和退避策略，避免无限循环。
        </p>

        <h2 className="mt-8 text-2xl font-semibold">3. 安全与权限边界</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          本地 Agent 应最小权限运行，敏感命令必须加白名单。远程调用链路需记录调用来源和时间，便于审计与追踪。
        </p>

        <p className="mt-10 text-sm text-muted-foreground">
          下一篇：
          <Link href="/guides/remote-control" className="underline ml-1">
            远程控制与设备协同指南
          </Link>
        </p>
      </article>
    </main>
  );
}
