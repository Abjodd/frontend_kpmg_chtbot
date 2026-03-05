import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --kpmg-blue: #00338D;
          --kpmg-mid: #005EB8;
          --kpmg-light: #0091DA;
          --kpmg-cyan: #00B2A9;
          --kpmg-purple: #6D2077;
          --kpmg-green: #00A3A1;
          --gold: #C4A35A;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #000;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
        }

        .scene {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: radial-gradient(ellipse at 20% 50%, #001a4d 0%, #000 60%);
        }

        /* ── Animated grid ── */
        .grid-floor {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,91,184,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,91,184,0.18) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(600px) rotateX(55deg) translateY(40%);
          transform-origin: center bottom;
          animation: gridPulse 4s ease-in-out infinite;
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }

        /* ── Floating orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: drift linear infinite;
          pointer-events: none;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #005EB8 0%, transparent 70%);
          top: -150px; left: -100px;
          animation-duration: 18s;
          animation-name: drift1;
        }
        .orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #6D2077 0%, transparent 70%);
          bottom: -100px; right: -80px;
          animation-duration: 22s;
          animation-name: drift2;
        }
        .orb-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, #00B2A9 0%, transparent 70%);
          top: 40%; right: 15%;
          animation-duration: 14s;
          animation-name: drift3;
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0,0); }
          33%       { transform: translate(80px, 60px); }
          66%       { transform: translate(30px, -40px); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0,0); }
          50%       { transform: translate(-60px, -80px); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(-40px, 30px) scale(1.2); }
        }

        /* ── Scanlines overlay ── */
        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.07) 3px,
            rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* ── Particles ── */
        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }
        .particle {
          position: absolute;
          width: 2px; height: 2px;
          background: #0091DA;
          border-radius: 50%;
          animation: floatUp linear infinite;
          opacity: 0;
        }
        @keyframes floatUp {
          0%   { transform: translateY(100vh) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-10vh) translateX(var(--dx, 20px)); opacity: 0; }
        }

        /* ── Card ── */
        .card {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          width: 480px;
          animation: cardReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translate(-50%, -40%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .card-inner {
          position: relative;
          background: rgba(0, 5, 20, 0.85);
          border: 1px solid rgba(0, 145, 218, 0.25);
          border-radius: 4px;
          padding: 52px 48px 48px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(0,91,184,0.1),
            0 40px 80px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
        }

        /* corner accents */
        .card-inner::before,
        .card-inner::after {
          content: '';
          position: absolute;
          width: 24px; height: 24px;
        }
        .card-inner::before {
          top: -1px; left: -1px;
          border-top: 2px solid var(--kpmg-light);
          border-left: 2px solid var(--kpmg-light);
        }
        .card-inner::after {
          bottom: -1px; right: -1px;
          border-bottom: 2px solid var(--kpmg-light);
          border-right: 2px solid var(--kpmg-light);
        }

        /* glow sweep */
        .card-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(0,145,218,0.04) 50%, transparent 100%);
          animation: sweep 3s ease-in-out infinite;
        }
        @keyframes sweep {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50%       { opacity: 1; transform: translateX(100%); }
        }

        /* ── Logo ── */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 36px;
          animation: fadeSlideDown 0.8s 0.3s both;
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-box {
          position: relative;
          width: 64px; height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--kpmg-blue);
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 0 30px rgba(0,91,184,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .logo-box::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .logo-text-kpmg {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: 1px;
          color: #fff;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .logo-right {}
        .logo-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px;
          letter-spacing: 3px;
          color: #fff;
          line-height: 1;
        }
        .logo-name span {
          color: var(--kpmg-light);
        }
        .logo-tagline {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-top: 3px;
        }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,145,218,0.4), transparent);
          margin-bottom: 28px;
          animation: fadeSlideDown 0.8s 0.5s both;
        }

        /* ── Headline ── */
        .headline {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
          animation: fadeSlideDown 0.8s 0.6s both;
        }
        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 44px;
          letter-spacing: 4px;
          color: #fff;
          line-height: 1.05;
          margin-bottom: 32px;
          animation: fadeSlideDown 0.8s 0.7s both;
        }
        .title em {
          font-style: normal;
          background: linear-gradient(90deg, var(--kpmg-light), var(--kpmg-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Buttons ── */
        .btn-row {
          display: flex;
          gap: 14px;
          animation: fadeSlideDown 0.8s 0.9s both;
        }

        .btn {
          flex: 1;
          position: relative;
          padding: 16px 20px;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
        }
        .btn:hover { transform: translateY(-2px); }

        .btn-primary {
          background: var(--kpmg-blue);
          color: #fff;
          box-shadow: 0 0 30px rgba(0,91,184,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .btn-primary:hover {
          box-shadow: 0 0 50px rgba(0,145,218,0.7), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
        }

        .btn-outline {
          background: transparent;
          color: var(--kpmg-light);
          border: 1px solid rgba(0,145,218,0.35);
          box-shadow: inset 0 0 20px rgba(0,145,218,0.04);
        }
        .btn-outline:hover {
          background: rgba(0,145,218,0.08);
          border-color: var(--kpmg-light);
          box-shadow: 0 0 25px rgba(0,145,218,0.25), inset 0 0 20px rgba(0,145,218,0.08);
          color: #fff;
        }

        /* icon dots */
        .btn-icon {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.7;
          box-shadow: 10px 0 0 currentColor, 20px 0 0 currentColor;
          flex-shrink: 0;
          position: relative;
          left: -5px;
        }

        /* ── Status bar ── */
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
          animation: fadeSlideDown 0.8s 1.1s both;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--kpmg-cyan);
          box-shadow: 0 0 8px var(--kpmg-cyan);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .status-text {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
        .status-text strong {
          color: var(--kpmg-cyan);
          font-weight: 400;
        }

        /* ── Corner data badges ── */
        .badge {
          position: absolute;
          z-index: 5;
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          animation: fadeSlideDown 0.8s 1.4s both;
        }
        .badge-tl { top: 24px; left: 28px; }
        .badge-tr { top: 24px; right: 28px; text-align: right; }
        .badge-bl { bottom: 24px; left: 28px; }
        .badge-br { bottom: 24px; right: 28px; text-align: right; }

        /* ── Vertical rule text ── */
        .vert-text {
          position: absolute;
          writing-mode: vertical-rl;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 11px;
          letter-spacing: 4px;
          color: rgba(0,91,184,0.25);
          z-index: 3;
          animation: fadeSlideDown 0.8s 1.6s both;
        }
        .vert-left  { left: 20px; top: 50%; transform: translateY(-50%); }
        .vert-right { right: 20px; top: 50%; transform: translateY(-50%) rotate(180deg); }
      `}</style>

      <div className="scene">
        <div className="grid-floor" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="scanlines" />

        {/* Particles */}
        <div className="particles">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${8 + Math.random() * 10}s`,
                // @ts-ignore
                '--dx': `${(Math.random() - 0.5) * 80}px`,
                width: Math.random() > 0.7 ? '3px' : '2px',
                height: Math.random() > 0.7 ? '3px' : '2px',
                background: ['#0091DA','#00B2A9','#005EB8','#fff'][Math.floor(Math.random()*4)],
              }}
            />
          ))}
        </div>

        {/* Vertical texts */}
        <div className="vert-text vert-left">KPMG · SECURE · INTERNAL</div>
        <div className="vert-text vert-right">AUTHORISED ACCESS ONLY</div>

        {/* Corner badges */}
        <div className="badge badge-tl">SYS v4.2.1</div>
        <div className="badge badge-tr">ENC · AES-256</div>
        <div className="badge badge-bl">KPMG © 2024</div>
        <div className="badge badge-br">GLOBAL NETWORK</div>

        {/* Main card */}
        <div className="card">
          <div className="card-inner">
            <div className="card-sweep" />

            {/* Logo */}
            <div className="logo-wrap">
              <div className="logo-box">
                <span className="logo-text-kpmg">KPMG</span>
              </div>
              <div className="logo-right">
                <div className="logo-name">
                  KP<span>MG</span>
                </div>
                <div className="logo-tagline">Audit · Tax · Advisory</div>
              </div>
            </div>

            <div className="divider" />

            <div className="headline">Secure Portal</div>
            <div className="title">
              Internal<br /><em>AI Assistant</em>
            </div>

            <div className="btn-row">
              <Link href="/admin" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%' }}>
                  <span className="btn-icon" />
                  Admin
                </button>
              </Link>
              <Link href="/user" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="btn btn-outline" style={{ width: '100%' }}>
                  <span className="btn-icon" />
                  User
                </button>
              </Link>
            </div>

            <div className="status">
              <div className="status-dot" />
              <div className="status-text">Systems <strong>operational</strong> · All nodes active</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}