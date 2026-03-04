import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sootie Cloud",
    short_name: "Sootie",
    description:
      "Sootie Cloud 是用于管理本地 AI Agent 的云端控制台，支持远程设备管理与任务协同。",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1117",
    theme_color: "#c4934a",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
