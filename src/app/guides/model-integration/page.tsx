import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "多模型接入策略与选型",
  description: "为 Sootie 设计多模型策略：按任务分层选择 Claude、Gemini、GPT 等模型能力。",
  alternates: { canonical: "/guides/model-integration" },
  openGraph: {
    url: absoluteUrl("/guides/model-integration"),
    title: "多模型接入策略与选型",
    description: "通过任务分层与路由策略，在质量、延迟和成本之间取得平衡。",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "多模型接入策略与选型",
  datePublished: "2026-03-04",
  dateModified: "2026-03-04",
  author: { "@type": "Organization", name: "SootieAI" },
  mainEntityOfPage: absoluteUrl("/guides/model-integration"),
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
      name: "多模型接入策略与选型",
      item: absoluteUrl("/guides/model-integration"),
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "多模型路由的核心目标是什么？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "核心目标是在质量、延迟和成本之间动态平衡，让每类任务都匹配最合适的模型。",
      },
    },
    {
      "@type": "Question",
      name: "模型降级策略如何设计？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "为每类任务预设主模型与备用模型，当超时或预算超限时自动降级并记录回退原因。",
      },
    },
  ],
};

export default function ModelIntegrationGuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Script id="schema-model-integration-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Script id="schema-model-integration-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="schema-model-integration-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <article className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight">多模型接入策略与选型</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          不同模型在推理深度、响应速度和调用成本上有明显差异，合理路由比“单模型全覆盖”更稳定。
        </p>

        <h2 className="mt-10 text-2xl font-semibold">1. 任务分层</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-muted-foreground">
          <li>高复杂推理任务：优先质量。</li>
          <li>常规问答与摘要：优先性价比与延迟。</li>
          <li>批处理与自动化：优先吞吐量与稳定性。</li>
        </ul>

        <h2 className="mt-8 text-2xl font-semibold">2. 路由策略</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          先做轻量分类，再把任务分流到目标模型。失败时降级到备用模型，并记录回退原因，用于后续策略优化。
        </p>

        <h2 className="mt-8 text-2xl font-semibold">3. 成本与延迟控制</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          给每类任务设置预算上限与超时阈值，超过阈值自动切换到更快或更低成本模型，避免高峰时段系统不可控。
        </p>

        <p className="mt-10 text-sm text-muted-foreground">
          返回：
          <Link href="/guides" className="underline ml-1">
            Sootie 实战指南首页
          </Link>
        </p>
      </article>
    </main>
  );
}
