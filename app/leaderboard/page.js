"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const FAILURE_TYPES = {
  hallucination:     { label: "Hallucination",     color: "#ef4444", icon: "◈" },
  refusal_bypass:    { label: "Refusal Bypass",    color: "#f97316", icon: "◉" },
  bias_stereotype:   { label: "Bias / Stereotype", color: "#a855f7", icon: "◬" },
  prompt_injection:  { label: "Prompt Injection",  color: "#3b82f6", icon: "◫" },
  confusion:         { label: "Confusion",          color: "#eab308", icon: "◭" },
  data_leakage:      { label: "Data Leakage",      color: "#10b981", icon: "◪" },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Leaderboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("score", { ascending: false })
      .limit(100);

    if (!error && data) setSubmissions(data);
    setLoading(false);
  };

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.failure_type === filter);

  const topAttackers = (() => {
    const counts = {};
    submissions.forEach(s => {
      const name = s.attacker_name || "Anonymous";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  const categoryStats = (() => {
    const counts = {};
    submissions.forEach(s => {
      counts[s.failure_type] = (counts[s.failure_type] || 0) + 1;
    });
    return counts;
  })();

  return (
    <div className="min-h-screen text-white" style={{ background: "#07090f", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(239,68,68,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.025) 1px,transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .row-hover{transition:background 0.15s}
        .row-hover:hover{background:rgba(255,255,255,0.02)}
      `}</style>

      <header className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor:"rgba(239,68,68,0.1)", background:"rgba(7,9,15,0.92)", backdropFilter:"blur(20px)" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-xs font-mono"
            style={{ color:"rgba(255,255,255,0.25)" }}>← Back</button>
          <div className="w-px h-4" style={{ background:"rgba(255,255,255,0.08)" }} />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-black text-white">Community Leaderboard</span>
          </div>
        </div>
        <button onClick={() => router.push("/arena")}
          className="text-xs font-mono px-3 py-1.5 rounded text-white"
          style={{ background:"#ef4444" }}>
          + Submit Attack
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8" style={{ animation:"fadeUp 0.5s ease forwards" }}>

        <div className="mb-8">
          <p className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color:"rgba(239,68,68,0.5)" }}>
            Global Database
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ letterSpacing:"-0.02em" }}>
            Failed Attacks Leaderboard
          </h1>
          <p className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.3)" }}>
            {submissions.length} verified attacks · ranked by exploit score
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Main list */}
          <div>
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setFilter("all")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filter === "all" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                  color:      filter === "all" ? "#ef4444" : "rgba(255,255,255,0.3)",
                  border: `1px solid ${filter === "all" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}>
                All ({submissions.length})
              </button>
              {Object.entries(FAILURE_TYPES).map(([key, f]) => (
                <button key={key} onClick={() => setFilter(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    background: filter === key ? `${f.color}15` : "rgba(255,255,255,0.03)",
                    color:      filter === key ? f.color : "rgba(255,255,255,0.3)",
                    border: `1px solid ${filter === key ? `${f.color}30` : "rgba(255,255,255,0.06)"}`,
                  }}>
                  {f.icon} {f.label} ({categoryStats[key] || 0})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="text-sm font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>Loading submissions...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl p-12 text-center" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                <div className="text-3xl mb-3 opacity-10">◈</div>
                <p className="text-sm" style={{ color:"rgba(255,255,255,0.2)" }}>No submissions yet. Be the first attacker!</p>
                <button onClick={() => router.push("/arena")}
                  className="mt-4 px-6 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ background:"#ef4444" }}>
                  Enter Arena →
                </button>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.05)" }}>
                {filtered.map((sub, i) => {
                  const f = FAILURE_TYPES[sub.failure_type];
                  const isExpanded = expandedId === sub.id;
                  return (
                    <div key={sub.id} className="row-hover border-b last:border-0"
                      style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}>
                        <span className="text-xs font-mono font-bold w-6 flex-shrink-0"
                          style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b87333" : "rgba(255,255,255,0.15)" }}>
                          #{i + 1}
                        </span>
                        <span className="text-sm flex-shrink-0" style={{ color: f?.color }}>{f?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate" style={{ color:"#e2e8f0" }}>
                            {sub.prompt}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono" style={{ color: f?.color }}>{f?.label}</span>
                            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
                            <span className="text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.25)" }}>{sub.model_name}</span>
                            <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.15)" }}>·</span>
                            <span className="text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>{sub.attacker_name}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-black tabular-nums" style={{ color: f?.color }}>{sub.score}</div>
                          <div className="text-[8px] font-mono" style={{ color:"rgba(255,255,255,0.15)" }}>{timeAgo(sub.created_at)}</div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4" style={{ animation:"fadeUp 0.2s ease forwards" }}>
                          <div className="rounded-lg p-3 mb-2" style={{ background:"rgba(0,0,0,0.3)" }}>
                            <div className="text-[9px] font-mono mb-1" style={{ color:"rgba(255,255,255,0.2)" }}>PROMPT</div>
                            <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>{sub.prompt}</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ background:"rgba(0,0,0,0.3)" }}>
                            <div className="text-[9px] font-mono mb-1" style={{ color:"rgba(255,255,255,0.2)" }}>RESPONSE</div>
                            <p className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>{sub.response}</p>
                          </div>
                          <div className="flex gap-4 mt-2 text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>
                            <span>Confidence: {sub.confidence}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar stats */}
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-mono tracking-widest uppercase mb-3" style={{ color:"rgba(255,255,255,0.2)" }}>
                Top Attackers
              </p>
              {topAttackers.length === 0 ? (
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.15)" }}>No attackers yet</p>
              ) : (
                <div className="space-y-2">
                  {topAttackers.map(([name, count], i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono" style={{ color: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>#{i+1}</span>
                        <span className="text-xs font-bold" style={{ color:"#e2e8f0" }}>{name}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color:"#ef4444" }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-mono tracking-widest uppercase mb-3" style={{ color:"rgba(255,255,255,0.2)" }}>
                Category Breakdown
              </p>
              <div className="space-y-2.5">
                {Object.entries(FAILURE_TYPES).map(([key, f]) => {
                  const count = categoryStats[key] || 0;
                  const pct = submissions.length ? (count / submissions.length) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span style={{ color: f.color }}>{f.icon} {f.label}</span>
                        <span style={{ color:"rgba(255,255,255,0.3)" }}>{count}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.04)" }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background: f.color, opacity:0.7 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}