"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chats, setChats, activeChat }: any) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChat]);

  const sendMessage = () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const updatedChats = [...chats];
    updatedChats[activeChat].messages.push({ text: input, sender: "user" });
    setChats(updatedChats);
    setInput("");

    setTimeout(() => setSending(false), 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messages = chats[activeChat]?.messages ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .cw-root {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
          position: relative;
          background: #00040f;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── subtle bg grid ── */
        .cw-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,91,184,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,91,184,0.07) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── ambient orbs ── */
        .cw-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .cw-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,51,141,0.35) 0%, transparent 70%);
          top: -100px; right: -100px;
        }
        .cw-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,178,169,0.15) 0%, transparent 70%);
          bottom: 60px; left: -80px;
        }

        /* ── header ── */
        .cw-header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(0, 4, 20, 0.9);
          border-bottom: 1px solid rgba(0,145,218,0.15);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .cw-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cw-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #00338D, #0091DA);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 13px;
          color: #fff;
          letter-spacing: 1px;
          box-shadow: 0 0 16px rgba(0,91,184,0.5);
          flex-shrink: 0;
        }
        .cw-chat-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 2px;
          color: #fff;
        }
        .cw-chat-sub {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 1px;
        }
        .cw-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cw-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,178,169,0.1);
          border: 1px solid rgba(0,178,169,0.25);
          border-radius: 2px;
          padding: 4px 10px;
        }
        .cw-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00B2A9;
          box-shadow: 0 0 8px #00B2A9;
          animation: cwBlink 2s ease-in-out infinite;
        }
        @keyframes cwBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .cw-status-text {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #00B2A9;
        }
        .cw-msg-count {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* ── messages area ── */
        .cw-messages {
          position: relative;
          z-index: 5;
          flex: 1;
          overflow-y: auto;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          scroll-behavior: smooth;
        }
        .cw-messages::-webkit-scrollbar { width: 4px; }
        .cw-messages::-webkit-scrollbar-track { background: transparent; }
        .cw-messages::-webkit-scrollbar-thumb {
          background: rgba(0,145,218,0.25);
          border-radius: 2px;
        }

        /* ── empty state ── */
        .cw-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          opacity: 0.4;
          pointer-events: none;
          padding-bottom: 60px;
        }
        .cw-empty-icon {
          width: 56px; height: 56px;
          border: 1px solid rgba(0,145,218,0.3);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          color: rgba(0,145,218,0.5);
          letter-spacing: 1px;
        }
        .cw-empty-text {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        /* ── date divider ── */
        .cw-date-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0 8px;
        }
        .cw-date-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,145,218,0.2), transparent);
        }
        .cw-date-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* ── input area ── */
        .cw-input-area {
          position: relative;
          z-index: 10;
          padding: 16px 20px;
          background: rgba(0, 4, 20, 0.95);
          border-top: 1px solid rgba(0,145,218,0.12);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .cw-input-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,145,218,0.2);
          border-radius: 4px;
          padding: 10px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .cw-input-row:focus-within {
          border-color: rgba(0,145,218,0.45);
          box-shadow: 0 0 24px rgba(0,145,218,0.1), inset 0 0 20px rgba(0,145,218,0.03);
        }

        .cw-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #fff;
          line-height: 1.5;
          caret-color: #0091DA;
          max-height: 120px;
          min-height: 24px;
          overflow-y: auto;
        }
        .cw-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .cw-textarea::-webkit-scrollbar { width: 3px; }
        .cw-textarea::-webkit-scrollbar-thumb { background: rgba(0,145,218,0.2); }

        .cw-send-btn {
          flex-shrink: 0;
          width: 40px; height: 40px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          background: #00338D;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
          box-shadow: 0 0 18px rgba(0,51,141,0.4);
          position: relative;
          overflow: hidden;
        }
        .cw-send-btn:not(:disabled):hover {
          background: #005EB8;
          box-shadow: 0 0 28px rgba(0,145,218,0.5);
          transform: translateY(-1px);
        }
        .cw-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .cw-send-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }

        /* send icon arrow */
        .send-arrow {
          width: 16px; height: 16px;
          position: relative;
          z-index: 1;
        }

        /* sending pulse ring */
        .cw-send-btn.sending::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 5px;
          border: 1px solid rgba(0,145,218,0.6);
          animation: sendPulse 0.6s ease-out forwards;
        }
        @keyframes sendPulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }

        .cw-input-hint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 0 2px;
        }
        .cw-hint-text {
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
        }
        .cw-char-count {
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.12);
        }

        /* ── scanline overlay ── */
        .cw-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 3px,
            rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div className="cw-root">
        <div className="cw-grid" />
        <div className="cw-orb cw-orb-1" />
        <div className="cw-orb cw-orb-2" />
        <div className="cw-scanlines" />

        {/* Header */}
        <div className="cw-header">
          <div className="cw-header-left">
            <div className="cw-avatar">AI</div>
            <div>
              <div className="cw-chat-name">
                {chats[activeChat]?.name ?? "Chat"}
              </div>
              <div className="cw-chat-sub">KPMG Internal Assistant</div>
            </div>
          </div>
          <div className="cw-header-right">
            <span className="cw-msg-count">
              {messages.length} MSG{messages.length !== 1 ? "S" : ""}
            </span>
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
              <div className="cw-empty-text">No messages yet — start the conversation</div>
            </div>
          ) : (
            <>
              <div className="cw-date-divider">
                <div className="cw-date-line" />
                <span className="cw-date-label">Today</span>
                <div className="cw-date-line" />
              </div>
              {messages.map((msg: any, i: number) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cw-input-area">
          <div className="cw-input-row">
            <textarea
              ref={textareaRef}
              className="cw-textarea"
              rows={1}
              placeholder="Type a message… (Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className={`cw-send-btn${sending ? " sending" : ""}`}
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              aria-label="Send message"
            >
              {/* Arrow SVG */}
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
            <span className="cw-hint-text">Shift+Enter for new line</span>
            <span className="cw-char-count">{input.length} / 2000</span>
          </div>
        </div>
      </div>
    </>
  );
}