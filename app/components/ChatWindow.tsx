"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chats, setChats, activeChat, setActiveChat, user }: any)
 {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChat]);

  // Clear attachments when switching chats
  useEffect(() => {
    setAttachments([]);
    setInput("");
  }, [activeChat]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - attachments.length);
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return "IMG";
    if (file.type === "application/pdf") return "PDF";
    if (file.type.includes("word")) return "DOC";
    if (file.type.includes("excel") || file.type.includes("sheet"))
      return "XLS";
    if (file.type.includes("text")) return "TXT";
    return "FILE";
  };

  const getFileColor = (file: File) => {
    if (file.type.startsWith("image/")) return "#0091DA";
    if (file.type === "application/pdf") return "#e53e3e";
    if (file.type.includes("word")) return "#3b82f6";
    if (file.type.includes("excel") || file.type.includes("sheet"))
      return "#00B2A9";
    return "rgba(255,255,255,0.4)";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          title: `Session ${chats.length + 1}`,
          messages: [],
        }),
      });
      const newChat = await res.json();
      setChats([newChat, ...chats]);
      setActiveChat(0);
      setInput("");
      setAttachments([]);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const sendMessage = () => {
    if ((!input.trim() && attachments.length === 0) || sending) return;
    setSending(true);

    const updatedChats = [...chats];
    const now = new Date().toISOString();

    // Auto-title the chat from the first user message
    if (updatedChats[activeChat].messages.length === 0 && input.trim()) {
      updatedChats[activeChat].title =
        input.trim().slice(0, 36) + (input.trim().length > 36 ? "…" : "");
    }

    updatedChats[activeChat].messages.push({
      text: input,
      sender: "user",
      timestamp: now,
      attachments: attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        icon: getFileIcon(f),
        color: getFileColor(f),
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      })),
    });

  
    updatedChats[activeChat].updatedAt = now;
    setChats([...updatedChats]);
    const chat = updatedChats[activeChat];
    if (chat._id) {
      fetch(`/api/chats/${chat._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chat.messages, title: chat.title }),
      }).catch(console.error);
    }

    setInput("");
    setAttachments([]);
    setTimeout(() => setSending(false), 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const messages = chats[activeChat]?.messages ?? [];
  const chatTitle = chats[activeChat]?.title ?? "Chat";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .cw-root {
          display:flex;flex-direction:column;flex:1;height:100%;
          position:relative;background:#00040f;overflow:hidden;
          font-family:'DM Sans',sans-serif;
        }
        .cw-grid { position:absolute;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,91,184,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,91,184,0.07) 1px,transparent 1px);background-size:48px 48px; }
        .cw-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0; }
        .cw-orb-1 { width:400px;height:400px;background:radial-gradient(circle,rgba(0,51,141,0.35) 0%,transparent 70%);top:-100px;right:-100px; }
        .cw-orb-2 { width:300px;height:300px;background:radial-gradient(circle,rgba(0,178,169,0.15) 0%,transparent 70%);bottom:60px;left:-80px; }
        .cw-scanlines { position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px); }

        /* header */
        .cw-header { position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:rgba(0,4,20,0.9);border-bottom:1px solid rgba(0,145,218,0.15);backdrop-filter:blur(20px);flex-shrink:0; }
        .cw-header-left { display:flex;align-items:center;gap:12px; }
        .cw-avatar { width:34px;height:34px;background:linear-gradient(135deg,#00338D,#0091DA);border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:12px;color:#fff;letter-spacing:1px;box-shadow:0 0 16px rgba(0,91,184,0.5);flex-shrink:0; }
        .cw-chat-name { font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#fff;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        .cw-chat-sub { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-top:1px; }

        .cw-header-right { display:flex;align-items:center;gap:8px; }

        /* new chat button in header */
        .cw-new-btn {
          display:flex;align-items:center;gap:6px;
          padding:6px 12px;border-radius:3px;border:1px solid rgba(0,145,218,0.22);
          background:rgba(0,51,141,0.15);cursor:pointer;
          font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;
          color:rgba(0,145,218,0.7);transition:background .18s,border-color .18s,color .18s,box-shadow .18s,transform .15s;
        }
        .cw-new-btn:hover { background:rgba(0,51,141,0.3);border-color:rgba(0,145,218,0.45);color:#fff;box-shadow:0 0 14px rgba(0,145,218,0.12);transform:translateY(-1px); }

        .cw-status-pill { display:flex;align-items:center;gap:6px;background:rgba(0,178,169,0.1);border:1px solid rgba(0,178,169,0.25);border-radius:2px;padding:4px 10px; }
        .cw-status-dot { width:5px;height:5px;border-radius:50%;background:#00B2A9;box-shadow:0 0 8px #00B2A9;animation:cwBlink 2s ease-in-out infinite; }
        @keyframes cwBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .cw-status-text { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#00B2A9; }
        .cw-msg-count { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.2); }

        /* messages */
        .cw-messages { position:relative;z-index:5;flex:1;overflow-y:auto;padding:24px 24px;display:flex;flex-direction:column;gap:4px;scroll-behavior:smooth; }
        .cw-messages::-webkit-scrollbar { width:4px; }
        .cw-messages::-webkit-scrollbar-track { background:transparent; }
        .cw-messages::-webkit-scrollbar-thumb { background:rgba(0,145,218,0.25);border-radius:2px; }

        /* empty state */
        .cw-empty { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;opacity:.45;pointer-events:none;padding-bottom:60px; }
        .cw-empty-icon { width:60px;height:60px;border:1px solid rgba(0,145,218,0.25);border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:20px;color:rgba(0,145,218,0.5);letter-spacing:1px; }
        .cw-empty-title { font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:rgba(255,255,255,0.4); }
        .cw-empty-text { font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.2); }

        .cw-date-divider { display:flex;align-items:center;gap:12px;margin:16px 0 8px; }
        .cw-date-line { flex:1;height:1px;background:linear-gradient(to right,transparent,rgba(0,145,218,0.2),transparent); }
        .cw-date-label { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.2); }

        /* attachment previews in messages */
        .msg-attachments { display:flex;flex-wrap:wrap;gap:8px;margin-top:8px; }
        .msg-attach-item { position:relative;border-radius:3px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);transition:border-color .18s;cursor:default; }
        .msg-attach-item:hover { border-color:rgba(0,145,218,0.3); }
        .msg-attach-img { width:120px;height:80px;object-fit:cover;display:block;border-radius:2px; }
        .msg-attach-img-overlay { position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,0.7),transparent);padding:4px 6px;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        .msg-attach-file { display:flex;align-items:center;gap:8px;padding:8px 12px;min-width:160px;max-width:220px; }
        .msg-attach-icon { width:28px;height:28px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:9px;letter-spacing:.5px;color:#fff;flex-shrink:0; }
        .msg-attach-info { flex:1;min-width:0; }
        .msg-attach-name { font-size:11px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        .msg-attach-size { font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.3);margin-top:1px; }

        /* input area */
        .cw-input-area { position:relative;z-index:10;padding:12px 20px 14px;background:rgba(0,4,20,0.95);border-top:1px solid rgba(0,145,218,0.12);backdrop-filter:blur(20px);flex-shrink:0; }

        .cw-attach-staging { display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;margin-bottom:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(0,145,218,0.15);border-radius:3px;animation:stageIn .2s ease both; }
        @keyframes stageIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

        .cw-stage-item { position:relative;display:flex;align-items:center;gap:7px;background:rgba(0,51,141,0.2);border:1px solid rgba(0,145,218,0.2);border-radius:3px;padding:5px 28px 5px 8px;max-width:180px;transition:border-color .15s; }
        .cw-stage-item:hover { border-color:rgba(0,145,218,0.4); }
        .cw-stage-thumb { width:24px;height:24px;border-radius:2px;object-fit:cover;flex-shrink:0; }
        .cw-stage-icon { width:24px;height:24px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:8px;letter-spacing:.5px;color:#fff;flex-shrink:0; }
        .cw-stage-name { font-size:11px;color:rgba(255,255,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px; }
        .cw-stage-size { font-size:8px;letter-spacing:1px;color:rgba(255,255,255,0.25); }
        .cw-stage-remove { position:absolute;top:50%;right:6px;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,0.25);display:flex;align-items:center;padding:2px;transition:color .15s;line-height:1; }
        .cw-stage-remove:hover { color:rgba(220,50,50,0.8); }

        .cw-input-row { display:flex;align-items:flex-end;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(0,145,218,0.2);border-radius:4px;padding:10px 10px 10px 14px;transition:border-color .2s,box-shadow .2s; }
        .cw-input-row:focus-within { border-color:rgba(0,145,218,0.45);box-shadow:0 0 24px rgba(0,145,218,0.1),inset 0 0 20px rgba(0,145,218,0.03); }

        .cw-textarea { flex:1;background:transparent;border:none;outline:none;resize:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:300;color:#fff;line-height:1.5;caret-color:#0091DA;max-height:120px;min-height:24px;overflow-y:auto; }
        .cw-textarea::placeholder { color:rgba(255,255,255,0.2); }
        .cw-textarea::-webkit-scrollbar { width:3px; }
        .cw-textarea::-webkit-scrollbar-thumb { background:rgba(0,145,218,0.2); }

        .cw-upload-btn { flex-shrink:0;width:38px;height:38px;border-radius:3px;border:1px solid rgba(0,145,218,0.2);background:rgba(0,51,141,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s,border-color .18s,box-shadow .18s,transform .15s;color:rgba(0,145,218,0.6);position:relative; }
        .cw-upload-btn:hover { background:rgba(0,51,141,0.3);border-color:rgba(0,145,218,0.45);box-shadow:0 0 16px rgba(0,145,218,0.15);transform:translateY(-1px);color:rgba(0,145,218,0.9); }
        .cw-upload-btn.has-files { border-color:rgba(0,178,169,0.4);background:rgba(0,178,169,0.1);color:#00B2A9; }
        .cw-upload-count { position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#00338D;border:1px solid rgba(0,145,218,0.5);font-size:9px;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600; }

        .cw-send-btn { flex-shrink:0;width:38px;height:38px;border-radius:3px;border:none;cursor:pointer;background:#00338D;display:flex;align-items:center;justify-content:center;transition:background .2s,box-shadow .2s,transform .15s;box-shadow:0 0 18px rgba(0,51,141,0.4);position:relative;overflow:hidden; }
        .cw-send-btn:not(:disabled):hover { background:#005EB8;box-shadow:0 0 28px rgba(0,145,218,0.5);transform:translateY(-1px); }
        .cw-send-btn:disabled { opacity:.35;cursor:not-allowed; }
        .cw-send-btn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%); }
        .send-arrow { width:15px;height:15px;position:relative;z-index:1; }
        .cw-send-btn.sending::after { content:'';position:absolute;inset:-4px;border-radius:5px;border:1px solid rgba(0,145,218,0.6);animation:sendPulse .6s ease-out forwards; }
        @keyframes sendPulse { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.5)} }

        .cw-input-hint { display:flex;align-items:center;justify-content:space-between;margin-top:7px;padding:0 2px; }
        .cw-hint-text  { font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.12); }
        .cw-char-count { font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.1); }
      `}</style>

      <div
        className="cw-root"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="cw-grid" />
        <div className="cw-orb cw-orb-1" />
        <div className="cw-orb cw-orb-2" />
        <div className="cw-scanlines" />

        {/* Header */}
        <div className="cw-header">
          <div className="cw-header-left">
            <div className="cw-avatar">AI</div>
            <div>
              <div className="cw-chat-name">{chatTitle}</div>
              <div className="cw-chat-sub">KPMG Internal Assistant</div>
            </div>
          </div>
          <div className="cw-header-right">
            <span className="cw-msg-count">
              {messages.length} MSG{messages.length !== 1 ? "S" : ""}
            </span>

            {/* ── New Chat button ── */}
            <button className="cw-new-btn" onClick={handleNewChat}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1v8M1 5h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              New Chat
            </button>

            <div className="cw-status-pill">
              <div className="cw-status-dot" />
              <span className="cw-status-text">Live</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="cw-messages">
          {messages.length === 0 ? (
            <div className="cw-empty">
              <div className="cw-empty-icon">AI</div>
              <div className="cw-empty-title">New Session</div>
              <div className="cw-empty-text">
                Type a message or attach a file to begin
              </div>
            </div>
          ) : (
            <>
              <div className="cw-date-divider">
                <div className="cw-date-line" />
                <span className="cw-date-label">Today · {chatTitle}</span>
                <div className="cw-date-line" />
              </div>
              {messages.map((msg: any, i: number) => (
                <div key={i}>
                  <MessageBubble message={msg} />
                  {msg.attachments?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          msg.sender === "user" ? "flex-end" : "flex-start",
                        paddingLeft: msg.sender === "user" ? 0 : "36px",
                        paddingRight: msg.sender === "user" ? "36px" : 0,
                        marginTop: "-4px",
                        marginBottom: "8px",
                      }}
                    >
                      <div className="msg-attachments">
                        {msg.attachments.map((att: any, ai: number) =>
                          att.preview ? (
                            <div key={ai} className="msg-attach-item">
                              <img
                                src={att.preview}
                                alt={att.name}
                                className="msg-attach-img"
                              />
                              <div className="msg-attach-img-overlay">
                                {att.name}
                              </div>
                            </div>
                          ) : (
                            <div key={ai} className="msg-attach-item">
                              <div className="msg-attach-file">
                                <div
                                  className="msg-attach-icon"
                                  style={{
                                    background: att.color + "33",
                                    border: `1px solid ${att.color}55`,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: att.color,
                                      fontSize: "9px",
                                    }}
                                  >
                                    {att.icon}
                                  </span>
                                </div>
                                <div className="msg-attach-info">
                                  <div className="msg-attach-name">
                                    {att.name}
                                  </div>
                                  <div className="msg-attach-size">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cw-input-area">
          {attachments.length > 0 && (
            <div className="cw-attach-staging">
              {attachments.map((file, i) => (
                <div key={i} className="cw-stage-item">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="cw-stage-thumb"
                    />
                  ) : (
                    <div
                      className="cw-stage-icon"
                      style={{ background: getFileColor(file) + "33" }}
                    >
                      <span style={{ color: getFileColor(file) }}>
                        {getFileIcon(file)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="cw-stage-name">{file.name}</div>
                    <div className="cw-stage-size">{formatSize(file.size)}</div>
                  </div>
                  <button
                    className="cw-stage-remove"
                    onClick={() => removeAttachment(i)}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1 1l8 8M9 1L1 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cw-input-row">
            <button
              className={`cw-upload-btn${attachments.length > 0 ? " has-files" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 9.5v2a2 2 0 01-2 2h-7a2 2 0 01-2-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M8 1v8M5.5 3.5L8 1l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {attachments.length > 0 && (
                <span className="cw-upload-count">{attachments.length}</span>
              )}
            </button>

            <textarea
              ref={textareaRef}
              className="cw-textarea"
              rows={1}
              placeholder={
                attachments.length > 0
                  ? "Add a message… (Enter to send)"
                  : "Type a message… (Enter to send)"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />

            <button
              className={`cw-send-btn${sending ? " sending" : ""}`}
              onClick={sendMessage}
              disabled={(!input.trim() && attachments.length === 0) || sending}
              aria-label="Send message"
            >
              <svg className="send-arrow" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8h12M9 3l5 5-5 5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="cw-input-hint">
            <span className="cw-hint-text">
              {attachments.length > 0
                ? `${attachments.length} file${attachments.length !== 1 ? "s" : ""} attached · Drag & drop supported`
                : "Shift+Enter for new line · Drag & drop files"}
            </span>
            <span className="cw-char-count">{input.length} / 2000</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </>
  );
}
