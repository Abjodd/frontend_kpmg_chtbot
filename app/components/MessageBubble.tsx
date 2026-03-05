export default function MessageBubble({ message }: any) {
  const isUser = message.sender === "user";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        .mb-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 12px;
          animation: mbFadeIn 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes mbFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mb-row.user  { flex-direction: row-reverse; }
        .mb-row.ai    { flex-direction: row; }

        /* avatar */
        .mb-avatar {
          width: 28px; height: 28px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 9px;
          letter-spacing: 1px;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .mb-avatar.user {
          background: linear-gradient(135deg, #005EB8, #0091DA);
          color: #fff;
          box-shadow: 0 0 12px rgba(0,91,184,0.45);
        }
        .mb-avatar.ai {
          background: rgba(0,51,141,0.35);
          border: 1px solid rgba(0,145,218,0.3);
          color: rgba(0,145,218,0.8);
        }

        /* bubble wrapper */
        .mb-wrap {
          display: flex;
          flex-direction: column;
          max-width: 68%;
          gap: 4px;
        }
        .mb-row.user  .mb-wrap { align-items: flex-end; }
        .mb-row.ai    .mb-wrap { align-items: flex-start; }

        /* sender label */
        .mb-label {
          font-size: 8px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          padding: 0 4px;
        }

        /* bubble */
        .mb-bubble {
          position: relative;
          padding: 11px 16px;
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.2px;
          word-break: break-word;
          overflow: hidden;
        }

        /* USER bubble */
        .mb-bubble.user {
          background: #00338D;
          color: #fff;
          border: 1px solid rgba(0,145,218,0.25);
          box-shadow: 0 0 24px rgba(0,51,141,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .mb-bubble.user::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%);
        }
        /* user corner accent */
        .mb-bubble.user::after {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 14px; height: 14px;
          border-top: 1.5px solid rgba(0,145,218,0.5);
          border-left: 1.5px solid rgba(0,145,218,0.5);
        }

        /* AI bubble */
        .mb-bubble.ai {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.82);
          border: 1px solid rgba(0,145,218,0.18);
          box-shadow: 0 0 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        /* ai corner accent */
        .mb-bubble.ai::after {
          content: '';
          position: absolute;
          bottom: -1px; right: -1px;
          width: 14px; height: 14px;
          border-bottom: 1.5px solid rgba(0,178,169,0.4);
          border-right: 1.5px solid rgba(0,178,169,0.4);
        }
        /* ai left stripe */
        .mb-bubble.ai .mb-ai-stripe {
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 2px;
          background: linear-gradient(to bottom, #0091DA, #00B2A9);
          border-radius: 0 2px 2px 0;
        }
        .mb-bubble.ai .mb-text {
          padding-left: 10px;
        }

        /* timestamp */
        .mb-time {
          font-size: 8px;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.15);
          padding: 0 4px;
        }
      `}</style>

      <div className={`mb-row ${isUser ? "user" : "ai"}`}>
        {/* Avatar */}
        <div className={`mb-avatar ${isUser ? "user" : "ai"}`}>
          {isUser ? "ME" : "AI"}
        </div>

        <div className="mb-wrap">
          {/* Sender label */}
          <div className="mb-label">{isUser ? "You" : "KPMG AI"}</div>

          {/* Bubble */}
          <div className={`mb-bubble ${isUser ? "user" : "ai"}`}>
            {!isUser && <div className="mb-ai-stripe" />}
            <div className={!isUser ? "mb-text" : ""}>
              {message.text}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mb-time">
            {new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </>
  );
}