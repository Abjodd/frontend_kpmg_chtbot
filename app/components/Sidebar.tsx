"use client";

import { useState } from "react";

export default function Sidebar({ chats, setChats, selectChat, activeChat, user }: any) {
  const [open, setOpen] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [search, setSearch] = useState("");

  // ── Create new chat in MongoDB ──
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          title: 'New Session',
          messages: [],
        }),
      });
      const newChat = await res.json();
      setChats([newChat]);   // single session — replace all
      selectChat(0);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  // ── Delete ONE chat — since single session, create a fresh one after ──
  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === chatId) {
      try {
        // Delete old then immediately create a fresh session
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?._id, title: "New Session", messages: [] }),
        });
        const newChat = await res.json();
        setChats([newChat]);
        setConfirmDeleteId(null);
        selectChat(0);
      } catch (err) {
        console.error("Failed to delete chat:", err);
      }
    } else {
      setConfirmDeleteId(chatId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  // ── Clear ALL chats (double-click to confirm) ──
  const handleClearAll = async () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3000);
      return;
    }
    setConfirmClearAll(false);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id, title: "New Session", messages: [] }),
      });
      const newChat = await res.json();
      setChats([newChat]);
      selectChat(0);
    } catch (err) {
      console.error("Failed to clear chats:", err);
    }
  };

  const filtered = chats.filter((c: any) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .sb-root { height:100%;display:flex;flex-direction:column;background:rgba(0,3,14,0.97);border-right:1px solid rgba(0,145,218,0.12);position:relative;overflow:hidden;font-family:'DM Sans',sans-serif;flex-shrink:0;transition:width 0.32s cubic-bezier(0.16,1,0.3,1); }
        .sb-root.open{width:270px}.sb-root.closed{width:56px}
        .sb-grid{position:absolute;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,91,184,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,91,184,0.07) 1px,transparent 1px);background-size:36px 36px}
        .sb-orb{position:absolute;width:280px;height:280px;border-radius:50%;filter:blur(80px);background:radial-gradient(circle,rgba(0,51,141,0.3) 0%,transparent 70%);top:-80px;right:-100px;pointer-events:none;z-index:0}
        .sb-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px);pointer-events:none;z-index:1}
        .sb-toggle{position:relative;z-index:10;display:flex;align-items:center;justify-content:center;width:100%;padding:0;height:56px;border:none;background:transparent;border-bottom:1px solid rgba(0,145,218,0.12);cursor:pointer;flex-shrink:0;transition:background .18s;gap:10px;overflow:hidden}
        .sb-toggle:hover{background:rgba(0,145,218,0.05)}
        .sb-logo-box{width:32px;height:32px;background:#00338D;border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:11px;color:#fff;letter-spacing:1px;box-shadow:0 0 14px rgba(0,51,141,0.6);position:relative;overflow:hidden;flex-shrink:0;transition:box-shadow .2s}
        .sb-toggle:hover .sb-logo-box{box-shadow:0 0 22px rgba(0,145,218,0.5)}
        .sb-logo-box::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%)}
        .sb-logo-text{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:#fff;white-space:nowrap;overflow:hidden;transition:max-width .32s cubic-bezier(.16,1,.3,1),opacity .22s}
        .sb-logo-text span{color:#0091DA}
        .sb-root.open .sb-logo-text{max-width:120px;opacity:1}.sb-root.closed .sb-logo-text{max-width:0;opacity:0}
        .sb-chevron{display:flex;align-items:center;justify-content:center;color:rgba(0,145,218,0.5);transition:transform .32s cubic-bezier(.16,1,.3,1),opacity .2s,max-width .32s;overflow:hidden}
        .sb-root.open .sb-chevron{max-width:24px;opacity:1;transform:rotate(0deg)}.sb-root.closed .sb-chevron{max-width:0;opacity:0;transform:rotate(180deg)}
        .sb-chevron-mini{position:absolute;right:8px;display:flex;align-items:center;color:rgba(0,145,218,0.4);transition:opacity .2s}
        .sb-root.open .sb-chevron-mini{opacity:0}.sb-root.closed .sb-chevron-mini{opacity:1}
        .sb-header-info{position:relative;z-index:5;padding:14px 16px 12px;border-bottom:1px solid rgba(0,145,218,0.1);overflow:hidden;transition:max-height .32s cubic-bezier(.16,1,.3,1),opacity .22s,padding .32s;flex-shrink:0}
        .sb-root.open .sb-header-info{max-height:160px;opacity:1;padding:14px 16px 12px}.sb-root.closed .sb-header-info{max-height:0;opacity:0;padding:0 16px;border-bottom:none}
        .sb-section-label{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:4px}
        .sb-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#fff;line-height:1}
        .sb-title em{font-style:normal;background:linear-gradient(90deg,#0091DA,#00B2A9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sb-header-actions{display:flex;align-items:center;gap:6px;margin-top:10px}
        .sb-count-num{background:rgba(0,145,218,0.12);border:1px solid rgba(0,145,218,0.25);border-radius:2px;padding:2px 8px;font-size:10px;letter-spacing:1px;color:#0091DA;font-weight:500}
        .sb-new-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 10px;border-radius:2px;border:1px solid rgba(0,145,218,0.25);background:rgba(0,51,141,0.15);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(0,145,218,0.7);transition:background .18s,border-color .18s,color .18s,box-shadow .18s}
        .sb-new-btn:hover{background:rgba(0,51,141,0.3);border-color:rgba(0,145,218,0.45);color:#fff;box-shadow:0 0 14px rgba(0,145,218,0.15)}
        .sb-clear-btn{display:flex;align-items:center;justify-content:center;padding:5px 8px;border-radius:2px;border:1px solid rgba(229,62,62,0.15);background:transparent;cursor:pointer;color:rgba(229,62,62,0.35);transition:background .18s,border-color .18s,color .18s}
        .sb-clear-btn:hover{background:rgba(229,62,62,0.08);border-color:rgba(229,62,62,0.4);color:rgba(229,62,62,0.8)}
        .sb-clear-btn.armed{border-color:rgba(229,62,62,0.6)!important;color:rgba(229,62,62,0.9)!important;background:rgba(229,62,62,0.12)!important;animation:pulse .6s ease-in-out infinite}
        .sb-search-wrap{position:relative;z-index:5;padding:10px 12px;border-bottom:1px solid rgba(0,145,218,0.08);flex-shrink:0;overflow:hidden;transition:max-height .32s,opacity .22s,padding .32s}
        .sb-root.open .sb-search-wrap{max-height:60px;opacity:1}.sb-root.closed .sb-search-wrap{max-height:0;opacity:0;padding:0}
        .sb-search{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(0,145,218,0.15);border-radius:3px;padding:7px 10px 7px 30px;font-family:'DM Sans',sans-serif;font-size:12px;color:#fff;outline:none;caret-color:#0091DA;transition:border-color .2s,background .2s}
        .sb-search::placeholder{color:rgba(255,255,255,0.18)}.sb-search:focus{border-color:rgba(0,145,218,0.4);background:rgba(0,145,218,0.05)}
        .sb-search-icon{position:absolute;left:20px;top:50%;transform:translateY(-50%);color:rgba(0,145,218,0.35);pointer-events:none}
        .sb-mini-count{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;padding:8px 0;border-bottom:1px solid rgba(0,145,218,0.1);transition:opacity .2s;flex-shrink:0}
        .sb-root.open .sb-mini-count{opacity:0;pointer-events:none;max-height:0;padding:0;border:none;overflow:hidden}.sb-root.closed .sb-mini-count{opacity:1;max-height:48px}
        .sb-mini-badge{background:rgba(0,145,218,0.12);border:1px solid rgba(0,145,218,0.25);border-radius:2px;padding:2px 6px;font-size:10px;letter-spacing:1px;color:#0091DA;font-weight:500}
        .sb-mini-new{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;padding:8px 0;border-bottom:1px solid rgba(0,145,218,0.1);flex-shrink:0;transition:opacity .2s;cursor:pointer;background:transparent;border-left:none;border-right:none;border-top:none;width:100%}
        .sb-root.open .sb-mini-new{opacity:0;pointer-events:none;max-height:0;padding:0;overflow:hidden}.sb-root.closed .sb-mini-new{opacity:1;max-height:48px}
        .sb-mini-new:hover{background:rgba(0,145,218,0.07)}.sb-mini-new svg{color:rgba(0,145,218,0.5)}
        .sb-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 8px;position:relative;z-index:5}
        .sb-scroll::-webkit-scrollbar{width:3px}.sb-scroll::-webkit-scrollbar-track{background:transparent}.sb-scroll::-webkit-scrollbar-thumb{background:rgba(0,145,218,0.2);border-radius:2px}
        .sb-group-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.18);padding:0 8px;margin-bottom:8px;white-space:nowrap;overflow:hidden;transition:opacity .22s}
        .sb-root.closed .sb-group-label{opacity:0}
        .sb-item{position:relative;display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:3px;cursor:pointer;margin-bottom:4px;border:1px solid transparent;overflow:hidden;background:transparent;transition:background .18s,border-color .18s,box-shadow .18s}
        .sb-item:hover{background:rgba(0,145,218,0.07);border-color:rgba(0,145,218,0.15)}
        .sb-item.active{background:rgba(0,51,141,0.25);border-color:rgba(0,145,218,0.3);box-shadow:0 0 20px rgba(0,51,141,0.2),inset 0 1px 0 rgba(255,255,255,0.04)}
        .sb-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:2px;background:linear-gradient(to bottom,#0091DA,#00B2A9);border-radius:0 2px 2px 0}
        .sb-item::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,145,218,0.06) 0%,transparent 60%);opacity:0;transition:opacity .2s;pointer-events:none}
        .sb-item:hover::after{opacity:1}
        .sb-item-icon{width:30px;height:30px;border-radius:2px;background:rgba(0,51,141,0.3);border:1px solid rgba(0,91,184,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Bebas Neue',sans-serif;font-size:10px;color:rgba(0,145,218,0.7);letter-spacing:.5px;transition:background .18s}
        .sb-item.active .sb-item-icon{background:rgba(0,91,184,0.4);border-color:rgba(0,145,218,0.4);color:#0091DA;box-shadow:0 0 10px rgba(0,91,184,0.3)}
        .sb-item-body{flex:1;min-width:0;overflow:hidden;transition:max-width .32s cubic-bezier(.16,1,.3,1),opacity .22s}
        .sb-root.open .sb-item-body{max-width:200px;opacity:1}.sb-root.closed .sb-item-body{max-width:0;opacity:0}
        .sb-item-title{font-size:12px;font-weight:400;color:rgba(255,255,255,0.65);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .18s}
        .sb-item.active .sb-item-title{color:#fff}.sb-item:hover .sb-item-title{color:rgba(255,255,255,0.85)}
        .sb-item-meta{font-size:9px;letter-spacing:1px;color:rgba(255,255,255,0.2);margin-top:2px;text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .sb-item.active .sb-item-meta{color:rgba(0,178,169,0.6)}
        .sb-item-right{display:flex;align-items:center;gap:6px;flex-shrink:0;transition:max-width .32s ease,opacity .22s}
        .sb-root.open .sb-item-right{max-width:60px;opacity:1}.sb-root.closed .sb-item-right{max-width:0;opacity:0}
        .sb-item-dot{width:5px;height:5px;border-radius:50%;background:#00B2A9;box-shadow:0 0 6px #00B2A9;flex-shrink:0;transition:opacity .18s}
        .sb-item.active .sb-item-dot{opacity:1}.sb-item:not(.active) .sb-item-dot{opacity:0}
        .sb-delete-btn{display:none;background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,0.2);padding:2px;border-radius:2px;transition:color .15s,background .15s;line-height:1;align-items:center;justify-content:center}
        .sb-item:hover .sb-delete-btn{display:flex}
        .sb-delete-btn:hover{color:rgba(229,62,62,0.8);background:rgba(229,62,62,0.1)}
        .sb-delete-btn.confirm{display:flex;color:rgba(229,62,62,0.8);background:rgba(229,62,62,0.1);animation:pulse .6s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .sb-root.closed .sb-item:hover::before{content:attr(data-tip);position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);background:rgba(0,3,16,0.97);border:1px solid rgba(0,145,218,0.25);border-radius:3px;padding:5px 10px;font-size:11px;color:rgba(255,255,255,0.7);white-space:nowrap;pointer-events:none;z-index:100;box-shadow:0 4px 20px rgba(0,0,0,0.5)}
        .sb-divider{height:1px;background:linear-gradient(to right,transparent,rgba(0,145,218,0.18),transparent);margin:8px 0}
        .sb-no-results{padding:16px 8px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.15);text-align:center}
        .sb-footer{position:relative;z-index:5;padding:12px 16px;border-top:1px solid rgba(0,145,218,0.1);flex-shrink:0;overflow:hidden}
        .sb-footer-status{display:flex;align-items:center;gap:7px;justify-content:center}
        .sb-footer-dot{width:5px;height:5px;border-radius:50%;background:#00B2A9;box-shadow:0 0 7px #00B2A9;flex-shrink:0;animation:sbBlink 2s ease-in-out infinite}
        @keyframes sbBlink{0%,100%{opacity:1}50%{opacity:.25}}
        .sb-footer-text{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.18);white-space:nowrap;overflow:hidden;transition:max-width .32s,opacity .22s}
        .sb-root.open .sb-footer-text{max-width:200px;opacity:1}.sb-root.closed .sb-footer-text{max-width:0;opacity:0}
        .sb-footer-text strong{color:#00B2A9;font-weight:400}
        .sb-empty{padding:20px 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.15);text-align:center;transition:opacity .22s}
        .sb-root.closed .sb-empty{opacity:0}
      `}</style>

      <div className={`sb-root ${open ? "open" : "closed"}`}>
        <div className="sb-grid" /><div className="sb-orb" /><div className="sb-scanlines" />

        <button className="sb-toggle" onClick={() => setOpen(!open)}>
          <div className="sb-logo-box">KPMG</div>
          <div className="sb-logo-text">KP<span>MG</span></div>
          <div className="sb-chevron">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="sb-chevron-mini">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </button>

        <div className="sb-header-info">
          <div className="sb-section-label">Navigation</div>
          <div className="sb-title">Chat<br /><em>History</em></div>
          <div className="sb-header-actions">
            <span className="sb-count-num">{chats.length}</span>
            <button className="sb-new-btn" onClick={handleNewChat}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              New Chat
            </button>
            {chats.length > 0 && (
              <button
                className={`sb-clear-btn${confirmClearAll ? " armed" : ""}`}
                onClick={handleClearAll}
                title={confirmClearAll ? "⚠ Click again to reset session" : "Reset session"}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
        </div>

        <div className="sb-search-wrap">
          <svg className="sb-search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input className="sb-search" placeholder="Search sessions…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <button className="sb-mini-new" onClick={handleNewChat} title="New chat">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="sb-mini-count"><span className="sb-mini-badge">{chats.length}</span></div>

        <div className="sb-scroll">
          <div className="sb-group-label">Current Session</div>
          {chats.length === 0 && <div className="sb-empty">No sessions yet</div>}
          {chats.length > 0 && filtered.length === 0 && <div className="sb-no-results">No matches</div>}

          {filtered.map((chat: any) => {
            const realIndex = chats.findIndex((c: any) => c._id === chat._id);
            const isConfirming = confirmDeleteId === chat._id;
            return (
              <div
                key={chat._id}
                data-tip={chat.title}
                className={`sb-item${activeChat === realIndex ? " active" : ""}`}
                onClick={() => selectChat(realIndex)}
              >
                <div className="sb-item-icon">#{String(realIndex + 1).padStart(2, "0")}</div>
                <div className="sb-item-body">
                  <div className="sb-item-title">{chat.title ?? `Session ${realIndex + 1}`}</div>
                  <div className="sb-item-meta">
                    <span>{chat.messages?.length ?? 0} msg{(chat.messages?.length ?? 0) !== 1 ? "s" : ""}</span>
                    {chat.updatedAt && <><span style={{opacity:0.3}}>·</span><span>{formatDate(chat.updatedAt)}</span></>}
                  </div>
                </div>
                <div className="sb-item-right">
                  <div className="sb-item-dot" />
                  <button
                    className={`sb-delete-btn${isConfirming ? " confirm" : ""}`}
                    onClick={(e) => handleDelete(e, chat._id)}
                    title={isConfirming ? "Click again to reset session" : "Reset session"}
                  >
                    {isConfirming ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          {chats.length > 0 && <div className="sb-divider" />}
        </div>

        <div className="sb-footer">
          <div className="sb-footer-status">
            <div className="sb-footer-dot" />
            <div className="sb-footer-text">AI <strong>online</strong> · {chats.length} session{chats.length !== 1 ? "s" : ""} active</div>
          </div>
        </div>
      </div>
    </>
  );
}