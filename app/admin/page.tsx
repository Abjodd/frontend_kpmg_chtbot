"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const locked = attempts >= MAX_ATTEMPTS;

  const handleLogin = async () => {
    if (!username.trim() || !password || loading || locked) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const next = attempts + 1;
        setAttempts(next);
        setLoading(false);
        setError(
          next >= MAX_ATTEMPTS
            ? "Account locked — too many failed attempts."
            : `Invalid credentials. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? "s" : ""} remaining.`
        );
        return;
      }

      // Only allow admin role on this page
      if (data.role !== "admin") {
        setAttempts(prev => prev + 1);
        setLoading(false);
        setError("Access denied. This portal is for admins only.");
        return;
      }

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      router.push("/chat");
    } catch (err) {
      setLoading(false);
      setError("Connection error. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        :root { --blue:#00338D; --mid:#005EB8; --light:#0091DA; --cyan:#00B2A9; --purple:#6D2077; }
        body { font-family:'DM Sans',sans-serif; background:#000; overflow:hidden; height:100vh; }
        .scene { position:relative; width:100vw; height:100vh; overflow:hidden; background:radial-gradient(ellipse at 70% 50%, #00112e 0%, #000 65%); }
        .grid-floor { position:absolute; inset:0; background-image:linear-gradient(rgba(0,91,184,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(0,91,184,0.18) 1px,transparent 1px); background-size:60px 60px; transform:perspective(600px) rotateX(55deg) translateY(40%); transform-origin:center bottom; animation:gridPulse 4s ease-in-out infinite; }
        @keyframes gridPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .orb-1 { width:500px;height:500px;background:radial-gradient(circle,#00338D 0%,transparent 70%);top:-150px;right:-80px;animation:drift1 20s ease-in-out infinite; }
        .orb-2 { width:300px;height:300px;background:radial-gradient(circle,#6D2077 0%,transparent 70%);bottom:-80px;left:-60px;animation:drift2 15s ease-in-out infinite; }
        .orb-3 { width:220px;height:220px;background:radial-gradient(circle,#00B2A9 0%,transparent 70%);top:30%;left:10%;animation:drift3 12s ease-in-out infinite; }
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,60px)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-40px)} }
        @keyframes drift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.15)} }
        .scanlines { position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.07) 3px,rgba(0,0,0,.07) 4px); }
        .particles { position:absolute;inset:0;pointer-events:none;z-index:2; }
        .particle  { position:absolute;width:2px;height:2px;border-radius:50%;animation:floatUp linear infinite;opacity:0; }
        @keyframes floatUp { 0%{transform:translateY(100vh) translateX(0);opacity:0;} 10%{opacity:1;} 90%{opacity:.5;} 100%{transform:translateY(-10vh) translateX(var(--dx,0));opacity:0;} }
        .card { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;width:480px;animation:cardReveal 1s cubic-bezier(.16,1,.3,1) both; }
        @keyframes cardReveal { from{opacity:0;transform:translate(-50%,-42%) scale(.94)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .card-inner { position:relative;background:rgba(0,4,18,.88);border:1px solid rgba(0,145,218,.2);border-radius:4px;padding:44px 44px 40px;backdrop-filter:blur(28px);box-shadow:0 0 0 1px rgba(0,51,141,.12),0 40px 80px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.05);overflow:hidden; }
        .card-inner::before { content:'';position:absolute;top:-1px;left:-1px;width:28px;height:28px;border-top:2px solid var(--light);border-left:2px solid var(--light); }
        .card-inner::after  { content:'';position:absolute;bottom:-1px;right:-1px;width:28px;height:28px;border-bottom:2px solid var(--light);border-right:2px solid var(--light); }
        .card-sweep { position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(0,145,218,.04),transparent);animation:sweep 3.5s ease-in-out infinite; }
        @keyframes sweep { 0%,100%{opacity:0;transform:translateX(-100%)} 50%{opacity:1;transform:translateX(100%)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        .logo-wrap { display:flex;align-items:center;gap:14px;margin-bottom:24px;animation:fadeDown .7s .3s both; }
        .logo-box { width:52px;height:52px;background:var(--blue);border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 28px rgba(0,51,141,.7),inset 0 1px 0 rgba(255,255,255,.1);position:relative;overflow:hidden; }
        .logo-box::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,transparent 60%); }
        .logo-box-text { font-family:'Bebas Neue',sans-serif;font-size:21px;color:#fff;letter-spacing:1px;position:relative;z-index:1; }
        .logo-name { font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:3px;color:#fff;line-height:1; }
        .logo-name span { color:var(--light); }
        .logo-sub { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-top:3px; }
        .admin-badge { display:inline-flex;align-items:center;gap:7px;background:rgba(109,32,119,.2);border:1px solid rgba(109,32,119,.4);border-radius:2px;padding:4px 12px;margin-bottom:16px;animation:fadeDown .7s .45s both; }
        .admin-badge-dot { width:5px;height:5px;border-radius:50%;background:#a855f7;box-shadow:0 0 8px #a855f7; }
        .admin-badge-text { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#c084fc; }
        .divider { height:1px;background:linear-gradient(to right,transparent,rgba(0,145,218,.35),transparent);margin-bottom:20px;animation:fadeDown .7s .5s both; }
        .eyebrow  { font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:4px;animation:fadeDown .7s .55s both; }
        .title    { font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:3px;color:#fff;line-height:1.05;margin-bottom:24px;animation:fadeDown .7s .6s both; }
        .title em { font-style:normal;background:linear-gradient(90deg,var(--light),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .error-box { display:flex;align-items:center;gap:8px;background:rgba(229,62,62,.1);border:1px solid rgba(229,62,62,.3);border-radius:3px;padding:9px 12px;margin-bottom:14px;animation:shake .4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        .error-text { font-size:11px;letter-spacing:.4px;color:rgba(255,110,110,.9); }
        .locked-banner { display:flex;align-items:flex-start;gap:10px;background:rgba(229,62,62,.1);border:1px solid rgba(229,62,62,.35);border-radius:3px;padding:12px 14px;margin-bottom:16px; }
        .locked-text { font-size:11px;letter-spacing:.4px;color:rgba(255,110,110,.9);line-height:1.6; }
        .field-group { margin-bottom:14px; }
        .input-label { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:7px;display:block; }
        .input-row   { position:relative; }
        .input-field { width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(0,145,218,.2);border-radius:3px;padding:13px 42px 13px 16px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:#fff;letter-spacing:.4px;outline:none;caret-color:var(--light);transition:border-color .2s,background .2s,box-shadow .2s; }
        .input-field::placeholder { color:rgba(255,255,255,.2); }
        .input-field:focus { border-color:rgba(0,145,218,.6);background:rgba(0,145,218,.06);box-shadow:0 0 20px rgba(0,145,218,.1),inset 0 0 20px rgba(0,145,218,.03); }
        .input-field.err  { border-color:rgba(229,62,62,.45); }
        .input-field:disabled { opacity:.45;cursor:not-allowed; }
        .input-underline { position:absolute;bottom:0;left:50%;height:2px;background:linear-gradient(90deg,var(--mid),var(--cyan));border-radius:0 0 3px 3px;transition:width .3s,left .3s;width:0;pointer-events:none; }
        .input-field:focus ~ .input-underline { width:100%;left:0; }
        .pw-eye { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;color:rgba(255,255,255,.28);display:flex;align-items:center;padding:4px;transition:color .2s; }
        .pw-eye:hover { color:rgba(0,145,218,.8); }
        .attempt-row { display:flex;align-items:center;gap:8px;margin-bottom:14px; }
        .attempt-label { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.2); }
        .attempt-dots  { display:flex;gap:5px; }
        .dot-used { width:7px;height:7px;border-radius:50%;background:rgba(229,62,62,.7);box-shadow:0 0 6px rgba(229,62,62,.5); }
        .dot-free { width:7px;height:7px;border-radius:50%;background:transparent;border:1px solid rgba(0,145,218,.3); }
        .btn-wrap { animation:fadeDown .7s .8s both; }
        .btn { position:relative;width:100%;padding:15px 20px;border-radius:3px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:#fff;background:var(--blue);overflow:hidden;transition:transform .2s,box-shadow .2s,opacity .2s;box-shadow:0 0 30px rgba(0,51,141,.5),inset 0 1px 0 rgba(255,255,255,.1); }
        .btn:not(:disabled):hover { transform:translateY(-2px);box-shadow:0 0 50px rgba(0,145,218,.6),inset 0 1px 0 rgba(255,255,255,.15); }
        .btn:disabled { opacity:.5;cursor:not-allowed; }
        .btn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1) 0%,transparent 60%); }
        .btn-bar { position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(90deg,var(--cyan),var(--light));animation:loadBar .9s cubic-bezier(.4,0,.6,1) forwards; }
        @keyframes loadBar { 0%{width:0} 100%{width:100%} }
        .status { display:flex;align-items:center;gap:8px;margin-top:18px;animation:fadeDown .7s 1s both; }
        .status-dot { width:5px;height:5px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan);animation:blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        .status-text { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.22); }
        .status-text strong { color:var(--cyan);font-weight:400; }
        .badge { position:absolute;z-index:5;font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.15);animation:fadeDown .7s 1.4s both; }
        .badge-tl{top:22px;left:26px} .badge-tr{top:22px;right:26px} .badge-bl{bottom:22px;left:26px} .badge-br{bottom:22px;right:26px}
        .vert-text { position:absolute;writing-mode:vertical-rl;font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:4px;color:rgba(0,91,184,.2);z-index:3; }
        .vert-left  { left:18px;top:50%;transform:translateY(-50%); }
        .vert-right { right:18px;top:50%;transform:translateY(-50%) rotate(180deg); }
      `}</style>

      <div className="scene">
        <div className="grid-floor" />
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="scanlines" />
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 14}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
              // @ts-ignore
              "--dx": `${(Math.random() - 0.5) * 80}px`,
              background: ["#0091DA","#00B2A9","#005EB8","rgba(255,255,255,0.6)"][Math.floor(Math.random()*4)],
            }} />
          ))}
        </div>
        <div className="vert-text vert-left">KPMG · ADMIN · SECURE</div>
        <div className="vert-text vert-right">ELEVATED ACCESS LEVEL</div>
        <div className="badge badge-tl">ADM-PORTAL</div>
        <div className="badge badge-tr">LVL · 9 ACCESS</div>
        <div className="badge badge-bl">KPMG © 2024</div>
        <div className="badge badge-br">SEC · GRADE A</div>

        <div className="card">
          <div className="card-inner">
            <div className="card-sweep" />
            <div className="logo-wrap">
              <div className="logo-box"><span className="logo-box-text">KPMG</span></div>
              <div>
                <div className="logo-name">KP<span>MG</span></div>
                <div className="logo-sub">Audit · Tax · Advisory</div>
              </div>
            </div>
            <div className="admin-badge">
              <div className="admin-badge-dot" />
              <span className="admin-badge-text">Admin Access</span>
            </div>
            <div className="divider" />
            <div className="eyebrow">Secure Login</div>
            <div className="title">Admin<br /><em>Portal</em></div>

            {locked && (
              <div className="locked-banner">
                <span style={{ fontSize: 18 }}>🔒</span>
                <div className="locked-text">Account locked after {MAX_ATTEMPTS} failed attempts.<br />Contact your system administrator to unlock.</div>
              </div>
            )}
            {error && !locked && (
              <div className="error-box">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7" stroke="rgba(229,62,62,0.8)" strokeWidth="1.4"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="rgba(229,62,62,0.8)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span className="error-text">{error}</span>
              </div>
            )}

            <div className="field-group" style={{ animation: "fadeDown .7s .65s both" }}>
              <label className="input-label">Username</label>
              <div className="input-row">
                <input type="text" placeholder="Enter username" className={`input-field${error ? " err" : ""}`} value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} disabled={loading || locked} autoComplete="username" />
                <div className="input-underline" />
              </div>
            </div>

            <div className="field-group" style={{ animation: "fadeDown .7s .72s both" }}>
              <label className="input-label">Password</label>
              <div className="input-row">
                <input type={showPass ? "text" : "password"} placeholder="Enter password" className={`input-field${error ? " err" : ""}`} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} disabled={loading || locked} autoComplete="current-password" />
                <button className="pw-eye" type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}>
                  {showPass ? (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  ) : (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>)}
                </button>
                <div className="input-underline" />
              </div>
            </div>

            {attempts > 0 && !locked && (
              <div className="attempt-row">
                <span className="attempt-label">Attempts</span>
                <div className="attempt-dots">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div key={i} className={i < attempts ? "dot-used" : "dot-free"} />
                  ))}
                </div>
              </div>
            )}

            <div className="btn-wrap">
              <button className="btn" onClick={handleLogin} disabled={!username.trim() || !password || loading || locked}>
                {loading ? "Authenticating..." : locked ? "Account Locked" : "Login as Admin"}
                {loading && <div className="btn-bar" />}
              </button>
            </div>
            <div className="status">
              <div className="status-dot" />
              <div className="status-text">Secure channel <strong>established</strong> · Admin node ready</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}