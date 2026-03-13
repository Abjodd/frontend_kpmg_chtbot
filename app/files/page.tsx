"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    const user = JSON.parse(stored);
    if (user.role !== "admin") { router.push("/chat"); return; }

    fetch(`/api/files?role=admin&userId=${user._id}`)
      .then(r => r.json())
      .then(data => { setFiles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    setFiles(prev => prev.filter(f => f._id !== id));
  };

  const handleDownload = (file: any) => {
    const link = document.createElement("a");
    link.href = file.base64;
    link.download = file.name;
    link.click();
  };

  const getIcon = (type: string) => {
    if (type?.startsWith("image/")) return "IMG";
    if (type === "application/pdf") return "PDF";
    if (type?.includes("word")) return "DOC";
    if (type?.includes("excel") || type?.includes("sheet")) return "XLS";
    if (type?.includes("text")) return "TXT";
    return "FILE";
  };

  const getColor = (type: string) => {
    if (type?.startsWith("image/")) return "#0091DA";
    if (type === "application/pdf") return "#e53e3e";
    if (type?.includes("word")) return "#3b82f6";
    if (type?.includes("excel") || type?.includes("sheet")) return "#00B2A9";
    return "rgba(255,255,255,0.4)";
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  };

  const fileTypes = ["all", ...Array.from(new Set(files.map(f => getIcon(f.type))))];

  const filtered = files.filter(f => {
    const matchSearch = f.name?.toLowerCase().includes(search.toLowerCase()) ||
                        f.username?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || getIcon(f.type) === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#00040f; font-family:'DM Sans',sans-serif; color:#fff; }
        .fp-root { min-height:100vh; background:#00040f; position:relative; }
        .fp-grid { position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,91,184,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,91,184,0.06) 1px,transparent 1px);background-size:48px 48px;z-index:0; }
        .fp-orb { position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0; }
        .fp-orb-1 { width:500px;height:500px;background:radial-gradient(circle,rgba(0,51,141,0.3) 0%,transparent 70%);top:-150px;right:-100px; }
        .fp-orb-2 { width:350px;height:350px;background:radial-gradient(circle,rgba(0,178,169,0.12) 0%,transparent 70%);bottom:-100px;left:-80px; }

        .fp-header { position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:18px 32px;background:rgba(0,4,20,0.95);border-bottom:1px solid rgba(0,145,218,0.15);backdrop-filter:blur(20px); }
        .fp-header-left { display:flex;align-items:center;gap:16px; }
        .fp-logo { width:36px;height:36px;background:#00338D;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:12px;color:#fff;box-shadow:0 0 16px rgba(0,51,141,0.5); }
        .fp-title { font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#fff; }
        .fp-title span { color:#0091DA; }
        .fp-back-btn { display:flex;align-items:center;gap:6px;background:rgba(0,51,141,0.15);border:1px solid rgba(0,145,218,0.2);border-radius:3px;padding:7px 14px;cursor:pointer;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(0,145,218,0.7);transition:all .18s; }
        .fp-back-btn:hover { background:rgba(0,51,141,0.3);color:#fff;border-color:rgba(0,145,218,0.4); }

        .fp-body { position:relative;z-index:5;padding:28px 32px; }

        .fp-stats { display:flex;gap:16px;margin-bottom:28px; }
        .fp-stat { flex:1;background:rgba(255,255,255,0.03);border:1px solid rgba(0,145,218,0.12);border-radius:3px;padding:16px 20px; }
        .fp-stat-num { font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:2px;color:#0091DA; }
        .fp-stat-label { font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-top:2px; }

        .fp-controls { display:flex;align-items:center;gap:12px;margin-bottom:20px; }
        .fp-search { flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(0,145,218,0.15);border-radius:3px;padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:13px;color:#fff;outline:none;caret-color:#0091DA;transition:border-color .2s; }
        .fp-search::placeholder { color:rgba(255,255,255,0.2); }
        .fp-search:focus { border-color:rgba(0,145,218,0.4); }
        .fp-filter-btn { padding:9px 14px;border-radius:3px;border:1px solid rgba(0,145,218,0.15);background:rgba(255,255,255,0.03);cursor:pointer;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);transition:all .18s; }
        .fp-filter-btn.active { background:rgba(0,51,141,0.25);border-color:rgba(0,145,218,0.4);color:#0091DA; }

        .fp-table-wrap { background:rgba(255,255,255,0.02);border:1px solid rgba(0,145,218,0.1);border-radius:4px;overflow:hidden; }
        .fp-table { width:100%;border-collapse:collapse; }
        .fp-th { padding:12px 16px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);text-align:left;border-bottom:1px solid rgba(0,145,218,0.1);background:rgba(0,0,0,0.2);white-space:nowrap; }
        .fp-tr { border-bottom:1px solid rgba(0,145,218,0.06);transition:background .15s; }
        .fp-tr:hover { background:rgba(0,145,218,0.05); }
        .fp-tr:last-child { border-bottom:none; }
        .fp-td { padding:12px 16px;font-size:13px;color:rgba(255,255,255,0.7);vertical-align:middle; }

        .fp-file-cell { display:flex;align-items:center;gap:10px; }
        .fp-file-icon { width:32px;height:32px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:9px;letter-spacing:.5px;flex-shrink:0; }
        .fp-file-preview { width:32px;height:32px;border-radius:3px;object-fit:cover;flex-shrink:0; }
        .fp-file-name { font-size:13px;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px; }
        .fp-file-type { font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.3);margin-top:1px;text-transform:uppercase; }

        .fp-user-badge { display:inline-flex;align-items:center;gap:5px;background:rgba(0,51,141,0.2);border:1px solid rgba(0,145,218,0.2);border-radius:2px;padding:3px 8px;font-size:10px;letter-spacing:1px;color:#0091DA; }

        .fp-actions { display:flex;gap:6px; }
        .fp-action-btn { display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:3px;border:1px solid;cursor:pointer;transition:all .15s;background:transparent; }
        .fp-download-btn { border-color:rgba(0,145,218,0.2);color:rgba(0,145,218,0.5); }
        .fp-download-btn:hover { background:rgba(0,145,218,0.1);border-color:rgba(0,145,218,0.5);color:#0091DA; }
        .fp-delete-btn { border-color:rgba(229,62,62,0.2);color:rgba(229,62,62,0.4); }
        .fp-delete-btn:hover { background:rgba(229,62,62,0.1);border-color:rgba(229,62,62,0.5);color:rgba(229,62,62,0.9); }

        .fp-empty { padding:60px 20px;text-align:center;color:rgba(255,255,255,0.2); }
        .fp-empty-icon { font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:2px;color:rgba(0,145,218,0.2);margin-bottom:12px; }
        .fp-empty-text { font-size:11px;letter-spacing:2px;text-transform:uppercase; }
        .fp-loading { padding:60px;text-align:center;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(0,145,218,0.4); }
      `}</style>

      <div className="fp-root">
        <div className="fp-grid" />
        <div className="fp-orb fp-orb-1" />
        <div className="fp-orb fp-orb-2" />

        {/* Header */}
        <div className="fp-header">
          <div className="fp-header-left">
            <div className="fp-logo">KPMG</div>
            <div>
              <div className="fp-title">FILE <span>VAULT</span></div>
            </div>
          </div>
          <button className="fp-back-btn" onClick={() => router.push("/chat")}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Chat
          </button>
        </div>

        <div className="fp-body">
          {/* Stats */}
          <div className="fp-stats">
            <div className="fp-stat">
              <div className="fp-stat-num">{files.length}</div>
              <div className="fp-stat-label">Total Files</div>
            </div>
            <div className="fp-stat">
              <div className="fp-stat-num">{Array.from(new Set(files.map(f => f.userId))).length}</div>
              <div className="fp-stat-label">Users</div>
            </div>
            <div className="fp-stat">
              <div className="fp-stat-num">{formatSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}</div>
              <div className="fp-stat-label">Total Size</div>
            </div>
            <div className="fp-stat">
              <div className="fp-stat-num">{files.filter(f => f.type?.startsWith("image/")).length}</div>
              <div className="fp-stat-label">Images</div>
            </div>
          </div>

          {/* Controls */}
          <div className="fp-controls">
            <input className="fp-search" placeholder="Search by filename or user..." value={search} onChange={e => setSearch(e.target.value)} />
            {fileTypes.map(t => (
              <button key={t} className={`fp-filter-btn${filter === t ? " active" : ""}`} onClick={() => setFilter(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="fp-table-wrap">
            {loading ? (
              <div className="fp-loading">Loading files...</div>
            ) : filtered.length === 0 ? (
              <div className="fp-empty">
                <div className="fp-empty-icon">NO FILES</div>
                <div className="fp-empty-text">No files uploaded yet</div>
              </div>
            ) : (
              <table className="fp-table">
                <thead>
                  <tr>
                    <th className="fp-th">File</th>
                    <th className="fp-th">Uploaded By</th>
                    <th className="fp-th">Size</th>
                    <th className="fp-th">Date</th>
                    <th className="fp-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(file => (
                    <tr key={file._id} className="fp-tr">
                      <td className="fp-td">
                        <div className="fp-file-cell">
                          {file.type?.startsWith("image/") ? (
                            <img src={file.base64} alt={file.name} className="fp-file-preview" />
                          ) : (
                            <div className="fp-file-icon" style={{ background: getColor(file.type) + "22", border: `1px solid ${getColor(file.type)}44` }}>
                              <span style={{ color: getColor(file.type) }}>{getIcon(file.type)}</span>
                            </div>
                          )}
                          <div>
                            <div className="fp-file-name">{file.name}</div>
                            <div className="fp-file-type">{file.type?.split("/")[1] || "unknown"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fp-td">
                        <span className="fp-user-badge">{file.username || "unknown"}</span>
                      </td>
                      <td className="fp-td">{formatSize(file.size)}</td>
                      <td className="fp-td" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{formatDate(file.uploadedAt)}</td>
                      <td className="fp-td">
                        <div className="fp-actions">
                          <button className="fp-action-btn fp-download-btn" onClick={() => handleDownload(file)} title="Download">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M6.5 1v8M3.5 6.5l3 3 3-3M1 10.5v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="fp-action-btn fp-delete-btn" onClick={() => handleDelete(file._id)} title="Delete">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}