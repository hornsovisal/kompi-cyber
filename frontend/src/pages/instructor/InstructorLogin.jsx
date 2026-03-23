import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield, Eye, EyeOff, AlertCircle, CheckCircle2,
  Loader2, Lock, Mail, ArrowRight, RotateCcw,
} from "lucide-react";

const OTP_EXPIRY_SECONDS = 600;

// ── Demo accounts aligned with LecturerModel
const DEMOS = [
  { email: "sarah.johnson@cadt.edu.kh", pwd: "password123", av: "SJ", name: "Dr. Sarah Johnson",   course: "Network Security" },
  { email: "michael.chen@cadt.edu.kh",  pwd: "password123", av: "MC", name: "Prof. Michael Chen",  course: "Web Security" },
  { email: "lisa.rodriguez@cadt.edu.kh",pwd: "password123", av: "LR", name: "Dr. Lisa Rodriguez",  course: "Incident Response" },
  { email: "david.kim@cadt.edu.kh",     pwd: "password123", av: "DK", name: "Mr. David Kim",       course: "Intro to Linux" },
  { email: "emma.wilson@cadt.edu.kh",   pwd: "password123", av: "EW", name: "Dr. Emma Wilson",     course: "Intro to Cybersecurity" },
];

export default function InstructorLogin() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [step, setStep]           = useState("login"); // "login" | "otp" | "success"
  const [otpDigits, setOtpDigits] = useState(["","","","","",""]);
  const [generatedOtp, setGen]    = useState("");
  const [otpExpiry, setExpiry]    = useState(null);
  const [countdown, setCd]        = useState(OTP_EXPIRY_SECONDS);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [pending, setPending]     = useState(null);
  const otpRefs                   = useRef([]);

  // ── Countdown
  useEffect(() => {
    if (step !== "otp" || !otpExpiry) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setCd(rem);
      if (rem === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [step, otpExpiry]);

  // ── LOGIN — now calls backend which uses LecturerModel
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/instructor/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, instructor } = response.data;
      // instructor = { id, name, email, department, employeeId } from LecturerModel

      setPending({ ...instructor, token });

      // LecturerModel has isVerified:true for all 5 — skip OTP, go straight to dashboard
      if (instructor.isVerified !== false) {
        loginSuccess({ ...instructor, token });
        return;
      }

      // If somehow isVerified is false — send OTP via backend
      try {
        const otpResponse = await axios.post("/api/instructor/send-otp", {
          email: instructor.email,
        });
        // For demo purposes, if in development, show the OTP
        if (otpResponse.data.otp) {
          setGen(otpResponse.data.otp);
          setExpiry(Date.now() + OTP_EXPIRY_SECONDS * 1000);
          setCd(OTP_EXPIRY_SECONDS);
          setError(`[DEV] OTP sent: ${otpResponse.data.otp}`);
        } else {
          setGen("123456"); // fallback for demo
          setExpiry(Date.now() + OTP_EXPIRY_SECONDS * 1000);
          setCd(OTP_EXPIRY_SECONDS);
        }
        setStep("otp");
      } catch (otpError) {
        setError("Failed to send verification code. Please try again.");
      }

    } catch (err) {
      // Backend returns 401 for wrong credentials, 403 for unverified
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verify — now calls backend
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError("");
    const entered = otpDigits.join("");
    if (entered.length < 6) { setError("Enter all 6 digits."); return; }
    if (countdown === 0)     { setError("Code expired. Request a new one."); return; }

    setLoading(true);
    try {
      const response = await axios.post("/api/instructor/verify-otp", {
        email: pending.email,
        otp: entered,
      });

      const { token, instructor } = response.data;
      loginSuccess({ ...instructor, token });
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect code. Please try again.");
      setOtpDigits(["","","","","",""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP — now calls backend
  const handleResend = async () => {
    setError(""); setLoading(true);
    try {
      const otpResponse = await axios.post("/api/instructor/send-otp", {
        email: pending.email,
      });
      setCd(OTP_EXPIRY_SECONDS);
      setExpiry(Date.now() + OTP_EXPIRY_SECONDS * 1000);
      setOtpDigits(["","","","","",""]);
      if (otpResponse.data.otp) {
        setGen(otpResponse.data.otp);
        setError(`[DEV] New OTP: ${otpResponse.data.otp}`);
      } else {
        setGen("123456"); // fallback
      }
      otpRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success — stores token + instructor, redirects to InstructorDashboard
  const loginSuccess = (inst) => {
    localStorage.setItem("token", inst.token);
    // Store fields InstructorDashboard.jsx reads: id, name, email, department, employeeId
    localStorage.setItem("instructor", JSON.stringify({
      id:         inst.id,
      name:       inst.name,
      email:      inst.email,
      department: inst.department,
      employeeId: inst.employeeId,
    }));
    setStep("success");
    // InstructorDashboard.jsx checks localStorage.getItem("token") on mount
    setTimeout(() => navigate("/instructor/dashboard"), 1200);
  };

  // ── OTP helpers
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const d = [...otpDigits]; d[i] = val; setOtpDigits(d);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (p.length === 6) { setOtpDigits(p.split("")); otpRefs.current[5]?.focus(); }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ─────────────────────────────────────── JSX (unchanged — keep your original UI)
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input:focus { border-color: #38bdf8 !important; box-shadow: 0 0 0 3px rgba(56,189,248,0.12); }
        button:hover:not(:disabled) { opacity: 0.88; }
        .demo-btn:hover { border-color: rgba(56,189,248,0.4) !important; background: rgba(56,189,248,0.05) !important; }
      `}</style>

      <div style={S.grid} />
      <div style={{ ...S.blob, top:"8%", left:"10%", background:"radial-gradient(circle,rgba(56,189,248,0.10) 0%,transparent 70%)" }} />
      <div style={{ ...S.blob, bottom:"12%", right:"8%", background:"radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%)" }} />

      <div style={S.card}>
        <div style={S.brand}>
          <div style={S.iconRing}><Shield size={26} color="#38bdf8" /></div>
          <div>
            <h1 style={S.brandName}>CADT</h1>
            <p style={S.brandSub}>Instructor Portal</p>
          </div>
        </div>

        {/* SUCCESS */}
        {step === "success" && (
          <div style={{ textAlign:"center", padding:"40px 0", animation:"fadeUp .4s ease" }}>
            <CheckCircle2 size={52} color="#4ade80" style={{ display:"block", margin:"0 auto 16px" }} />
            <p style={{ color:"#4ade80", fontWeight:700, fontSize:20, margin:"0 0 6px" }}>Authenticated</p>
            <p style={{ color:"#475569", fontSize:13 }}>Redirecting to dashboard…</p>
          </div>
        )}

        {/* LOGIN */}
        {step === "login" && (
          <div style={{ animation:"fadeUp .35s ease" }}>
            <div style={{ marginBottom:28 }}>
              <h2 style={S.title}>Sign in</h2>
              <p style={S.sub}>Access your instructor dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <label style={S.label}>Email Address</label>
              <div style={S.wrap}>
                <Mail size={15} color="#475569" style={S.icoLeft} />
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@cadt.edu.kh" required style={S.input} autoComplete="email" />
              </div>

              <label style={{ ...S.label, marginTop:16 }}>Password</label>
              <div style={S.wrap}>
                <Lock size={15} color="#475569" style={S.icoLeft} />
                <input type={showPwd?"text":"password"} value={password}
                  onChange={e=>setPassword(e.target.value)} placeholder="••••••••••"
                  required style={{ ...S.input, paddingRight:44 }} autoComplete="current-password" />
                <button type="button" onClick={()=>setShowPwd(v=>!v)} style={S.eyeBtn} tabIndex={-1}>
                  {showPwd ? <EyeOff size={15} color="#475569"/> : <Eye size={15} color="#475569"/>}
                </button>
              </div>

              {error && <ErrBanner msg={error} />}

              <button type="submit" disabled={loading} style={S.submitBtn}>
                {loading
                  ? <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                  : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>

            {/* Demo accounts — aligned with LecturerModel */}
            <div style={S.demoBox}>
              <p style={S.demoLabel}>Quick Fill — Demo Accounts</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {DEMOS.map(d => (
                  <button key={d.email} className="demo-btn"
                    style={S.demoBtn} onClick={()=>{ setEmail(d.email); setPassword(d.pwd); }}>
                    <span style={S.av}>{d.av}</span>
                    <div style={{ textAlign:"left" }}>
                      <p style={{ margin:0, color:"#94a3b8", fontSize:12, fontWeight:600 }}>{d.name}</p>
                      <p style={{ margin:0, color:"#475569", fontSize:11 }}>{d.course}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ color:"#334155", fontSize:11, textAlign:"center", marginTop:10 }}>
                🔑 Password: <span style={{ fontFamily:"monospace", color:"#38bdf8" }}>password123</span>
              </p>
            </div>
          </div>
        )}

        {/* OTP */}
        {step === "otp" && (
          <div style={{ animation:"fadeUp .35s ease" }}>
            <div style={{ marginBottom:28 }}>
              <h2 style={S.title}>Verify email</h2>
              <p style={S.sub}>
                A 6-digit code was sent to<br />
                <span style={{ color:"#38bdf8", fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{pending?.email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpVerify}>
              <div style={S.otpRow} onPaste={handlePaste}>
                {otpDigits.map((d,i) => (
                  <input key={i} ref={el=>otpRefs.current[i]=el}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e=>handleOtpChange(i,e.target.value)}
                    onKeyDown={e=>handleOtpKey(i,e)}
                    autoFocus={i===0}
                    style={{ ...S.otpBox, borderColor:d?"#38bdf8":"#1e293b", color:d?"#38bdf8":"#475569" }} />
                ))}
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:countdown>60?"#475569":"#f87171", fontSize:13 }}>
                  Expires in {fmt(countdown)}
                </span>
                <button type="button" onClick={handleResend} disabled={loading||countdown>540} style={S.resend}>
                  <RotateCcw size={12} /> Resend
                </button>
              </div>

              {error && <ErrBanner msg={error} />}

              <button type="submit" disabled={loading||otpDigits.join("").length<6} style={S.submitBtn}>
                {loading
                  ? <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                  : <><span>Verify Code</span><ArrowRight size={16} /></>}
              </button>

              <button type="button" onClick={()=>{setStep("login");setError("");setOtpDigits(["","","","","",""]);}} style={S.back}>
                ← Back to login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrBanner({ msg }) {
  return (
    <div style={{ marginTop:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
      borderRadius:8, padding:"10px 14px", display:"flex", gap:8, color:"#fca5a5", fontSize:13, lineHeight:1.5,
      alignItems:"flex-start" }}>
      <AlertCircle size={14} color="#f87171" style={{ flexShrink:0, marginTop:2 }} />
      <span>{msg}</span>
    </div>
  );
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const S = {
  page: { minHeight:"100vh", background:"#050810", display:"flex", alignItems:"center",
    justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24,
    position:"relative", overflow:"hidden" },
  grid: { position:"absolute", inset:0, pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(56,189,248,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.035) 1px,transparent 1px)",
    backgroundSize:"44px 44px" },
  blob: { position:"absolute", width:500, height:500, borderRadius:"50%", pointerEvents:"none" },
  card: { background:"rgba(8,12,24,0.94)", backdropFilter:"blur(24px)",
    border:"1px solid rgba(56,189,248,0.13)", borderRadius:20, padding:"40px 36px",
    width:"100%", maxWidth:440, position:"relative",
    boxShadow:"0 0 100px rgba(56,189,248,0.04), 0 24px 60px rgba(0,0,0,0.7)" },
  brand: { display:"flex", alignItems:"center", gap:14, marginBottom:32 },
  iconRing: { width:50, height:50, borderRadius:13, border:"1.5px solid rgba(56,189,248,0.35)",
    background:"rgba(56,189,248,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  brandName: { fontFamily:"'JetBrains Mono',monospace", color:"#f1f5f9", fontSize:19,
    fontWeight:700, margin:0, letterSpacing:"-0.5px" },
  brandSub: { color:"#38bdf8", fontSize:10, fontWeight:700, margin:"2px 0 0",
    textTransform:"uppercase", letterSpacing:"1.8px" },
  title: { color:"#f1f5f9", fontSize:26, fontWeight:700, margin:"0 0 6px", letterSpacing:"-0.4px" },
  sub: { color:"#64748b", fontSize:14, margin:0, lineHeight:1.6 },
  label: { display:"block", color:"#64748b", fontSize:11, fontWeight:600, marginBottom:7,
    textTransform:"uppercase", letterSpacing:"0.9px" },
  wrap: { position:"relative", display:"flex", alignItems:"center" },
  icoLeft: { position:"absolute", left:13, pointerEvents:"none" },
  input: { width:"100%", background:"rgba(15,23,42,0.8)", border:"1.5px solid #1e293b",
    borderRadius:10, color:"#e2e8f0", fontSize:14, padding:"12px 14px 12px 40px",
    outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif",
    transition:"border-color .2s, box-shadow .2s" },
  eyeBtn: { position:"absolute", right:11, background:"none", border:"none",
    cursor:"pointer", padding:4, display:"flex", alignItems:"center" },
  submitBtn: { marginTop:22, background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
    border:"none", borderRadius:10, color:"#fff", fontSize:15, fontWeight:700,
    padding:"13px", cursor:"pointer", display:"flex", alignItems:"center",
    justifyContent:"center", gap:8, width:"100%", fontFamily:"'DM Sans',sans-serif",
    letterSpacing:"0.2px", transition:"opacity .2s" },
  back: { marginTop:10, background:"none", border:"none", color:"#475569",
    fontSize:13, cursor:"pointer", padding:"8px 0", width:"100%",
    textAlign:"center", fontFamily:"'DM Sans',sans-serif" },
  demoBox: { marginTop:28, borderTop:"1px solid #0f172a", paddingTop:20 },
  demoLabel: { color:"#334155", fontSize:10, fontWeight:700, textTransform:"uppercase",
    letterSpacing:"1.2px", marginBottom:10 },
  demoBtn: { background:"rgba(15,23,42,0.5)", border:"1px solid #1e293b",
    borderRadius:8, padding:"8px 12px", cursor:"pointer", display:"flex",
    alignItems:"center", gap:10, width:"100%", transition:"border-color .2s, background .2s" },
  av: { width:28, height:28, borderRadius:6, background:"rgba(56,189,248,0.12)",
    border:"1px solid rgba(56,189,248,0.25)", color:"#38bdf8", fontSize:9,
    fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0, fontFamily:"'JetBrains Mono',monospace" },
  otpRow: { display:"flex", gap:8, justifyContent:"center", marginBottom:18 },
  otpBox: { width:50, height:58, background:"rgba(15,23,42,0.8)", border:"1.5px solid #1e293b",
    borderRadius:10, textAlign:"center", fontSize:22, fontWeight:700,
    fontFamily:"'JetBrains Mono',monospace", outline:"none",
    transition:"border-color .2s, color .2s", caretColor:"#38bdf8" },
  resend: { background:"none", border:"none", color:"#38bdf8", fontSize:12,
    cursor:"pointer", display:"flex", alignItems:"center", gap:4,
    fontFamily:"'DM Sans',sans-serif", fontWeight:600 },
};