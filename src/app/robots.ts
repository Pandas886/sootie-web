import type { MetadataRoute } from "next";
import { siteConfig, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "PerplexityBot",
          "ChatGPT-User",
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
        ],
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteConfig.domain,
  };
}
