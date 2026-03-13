"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ chats, setChats, activeChat, setActiveChat, user }: any) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats?.[activeChat] ?? null;
  const messages = currentChat?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const getFileIcon = (file: File) => {
    const t = file.type;
    if (t.startsWith("image/")) return "🖼️";
    if (t === "application/pdf") return "📄";
    if (t.includes("word")) return "📝";
    if (t.includes("sheet") || t.includes("excel")) return "📊";
    if (t.includes("presentation") || t.includes("powerpoint")) return "📋";
    if (t.startsWith("video/")) return "🎬";
    if (t.startsWith("audio/")) return "🎵";
    if (t.includes("zip") || t.includes("rar")) return "🗜️";
    return "📎";
  };

  const getFileColor = (file: File) => {
    const t = file.type;
    if (t.startsWith("image/")) return "#0091DA";
    if (t === "application/pdf") return "#E53E3E";
    if (t.includes("word")) return "#2B579A";
    if (t.includes("sheet") || t.includes("excel")) return "#217346";
    if (t.includes("presentation") || t.includes("powerpoint")) return "#D24726";
    return "#6B7280";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const saveFileToDb = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?._id,
              username: user?.username || user?.displayName,
              name: file.name,
              type: file.type,
              size: file.size,
              base64,
            }),
          });
          resolve(base64);
        } catch {
          resolve(URL.createObjectURL(file));
        }
      };
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          title: "New Session",
          messages: [],
        }),
      });
      const newChat = await res.json();
      setChats([newChat]);
      setActiveChat(0);
      setInput("");
      setAttachments([]);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!currentChat) return;

    const now = new Date().toISOString();

    const processedAttachments = await Promise.all(
      attachments.map(async (f) => {
        const base64 = await saveFileToDb(f);
        return {
          name: f.name,
          size: f.size,
          type: f.type,
          icon: getFileIcon(f),
          color: getFileColor(f),
          preview: f.type.startsWith("image/") ? base64 : null,
        };
      })
    );

    const userMsg = {
      sender: "user",
      text: input.trim(),
      attachments: processedAttachments,
      timestamp: now,
    };

    const messagesWithUser = [...messages, userMsg];
    const chatsWithUser = chats.map((c: any, i: number) =>
      i === activeChat ? { ...c, messages: messagesWithUser, updatedAt: now } : c
    );

    setChats(chatsWithUser);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    // ─────────────────────────────────────────────────────────────────────────
    // REPLACE THIS BLOCK with your real backend fetch call.
    // Example:
    //   const res = await fetch("/api/ai", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ message: userMsg.text, chatId: currentChat._id }),
    //   });
    //   const data = await res.json();
    //   const botText = data.reply; // this will be the markdown string
    // ─────────────────────────────────────────────────────────────────────────
    await new Promise((res) => setTimeout(res, 1500));

    const botText =
      processedAttachments.length > 0
        ? `I received **${processedAttachments.length} file${processedAttachments.length > 1 ? "s" : ""}**${userMsg.text ? ` and your message:\n\n> ${userMsg.text}` : ""}.\n\nHow can I help?`
        : "Got it! How can I help further?";
    const botMsg = {
      sender: "bot",
      text: botText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messagesWithUser, botMsg];
    const updatedChats = chatsWithUser.map((c: any, i: number) =>
      i === activeChat ? { ...c, messages: updatedMessages, updatedAt: now } : c
    );

    setIsLoading(false);
    setChats(updatedChats);

    const chat = updatedChats[activeChat];
    if (chat?._id) {
      fetch(`/api/chats/${chat._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, title: chat.title }),
      }).catch(console.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!currentChat) {
    return (
      <>
        <style>{cwStyles}</style>
        <div className="cw-root cw-no-session">
          <div className="cw-empty-state">
            <div className="cw-empty-icon">💬</div>
            <div className="cw-empty-label">No session selected</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cwStyles}</style>
      <div className="cw-root">

        {/* ── Header ── */}
        <div className="cw-header">
          <div className="cw-header-left">
            <div className="cw-header-dot" />
            <div>
              <div className="cw-header-title">{currentChat.title ?? "Session"}</div>
              <div className="cw-header-sub">
                {messages.length} message{messages.length !== 1 ? "s" : ""} · AI Assistant
              </div>
            </div>
          </div>
          <button className="cw-new-btn" onClick={handleNewChat}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Session
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="cw-messages">
          {messages.length === 0 && !isLoading && (
            <div className="cw-empty">
              <div className="cw-empty-icon">⚡</div>
              <div className="cw-empty-title">KPMG AI Assistant</div>
              <div className="cw-empty-sub">Ask me anything about audit, tax, or advisory.</div>
            </div>
          )}

          {messages.map((msg: any, idx: number) => (
            <div key={idx} className={`cw-msg-row ${msg.sender === "user" ? "user" : "bot"}`}>
              {msg.sender === "bot" && (
                <div className="cw-avatar bot-avatar">AI</div>
              )}

              <div className={`cw-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                {msg.attachments?.length > 0 && (
                  <div className="cw-attachments">
                    {msg.attachments.map((att: any, ai: number) => (
                      <div key={ai} className="cw-att-chip">
                        {att.preview ? (
                          <img src={att.preview} alt={att.name} className="cw-att-img" />
                        ) : (
                          <span style={{ fontSize: 18 }}>{att.icon}</span>
                        )}
                        <div className="cw-att-info">
                          <div className="cw-att-name">{att.name}</div>
                          <div className="cw-att-size">{formatSize(att.size)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Markdown for bot, plain text for user ── */}
                {msg.text && (
                  msg.sender === "bot"
                    ? (
                      <div className="cw-markdown">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )
                    : <p className="cw-bubble-text">{msg.text}</p>
                )}

                <div className="cw-bubble-time">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="cw-avatar user-avatar">
                  {(user?.displayName || user?.username || "U")[0].toUpperCase()}
                </div>
              )}
            </div>
          ))}

          
          {isLoading && (
            <div className="cw-msg-row bot">
              <div className="cw-avatar bot-avatar">AI</div>
              <div className="cw-bubble bot-bubble cw-skeleton-bubble">
                <div className="cw-skeleton-line" style={{ width: "88%" }} />
                <div className="cw-skeleton-line" style={{ width: "62%" }} />
                <div className="cw-skeleton-line" style={{ width: "76%" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        
        <div className="cw-input-area">
          {attachments.length > 0 && (
            <div className="cw-pending-files">
              {attachments.map((f, i) => (
                <div key={i} className="cw-pending-chip">
                  <span style={{ fontSize: 14 }}>{getFileIcon(f)}</span>
                  <span className="cw-pending-name">{f.name}</span>
                  <button className="cw-pending-remove" onClick={() => removeAttachment(i)}>×</button>
                </div>
              ))}
            </div>
          )}

          {showAdminPrompt && (
            <div className="cw-admin-prompt">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="7" stroke="rgba(229,62,62,0.8)" strokeWidth="1.4" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="rgba(229,62,62,0.8)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>Only admins can upload files.</span>
            </div>
          )}

          <div className="cw-input-row">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="cw-hidden"
              multiple
              accept="*/*"
            />

            <button
              className="cw-icon-btn"
              title={user?.role === "admin" ? "Attach file" : "Only admins can upload files"}
              onClick={() => {
                if (user?.role !== "admin") {
                  setShowAdminPrompt(true);
                  setTimeout(() => setShowAdminPrompt(false), 3000);
                  return;
                }
                fileInputRef.current?.click();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 10.5v2a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0014 12.5v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M8 1.5v8M5 4.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <input
              type="text"
              className="cw-input"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <button
              className={`cw-send-btn${(!input.trim() && attachments.length === 0) || isLoading ? " disabled" : ""}`}
              onClick={sendMessage}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13.5 7.5L2 1l2.5 6.5L2 14l11.5-6.5z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="cw-footer-note">
            KPMG Internal · AI Assistant · Responses may require verification
          </div>
        </div>
      </div>
    </>
  );
}


const cwStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .cw-root {
    flex: 1; display: flex; flex-direction: column; height: 100%;
    background: #00030E; font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
  }
  .cw-root::before {
    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,91,184,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,91,184,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .cw-no-session { align-items: center; justify-content: center; }
  .cw-empty-state { text-align: center; }
  .cw-empty-label { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-top: 8px; }

  /* Header */
  .cw-header {
    position: relative; z-index: 5; display: flex; align-items: center;
    justify-content: space-between; padding: 14px 24px;
    border-bottom: 1px solid rgba(0,145,218,0.1);
    background: rgba(0,3,14,0.8); backdrop-filter: blur(8px); flex-shrink: 0;
  }
  .cw-header-left { display: flex; align-items: center; gap: 12px; }
  .cw-header-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #00B2A9;
    box-shadow: 0 0 8px #00B2A9; animation: cwBlink 2s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes cwBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .cw-header-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 2px; color: #fff; }
  .cw-header-sub { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-top: 1px; }

  .cw-new-btn {
    display: flex; align-items: center; gap: 6px; padding: 6px 14px;
    border-radius: 2px; border: 1px solid rgba(0,145,218,0.25);
    background: rgba(0,51,141,0.12); cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 9px; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(0,145,218,0.7);
    transition: background .18s, border-color .18s, color .18s;
  }
  .cw-new-btn:hover { background: rgba(0,51,141,0.28); border-color: rgba(0,145,218,0.45); color: #fff; }

  /* Messages */
  .cw-messages {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 24px 28px; display: flex; flex-direction: column; gap: 16px;
    position: relative; z-index: 5;
  }
  .cw-messages::-webkit-scrollbar { width: 3px; }
  .cw-messages::-webkit-scrollbar-track { background: transparent; }
  .cw-messages::-webkit-scrollbar-thumb { background: rgba(0,145,218,0.2); border-radius: 2px; }

  .cw-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 60px 20px; }
  .cw-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }
  .cw-empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: rgba(255,255,255,0.3); }
  .cw-empty-sub { font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.18); margin-top: 6px; text-align: center; }

  /* Message rows */
  .cw-msg-row { display: flex; align-items: flex-end; gap: 10px; animation: cwIn .2s ease both; }
  .cw-msg-row.user { flex-direction: row-reverse; }
  @keyframes cwIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

  .cw-avatar {
    width: 30px; height: 30px; border-radius: 2px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500;
  }
  .bot-avatar { background: rgba(0,51,141,0.4); border: 1px solid rgba(0,145,218,0.3); color: #0091DA; font-family: 'Bebas Neue', sans-serif; font-size: 11px; letter-spacing: 0.5px; }
  .user-avatar { background: rgba(0,145,218,0.15); border: 1px solid rgba(0,145,218,0.3); color: #0091DA; }

  .cw-bubble { max-width: 65%; border-radius: 3px; padding: 10px 14px; }
  .bot-bubble { background: rgba(0,20,50,0.6); border: 1px solid rgba(0,145,218,0.15); border-bottom-left-radius: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
  .user-bubble { background: linear-gradient(135deg, rgba(0,51,141,0.5), rgba(0,91,184,0.35)); border: 1px solid rgba(0,145,218,0.25); border-bottom-right-radius: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }

  .cw-bubble-text { font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.85); margin: 0; white-space: pre-wrap; word-break: break-word; }
  .cw-bubble-time { font-size: 9px; color: rgba(255,255,255,0.2); margin-top: 5px; letter-spacing: 0.5px; }

  /* Attachments */
  .cw-attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .cw-att-chip { display: flex; align-items: center; gap: 8px; background: rgba(0,145,218,0.08); border: 1px solid rgba(0,145,218,0.18); border-radius: 3px; padding: 6px 10px; max-width: 220px; }
  .cw-att-img { width: 40px; height: 40px; object-fit: cover; border-radius: 2px; }
  .cw-att-info { min-width: 0; }
  .cw-att-name { font-size: 11px; color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
  .cw-att-size { font-size: 9px; color: rgba(255,255,255,0.3); margin-top: 2px; }

  /* ── Markdown styles ── */
  .cw-markdown { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); word-break: break-word; }
  .cw-markdown p { margin: 0 0 8px; }
  .cw-markdown p:last-child { margin-bottom: 0; }
  .cw-markdown strong { color: #fff; font-weight: 500; }
  .cw-markdown em { color: rgba(255,255,255,0.7); font-style: italic; }
  .cw-markdown h1, .cw-markdown h2, .cw-markdown h3 {
    font-family: 'Bebas Neue', sans-serif; letter-spacing: 1.5px;
    color: #fff; margin: 12px 0 6px; font-weight: 400;
  }
  .cw-markdown h1 { font-size: 20px; }
  .cw-markdown h2 { font-size: 16px; }
  .cw-markdown h3 { font-size: 13px; }
  .cw-markdown ul, .cw-markdown ol { margin: 6px 0 8px 18px; padding: 0; }
  .cw-markdown li { margin-bottom: 4px; color: rgba(255,255,255,0.8); }
  .cw-markdown ul li::marker { color: #0091DA; }
  .cw-markdown ol li::marker { color: #0091DA; font-size: 11px; }
  .cw-markdown code {
    background: rgba(0,145,218,0.12); border: 1px solid rgba(0,145,218,0.2);
    border-radius: 3px; padding: 1px 6px; font-size: 11px;
    font-family: 'Courier New', monospace; color: #5BC8F5;
  }
  .cw-markdown pre {
    background: rgba(0,0,0,0.4); border: 1px solid rgba(0,145,218,0.15);
    border-radius: 3px; padding: 10px 12px; overflow-x: auto; margin: 8px 0;
  }
  .cw-markdown pre code {
    background: none; border: none; padding: 0;
    font-size: 11px; color: rgba(255,255,255,0.75);
  }
  .cw-markdown blockquote {
    border-left: 2px solid rgba(0,145,218,0.4); margin: 8px 0;
    padding: 4px 0 4px 12px; color: rgba(255,255,255,0.5); font-style: italic;
  }
  .cw-markdown a { color: #0091DA; text-decoration: underline; }
  .cw-markdown a:hover { color: #5BC8F5; }
  .cw-markdown hr { border: none; border-top: 1px solid rgba(0,145,218,0.15); margin: 10px 0; }
  .cw-markdown table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0; }
  .cw-markdown th { background: rgba(0,51,141,0.3); color: rgba(255,255,255,0.7); padding: 6px 10px; text-align: left; font-weight: 500; border: 1px solid rgba(0,145,218,0.15); font-size: 11px; letter-spacing: 0.5px; }
  .cw-markdown td { padding: 6px 10px; border: 1px solid rgba(0,145,218,0.1); color: rgba(255,255,255,0.7); }
  .cw-markdown tr:nth-child(even) td { background: rgba(0,145,218,0.04); }

  /* ── Skeleton shimmer loading bubble ── */
  .cw-skeleton-bubble { width: 260px; padding: 14px 16px !important; }
  .cw-skeleton-line {
    height: 9px; border-radius: 2px; margin-bottom: 9px;
    background: linear-gradient(
      90deg,
      rgba(0,145,218,0.08) 0%,
      rgba(0,145,218,0.22) 40%,
      rgba(0,145,218,0.08) 80%
    );
    background-size: 300% 100%;
    animation: cwShimmer 1.6s ease-in-out infinite;
  }
  .cw-skeleton-line:last-child { margin-bottom: 0; }
  @keyframes cwShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Input area */
  .cw-input-area {
    position: relative; z-index: 5; padding: 12px 20px 16px;
    border-top: 1px solid rgba(0,145,218,0.1);
    background: rgba(0,3,14,0.9); backdrop-filter: blur(8px); flex-shrink: 0;
  }

  .cw-pending-files { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .cw-pending-chip { display: flex; align-items: center; gap: 6px; background: rgba(0,145,218,0.08); border: 1px solid rgba(0,145,218,0.2); border-radius: 3px; padding: 4px 8px; }
  .cw-pending-name { font-size: 11px; color: rgba(255,255,255,0.6); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cw-pending-remove { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 15px; line-height: 1; padding: 0 2px; transition: color .15s; }
  .cw-pending-remove:hover { color: rgba(229,62,62,0.8); }

  .cw-admin-prompt {
    display: flex; align-items: center; gap: 8px;
    background: rgba(229,62,62,0.08); border: 1px solid rgba(229,62,62,0.25);
    border-radius: 3px; padding: 7px 12px; margin-bottom: 8px;
    font-size: 11px; color: rgba(255,110,110,0.9); letter-spacing: 0.3px;
    animation: cwIn .2s ease both;
  }

  .cw-input-row {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(0,145,218,0.15);
    border-radius: 3px; padding: 6px 8px;
    transition: border-color .2s;
  }
  .cw-input-row:focus-within { border-color: rgba(0,145,218,0.35); background: rgba(0,145,218,0.03); }

  .cw-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border: none; background: transparent;
    color: rgba(0,145,218,0.4); cursor: pointer; border-radius: 2px; flex-shrink: 0;
    transition: background .15s, color .15s;
  }
  .cw-icon-btn:hover { background: rgba(0,145,218,0.08); color: rgba(0,145,218,0.8); }

  .cw-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: rgba(255,255,255,0.85); caret-color: #0091DA;
  }
  .cw-input::placeholder { color: rgba(255,255,255,0.2); }
  .cw-input:disabled { opacity: 0.4; cursor: not-allowed; }

  .cw-send-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border: none; border-radius: 2px;
    background: linear-gradient(135deg, #00338D, #0091DA);
    color: #fff; cursor: pointer; flex-shrink: 0;
    transition: opacity .2s, box-shadow .2s;
    box-shadow: 0 0 12px rgba(0,145,218,0.3);
  }
  .cw-send-btn:hover { box-shadow: 0 0 20px rgba(0,145,218,0.5); }
  .cw-send-btn.disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }

  .cw-footer-note {
    text-align: center; font-size: 9px; letter-spacing: 1.5px;
    text-transform: uppercase; color: rgba(255,255,255,0.1); margin-top: 8px;
  }

  .cw-hidden { display: none; }
`;