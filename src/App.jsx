
import { useState, useEffect, useRef, useCallback } from "react";

// ── Google Fonts ──────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');`;

// ── Typed text hook ───────────────────────────────────────────────
function useTyped(words, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[wIdx % words.length];
    const t = setTimeout(() => {
      if (!del) {
        setDisplay(word.slice(0, cIdx + 1));
        if (cIdx + 1 === word.length) setTimeout(() => setDel(true), pause);
        else setCIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, cIdx - 1));
        if (cIdx - 1 === 0) { setDel(false); setCIdx(0); setWIdx(w => w + 1); }
        else setCIdx(c => c - 1);
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [cIdx, del, wIdx, words, speed, pause]);
  return display;
}

// ── Intersection observer ─────────────────────────────────────────
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1, ...opts });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Smooth counter hook ───────────────────────────────────────────
function useCounter(target, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf, startTime;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const pct = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(ease * target));
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// ── Particles background ──────────────────────────────────────────
function Particles({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.5 + 0.15
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `rgba(56,189,248,${p.a})` : `rgba(14,165,233,${p.a * 0.6})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = dark ? `rgba(56,189,248,${0.07 * (1 - d / 110)})` : `rgba(14,165,233,${0.05 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Skill ring ────────────────────────────────────────────────────
function SkillRing({ name, pct, icon, dark, delay = 0 }) {
  const [ref, inView] = useInView();
  const r = 38, circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { if (inView) setTimeout(() => setAnimated(true), delay); }, [inView, delay]);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: inView ? 1 : 0, transform: inView ? "scale(1)" : "scale(0.85)", transition: `all 0.5s ease ${delay}ms` }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke={dark ? "#1e293b" : "#e2e8f0"} strokeWidth="7" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="url(#skillGrad)" strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
          <defs>
            <linearGradient id="skillGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9" }}>{animated ? pct : 0}%</span>
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#475569", textAlign: "center", maxWidth: 80, lineHeight: 1.3 }}>{name}</span>
    </div>
  );
}

// ── Animated bar ──────────────────────────────────────────────────
function Bar({ name, pct, dark, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ marginBottom: 16, opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-20px)", transition: `all 0.5s ease ${delay}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600, color: dark ? "#94a3b8" : "#475569" }}>
        <span>{name}</span><span style={{ color: "#0ea5e9" }}>{pct}%</span>
      </div>
      <div style={{ background: dark ? "#1e293b" : "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{
          width: inView ? `${pct}%` : "0%", height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg,#0284c7,#0ea5e9,#38bdf8)",
          boxShadow: "0 0 10px rgba(14,165,233,.4)",
          transition: `width 1.2s cubic-bezier(.4,0,.2,1) ${delay}ms`
        }} />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ id, title, subtitle, children, dark }) {
  const [ref, inView] = useInView();
  return (
    <section id={id} ref={ref} style={{ padding: "100px 0 70px", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: "all 0.7s ease" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: 99, background: "rgba(14,165,233,.1)", border: "1px solid rgba(14,165,233,.2)", color: "#0ea5e9", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14 }}>{title}</span>
          {subtitle && <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontFamily: "'Outfit',sans-serif", fontWeight: 800, margin: 0, color: dark ? "#f1f5f9" : "#0f172a", letterSpacing: "-1px" }}>{subtitle}</h2>}
          <div style={{ width: 48, height: 3, background: "linear-gradient(90deg,#0ea5e9,#38bdf8)", borderRadius: 99, margin: "18px auto 0" }} />
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Glass card ────────────────────────────────────────────────────
function GlassCard({ children, dark, style = {}, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: dark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hover ? "rgba(14,165,233,.4)" : dark ? "rgba(30,41,59,0.8)" : "rgba(226,232,240,0.8)"}`,
        borderRadius: 20, padding: "28px",
        boxShadow: hover ? "0 24px 60px rgba(14,165,233,.15), 0 0 0 1px rgba(14,165,233,.1)" : dark ? "0 4px 20px rgba(0,0,0,.5)" : "0 4px 20px rgba(0,0,0,.07)",
        transform: hover ? "translateY(-5px)" : "none",
        transition: "all .35s cubic-bezier(.4,0,.2,1)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >{children}</div>
  );
}

// ── Tag ───────────────────────────────────────────────────────────
function Tag({ label, dark }) {
  return <span style={{ display: "inline-block", padding: "5px 13px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: dark ? "rgba(14,165,233,.12)" : "rgba(14,165,233,.08)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,.2)", marginRight: 7, marginBottom: 7 }}>{label}</span>;
}

// ── Timeline item ─────────────────────────────────────────────────
function TimelineItem({ year, degree, inst, score, dark, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ display: "flex", gap: 20, marginBottom: 28, opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-30px)", transition: `all 0.5s ease ${delay}ms` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#0ea5e9", flexShrink: 0, boxShadow: "0 0 10px rgba(14,165,233,.5)" }} />
        <div style={{ width: 2, height: "100%", background: dark ? "#1e293b" : "#e2e8f0", minHeight: 30 }} />
      </div>
      <div style={{ paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: dark ? "#f1f5f9" : "#0f172a", fontFamily: "'Outfit',sans-serif" }}>{degree}</span>
          <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "rgba(14,165,233,.1)", color: "#0ea5e9" }}>{year}</span>
        </div>
        <div style={{ fontSize: 13, color: dark ? "#64748b" : "#94a3b8", marginTop: 3 }}>{inst}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9", marginTop: 4 }}>{score}</div>
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────
function ProjectCard({ title, desc, tags, emoji, color, github, live, dark, delay = 0 }) {
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)", transition: `all 0.5s ease ${delay}ms` }}>
      <GlassCard dark={dark} style={{ height: "100%", overflow: "hidden", padding: 0 }}>
        {/* Banner */}
        <div style={{ height: 160, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: hover ? "rgba(0,0,0,.1)" : "transparent", transition: "background .3s" }} />
          <span style={{ position: "relative", zIndex: 1, filter: hover ? "drop-shadow(0 0 20px rgba(255,255,255,.4))" : "none", transition: "filter .3s", transform: hover ? "scale(1.15)" : "scale(1)", transition: "all .3s" }}>{emoji}</span>
          <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,.3)", backdropFilter: "blur(6px)", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>FEATURED</div>
        </div>
        <div style={{ padding: "22px 24px 24px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", fontFamily: "'Outfit',sans-serif" }}>{title}</h3>
          <p style={{ fontSize: 14, color: dark ? "#94a3b8" : "#475569", lineHeight: 1.75, margin: "0 0 16px" }}>{desc}</p>
          <div style={{ marginBottom: 20 }}>{tags.map(t => <Tag key={t} label={t} dark={dark} />)}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={github} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, textAlign: "center", textDecoration: "none", padding: "9px 0", borderRadius: 12,
              border: `1px solid ${dark ? "rgba(30,41,59,.8)" : "#e2e8f0"}`, fontSize: 13, fontWeight: 700, color: dark ? "#94a3b8" : "#475569", transition: "all .2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.currentTarget.style.color = dark ? "#94a3b8" : "#475569"; }}
            >⭐ GitHub</a>
            <a href={live} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, textAlign: "center", textDecoration: "none", padding: "9px 0", borderRadius: 12,
              background: "linear-gradient(135deg,#0284c7,#0ea5e9)", color: "#fff", fontSize: 13, fontWeight: 700, transition: "all .2s",
              boxShadow: "0 4px 14px rgba(14,165,233,.3)"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(14,165,233,.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,.3)"; }}
            >🚀 Live Demo</a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, suffix = "", dark, start }) {
  const num = useCounter(value, 1800, start);
  return (
    <GlassCard dark={dark} style={{ textAlign: "center", padding: "24px 20px" }}>
      <div style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "#0ea5e9", fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>{num}{suffix}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#64748b" : "#94a3b8", marginTop: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</div>
    </GlassCard>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactMode, setContactMode] = useState("email"); // "email" | "sms"
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHover, setCursorHover] = useState(false);
  const statsRef = useRef(null);
  const typed = useTyped(["MCA Student", "Python Developer", "Django Developer", "Problem Solver", "Future IT Pro"]);

  // Cursor tracker
  useEffect(() => {
    const move = e => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Stats observer
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsInView(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      const ids = ["home", "about", "skills", "projects", "contact"];
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 140) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bg = dark ? "#020917" : "#f0f4f8";
  const text = dark ? "#cbd5e1" : "#334155";

  const navLinks = [
    { href: "#home", label: "Home", id: "home" },
    { href: "#about", label: "About", id: "about" },
    { href: "#skills", label: "Skills", id: "skills" },
    { href: "#projects", label: "Projects", id: "projects" },
    { href: "#contact", label: "Contact", id: "contact" },
  ];

  function handleContact(e) {
    e.preventDefault();
    if (!form.message) return;
    if (contactMode === "sms") {
      const smsBody = encodeURIComponent(`Hi Avanish! I'm ${form.name}.\n\n${form.message}`);
      window.open(`sms:+919294583276?body=${smsBody}`);
    } else {
      const subject = encodeURIComponent(`Portfolio Inquiry from ${form.name}`);
      const body = encodeURIComponent(`Hi Avanish,\n\n${form.message}\n\nBest,\n${form.name}\n${form.email}`);
      window.open(`mailto:avanishtiwari787@gmail.com?subject=${subject}&body=${body}`);
    }
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  }

  const inputCls = {
    width: "100%", padding: "13px 18px", borderRadius: 14,
    border: `1.5px solid ${dark ? "rgba(30,41,59,.8)" : "#e2e8f0"}`,
    background: dark ? "rgba(15,23,42,.7)" : "rgba(255,255,255,.9)",
    color: dark ? "#f1f5f9" : "#0f172a", fontSize: 15, outline: "none",
    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "border .2s, box-shadow .2s",
    backdropFilter: "blur(10px)", boxSizing: "border-box",
  };

  const techSkills = [
    { name: "Python", pct: 82, icon: "🐍" }, { name: "Django", pct: 80, icon: "🌐" },
    { name: "Java", pct: 72, icon: "☕" }, { name: "C", pct: 68, icon: "⚙️" },
    { name: "MySQL", pct: 78, icon: "🗄️" }, { name: "DSA", pct: 75, icon: "🔄" },
  ];
  const softSkills = [
    { name: "Effective Communication", pct: 88 }, { name: "Team Collaboration", pct: 85 },
    { name: "Analytical Thinking", pct: 90 }, { name: "Time Management", pct: 82 },
    { name: "Willingness to Learn", pct: 95 },
  ];

  return (
    <div style={{ background: bg, color: text, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "background .4s,color .4s", overflow: "hidden" }}
      onMouseEnter={() => setCursorHover(false)}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatR { 0%,100%{transform:translateY(0) rotate(12deg)} 50%{transform:translateY(-10px) rotate(12deg)} }
        @keyframes blink { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
        @keyframes ripple { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes morphBg { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(14,165,233,.3)} 50%{box-shadow:0 0 40px rgba(14,165,233,.6),0 0 80px rgba(14,165,233,.2)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#0284c7,#38bdf8); border-radius: 99px; }
        .cursor-dot { pointer-events:none; position:fixed; z-index:9999; width:8px; height:8px; background:#0ea5e9; border-radius:50%; transform:translate(-50%,-50%); transition:transform .1s; mix-blend-mode:screen; }
        .cursor-ring { pointer-events:none; position:fixed; z-index:9998; width:36px; height:36px; border:1.5px solid rgba(14,165,233,.5); border-radius:50%; transform:translate(-50%,-50%); transition:all .15s ease; mix-blend-mode:screen; }
        .cursor-ring.hovered { width:52px; height:52px; border-color:#0ea5e9; background:rgba(14,165,233,.05); }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:50%; right:50%; height:2px; background:#0ea5e9; border-radius:99px; transition:all .25s; }
        .nav-link.active::after, .nav-link:hover::after { left:0; right:0; }
        .shimmer-text { background: linear-gradient(90deg, #0ea5e9 0%, #38bdf8 40%, #7dd3fc 50%, #38bdf8 60%, #0ea5e9 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .glass-btn { backdrop-filter: blur(12px); }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>

      {/* Custom cursor */}
      <div className="cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className={`cursor-ring ${cursorHover ? "hovered" : ""}`} style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? (dark ? "rgba(2,9,23,.85)" : "rgba(240,244,248,.85)") : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${dark ? "rgba(30,41,59,.6)" : "rgba(226,232,240,.8)"}` : "none",
        transition: "all .4s",
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <a href="#home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
            onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0284c7,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 12px rgba(14,165,233,.4)" }}>AT</div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: dark ? "#f1f5f9" : "#0f172a" }}>Avanish<span style={{ color: "#0ea5e9" }}>.</span></span>
          </a>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {navLinks.map(n => (
              <a key={n.id} href={n.href} className={`nav-link${active === n.id ? " active" : ""}`}
                onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
                style={{ textDecoration: "none", padding: "7px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: active === n.id ? "#0ea5e9" : (dark ? "#94a3b8" : "#475569"), transition: "color .2s" }}
              >{n.label}</a>
            ))}
            {/* Dark mode toggle */}
            <button onClick={() => setDark(!dark)} style={{
              marginLeft: 10, width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
              background: dark ? "#0ea5e9" : "#cbd5e1", position: "relative", transition: "background .3s",
              boxShadow: dark ? "0 0 12px rgba(14,165,233,.4)" : "none"
            }}>
              <span style={{ position: "absolute", top: 3, left: dark ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .3s", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{dark ? "🌙" : "☀️"}</span>
            </button>
            {/* Resume download */}
            <a href="https://drive.google.com/uc?export=download&id=Avanish_Resume" download="Avanish_Tiwari_Resume.pdf"
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
              style={{ marginLeft: 10, textDecoration: "none", padding: "8px 18px", borderRadius: 12, background: "linear-gradient(135deg,#0284c7,#0ea5e9)", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(14,165,233,.35)", transition: "all .2s" }}
              onMouseEnter={e => { setCursorHover(true); e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(14,165,233,.5)"; }}
              onMouseLeave={e => { setCursorHover(false); e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,.35)"; }}
            >↓ Resume</a>
          </div>

          {/* Mobile menu btn */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}
            style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 22, height: 2, background: dark ? "#94a3b8" : "#475569", borderRadius: 99, transition: "all .3s", transform: mobileMenu && i === 0 ? "rotate(45deg) translate(5px,5px)" : mobileMenu && i === 2 ? "rotate(-45deg) translate(5px,-5px)" : mobileMenu && i === 1 ? "scaleX(0)" : "none" }} />)}
          </button>
        </div>
        {/* Mobile nav */}
        {mobileMenu && (
          <div style={{ padding: "12px 28px 20px", borderTop: `1px solid ${dark ? "rgba(30,41,59,.5)" : "#e2e8f0"}`, animation: "slideDown .2s ease", background: dark ? "rgba(2,9,23,.95)" : "rgba(240,244,248,.95)", backdropFilter: "blur(20px)" }}>
            {navLinks.map(n => <a key={n.id} href={n.href} onClick={() => setMobileMenu(false)} style={{ display: "block", padding: "12px 0", textDecoration: "none", fontWeight: 600, fontSize: 15, color: active === n.id ? "#0ea5e9" : (dark ? "#94a3b8" : "#475569"), borderBottom: `1px solid ${dark ? "rgba(30,41,59,.4)" : "#f1f5f9"}` }}>{n.label}</a>)}
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {/* Animated mesh background */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Particles dark={dark} />
          <div style={{ position: "absolute", top: "8%", left: "5%", width: 500, height: 500, borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%", background: dark ? "rgba(14,165,233,.04)" : "rgba(14,165,233,.03)", animation: "morphBg 12s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "3%", width: 350, height: 350, borderRadius: "40% 60% 70% 30%/40% 50% 60% 50%", background: dark ? "rgba(56,189,248,.03)" : "rgba(56,189,248,.025)", animation: "morphBg 15s ease-in-out infinite reverse" }} />
        </div>

        <div style={{ textAlign: "center", padding: "0 28px", position: "relative", zIndex: 1, maxWidth: 760 }}>
          {/* Availability badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 99, background: dark ? "rgba(15,23,42,.8)" : "rgba(255,255,255,.8)", border: "1px solid rgba(14,165,233,.3)", backdropFilter: "blur(12px)", marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "glow 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#94a3b8" : "#475569" }}>Open to opportunities • Indore, MP</span>
          </div>

          {/* Avatar */}
          <div style={{ margin: "0 auto 28px", width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#0284c7,#0ea5e9,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "#fff", fontFamily: "'Outfit',sans-serif", animation: "float 5s ease-in-out infinite, glow 3s ease-in-out infinite", position: "relative" }}>
            AT
            <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(14,165,233,.3)", animation: "ripple 2s ease-out infinite" }} />
            <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1.5px solid rgba(14,165,233,.15)", animation: "ripple 2s ease-out .5s infinite" }} />
          </div>

          <h1 style={{ fontSize: "clamp(42px,7vw,84px)", fontFamily: "'Outfit',sans-serif", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.05, letterSpacing: "-2.5px", color: dark ? "#f1f5f9" : "#0f172a" }}>
            Avanish Tiwari
          </h1>

          {/* Typing */}
          <div style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: "#0ea5e9", marginBottom: 22, height: 40, fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
            <span className="shimmer-text">{typed}</span>
            <span style={{ display: "inline-block", width: 3, height: "1.1em", background: "#0ea5e9", borderRadius: 2, verticalAlign: "text-bottom", animation: "blink 1s step-start infinite", marginLeft: 2 }} />
          </div>

          <p style={{ maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.8, fontSize: 16, color: dark ? "#94a3b8" : "#64748b" }}>
            Aspiring IT professional • Building scalable web apps with <strong style={{ color: "#0ea5e9" }}>Python & Django</strong> • Passionate about clean code and elegant, impactful solutions.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
            <a href="#projects"
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
              style={{ textDecoration: "none", padding: "14px 32px", borderRadius: 14, fontWeight: 700, fontSize: 16, color: "#fff", background: "linear-gradient(135deg,#0284c7,#0ea5e9)", boxShadow: "0 6px 28px rgba(14,165,233,.45)", transition: "all .25s" }}
              onMouseEnter={e => { setCursorHover(true); e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(14,165,233,.6)"; }}
              onMouseLeave={e => { setCursorHover(false); e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(14,165,233,.45)"; }}
            >🚀 View My Work</a>
            <a href="https://drive.google.com/uc?export=download&id=Avanish_Resume" download="Avanish_Tiwari_Resume.pdf"
              onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
              style={{ textDecoration: "none", padding: "14px 32px", borderRadius: 14, fontWeight: 700, fontSize: 16, color: dark ? "#f1f5f9" : "#0f172a", background: dark ? "rgba(15,23,42,.8)" : "rgba(255,255,255,.9)", border: `1.5px solid ${dark ? "rgba(30,41,59,.8)" : "#e2e8f0"}`, backdropFilter: "blur(12px)", transition: "all .25s" }}
              onMouseEnter={e => { setCursorHover(true); e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { setCursorHover(false); e.currentTarget.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.currentTarget.style.color = dark ? "#f1f5f9" : "#0f172a"; e.currentTarget.style.transform = "none"; }}
            >📄 Download Resume</a>
          </div>

          {/* Socials */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            {[
              { label: "LinkedIn", href: "https://linkedin.com/in/avanish-tiwari", icon: "🔗" },
              { label: "GitHub", href: "https://github.com/avanish-tiwari", icon: "🐙" },
              { label: "Instagram", href: "https://instagram.com/avanish_tiwari", icon: "📸" },
              { label: "Email", href: "mailto:avanishtiwari787@gmail.com", icon: "✉️" },
              { label: "Phone / SMS", href: "tel:+919294583276", icon: "📱" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
                style={{
                  width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  background: dark ? "rgba(15,23,42,.8)" : "rgba(255,255,255,.9)", border: `1.5px solid ${dark ? "rgba(30,41,59,.8)" : "#e2e8f0"}`,
                  fontSize: 18, textDecoration: "none", transition: "all .25s", backdropFilter: "blur(12px)",
                }}
                onMouseEnter={e => { setCursorHover(true); e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(14,165,233,.25)"; }}
                onMouseLeave={e => { setCursorHover(false); e.currentTarget.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >{s.icon}</a>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>Scroll Down</span>
          <div style={{ width: 20, height: 32, borderRadius: 10, border: `1.5px solid ${dark ? "#334155" : "#94a3b8"}`, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5px 0" }}>
            <div style={{ width: 4, height: 8, borderRadius: 99, background: "#0ea5e9", animation: "float 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────── */}
      <Section id="about" title="About Me" subtitle="Who I Am" dark={dark}>
        {/* Stats */}
        <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 40 }}>
          <StatCard label="Projects Built" value={1} suffix="+" dark={dark} start={statsInView} />
          <StatCard label="CGPA (B.Sc)" value={74} suffix="%" dark={dark} start={statsInView} />
          <StatCard label="MCA Score" value={72} suffix="%" dark={dark} start={statsInView} />
          <StatCard label="Skills" value={6} suffix="+" dark={dark} start={statsInView} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, marginBottom: 24 }}>
          <GlassCard dark={dark}>
            <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", fontFamily: "'Outfit',sans-serif" }}>🎯 Objective</h3>
            <p style={{ lineHeight: 1.85, color: dark ? "#94a3b8" : "#475569", fontSize: 14 }}>
              Aspiring IT professional pursuing MCA with a solid foundation in programming, data structures, and problem-solving. Seeking an entry-level opportunity to apply technical skills, contribute to innovative projects, and grow within a dynamic IT organization.
            </p>
          </GlassCard>
          <GlassCard dark={dark}>
            <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a", fontFamily: "'Outfit',sans-serif" }}>📚 Education</h3>
            <TimelineItem degree="MCA" inst="IPS Academy, Indore" year="Pursuing" score="72.65% (Till 2nd Sem)" dark={dark} delay={0} />
            <TimelineItem degree="B.Sc" inst="MCBU Chhatarpur" year="2024" score="7.4 CGPA" dark={dark} delay={100} />
            <TimelineItem degree="12th" inst="MP Board" year="2021" score="74%" dark={dark} delay={200} />
            <TimelineItem degree="10th" inst="MP Board" year="2019" score="71%" dark={dark} delay={300} />
          </GlassCard>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {[
            { icon: "📍", label: "Location", val: "Indore, Madhya Pradesh" },
            { icon: "🎓", label: "Degree", val: "MCA (Pursuing)" },
            { icon: "📧", label: "Email", val: "avanishtiwari787@gmail.com" },
            { icon: "📱", label: "Phone", val: "+91 9294583276" },
          ].map((item, i) => (
            <div key={item.label} style={{ opacity: 1 }}>
              <GlassCard dark={dark} style={{ padding: "20px 22px" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0ea5e9", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 5 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f1f5f9" : "#0f172a", lineHeight: 1.4 }}>{item.val}</div>
              </GlassCard>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SKILLS ──────────────────────────────────────────────── */}
      <Section id="skills" title="My Skills" subtitle="What I Know" dark={dark}>
        {/* Skill rings */}
        <GlassCard dark={dark} style={{ marginBottom: 28, padding: "36px 28px" }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 30, textAlign: "center" }}>⚙️ Technical Proficiency</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center" }}>
            {techSkills.map((s, i) => <SkillRing key={s.name} name={s.name} pct={s.pct} icon={s.icon} dark={dark} delay={i * 100} />)}
          </div>
        </GlassCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          <GlassCard dark={dark}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 22 }}>🤝 Soft Skills</h3>
            {softSkills.map((s, i) => <Bar key={s.name} name={s.name} pct={s.pct} dark={dark} delay={i * 80} />)}
          </GlassCard>
          <GlassCard dark={dark}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 18 }}>🛠️ Tech Stack</h3>
            <p style={{ fontSize: 13, color: dark ? "#64748b" : "#94a3b8", marginBottom: 18, lineHeight: 1.6 }}>Technologies I work with on a regular basis:</p>
            <div>
              {["Python", "Django", "Java", "C", "MySQL", "HTML/CSS", "DSA", "OOPs", "Git", "REST APIs", "JavaScript", "Bootstrap"].map(t => <Tag key={t} label={t} dark={dark} />)}
            </div>
            <div style={{ marginTop: 24, padding: "16px 18px", borderRadius: 14, background: dark ? "rgba(14,165,233,.06)" : "rgba(14,165,233,.04)", border: "1px solid rgba(14,165,233,.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0ea5e9", marginBottom: 8, letterSpacing: "1px" }}>CURRENTLY LEARNING</div>
              <div>{["React.js", "Docker", "AWS Basics", "Machine Learning"].map(t => <Tag key={t} label={t} dark={dark} />)}</div>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* ── PROJECTS ────────────────────────────────────────────── */}
      <Section id="projects" title="Projects" subtitle="What I've Built" dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}>
          <ProjectCard
            title="Student Placement Tracking System"
            desc="A full-stack web-based placement management system built with Python (Django). Features secure authentication, student and company data management, and analytical dashboards with placement insights and report generation."
            tags={["Python", "Django", "SQL", "HTML/CSS", "JavaScript"]}
            emoji="🎓"
            color="linear-gradient(135deg,#0284c7,#0ea5e9,#38bdf8)"
            github="https://github.com/avanish-tiwari"
            live="#"
            dark={dark}
            delay={0}
          />
          {/* Upcoming card */}
          <div style={{ opacity: 1 }}>
            <GlassCard dark={dark} style={{ height: "100%", minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${dark ? "rgba(30,41,59,.8)" : "#e2e8f0"}`, background: "transparent", boxShadow: "none" }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: "float 4s ease-in-out infinite" }}>✨</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: dark ? "#475569" : "#94a3b8", marginBottom: 10, textAlign: "center" }}>Next Project Loading...</h3>
              <p style={{ textAlign: "center", color: dark ? "#334155" : "#cbd5e1", fontSize: 13, lineHeight: 1.7, maxWidth: 220 }}>Currently brainstorming. Check back soon for something amazing!</p>
              <a href="#contact" style={{ marginTop: 20, textDecoration: "none", padding: "9px 22px", borderRadius: 12, background: "rgba(14,165,233,.08)", color: "#0ea5e9", fontWeight: 700, fontSize: 13, border: "1px solid rgba(14,165,233,.2)", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(14,165,233,.08)"; }}
              >💬 Suggest an Idea</a>
            </GlassCard>
          </div>
        </div>
      </Section>

      {/* ── CONTACT ─────────────────────────────────────────────── */}
      <Section id="contact" title="Contact" subtitle="Get In Touch" dark={dark}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 32 }}>
          {/* Left info */}
          <div>
            <GlassCard dark={dark} style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, color: dark ? "#f1f5f9" : "#0f172a", marginBottom: 12 }}>Let's Connect 👋</h3>
              <p style={{ fontSize: 14, color: dark ? "#94a3b8" : "#475569", lineHeight: 1.8, marginBottom: 22 }}>
                Open to entry-level roles, internships, and freelance projects. Whether you have an opportunity, a project, or just want to say hi — reach out!
              </p>
              {[
                { icon: "📧", label: "Email", val: "avanishtiwari787@gmail.com", href: "mailto:avanishtiwari787@gmail.com" },
                { icon: "📱", label: "Phone / SMS", val: "+91 9294583276", href: "tel:+919294583276" },
                { icon: "💬", label: "WhatsApp", val: "+91 9294583276", href: "https://wa.me/919294583276?text=Hi%20Avanish!" },
                { icon: "🔗", label: "LinkedIn", val: "linkedin.com/in/avanish-tiwari", href: "https://linkedin.com/in/avanish-tiwari" },
              ].map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                  onMouseEnter={() => setCursorHover(true)} onMouseLeave={() => setCursorHover(false)}
                  style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, textDecoration: "none", padding: "10px 14px", borderRadius: 12, background: dark ? "rgba(30,41,59,.4)" : "rgba(241,245,249,.8)", border: `1px solid ${dark ? "rgba(30,41,59,.6)" : "#e2e8f0"}`, transition: "all .2s" }}
                  onMouseEnter={e => { setCursorHover(true); e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { setCursorHover(false); e.currentTarget.style.borderColor = dark ? "rgba(30,41,59,.6)" : "#e2e8f0"; e.currentTarget.style.transform = "none"; }}
                >
                  <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#0ea5e9", letterSpacing: "1px", textTransform: "uppercase" }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#475569" }}>{item.val}</div>
                  </div>
                </a>
              ))}
            </GlassCard>

            {/* Quick action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <a href="https://wa.me/919294583276?text=Hi%20Avanish!%20I%20found%20your%20portfolio" target="_blank" rel="noopener noreferrer" style={{
                textDecoration: "none", padding: "12px", borderRadius: 14, background: "#25D366", color: "#fff",
                fontWeight: 700, fontSize: 13, textAlign: "center", transition: "all .2s", boxShadow: "0 4px 14px rgba(37,211,102,.3)"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(37,211,102,.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,.3)"; }}
              >💬 WhatsApp</a>
              <a href="sms:+919294583276?body=Hi%20Avanish!%20I%20saw%20your%20portfolio" style={{
                textDecoration: "none", padding: "12px", borderRadius: 14, background: "linear-gradient(135deg,#5856D6,#007AFF)", color: "#fff",
                fontWeight: 700, fontSize: 13, textAlign: "center", transition: "all .2s", boxShadow: "0 4px 14px rgba(0,122,255,.3)"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(0,122,255,.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,122,255,.3)"; }}
              >📱 Send SMS</a>
            </div>
          </div>

          {/* Contact form */}
          <GlassCard dark={dark}>
            <div style={{ marginBottom: 20 }}>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 0, marginBottom: 22, background: dark ? "rgba(30,41,59,.5)" : "#f1f5f9", borderRadius: 12, padding: 4 }}>
                {[
                  { key: "email", label: "✉️ Email" },
                  { key: "sms", label: "📱 SMS" },
                ].map(m => (
                  <button key={m.key} onClick={() => setContactMode(m.key)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                    background: contactMode === m.key ? (dark ? "#0ea5e9" : "#0ea5e9") : "transparent",
                    color: contactMode === m.key ? "#fff" : (dark ? "#64748b" : "#94a3b8"),
                    fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .25s",
                    boxShadow: contactMode === m.key ? "0 4px 12px rgba(14,165,233,.3)" : "none"
                  }}>{m.label}</button>
                ))}
              </div>

              {sent && (
                <div style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: "#22c55e", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✅</span>
                  <span>{contactMode === "sms" ? "SMS app opened! Send your message to Avanish." : "Email app opened! Fill in your message and hit send."}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleContact}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name" style={{ ...inputCls, marginBottom: 14 }}
                onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,.1)"; }}
                onBlur={e => { e.target.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
              {contactMode === "email" ? (
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Your Email" style={{ ...inputCls, marginBottom: 14 }}
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,.1)"; }}
                  onBlur={e => { e.target.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              ) : (
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Your Phone (optional)" style={{ ...inputCls, marginBottom: 14 }}
                  onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,.1)"; }}
                  onBlur={e => { e.target.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              )}
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder={contactMode === "sms" ? "Your SMS message to Avanish…" : "Your message to Avanish…"}
                rows={5} style={{ ...inputCls, resize: "vertical", marginBottom: 20 }}
                onFocus={e => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,.1)"; }}
                onBlur={e => { e.target.style.borderColor = dark ? "rgba(30,41,59,.8)" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
              <button type="submit" style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
                background: contactMode === "sms" ? "linear-gradient(135deg,#5856D6,#007AFF)" : "linear-gradient(135deg,#0284c7,#0ea5e9)",
                color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: contactMode === "sms" ? "0 6px 24px rgba(0,122,255,.35)" : "0 6px 24px rgba(14,165,233,.35)", transition: "all .25s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = contactMode === "sms" ? "0 10px 32px rgba(0,122,255,.5)" : "0 10px 32px rgba(14,165,233,.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = contactMode === "sms" ? "0 6px 24px rgba(0,122,255,.35)" : "0 6px 24px rgba(14,165,233,.35)"; }}
              >
                {contactMode === "sms" ? "📱 Open SMS App →" : "✉️ Open Email App →"}
              </button>
              <p style={{ fontSize: 12, color: dark ? "#334155" : "#cbd5e1", textAlign: "center", marginTop: 10 }}>
                {contactMode === "sms" ? "Opens your default SMS app pre-filled with message" : "Opens your default email client pre-filled with message"}
              </p>
            </form>
          </GlassCard>
        </div>
      </Section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${dark ? "rgba(30,41,59,.6)" : "#e2e8f0"}`, padding: "32px 28px", textAlign: "center" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 24, color: "#0ea5e9", marginBottom: 8 }}>Avanish<span style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>.</span></div>
          <p style={{ fontSize: 13, color: dark ? "#475569" : "#94a3b8", marginBottom: 16 }}>Designed & built with ❤️ • Always learning, always growing</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            {navLinks.map(n => <a key={n.id} href={n.href} style={{ fontSize: 13, fontWeight: 600, color: dark ? "#475569" : "#94a3b8", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0ea5e9"}
              onMouseLeave={e => e.currentTarget.style.color = dark ? "#475569" : "#94a3b8"}
            >{n.label}</a>)}
          </div>
          <div style={{ fontSize: 12, color: dark ? "#334155" : "#cbd5e1" }}>© {new Date().getFullYear()} Avanish Tiwari • avanishtiwari787@gmail.com</div>
        </div>
      </footer>
    </div>
  );
}
