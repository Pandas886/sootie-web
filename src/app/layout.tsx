import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@chatui/core/dist/index.css";
import "./globals.css";
import { absoluteUrl, siteConfig, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | 本地 AI Agent 云端控制台`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    title: `${siteConfig.name} | 本地 AI Agent 云端控制台`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "zh_CN",
    images: [
      {
        url: absoluteUrl(siteConfig.socialImage),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | 本地 AI Agent 云端控制台`,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.socialImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
