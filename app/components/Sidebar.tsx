"use client";

import { useState } from "react";

export default function Sidebar({ chats, selectChat, activeChat }: any) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .sb-root {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: rgba(0, 3, 14, 0.97);
          border-right: 1px solid rgba(0,145,218,0.12);
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
          transition: width 0.32s cubic-bezier(0.16,1,0.3,1);
        }
        .sb-root.open   { width: 260px; }
        .sb-root.closed { width: 56px;  }

        .sb-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,91,184,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,91,184,0.07) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
          z-index: 0;
        }
        .sb-orb {
          position: absolute;
          width: 280px; height: 280px;
          border-radius: 50%;
          filter: blur(80px);
          background: radial-gradient(circle, rgba(0,51,141,0.3) 0%, transparent 70%);
          top: -80px; right: -100px;
          pointer-events: none;
          z-index: 0;
        }
        .sb-scanlines {
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

        /* ── toggle button ── */
        .sb-toggle {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0;
          height: 56px;
          border: none;
          background: transparent;
          border-bottom: 1px solid rgba(0,145,218,0.12);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.18s ease;
          gap: 10px;
          overflow: hidden;
        }
        .sb-toggle:hover { background: rgba(0,145,218,0.05); }

        .sb-logo-box {
          width: 32px; height: 32px;
          background: #00338D;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 11px;
          color: #fff;
          letter-spacing: 1px;
          box-shadow: 0 0 14px rgba(0,51,141,0.6);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          transition: box-shadow 0.2s ease;
        }
        .sb-toggle:hover .sb-logo-box {
          box-shadow: 0 0 22px rgba(0,145,218,0.5);
        }
        .sb-logo-box::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }

        .sb-logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 2px;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          transition: max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.22s ease;
        }
        .sb-logo-text span { color: #0091DA; }
        .sb-root.open  .sb-logo-text { max-width: 120px; opacity: 1; }
        .sb-root.closed .sb-logo-text { max-width: 0; opacity: 0; }

        /* chevron icon */
        .sb-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0,145,218,0.5);
          transition: transform 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease, max-width 0.32s ease;
          overflow: hidden;
        }
        .sb-root.open   .sb-chevron { max-width: 24px; opacity: 1; transform: rotate(0deg); }
        .sb-root.closed .sb-chevron { max-width: 0;    opacity: 0; transform: rotate(180deg); }

        .sb-chevron-mini {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          color: rgba(0,145,218,0.4);
          transition: opacity 0.2s ease;
        }
        .sb-root.open   .sb-chevron-mini { opacity: 0; }
        .sb-root.closed .sb-chevron-mini { opacity: 1; }

        /* ── section label + title ── */
        .sb-header-info {
          position: relative;
          z-index: 5;
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(0,145,218,0.1);
          overflow: hidden;
          transition: max-height 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.22s ease, padding 0.32s ease;
          flex-shrink: 0;
        }
        .sb-root.open   .sb-header-info { max-height: 120px; opacity: 1; padding: 14px 16px 12px; }
        .sb-root.closed .sb-header-info { max-height: 0; opacity: 0; padding: 0 16px; border-bottom: none; }

        .sb-section-label {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 4px;
        }
        .sb-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 2px;
          color: #fff;
          line-height: 1;
        }
        .sb-title em {
          font-style: normal;
          background: linear-gradient(90deg, #0091DA, #00B2A9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sb-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        .sb-count-num {
          background: rgba(0,145,218,0.12);
          border: 1px solid rgba(0,145,218,0.25);
          border-radius: 2px;
          padding: 2px 8px;
          font-size: 10px;
          letter-spacing: 1px;
          color: #0091DA;
          font-weight: 500;
        }
        .sb-count-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* collapsed count badge */
        .sb-mini-count {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0,145,218,0.1);
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        .sb-root.open   .sb-mini-count { opacity: 0; pointer-events: none; max-height: 0; padding: 0; border: none; overflow: hidden; }
        .sb-root.closed .sb-mini-count { opacity: 1; max-height: 48px; }

        .sb-mini-badge {
          background: rgba(0,145,218,0.12);
          border: 1px solid rgba(0,145,218,0.25);
          border-radius: 2px;
          padding: 2px 6px;
          font-size: 10px;
          letter-spacing: 1px;
          color: #0091DA;
          font-weight: 500;
        }

        /* ── scroll area ── */
        .sb-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 12px 8px;
          position: relative;
          z-index: 5;
        }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,145,218,0.2);
          border-radius: 2px;
        }

        .sb-group-label {
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          padding: 0 8px;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.22s ease;
        }
        .sb-root.closed .sb-group-label { opacity: 0; }

        /* ── chat item ── */
        .sb-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-radius: 3px;
          cursor: pointer;
          margin-bottom: 4px;
          border: 1px solid transparent;
          overflow: hidden;
          background: transparent;
          transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .sb-item:hover {
          background: rgba(0,145,218,0.07);
          border-color: rgba(0,145,218,0.15);
        }
        .sb-item.active {
          background: rgba(0,51,141,0.25);
          border-color: rgba(0,145,218,0.3);
          box-shadow: 0 0 20px rgba(0,51,141,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          background: linear-gradient(to bottom, #0091DA, #00B2A9);
          border-radius: 0 2px 2px 0;
        }
        .sb-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,145,218,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .sb-item:hover::after { opacity: 1; }

        .sb-item-icon {
          width: 30px; height: 30px;
          border-radius: 2px;
          background: rgba(0,51,141,0.3);
          border: 1px solid rgba(0,91,184,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 10px;
          color: rgba(0,145,218,0.7);
          letter-spacing: 0.5px;
          transition: background 0.18s ease;
        }
        .sb-item.active .sb-item-icon {
          background: rgba(0,91,184,0.4);
          border-color: rgba(0,145,218,0.4);
          color: #0091DA;
          box-shadow: 0 0 10px rgba(0,91,184,0.3);
        }

        /* item text — fades + slides out when closed */
        .sb-item-body {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          transition: max-width 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.22s ease;
        }
        .sb-root.open   .sb-item-body { max-width: 200px; opacity: 1; }
        .sb-root.closed .sb-item-body { max-width: 0; opacity: 0; }

        .sb-item-title {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.18s ease;
        }
        .sb-item.active .sb-item-title { color: #fff; }
        .sb-item:hover  .sb-item-title { color: rgba(255,255,255,0.85); }

        .sb-item-meta {
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.2);
          margin-top: 2px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .sb-item.active .sb-item-meta { color: rgba(0,178,169,0.6); }

        .sb-item-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00B2A9;
          box-shadow: 0 0 6px #00B2A9;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.18s ease, max-width 0.32s ease;
        }
        .sb-item.active .sb-item-dot { opacity: 1; }
        .sb-root.closed .sb-item-dot { max-width: 0; overflow: hidden; }

        /* tooltip on collapsed */
        .sb-item[data-tip] {
          position: relative;
        }
        .sb-root.closed .sb-item:hover::before {
          content: attr(data-tip);
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,3,16,0.97);
          border: 1px solid rgba(0,145,218,0.25);
          border-radius: 3px;
          padding: 5px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        /* override active::before on collapsed */
        .sb-root.closed .sb-item.active::before {
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          width: auto; height: auto;
          border-radius: 3px;
          background: rgba(0,3,16,0.97);
          border: 1px solid rgba(0,145,218,0.25);
          padding: 5px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          content: attr(data-tip);
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }

        .sb-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,145,218,0.18), transparent);
          margin: 8px 0;
        }

        /* ── footer ── */
        .sb-footer {
          position: relative;
          z-index: 5;
          padding: 12px 16px;
          border-top: 1px solid rgba(0,145,218,0.1);
          flex-shrink: 0;
          overflow: hidden;
        }
        .sb-footer-status {
          display: flex;
          align-items: center;
          gap: 7px;
          justify-content: center;
        }
        .sb-footer-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00B2A9;
          box-shadow: 0 0 7px #00B2A9;
          flex-shrink: 0;
          animation: sbBlink 2s ease-in-out infinite;
        }
        @keyframes sbBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        .sb-footer-text {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          white-space: nowrap;
          overflow: hidden;
          transition: max-width 0.32s ease, opacity 0.22s ease;
        }
        .sb-root.open   .sb-footer-text { max-width: 200px; opacity: 1; }
        .sb-root.closed .sb-footer-text { max-width: 0; opacity: 0; }
        .sb-footer-text strong { color: #00B2A9; font-weight: 400; }

        .sb-empty {
          padding: 20px 6px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          text-align: center;
          transition: opacity 0.22s ease;
        }
        .sb-root.closed .sb-empty { opacity: 0; }
      `}</style>

      <div className={`sb-root ${open ? "open" : "closed"}`}>
        <div className="sb-grid" />
        <div className="sb-orb" />
        <div className="sb-scanlines" />

        {/* Toggle button / logo */}
        <button className="sb-toggle" onClick={() => setOpen(!open)} aria-label="Toggle sidebar">
        
         
          {/* open chevron */}
          <div className="sb-chevron">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* collapsed chevron */}
          <div className="sb-chevron-mini">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        {/* Expanded header info */}
        <div className="sb-header-info">
          <div className="sb-section-label">Navigation</div>
          <div className="sb-title">Chat<br /><em>History</em></div>
          <div className="sb-count">
            <span className="sb-count-num">{chats.length}</span>
            <span className="sb-count-label">Session{chats.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Collapsed count badge */}
        <div className="sb-mini-count">
          <span className="sb-mini-badge">{chats.length}</span>
        </div>

        {/* Chat list */}
        <div className="sb-scroll">
          <div className="sb-group-label">Recent</div>

          {chats.length === 0 && (
            <div className="sb-empty">—</div>
          )}

          {chats.map((chat: any, index: number) => (
            <div
              key={index}
              data-tip={chat.title ?? `Session ${index + 1}`}
              className={`sb-item${activeChat === index ? " active" : ""}`}
              onClick={() => selectChat(index)}
            >
              <div className="sb-item-icon">
                #{String(index + 1).padStart(2, "0")}
              </div>
              <div className="sb-item-body">
                <div className="sb-item-title">{chat.title ?? `Session ${index + 1}`}</div>
                <div className="sb-item-meta">
                  {chat.messages?.length ?? 0} msg{(chat.messages?.length ?? 0) !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="sb-item-dot" />
            </div>
          ))}

          {chats.length > 0 && <div className="sb-divider" />}
        </div>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-footer-status">
            <div className="sb-footer-dot" />
            <div className="sb-footer-text">
              AI <strong>online</strong> · Secure
            </div>
          </div>
        </div>
      </div>
    </>
  );
}