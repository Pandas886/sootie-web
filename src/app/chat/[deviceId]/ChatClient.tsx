"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Chat, { Bubble, useMessages, MessageProps } from "@chatui/core";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, MonitorSmartphone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./markdown.css";

const SESSION_ID = "default";

export default function ChatClient({ userId, userEmail, deviceId, deviceName }: { userId: string, userEmail?: string, deviceId: string, deviceName: string }) {
    const userAvatar = userEmail ? `https://api.dicebear.com/9.x/lorelei/svg?seed=${userEmail}` : undefined;
    const { messages, appendMsg } = useMessages([]);
    const [isTyping, setIsTyping] = useState(false);
    // useMemo 确保 supabase 实例在组件生命周期内只创建一次
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    // 用 ref 持有 appendMsg 的最新引用，避免 useEffect 因 appendMsg 变化重复执行
    const appendMsgRef = useRef(appendMsg);
    appendMsgRef.current = appendMsg;

    // 全局已渲染消息 ID 集合，跨 effect 生命周期保持稳定
    const seenIdsRef = useRef(new Set<string>());

    useEffect(() => {
        const seenIds = seenIdsRef.current;
        let lastFetchedAt = new Date().toISOString();
        let cancelled = false;

        // 1. 获取历史消息
        const fetchHistory = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("user_id", userId)
                .eq("device_id", deviceId)
                .order("created_at", { ascending: true });

            if (cancelled || !data) return;

            data.forEach((msg) => {
                if (!seenIds.has(msg.id)) {
                    seenIds.add(msg.id);
                    appendMsgRef.current({
                        type: "text",
                        content: { text: msg.message_content?.text || "" },
                        position: msg.role === "user" ? "right" : "left",
                        _id: msg.id,
                        user: msg.role === "assistant"
                            ? { avatar: "/sootie-logo-transparent.png" }
                            : { avatar: userAvatar },
                    });
                }
            });
            if (data.length > 0) {
                lastFetchedAt = data[data.length - 1].created_at;
            }
        };

        fetchHistory();

        // 2. Realtime 订阅
        const channel = supabase
            .channel(`messages:device_id=eq.${deviceId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `device_id=eq.${deviceId}`,
                },
                (payload) => {
                    const newMsg = payload.new as any;
                    if (newMsg.role === "assistant" && !seenIds.has(newMsg.id)) {
                        seenIds.add(newMsg.id);
                        setIsTyping(false);
                        appendMsgRef.current({
                            type: "text",
                            content: { text: newMsg.message_content?.text || "..." },
                            position: "left",
                            _id: newMsg.id,
                            user: { avatar: "/sootie-logo-transparent.png" }
                        });
                    }
                }
            )
            .subscribe();

        // 3. 轮询兜底：每 2s 拉取新 assistant 消息
        const pollInterval = setInterval(async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("device_id", deviceId)
                .eq("role", "assistant")
                .gt("created_at", lastFetchedAt)
                .order("created_at", { ascending: true });

            if (data && data.length > 0) {
                data.forEach((msg) => {
                    if (!seenIds.has(msg.id)) {
                        seenIds.add(msg.id);
                        setIsTyping(false);
                        appendMsgRef.current({
                            type: "text",
                            content: { text: msg.message_content?.text || "..." },
                            position: "left",
                            _id: msg.id,
                            user: { avatar: "/sootie-logo-transparent.png" }
                        });
                    }
                });
                lastFetchedAt = data[data.length - 1].created_at;
            }
        }, 2000);

        return () => {
            cancelled = true;
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, userId, supabase]);


    const handleSend = async (type: string, val: string) => {
        if (type === "text" && val.trim()) {
            appendMsg({
                type: "text",
                content: { text: val },
                position: "right",
                user: { avatar: userAvatar },
            });

            setIsTyping(true);

            const { error } = await supabase.from("messages").insert({
                session_id: SESSION_ID,
                user_id: userId,
                device_id: deviceId,
                role: "user",
                message_content: { text: val },
            });

            if (error) {
                console.error("Failed to send message", error);
                setIsTyping(false);
            }
        }
    };

    const renderMessageContent = (msg: MessageProps) => {
        const { content } = msg;
        if (msg.type === "text" && content?.text) {
            return (
                <Bubble>
                    {/* 添加内联白空控制防御外层样式污染 */}
                    <div className="markdown-body text-sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content.text}
                        </ReactMarkdown>
                    </div>
                </Bubble>
            );
        }
        return <Bubble content={content?.text} />;
    };

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden" style={{ background: '#F8F9FB' }}>
            {/* 侧边栏 */}
            <div className="w-64 hidden md:flex flex-col"
                style={{
                    background: '#FFFFFF',
                    borderRight: '1px solid #E0E2E7',
                }}>
                <div className="p-4 font-bold text-lg flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    style={{ borderBottom: '1px solid #EBEDF0', color: '#1A1D23' }}
                    onClick={() => router.push('/dashboard')}>
                    <ChevronLeft className="w-5 h-5" style={{ color: '#8B8FA3' }} />
                    <div className="flex items-center gap-2">
                        <Image src="/sootie-logo-transparent.png" alt="Sootie" width={20} height={20} />
                        Sootie Cloud
                    </div>
                </div>
                <div className="p-2">
                    <div className="text-xs font-semibold uppercase tracking-widest p-2"
                        style={{ color: '#8B8FA3' }}>
                        当前设备
                    </div>
                    <button className="w-full text-left p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                        style={{
                            background: 'rgba(196, 147, 74, 0.1)',
                            color: '#a87a3a',
                        }}>
                        <div className="relative">
                            <MonitorSmartphone className="w-4 h-4" />
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: '#c4934a', border: '1px solid white' }}></span>
                        </div>
                        {deviceName}
                    </button>
                </div>
                <div className="mt-auto p-4" style={{ borderTop: '1px solid #EBEDF0' }}>
                    <div className="text-xs truncate" style={{ color: '#8B8FA3' }}>
                        Device UUID: {deviceId.slice(0, 8)}...
                    </div>
                </div>
            </div>

            {/* 主聊天区域 */}
            <div className="flex-1 flex flex-col h-full relative" style={{ background: '#F8F9FB' }}>
                <Chat
                    navbar={{
                        title: deviceName,
                        leftContent: {
                            icon: 'chevron-left',
                            title: 'Back',
                            onClick: () => router.push('/dashboard')
                        }
                    }}
                    messages={messages}
                    renderMessageContent={renderMessageContent}
                    onSend={handleSend}
                    placeholder={`给 ${deviceName} 上的 Sootie 发送指令...`}
                />
            </div>
        </div>
    );
}
