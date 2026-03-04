import { NextResponse } from "next/server";

const content = `# Sootie Cloud\n\n> Sootie Cloud is a control plane for local desktop AI agents.\n\n## Primary Pages\n- /landing: Product overview and capabilities\n- /guides: Practical guides index\n- /guides/local-ai-agent: 24/7 local agent operation\n- /guides/remote-control: Remote control workflows\n- /guides/model-integration: Multi-model integration strategy\n\n## Repository\n- https://github.com/Pandas886/sootie-web\n`;

export function GET() {
  return new NextResponse(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
