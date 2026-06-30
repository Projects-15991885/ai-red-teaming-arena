"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Animated terminal lines ──
const BOOT_LINES = [
  "> Initializing Red Team Environment...",
  "> Loading attack vectors... [OK]",
  "> Connecting to LLM endpoints... [OK]",
  "> Failure detection engine... [READY]",
  "> Community leaderboard... [ONLINE]",
  "> Arena is LIVE. Begin testing.",
];

function TerminalBoot() {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 380);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[11px] md:text-xs space-y-1.5 text-left">
      {lines.filter(Boolean).map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{
            color: typeof line === "string" && line.includes("[OK]") ? "#22c55e" :
                   typeof line === "string" && line.includes("[READY]") ? "#3b82f6" :
                   typeof line === "string" && line.includes("[ONLINE]") ? "#a855f7" :
                   typeof line === "string" && line.includes("LIVE") ? "#ef4444" : "#64748b"
          }}>
            {line}
          </span>
        </div>
      ))}
      {!done && (
        <div className="flex items-center gap-1">
          <span style={{ color: "#64748b" }}>{">"}</span>
          <span className="w-2 h-4 animate-pulse" style={{ background: "#ef4444" }} />
        </div>
      )}
    </div>
  );
}

// ── Floating particle canvas ──
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const count = W < 640 ? 28 : 55;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const a = 0.3 + 0.2 * Math.sin(p.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,68,68,${a})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(239,68,68,${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />;
}

// ── Stats counter ──
function StatCounter({ value, label, color }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-black tabular-nums" style={{ color }}>{count.toLocaleString()}+</div>
      <div className="text-[10px] md:text-xs font-mono mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
    </div>
  );
}

// ── Attack category pills ──
const CATEGORIES = [
  { label: "Hallucination",     color: "#ef4444", desc: "Model confidently states false info" },
  { label: "Refusal Bypass",    color: "#f97316", desc: "Bypassing safety filters" },
  { label: "Bias & Stereotype", color: "#a855f7", desc: "Demographic or cultural bias" },
  { label: "Prompt Injection",  color: "#3b82f6", desc: "Hijacking model instructions" },
  { label: "Confusion",         color: "#eab308", desc: "Incoherent / contradictory output" },
  { label: "Data Leakage",      color: "#10b981", desc: "Exposing training/system data" },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const onMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  return (
    <main className="min-h-screen text-white relative overflow-hidden" style={{ background: "#07090f" }}>

      {mounted && <ParticleCanvas />}

      {mounted && (
        <div className="hidden md:block fixed pointer-events-none rounded-full" style={{
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)",
          left: mousePos.x - 300, top: mousePos.y - 300,
          transition: "left 0.12s ease, top 0.12s ease",
          zIndex: 0,
        }} />
      )}

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-full h-px opacity-20"
          style={{ background: "linear-gradient(90deg,transparent,#ef4444,transparent)", animation: "scan 6s linear infinite" }} />
      </div>

      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: "linear-gradient(rgba(239,68,68,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.03) 1px,transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      <style>{`
        @keyframes scan { 0%{top:-2px} 100%{top:100%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glitch {
          0%,100%{transform:translate(0)} 
          20%{transform:translate(-2px,1px)} 
          40%{transform:translate(2px,-1px)} 
          60%{transform:translate(-1px,2px)} 
          80%{transform:translate(1px,-2px)}
        }
      `}</style>

      {/* HEADER */}
      <header className="relative z-10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(239,68,68,0.1)", background: "rgba(7,9,15,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="relative w-7 h-7 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center rounded"
            style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <span className="text-xs md:text-sm font-black text-red-400">⚔</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs md:text-sm font-black tracking-tight text-white truncate">AI Red Teaming Arena</div>
            <div className="hidden sm:block text-[8px] md:text-[9px] font-mono tracking-widest" style={{ color: "rgba(239,68,68,0.5)" }}>
              ADVERSARIAL TESTING PLATFORM
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-500" />
            LIVE
          </div>
          <button
            onClick={() => router.push("/leaderboard")}
            className="text-[10px] md:text-xs font-mono px-2.5 md:px-3 py-1.5 rounded border transition-all whitespace-nowrap"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
            Leaderboard →
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 md:mb-24">

          {/* Left: Hero text */}
          <div style={{ animation: "fadeUp 0.7s ease forwards" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5 md:mb-6 text-[9px] md:text-[10px] font-mono tracking-widest uppercase"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="leading-tight">Human-in-the-Loop Red Teaming</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 md:mb-6 leading-[1.05]"
              style={{ letterSpacing: "-0.03em" }}>
              <span className="text-white">Break</span>{" "}
              <span style={{
                color: "#ef4444",
                textShadow: "0 0 40px rgba(239,68,68,0.4)",
                animation: "glitch 8s infinite",
                display: "inline-block",
              }}>AI</span>
              <br />
              <span className="text-white">Before It</span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Breaks You.</span>
            </h1>

            <p className="text-sm leading-relaxed mb-7 md:mb-8" style={{ color: "rgba(255,255,255,0.35)", maxWidth: "440px" }}>
              Find vulnerabilities in large language models through adversarial prompting.
              Every failure you discover is categorized, scored, and added to the global database.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/arena")}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all relative overflow-hidden"
                style={{ background: "#ef4444", color: "white" }}
                onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}>
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)" }} />
                <span className="relative">Enter Arena →</span>
              </button>
              <button
                onClick={() => router.push("/leaderboard")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all border"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Right: Terminal boot */}
          <div style={{ animation: "fadeUp 0.9s ease forwards" }}>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(0,0,0,0.4)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(239,68,68,0.1)", background: "rgba(0,0,0,0.3)" }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>arena-boot.sh</span>
              </div>
              <div className="p-4 md:p-6 overflow-x-auto">
                <TerminalBoot />
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-3 md:gap-8 mb-16 md:mb-24 py-7 md:py-10 border-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <StatCounter value={2847} label="Attacks Submitted" color="#ef4444" />
          <StatCounter value={6} label="Failure Categories" color="#a855f7" />
          <StatCounter value={4} label="LLMs Tested" color="#3b82f6" />
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-10 md:mb-12 px-2">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: "rgba(239,68,68,0.5)" }}>
              Process
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.02em" }}>
              How Red Teaming Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { step: "01", title: "Write Attack", desc: "Craft an adversarial prompt designed to expose a model's weakness", color: "#ef4444" },
              { step: "02", title: "Fire at LLM", desc: "Send your prompt to a real LLM via OpenRouter API", color: "#f97316" },
              { step: "03", title: "Analyze Failure", desc: "Auto-detection categorizes the failure type and severity score", color: "#a855f7" },
              { step: "04", title: "Submit & Rank", desc: "Successful attacks go on the community leaderboard", color: "#3b82f6" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 md:p-5 relative overflow-hidden group transition-all"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}30`; e.currentTarget.style.background = `${s.color}06`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                <div className="text-2xl md:text-3xl font-black mb-2 md:mb-3 tabular-nums" style={{ color: `${s.color}30` }}>{s.step}</div>
                <div className="text-sm font-bold text-white mb-1.5 md:mb-2">{s.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>{s.desc}</div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── FAILURE CATEGORIES ── */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-10 md:mb-12 px-2">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: "rgba(239,68,68,0.5)" }}>
              Taxonomy
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white" style={{ letterSpacing: "-0.02em" }}>
              Failure Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="rounded-xl p-4 flex items-start gap-3 group transition-all cursor-default"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}60` }} />
                <div className="min-w-0">
                  <div className="text-xs font-bold mb-1" style={{ color: cat.color }}>{cat.label}</div>
                  <div className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08), transparent 70%)" }} />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3 relative px-2" style={{ letterSpacing: "-0.02em" }}>
            Ready to find vulnerabilities?
          </h2>
          <p className="text-sm mb-7 md:mb-8 relative px-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Every attack you submit helps make AI systems safer.
          </p>
          <button
            onClick={() => router.push("/arena")}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-black text-sm tracking-wide text-white transition-all relative"
            style={{ background: "#ef4444" }}
            onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
            onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}>
            Enter the Arena →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <span className="text-[9px] md:text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.1)" }}>
          AI Red Teaming Arena · Human-in-the-Loop Safety Research
        </span>
        <span className="text-[9px] md:text-[10px] font-mono" style={{ color: "rgba(239,68,68,0.25)" }}>
          Inspired by Kahng et al. · FAccT 2024
        </span>
      </footer>
    </main>
  );
}