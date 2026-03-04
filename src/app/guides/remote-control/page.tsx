import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "远程控制与设备协同指南",
  description: "通过 Sootie Cloud 远程下发任务、管理设备状态、保障跨设备协同可靠性。",
  alternates: { canonical: "/guides/remote-control" },
  openGraph: {
    url: absoluteUrl("/guides/remote-control"),
    title: "远程控制与设备协同指南",
    description: "从链路设计到权限控制，构建可靠的远程 AI 任务执行流程。",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "远程控制与设备协同指南",
  datePublished: "2026-03-04",
  dateModified: "2026-03-04",
  author: { "@type": "Organization", name: "SootieAI" },
  mainEntityOfPage: absoluteUrl("/guides/remote-control"),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Sootie 指南",
      item: absoluteUrl("/guides"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "远程控制与设备协同指南",
      item: absoluteUrl("/guides/remote-control"),
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "远程控制链路中最关键的稳定性点是什么？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "关键在任务状态可追踪和失败可恢复，包括任务 ID、重试策略、超时规则和人工接管入口。",
      },
    },
    {
      "@type": "Question",
      name: "如何避免多设备之间的任务冲突？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "通过设备职责分层和队列隔离，给不同设备分配不同任务类型，并设置互斥锁与优先级规则。",
      },
    },
  ],
};

export default function RemoteControlGuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Script id="schema-remote-control-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="schema-remote-control-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="schema-remote-control-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight">远程控制与设备协同指南</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          Sootie Cloud 的价值在于你不在电脑前时，仍能安全地向本地 Agent 下发任务并拿到结果。
        </p>

        <h2 className="mt-10 text-2xl font-semibold">1. 标准执行链路</h2>
        <ol className="mt-3 list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>云端下发任务并附带执行上下文。</li>
          <li>本地 Agent 拉取任务、执行并回传状态。</li>
          <li>失败任务进入重试或人工接管队列。</li>
        </ol>

        <h2 className="mt-8 text-2xl font-semibold">2. 多设备调度建议</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          推荐为不同设备设置职责边界，例如主设备处理高权限任务，备用设备处理可并行的内容型任务，以避免资源竞争。
        </p>

        <h2 className="mt-8 text-2xl font-semibold">3. 可观测性指标</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
          <li>任务成功率、平均执行时长、P95 延迟。</li>
          <li>重试率与失败原因分布。</li>
          <li>设备在线率与连接中断时长。</li>
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          上一篇：
          <Link href="/guides/local-ai-agent" className="underline ml-1">
            本地 AI Agent 7×24 运行指南
          </Link>
          <span className="mx-2">|</span>
          下一篇：
          <Link href="/guides/model-integration" className="underline ml-1">
            多模型接入策略与选型
          </Link>
        </p>
      </article>
    </main>
  );
}
