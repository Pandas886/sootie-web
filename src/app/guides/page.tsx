import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sootie 指南",
  description: "Sootie Cloud 实战指南：本地 AI Agent、远程控制、多模型接入与最佳实践。",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    url: absoluteUrl("/guides"),
    title: "Sootie 指南",
    description: "系统化了解 Sootie Cloud 的部署、远程控制和模型接入方案。",
  },
};

const guides = [
  {
    title: "本地 AI Agent 7×24 运行指南",
    href: "/guides/local-ai-agent",
    description: "如何在桌面设备长期稳定运行本地 Agent，并保持云端可控。",
  },
  {
    title: "远程控制与设备协同指南",
    href: "/guides/remote-control",
    description: "如何通过 Sootie Cloud 和 IM 通道远程下发任务，管理多设备。",
  },
  {
    title: "多模型接入策略与选型",
    href: "/guides/model-integration",
    description: "Claude、Gemini、GPT 等模型的任务分工、延迟与成本平衡思路。",
  },
];

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Sootie 实战指南",
  itemListElement: guides.map((guide, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: guide.title,
    url: absoluteUrl(guide.href),
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "首页",
      item: absoluteUrl("/landing"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Sootie 指南",
      item: absoluteUrl("/guides"),
    },
  ],
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Script id="schema-guides-item-list" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Script id="schema-guides-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sootie 实战指南</h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-3xl">
          这些指南以“可执行”为目标，帮助你把 Sootie 从安装和接入，走到稳定运行与远程协同。
        </p>

        <div className="mt-10 grid gap-4">
          {guides.map((guide) => (
            <article key={guide.href} className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="text-xl font-semibold">
                <Link href={guide.href} className="hover:underline">
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted-foreground">{guide.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
