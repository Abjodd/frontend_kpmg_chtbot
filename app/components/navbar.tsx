"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/");
    } else {
      setUser(JSON.parse(stored));
    }

    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  // Support both old (name) and new (displayName) user object shapes
  const displayName = user?.displayName || user?.name || "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";
  const isAdmin = user?.role === "admin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          position: relative; width: 100%; height: 90px;
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; padding: 0 24px;
          background: rgba(0, 3, 16, 0.97);
          border-bottom: 1px solid rgba(0,145,218,0.12);
          backdrop-filter: blur(20px);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden; flex-shrink: 0; z-index: 50;
        }
        .nav-root::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent 0%, rgba(0,145,218,0.45) 30%, rgba(0,178,169,0.45) 70%, transparent 100%);
        }
        .nav-sweep {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(0,145,218,0.025) 50%, transparent 100%);
          animation: navSweep 6s ease-in-out infinite; pointer-events: none;
        }
        @keyframes navSweep {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50%       { transform: translateX(100%);  opacity: 1; }
        }

        .nav-left { display: flex; align-items: center; gap: 10px; position: relative; z-index: 2; }
        .nav-breadcrumb { display: flex; align-items: center; gap: 7px; }
        .nav-bc-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.18); }
        .nav-bc-sep { font-size: 9px; color: rgba(0,145,218,0.3); }
        .nav-bc-active { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(0,178,169,0.65); }
        .nav-bc-dot { width: 4px; height: 4px; border-radius: 50%; background: #00B2A9; box-shadow: 0 0 6px #00B2A9; animation: navBlink 2s ease-in-out infinite; }
        @keyframes navBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

        .nav-center {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          position: relative; z-index: 2; padding: 0 32px;
          text-decoration: none; cursor: pointer;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .nav-center:hover { opacity: 0.85; transform: translateY(-1px); }
        .nav-center:hover .nav-logo-box { box-shadow: 0 0 32px rgba(0,91,184,0.9), 0 0 12px rgba(0,145,218,0.5), inset 0 1px 0 rgba(255,255,255,0.15); }
        .nav-center::before {
          content: ''; position: absolute; width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,51,141,0.35) 0%, transparent 70%);
          filter: blur(16px); pointer-events: none; top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .nav-logo-box {
          width: 42px; height: 42px; background: #00338D; border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 15px; color: #fff; letter-spacing: 1px;
          box-shadow: 0 0 24px rgba(0,51,141,0.8), 0 0 8px rgba(0,145,218,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .nav-logo-box::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, transparent 55%); }
        .nav-brand-row { display: flex; align-items: baseline; gap: 0; }
        .nav-brand-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 4px; color: #fff; line-height: 1; }
        .nav-brand-name span { color: #0091DA; }
        .nav-brand-sub { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); line-height: 2; text-align: center; }
        .nav-center-line { position: absolute; top: 50%; height: 1px; width: 28px; background: linear-gradient(to right, transparent, rgba(0,145,218,0.3)); transform: translateY(-50%); }
        .nav-center-line.left  { right: calc(100% - 6px); background: linear-gradient(to left, transparent, rgba(0,145,218,0.3)); }
        .nav-center-line.right { left: calc(100% - 6px); }

        .nav-right { display: flex; align-items: center; gap: 14px; justify-content: flex-end; position: relative; z-index: 2; }
        .nav-clock { font-size: 11px; letter-spacing: 2px; font-family: 'Bebas Neue', sans-serif; color: rgba(255,255,255,0.2); font-variant-numeric: tabular-nums; }
        .nav-divider { width: 1px; height: 22px; background: rgba(0,145,218,0.14); }

        /* ── File Vault button (admin only) ── */
        .nav-vault-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,51,141,0.15); border: 1px solid rgba(0,145,218,0.2);
          border-radius: 3px; padding: 6px 14px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(0,145,218,0.7);
          transition: all .18s; white-space: nowrap;
        }
        .nav-vault-btn:hover { background: rgba(0,51,141,0.35); border-color: rgba(0,145,218,0.5); color: #fff; box-shadow: 0 0 16px rgba(0,145,218,0.15); transform: translateY(-1px); }

        .nav-role-badge { display: flex; align-items: center; gap: 6px; background: rgba(109,32,119,0.16); border: 1px solid rgba(109,32,119,0.3); border-radius: 2px; padding: 3px 10px; }
        .nav-role-dot { width: 4px; height: 4px; border-radius: 50%; background: #c084fc; box-shadow: 0 0 6px #c084fc; }
        .nav-role-text { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #c084fc; }

        .nav-user { display: flex; align-items: center; gap: 9px; }
        .nav-avatar { width: 30px; height: 30px; border-radius: 3px; background: linear-gradient(135deg, #005EB8, #0091DA); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 11px; color: #fff; letter-spacing: 1px; box-shadow: 0 0 12px rgba(0,91,184,0.45); flex-shrink: 0; }
        .nav-user-name { font-size: 12px; font-weight: 500; color: #fff; letter-spacing: 0.3px; line-height: 1.2; white-space: nowrap; }
        .nav-user-role { font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.26); line-height: 1; }

        .nav-logout {
          position: relative; padding: 6px 14px; border-radius: 3px;
          border: 1px solid rgba(0,145,218,0.22); background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45);
          cursor: pointer; overflow: hidden;
          transition: color 0.18s, border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.15s;
          white-space: nowrap;
        }
        .nav-logout:hover { color: #fff; border-color: rgba(220,50,50,0.45); background: rgba(220,50,50,0.07); box-shadow: 0 0 16px rgba(220,50,50,0.12); transform: translateY(-1px); }
        .nav-logout::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%); }
      `}</style>

      <nav className="nav-root">
        <div className="nav-sweep" />

        {/* LEFT — breadcrumb */}
        <div className="nav-left">
          <div className="nav-breadcrumb">
            <span className="nav-bc-label">Internal</span>
            <span className="nav-bc-sep">›</span>
            <span className="nav-bc-active">AI Assistant</span>
            <div className="nav-bc-dot" />
          </div>
        </div>

        {/* CENTER — KPMG brand */}
        <Link href="/" className="nav-center">
          <div className="nav-center-line left" />
          <div className="nav-center-line right" />
          <div className="nav-logo-box">KPMG</div>
          <div className="nav-brand-row" />
          <div className="nav-brand-sub">Audit · Tax · Advisory</div>
        </Link>

        {/* RIGHT — user info */}
        {user ? (
          <div className="nav-right">
            <span className="nav-clock">{time}</span>
            <div className="nav-divider" />

            {/* File Vault — admin only */}
            {isAdmin && (
              <button className="nav-vault-btn" onClick={() => router.push("/files")}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="7" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="3" cy="3" r=".8" fill="currentColor"/>
                  <circle cx="3" cy="9" r=".8" fill="currentColor"/>
                </svg>
                File Vault
              </button>
            )}

            <div className="nav-role-badge">
              <div className="nav-role-dot" />
              <span className="nav-role-text">{user.role}</span>
            </div>

            <div className="nav-user">
              <div className="nav-avatar">{initials}</div>
              <div>
                <div className="nav-user-name">{displayName}</div>
                <div className="nav-user-role">{user.role}</div>
              </div>
            </div>

            <div className="nav-divider" />
            <button className="nav-logout" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div />
        )}
      </nav>
    </>
  );
}