// ManageQuizzes.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Trash2, Edit2, Eye, Clock,
  FileQuestion, ToggleLeft, GripVertical, Filter,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

const INITIAL_QUIZZES = [
  {
    id: 1,
    title: "Network Security Basics",
    course: "Network Security",
    module: "Module 1",
    questionCount: 10,
    timeLimit: 30,
    status: "active",
    type: "multiple_choice",
    createdAt: "2026-01-10",
    attempts: 24,
  },
  {
    id: 2,
    title: "Web Vulnerabilities Quiz",
    course: "Web Security",
    module: "Module 2",
    questionCount: 8,
    timeLimit: 20,
    status: "active",
    type: "true_false",
    createdAt: "2026-01-15",
    attempts: 18,
  },
  {
    id: 3,
    title: "Incident Response Procedures",
    course: "Incident Response",
    module: "Module 1",
    questionCount: 12,
    timeLimit: 45,
    status: "draft",
    type: "drag_drop",
    createdAt: "2026-01-20",
    attempts: 0,
  },
  {
    id: 4,
    title: "Linux Command Line",
    course: "Introduction to Linux",
    module: "Module 3",
    questionCount: 15,
    timeLimit: 40,
    status: "active",
    type: "multiple_choice",
    createdAt: "2026-02-01",
    attempts: 31,
  },
  {
    id: 5,
    title: "Cybersecurity Fundamentals",
    course: "Introduction to Cybersecurity",
    module: "Module 1",
    questionCount: 10,
    timeLimit: 25,
    status: "draft",
    type: "true_false",
    createdAt: "2026-02-10",
    attempts: 0,
  },
];

const TYPE_LABELS = {
  multiple_choice: { label: "Multiple Choice", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  true_false:      { label: "True / False",    color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
  drag_drop:       { label: "Drag & Drop",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

const STATUS_CONFIG = {
  active: { label: "Active", color: "#4ade80", bg: "rgba(74,222,128,0.1)", icon: CheckCircle2 },
  draft:  { label: "Draft",  color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: XCircle },
};

export default function ManageQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes]     = useState(INITIAL_QUIZZES);
  const [search, setSearch]       = useState("");
  const [filterType, setFilter]   = useState("all");
  const [filterStatus, setStatus] = useState("all");
  const [confirmId, setConfirmId] = useState(null); // delete confirm

  // ── Filter + Search
  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
                        q.course.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType   === "all" || q.type   === filterType;
    const matchStatus = filterStatus === "all" || q.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // ── Toggle status active ↔ draft
  const toggleStatus = (id) => {
    setQuizzes(prev => prev.map(q =>
      q.id === id ? { ...q, status: q.status === "active" ? "draft" : "active" } : q
    ));
  };

  // ── Delete
  const handleDelete = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
    setConfirmId(null);
  };

  // ── Stats
  const total   = quizzes.length;
  const active  = quizzes.filter(q => q.status === "active").length;
  const drafts  = quizzes.filter(q => q.status === "draft").length;
  const attempts = quizzes.reduce((s, q) => s + q.attempts, 0);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        input:focus, select:focus { outline: none; border-color: #38bdf8 !important; box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }
        .row-hover:hover { background: rgba(56,189,248,0.03) !important; }
        .action-btn:hover { opacity: 0.75; }
        .quiz-row { animation: fadeUp .3s ease both; }
      `}</style>

      {/* ── Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Manage Quizzes</h1>
          <p style={S.sub}>Create and manage quizzes for your courses</p>
        </div>
        <button style={S.createBtn} onClick={() => navigate("/instructor/create-quiz")}>
          <Plus size={18} /> Create Quiz
        </button>
      </div>

      {/* ── Stat Cards */}
      <div style={S.statsRow}>
        {[
          { label: "Total Quizzes",   value: total,    color: "#38bdf8" },
          { label: "Active",          value: active,   color: "#4ade80" },
          { label: "Drafts",          value: drafts,   color: "#94a3b8" },
          { label: "Total Attempts",  value: attempts, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <p style={{ ...S.statVal, color: s.color }}>{s.value}</p>
            <p style={S.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters */}
      <div style={S.filterRow}>
        {/* Search */}
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={15} color="#475569" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes or courses…"
            style={S.searchInput}
          />
        </div>

        {/* Type filter */}
        <div style={{ position:"relative" }}>
          <Filter size={14} color="#475569" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
          <select value={filterType} onChange={e => setFilter(e.target.value)} style={S.select}>
            <option value="all">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="drag_drop">Drag &amp; Drop</option>
          </select>
        </div>

        {/* Status filter */}
        <div style={{ position:"relative" }}>
          <Filter size={14} color="#475569" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
          <select value={filterStatus} onChange={e => setStatus(e.target.value)} style={S.select}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* ── Table */}
      <div style={S.tableWrap}>
        {filtered.length === 0 ? (
          <div style={S.empty}>
            <FileQuestion size={48} color="#1e293b" style={{ marginBottom:12 }} />
            <p style={{ color:"#475569", fontSize:15, margin:0 }}>No quizzes found</p>
            <p style={{ color:"#334155", fontSize:13, marginTop:6 }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {["Quiz Title","Type","Questions","Time Limit","Attempts","Status","Actions"].map(h => (
                  <th key={h} style={{ ...S.th, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, idx) => {
                const type   = TYPE_LABELS[q.type]   || TYPE_LABELS.multiple_choice;
                const status = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
                const StatusIcon = status.icon;

                return (
                  <tr key={q.id} className="quiz-row row-hover"
                    style={{ ...S.tr, animationDelay: `${idx * 0.05}s` }}>

                    {/* Title */}
                    <td style={S.td}>
                      <p style={{ margin:0, color:"#e2e8f0", fontWeight:600, fontSize:14 }}>{q.title}</p>
                      <p style={{ margin:"3px 0 0", color:"#475569", fontSize:12 }}>{q.course} · {q.module}</p>
                    </td>

                    {/* Type badge */}
                    <td style={S.td}>
                      <span style={{ ...S.badge, color:type.color, background:type.bg }}>
                        {type.label === "Drag & Drop" && <GripVertical size={11} style={{ marginRight:3 }} />}
                        {type.label === "True / False" && <ToggleLeft size={11} style={{ marginRight:3 }} />}
                        {type.label === "Multiple Choice" && <CheckCircle2 size={11} style={{ marginRight:3 }} />}
                        {type.label}
                      </span>
                    </td>

                    {/* Questions */}
                    <td style={S.td}>
                      <span style={{ color:"#94a3b8", fontSize:14, display:"flex", alignItems:"center", gap:5 }}>
                        <FileQuestion size={14} color="#334155" /> {q.questionCount}
                      </span>
                    </td>

                    {/* Time */}
                    <td style={S.td}>
                      <span style={{ color:"#94a3b8", fontSize:14, display:"flex", alignItems:"center", gap:5 }}>
                        <Clock size={14} color="#334155" /> {q.timeLimit} min
                      </span>
                    </td>

                    {/* Attempts */}
                    <td style={S.td}>
                      <span style={{ color:"#94a3b8", fontSize:14 }}>{q.attempts}</span>
                    </td>

                    {/* Status toggle */}
                    <td style={S.td}>
                      <button onClick={() => toggleStatus(q.id)}
                        style={{ ...S.badge, cursor:"pointer", border:"none",
                          color:status.color, background:status.bg,
                          display:"inline-flex", alignItems:"center", gap:5 }}>
                        <StatusIcon size={11} />
                        {status.label}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ ...S.td, textAlign:"right" }}>
                      <div style={{ display:"flex", justifyContent:"flex-end", gap:6 }}>
                        <ActionBtn icon={Eye}   color="#38bdf8" title="View responses"
                          onClick={() => navigate(`/instructor/quizzes/${q.id}/responses`)} />
                        <ActionBtn icon={Edit2} color="#4ade80" title="Edit quiz"
                          onClick={() => navigate(`/instructor/quizzes/${q.id}/edit`)} />
                        <ActionBtn icon={Trash2} color="#f87171" title="Delete quiz"
                          onClick={() => setConfirmId(q.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Delete Confirm Modal */}
      {confirmId && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <AlertCircle size={40} color="#f87171" style={{ marginBottom:12 }} />
            <h3 style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 8px" }}>Delete Quiz?</h3>
            <p style={{ color:"#64748b", fontSize:14, margin:"0 0 24px", lineHeight:1.6 }}>
              This action cannot be undone. All student responses for this quiz will also be deleted.
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setConfirmId(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(confirmId)} style={S.deleteBtn}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, color, title, onClick }) {
  return (
    <button className="action-btn" onClick={onClick} title={title}
      style={{ background:"transparent", border:`1px solid ${color}22`,
        borderRadius:8, padding:"6px 8px", cursor:"pointer",
        display:"flex", alignItems:"center", color, transition:"opacity .2s" }}>
      <Icon size={15} />
    </button>
  );
}

const S = {
  page: { minHeight:"100vh", background:"#050810", fontFamily:"'DM Sans',sans-serif",
    padding:"32px 40px", color:"#e2e8f0" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start",
    marginBottom:28 },
  title: { fontFamily:"'JetBrains Mono',monospace", color:"#f1f5f9", fontSize:26,
    fontWeight:700, margin:"0 0 4px", letterSpacing:"-0.5px" },
  sub: { color:"#475569", fontSize:14, margin:0 },
  createBtn: { display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
    border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700,
    padding:"11px 20px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 },
  statCard: { background:"rgba(15,23,42,0.8)", border:"1px solid #1e293b", borderRadius:12,
    padding:"18px 20px", textAlign:"center" },
  statVal: { fontSize:28, fontWeight:700, margin:"0 0 4px",
    fontFamily:"'JetBrains Mono',monospace" },
  statLabel: { color:"#475569", fontSize:12, fontWeight:600, textTransform:"uppercase",
    letterSpacing:"0.8px", margin:0 },
  filterRow: { display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" },
  searchInput: { width:"100%", background:"rgba(15,23,42,0.8)", border:"1.5px solid #1e293b",
    borderRadius:10, color:"#e2e8f0", fontSize:14, padding:"10px 14px 10px 38px",
    fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s, box-shadow .2s" },
  select: { background:"rgba(15,23,42,0.8)", border:"1.5px solid #1e293b", borderRadius:10,
    color:"#94a3b8", fontSize:13, padding:"10px 14px 10px 34px", cursor:"pointer",
    fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s" },
  tableWrap: { background:"rgba(8,12,24,0.94)", border:"1px solid #1e293b",
    borderRadius:16, overflow:"hidden" },
  table: { width:"100%", borderCollapse:"collapse" },
  thead: { background:"rgba(15,23,42,0.9)", borderBottom:"1px solid #1e293b" },
  th: { padding:"14px 18px", fontSize:11, fontWeight:700, color:"#334155",
    textTransform:"uppercase", letterSpacing:"0.9px" },
  tr: { borderBottom:"1px solid #0f172a", transition:"background .15s" },
  td: { padding:"14px 18px", verticalAlign:"middle" },
  badge: { display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:700,
    padding:"4px 10px", borderRadius:20, letterSpacing:"0.4px" },
  empty: { padding:"60px 20px", textAlign:"center" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
    display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 },
  modal: { background:"#0f172a", border:"1px solid #1e293b", borderRadius:16,
    padding:"36px 32px", maxWidth:400, width:"90%", textAlign:"center" },
  cancelBtn: { background:"transparent", border:"1px solid #1e293b", borderRadius:8,
    color:"#94a3b8", fontSize:14, fontWeight:600, padding:"10px 24px",
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  deleteBtn: { background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)",
    borderRadius:8, color:"#f87171", fontSize:14, fontWeight:600, padding:"10px 24px",
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
};