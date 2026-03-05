"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Chat, { Bubble, useMessages, MessageProps } from "@chatui/core";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, MonitorSmartphone, Paperclip, X, FileImage, FileText, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./markdown.css";

const SESSION_ID = "default";
const ATTACHMENTS_BUCKET = "im-attachments";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES_PER_MESSAGE = 5;

type StoredAttachment = {
  bucket: string;
  storage_path: string;
  name: string;
  mime_type: string;
  size: number;
  signed_url?: string;
};

type MessageContent = {
  text?: string;
  attachments?: StoredAttachment[];
};

type MessageRow = {
  id: string;
  created_at: string;
  role: "user" | "assistant" | "system";
  message_content?: MessageContent;
};

const sanitizeFileName = (name: string): string =>
  name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120) || "file";

const generateObjectId = (): string => {
  const maybeRandomUUID = globalThis.crypto?.randomUUID;
  if (typeof maybeRandomUUID === "function") {
    return maybeRandomUUID.call(globalThis.crypto);
  }

  const fallback = Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${fallback}`;
};

const isImageAttachment = (attachment: StoredAttachment): boolean =>
  attachment.mime_type.startsWith("image/");

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ChatClient({ userId, userEmail, deviceId, deviceName }: { userId: string; userEmail?: string; deviceId: string; deviceName: string }) {
  const userAvatar = userEmail ? `https://api.dicebear.com/9.x/lorelei/svg?seed=${userEmail}` : undefined;
  const { messages, appendMsg } = useMessages([]);
  const [, setIsTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComposerMultiline, setIsComposerMultiline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sendingLockRef = useRef(false);

  // useMemo 确保 supabase 实例在组件生命周期内只创建一次
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // 用 ref 持有 appendMsg 的最新引用，避免 useEffect 因 appendMsg 变化重复执行
  const appendMsgRef = useRef(appendMsg);
  appendMsgRef.current = appendMsg;

  // 全局已渲染消息 ID 集合，跨 effect 生命周期保持稳定
  const seenIdsRef = useRef(new Set<string>());

  const resolveSignedAttachmentUrls = async (attachments: StoredAttachment[] | undefined): Promise<StoredAttachment[] | undefined> => {
    if (!attachments || attachments.length === 0) {
      return undefined;
    }

    const resolved = await Promise.all(
      attachments.map(async (attachment) => {
        if (!isImageAttachment(attachment)) {
          return attachment;
        }

        const { data, error } = await supabase.storage
          .from(attachment.bucket || ATTACHMENTS_BUCKET)
          .createSignedUrl(attachment.storage_path, 3600);

        if (error || !data?.signedUrl) {
          return attachment;
        }

        return {
          ...attachment,
          signed_url: data.signedUrl,
        };
      })
    );

    return resolved;
  };

  const buildContentFromRow = async (raw: MessageContent | undefined): Promise<MessageContent> => {
    const text = typeof raw?.text === "string" ? raw.text : "";
    const attachments = Array.isArray(raw?.attachments)
      ? (raw.attachments as StoredAttachment[])
      : undefined;

    const resolvedAttachments = await resolveSignedAttachmentUrls(attachments);
    return {
      text,
      attachments: resolvedAttachments,
    };
  };

  useEffect(() => {
    const seenIds = seenIdsRef.current;
    let lastFetchedAt = new Date().toISOString();
    let cancelled = false;

    const appendMessageFromRow = async (row: MessageRow, fallbackPosition?: "left" | "right") => {
      if (cancelled || seenIds.has(row.id)) return;
      seenIds.add(row.id);

      const content = await buildContentFromRow(row.message_content);
      if (cancelled) return;

      const position = fallbackPosition || (row.role === "user" ? "right" : "left");
      appendMsgRef.current({
        type: "text",
        content,
        position,
        _id: row.id,
        user: row.role === "assistant"
          ? { avatar: "/sootie-logo-transparent.png" }
          : { avatar: userAvatar },
      });
    };

    // 1. 获取历史消息
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .eq("device_id", deviceId)
        .order("created_at", { ascending: true });

      if (cancelled || !data) return;

      for (const msg of data) {
        await appendMessageFromRow(msg);
      }

      if (data.length > 0) {
        lastFetchedAt = data[data.length - 1].created_at;
      }
    };

    void fetchHistory();

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
          const newMsg = payload.new as MessageRow;
          if (newMsg.role === "assistant") {
            setIsTyping(false);
            void appendMessageFromRow(newMsg);
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
        for (const msg of data) {
          setIsTyping(false);
          await appendMessageFromRow(msg, "left");
        }
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

  const handlePickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(event.target.files || []);
    if (list.length === 0) return;

    const merged = [...pendingFiles, ...list].slice(0, MAX_FILES_PER_MESSAGE);
    setPendingFiles(merged);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPendingFiles = async (): Promise<StoredAttachment[]> => {
    if (pendingFiles.length === 0) return [];

    const uploaded: StoredAttachment[] = [];

    for (const file of pendingFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`文件 ${file.name} 超过 10MB 限制`);
      }

      const safeName = sanitizeFileName(file.name);
      const objectPath = `${userId}/${deviceId}/${SESSION_ID}/${generateObjectId()}-${safeName}`;

      const { error } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (error) {
        throw error;
      }

      uploaded.push({
        bucket: ATTACHMENTS_BUCKET,
        storage_path: objectPath,
        name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
        signed_url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      });
    }

    return uploaded;
  };

  const submitMessage = async () => {
    if (sendingLockRef.current) {
      return;
    }
    const text = inputValue.trim();
    if (!text && pendingFiles.length === 0) {
      return;
    }

    sendingLockRef.current = true;
    setIsSending(true);

    try {
      const uploadedAttachments = await uploadPendingFiles();

      appendMsg({
        type: "text",
        content: {
          text,
          attachments: uploadedAttachments,
        },
        position: "right",
        user: { avatar: userAvatar },
      });

      setIsTyping(true);
      setPendingFiles([]);
      setInputValue("");
      setIsComposerMultiline(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "46px";
      }

      const { error } = await supabase.from("messages").insert({
        session_id: SESSION_ID,
        user_id: userId,
        device_id: deviceId,
        role: "user",
        message_content: {
          text,
          attachments: uploadedAttachments.map(({ bucket, storage_path, name, mime_type, size }) => ({
            bucket,
            storage_path,
            name,
            mime_type,
            size,
          })),
        },
      });

      if (error) {
        console.error("Failed to send message", error);
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Failed to upload/send message", error);
      setIsTyping(false);
    } finally {
      sendingLockRef.current = false;
      setIsSending(false);
    }
  };

  const handleTextareaInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    const target = event.target;
    target.style.height = "46px";
    const nextHeight = Math.min(target.scrollHeight, 160);
    target.style.height = `${nextHeight}px`;
    setIsComposerMultiline(nextHeight > 56);
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSending) {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const renderMessageContent = (msg: MessageProps) => {
    const content = msg.content as MessageContent;
    const text = content?.text || "";
    const attachments = content?.attachments || [];

    return (
      <Bubble>
        {text ? (
          <div className="markdown-body text-sm" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className={text ? "chat-attachment-wrap mt-3" : "chat-attachment-wrap"}>
            <div className="grid grid-cols-1 gap-2">
              {attachments.map((attachment) => {
                if (attachment.signed_url && isImageAttachment(attachment)) {
                  return (
                    <a
                      key={attachment.storage_path}
                      href={attachment.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      className="chat-attachment-image-link"
                    >
                      <div className="chat-attachment-image-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={attachment.signed_url}
                          alt={attachment.name}
                          className="chat-attachment-image"
                        />
                      </div>
                      <div className="chat-attachment-image-caption">{attachment.name}</div>
                    </a>
                  );
                }

                return (
                  <div key={attachment.storage_path} className="chat-file-bubble">
                    <div className="chat-file-name">{attachment.name}</div>
                    <div className="chat-file-meta">{Math.max(1, Math.round(attachment.size / 1024))} KB</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Bubble>
    );
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden" style={{ background: "#F8F9FB" }}>
      {/* 侧边栏 */}
      <div
        className="hidden w-64 flex-col md:flex"
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E0E2E7",
        }}
      >
        <div
          className="flex cursor-pointer items-center gap-2 p-4 text-lg font-bold transition-all duration-200 active:scale-[0.98]"
          style={{ borderBottom: "1px solid #EBEDF0", color: "#1A1D23" }}
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="h-5 w-5" style={{ color: "#8B8FA3" }} />
          <div className="flex items-center gap-2">
            <Image src="/sootie-logo-transparent.png" alt="Sootie" width={20} height={20} />
            Sootie Cloud
          </div>
        </div>
        <div className="p-2">
          <div className="p-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B8FA3" }}>
            当前设备
          </div>
          <button
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium"
            style={{
              background: "rgba(196, 147, 74, 0.1)",
              color: "#a87a3a",
            }}
          >
            <div className="relative">
              <MonitorSmartphone className="h-4 w-4" />
              <span
                className="absolute right-0 top-0 h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: "#c4934a", border: "1px solid white" }}
              ></span>
            </div>
            {deviceName}
          </button>
        </div>
        <div className="mt-auto p-4" style={{ borderTop: "1px solid #EBEDF0" }}>
          <div className="truncate text-xs" style={{ color: "#8B8FA3" }}>
            Device UUID: {deviceId.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div
        className={`chat-main-shell relative flex h-full flex-1 flex-col${pendingFiles.length > 0 ? " has-pending" : ""}`}
        style={{ background: "#F8F9FB" }}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickFiles} />

        <Chat
          navbar={{
            title: deviceName,
            leftContent: {
              icon: "chevron-left",
              title: "Back",
              onClick: () => router.push("/dashboard"),
            },
          }}
          messages={messages}
          renderMessageContent={renderMessageContent}
          onSend={() => {}}
          placeholder={`给 ${deviceName} 上的 Sootie 发送指令...`}
        />

        <div className="chat-custom-composer">
          {pendingFiles.length > 0 ? (
            <div className="chat-pending-dock">
              <div className="chat-pending-head">
                <Paperclip className="h-3.5 w-3.5" />
                <span>已添加 {pendingFiles.length}/{MAX_FILES_PER_MESSAGE} 个附件</span>
                <span className="chat-pending-limit">单个不超过 10MB</span>
              </div>
              <div className="chat-pending-grid">
                {pendingFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="chat-pending-card"
                    title={file.name}
                  >
                    <div className="chat-pending-icon">
                      {file.type.startsWith("image/")
                        ? <FileImage className="h-4 w-4" />
                        : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="chat-pending-meta">
                      <span className="chat-pending-name">{file.name}</span>
                      <span className="chat-pending-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="chat-pending-remove"
                      disabled={isSending}
                      onClick={(event) => {
                        event.stopPropagation();
                        removePendingFile(idx);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="chat-composer-main">
            <div className={`chat-composer-input-shell${isComposerMultiline ? " is-multiline" : ""}`}>
              <button
                type="button"
                className="chat-composer-attach"
                onClick={() => fileInputRef.current?.click()}
                title="添加附件"
                disabled={isSending}
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              <textarea
                ref={textareaRef}
                className="chat-composer-input"
                value={inputValue}
                onChange={handleTextareaInput}
                onKeyDown={handleTextareaKeyDown}
                placeholder={`给 ${deviceName} 上的 Sootie 发送指令...`}
                rows={1}
                disabled={isSending}
              />
              <button
                type="button"
                className="chat-composer-send"
                onClick={() => void submitMessage()}
                disabled={isSending || (!inputValue.trim() && pendingFiles.length === 0)}
                title={isSending ? "发送中" : "发送"}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
