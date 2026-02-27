import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Monitor, Cloud, Zap, Shield } from 'lucide-react';
import './landing.css';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-brand/20 selection:text-brand flex flex-col font-sans">
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
