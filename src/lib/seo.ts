export const siteConfig = {
  name: "Sootie Cloud",
  shortName: "Sootie",
  domain: "sootie.cloudeon.top",
  url: "https://sootie.cloudeon.top",
  description:
    "Sootie Cloud 是 SootieAI 的云端控制台，支持远程管理本地 AI Agent、设备与任务，实现 7×24 小时桌面级智能助手体验。",
  keywords: [
    "Sootie",
    "Sootie Cloud",
    "SootieAI",
    "AI 助手",
    "本地 AI Agent",
    "云端控制",
    "远程桌面 AI",
    "Desktop AI Agent",
    "Local AI Assistant",
    "AI automation",
  ],
  socialImage: "/sootie-logo-transparent.png",
  githubUrl: "https://github.com/Pandas886/sootie-web",
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? siteConfig.url;

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
};
