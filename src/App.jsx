import { useState, useEffect, useRef } from "react";

// ─── THEME ──────────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400&family=Barlow+Condensed:wght@300;400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#0a0a0b;color:#d4cfc8;font-family:'Barlow Condensed',sans-serif;overflow-x:hidden;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#b8860b;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes flicker{0%,100%{opacity:1;}92%{opacity:.95;}94%{opacity:.7;}96%{opacity:.9;}98%{opacity:.6;}}
  @keyframes scanline{0%{transform:translateY(-100%);}100%{transform:translateY(100vh);}}
  @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:.9;}}
  @keyframes typewriter{from{width:0}to{width:100%}}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
  @keyframes notifIn{from{transform:translateX(110%);opacity:0;}to{transform:translateX(0);opacity:1;}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
`;

const AMBER = "#b8860b";
const AMBER2 = "#d4a017";
const RED = "#8b1a1a";
const RED2 = "#c0392b";
const MUTED = "#4a4540";

// ─── STATS / TRACKING ───────────────────────────────────────────────────────
const defaultStats = { instinct: 50, authority: 40, empathy: 50, resolve: 45 };
const defaultRels = { vivienne: 20, ghost: 0, crane: 15, voss: 5 };
const defaultClues = [];
const defaultFlags = {};

function applyDelta(obj, delta) {
  const n = { ...obj };
  for (const [k, v] of Object.entries(delta || {}))
    n[k] = Math.min(100, Math.max(0, (n[k] || 0) + v));
  return n;
}

// ─── NOTIFICATION ─────────────────────────────────────────────────────────
function Notif({ n, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, []);
  const colors = { clue: AMBER2, rel: "#60a5fa", stat: "#4ade80", warn: RED2 };
  const labels = { clue: "EVIDENCE", rel: "RELATIONSHIP", stat: "INSTINCT", warn: "DANGER" };
  return (
    <div style={{ background: "#0d0d0e", border: `1px solid #1e1e20`, borderLeft: `3px solid ${colors[n.type] || AMBER}`, padding: "10px 14px", borderRadius: 2, maxWidth: 240, animation: "notifIn .3s ease", fontSize: 11, color: "#888", boxShadow: "0 8px 32px rgba(0,0,0,.9)", position: "relative", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors[n.type] || AMBER, marginBottom: 4 }}>{labels[n.type] || "UPDATE"}</div>
      {n.text}
      <button onClick={onClose} style={{ position: "absolute", top: 7, right: 9, background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 14 }}>×</button>
    </div>
  );
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────
function StatBar({ label, val, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 8, letterSpacing: 2, color: "#444" }}>{label}</span>
        <span style={{ fontSize: 8, color: color || AMBER, fontFamily: "'IBM Plex Mono', monospace" }}>{val}</span>
      </div>
      <div style={{ height: 1, background: "#111", position: "relative" }}>
        <div style={{ height: 1, background: color || AMBER, width: `${val}%`, transition: "width .8s ease" }} />
      </div>
    </div>
  );
}

// ─── EVIDENCE PANEL ──────────────────────────────────────────────────────
function EvidencePanel({ clues, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 340, maxHeight: "70vh", overflowY: "auto", background: "#0a0a0b", border: `1px solid #1e1e20`, borderTop: `2px solid ${AMBER}`, padding: 24 }}>
        <div style={{ fontSize: 8, letterSpacing: 4, color: AMBER, marginBottom: 20 }}>EVIDENCE FILE</div>
        {clues.length === 0 && <div style={{ color: "#333", fontSize: 12, fontStyle: "italic" }}>No evidence collected yet.</div>}
        {clues.map((c, i) => (
          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #111" }}>
            <div style={{ fontSize: 9, color: AMBER2, letterSpacing: 1.5, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, fontFamily: "'IBM Plex Mono', monospace" }}>{c.desc}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 8, fontSize: 8, letterSpacing: 3, color: "#333", background: "none", border: "none", cursor: "pointer" }}>CLOSE ×</button>
      </div>
    </div>
  );
}

// ─── CHAR CREATE ──────────────────────────────────────────────────────────
function CharCreate({ onStart }) {
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState({ name: "", background: "", style: "", age: "" });
  const [input, setInput] = useState("");

  const steps = [
    {
      prompt: "The city doesn't care who you are. But the record needs a name.\n\nWhat do they call you?",
      field: "name",
      type: "text",
      placeholder: "Enter your name...",
    },
    {
      prompt: "Before the PI license. Before the city ate you up and spit you out. Where'd you come from?",
      field: "background",
      type: "choice",
      choices: [
        { label: "Army Ranger — Two tours, Kandahar.", sub: "You read rooms the way most people read text. Violence was a tool once. Now it's a ghost.", value: "ranger" },
        { label: "NYPD Homicide — Eight years on the job.", sub: "You know how the system works. You also know exactly how it fails.", value: "cop" },
        { label: "Military Intelligence — Analyst, then operative.", sub: "You were never officially there. Half your records don't exist.", value: "intel" },
        { label: "Marine Force Recon — EOD specialist.", sub: "Bombs, booby traps, pressure plates. You learned to read the thing underneath the thing.", value: "recon" },
      ],
    },
    {
      prompt: "Everybody's got a method. How do you work a scene?",
      field: "style",
      type: "choice",
      choices: [
        { label: "Patient. Systematic. Every detail matters.", sub: "You miss nothing. You also move slow.", value: "methodical" },
        { label: "Instinct. Trust the gut, ask questions later.", sub: "You're usually right. When you're not, it costs you.", value: "instinct" },
        { label: "People first. The room is made of liars.", sub: "You read faces, not floors.", value: "social" },
        { label: "Push until something breaks.", sub: "Pressure reveals. It also leaves marks.", value: "aggressive" },
      ],
    },
  ];

  const current = steps[step];

  function handleChoice(val) {
    const updated = { ...player, [current.field]: val };
    setPlayer(updated);
    if (step < steps.length - 1) setStep(step + 1);
    else onStart(updated);
  }

  function handleText() {
    if (!input.trim()) return;
    const updated = { ...player, name: input.trim() };
    setPlayer(updated);
    setInput("");
    setStep(step + 1);
  }

  const bgLabel = { ranger: "Army Ranger", cop: "Former NYPD", intel: "MI Operative", recon: "Force Recon" };
  const styleLabel = { methodical: "Methodical", instinct: "Gut Instinct", social: "People Reader", aggressive: "Pressure Player" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{G}</style>
      {/* Atmosphere */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(184,134,11,.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,26,26,.04) 0%, transparent 50%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`, opacity: .15 }} />

      <div style={{ maxWidth: 460, width: "100%", animation: "fadeUp .7s ease" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 7, letterSpacing: 5, color: AMBER, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }}>CASE FILE — SUBJECT IDENTITY</div>
          <div style={{ height: 1, background: "#111", marginBottom: 20 }} />
          {step > 0 && (
            <div style={{ marginBottom: 20 }}>
              {player.name && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>NAME: <span style={{ color: "#555" }}>{player.name}</span></div>}
              {player.background && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>BACKGROUND: <span style={{ color: "#555" }}>{bgLabel[player.background]}</span></div>}
              {player.style && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace" }}>METHOD: <span style={{ color: "#555" }}>{styleLabel[player.style]}</span></div>}
            </div>
          )}
        </div>

        {/* Prompt */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, lineHeight: 1.75, color: "#c8c4bc", marginBottom: 32, whiteSpace: "pre-line" }}>
          {current.prompt}
        </div>

        {/* Input or choices */}
        {current.type === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleText()}
              placeholder={current.placeholder}
              style={{ background: "transparent", border: "none", borderBottom: `1px solid #222`, padding: "12px 0", color: "#d4cfc8", fontSize: 20, fontFamily: "'Playfair Display', serif", fontStyle: "italic", outline: "none", caretColor: AMBER2 }}
            />
            <button
              onClick={handleText}
              onMouseEnter={e => { e.currentTarget.style.background = AMBER; e.currentTarget.style.color = "#000"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = AMBER2; }}
              style={{ alignSelf: "flex-start", marginTop: 8, padding: "10px 28px", background: "transparent", border: `1px solid ${AMBER}`, color: AMBER2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 4, fontSize: 12, cursor: "pointer", transition: "all .25s" }}>
              CONFIRM →
            </button>
          </div>
        )}

        {current.type === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {current.choices.map((c, i) => (
              <button key={i} onClick={() => handleChoice(c.value)}
                onMouseEnter={e => { e.currentTarget.style.background = "#0f0f10"; e.currentTarget.style.borderColor = AMBER; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#1e1e20"; }}
                style={{ textAlign: "left", padding: "16px 18px", background: "transparent", border: "1px solid #1e1e20", cursor: "pointer", transition: "all .2s" }}>
                <div style={{ fontSize: 14, color: "#c8c4bc", letterSpacing: .5, marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", lineHeight: 1.5, fontFamily: "'Playfair Display', serif" }}>{c.sub}</div>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, fontSize: 7, color: "#1a1a1c", letterSpacing: 3 }}>BROKEN CITY — CHAPTER ONE</div>
      </div>
    </div>
  );
}

// ─── BEATS ENGINE ─────────────────────────────────────────────────────────
// Scene data lives below, engine is universal
function Game({ player }) {
  const [sceneId, setSceneId] = useState("prologue_1");
  const [beats, setBeats] = useState([]);   // accumulated prose
  const [pendingChoices, setPendingChoices] = useState(null);
  const [outcome, setOutcome] = useState(null); // consequence text shown before continue
  const [waitingContinue, setWaitingContinue] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [rels, setRels] = useState(defaultRels);
  const [clues, setClues] = useState(defaultClues);
  const [flags, setFlags] = useState(defaultFlags);
  const [notifs, setNotifs] = useState([]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [nextBeatIdx, setNextBeatIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const notifId = useRef(0);

  function addNotif(type, text) {
    const id = notifId.current++;
    setNotifs(n => [...n, { id, type, text }]);
  }

  function removeNotif(id) { setNotifs(n => n.filter(x => x.id !== id)); }

  function addClue(clue) {
    setClues(c => [...c, clue]);
    addNotif("clue", `Evidence logged: ${clue.label}`);
  }

  function applyStatDelta(sd) {
    if (!sd) return;
    setStats(s => applyDelta(s, sd.stats));
    setRels(r => applyDelta(r, sd.rels));
    if (sd.clue) addClue(sd.clue);
    if (sd.flag) setFlags(f => ({ ...f, [sd.flag]: true }));
    if (sd.notify) sd.notify.forEach(n => addNotif(n.type, n.text));
  }

  // Scroll to bottom on new beats
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [beats, outcome, pendingChoices]);

  // Load scene
  useEffect(() => { startScene(sceneId); }, [sceneId]);

  function startScene(id) {
    const scene = SCENES[id];
    if (!scene) return;
    setBeats([]);
    setPendingChoices(null);
    setOutcome(null);
    setWaitingContinue(false);
    setNextBeatIdx(0);
    advanceBeats(scene.beats, 0, {}, id);
  }

  function advanceBeats(sceneBs, idx, localFlags, sceneId) {
    if (!sceneBs || idx >= sceneBs.length) return;
    const beat = sceneBs[idx];

    // Conditional beat
    if (beat.condition) {
      const passes = evalCondition(beat.condition, flags, clues, stats, rels);
      if (!passes) { advanceBeats(sceneBs, idx + 1, localFlags, sceneId); return; }
    }

    if (beat.type === "prose") {
      setBeats(b => [...b, { type: "prose", text: beat.text(player, flags, clues, stats, rels) }]);
      advanceBeats(sceneBs, idx + 1, localFlags, sceneId);
    } else if (beat.type === "pause") {
      setBeats(b => [...b, { type: "prose", text: beat.text(player, flags, clues, stats, rels) }]);
      setWaitingContinue(true);
      setNextBeatIdx(idx + 1);
      // store scene ref for continuation
      window._currentScene = sceneId;
    } else if (beat.type === "examine") {
      setBeats(b => [...b, { type: "examine", items: beat.items, prompt: beat.prompt }]);
      setWaitingContinue(false);
      setNextBeatIdx(idx + 1);
      window._currentScene = sceneId;
      window._examineResume = (examined) => {
        // give the clue
        examined.forEach(item => {
          if (item.clue) addClue(item.clue);
          if (item.stat) applyStatDelta(item.stat);
        });
        setBeats(b => b.filter(x => x.type !== "examine"));
        advanceBeats(sceneBs, idx + 1, localFlags, sceneId);
      };
    } else if (beat.type === "choice") {
      setPendingChoices({ choices: beat.choices, sceneBs, idx, localFlags, sceneId });
    }
  }

  function evalCondition(cond, flags, clues, stats, rels) {
    if (cond.flag) return !!flags[cond.flag];
    if (cond.clue) return clues.some(c => c.id === cond.clue);
    if (cond.stat) return (stats[cond.stat.key] || 0) >= cond.stat.min;
    return true;
  }

  function handleContinue() {
    setWaitingContinue(false);
    const scene = SCENES[window._currentScene];
    if (scene) advanceBeats(scene.beats, nextBeatIdx, {}, window._currentScene);
  }

  function handleChoice(choice) {
    if (!pendingChoices) return;
    const { sceneBs, idx, localFlags, sceneId } = pendingChoices;
    setPendingChoices(null);

    // Apply stat deltas from choice
    if (choice.delta) applyStatDelta(choice.delta);

    // Show outcome text if any
    if (choice.outcome) {
      setOutcome(choice.outcome(player, flags, clues, stats, rels));
      setWaitingContinue(true);
      // After continue, go to next beat or next scene
      window._afterOutcome = () => {
        setOutcome(null);
        if (choice.nextScene) { setSceneId(choice.nextScene); return; }
        advanceBeats(sceneBs, idx + 1, localFlags, sceneId);
      };
      window._currentScene = "__outcome__";
    } else if (choice.nextScene) {
      setSceneId(choice.nextScene);
    } else {
      advanceBeats(sceneBs, idx + 1, localFlags, sceneId);
    }
  }

  function handleContinueOutcome() {
    setWaitingContinue(false);
    if (window._afterOutcome) { const fn = window._afterOutcome; window._afterOutcome = null; fn(); }
    else handleContinue();
  }

  // Background labels
  const bgLabels = { ranger: "Army Ranger", cop: "Former NYPD", intel: "MI Operative", recon: "Force Recon" };
  const styleLabels = { methodical: "Methodical", instinct: "Gut Instinct", social: "People Reader", aggressive: "Pressure Player" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto", position: "relative" }}>
      <style>{G}</style>
      {/* Notifs */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {notifs.map(n => <Notif key={n.id} n={n} onClose={() => removeNotif(n.id)} />)}
      </div>

      {/* Evidence panel */}
      {showEvidence && <EvidencePanel clues={clues} onClose={() => setShowEvidence(false)} />}

      {/* Stats panel */}
      {showStats && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={() => setShowStats(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 300, background: "#0a0a0b", border: `1px solid #1e1e20`, borderTop: `2px solid ${AMBER}`, padding: 24 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: AMBER, marginBottom: 20 }}>{player.name?.toUpperCase()} · {bgLabels[player.background]}</div>
            <StatBar label="INSTINCT" val={stats.instinct} color={AMBER2} />
            <StatBar label="AUTHORITY" val={stats.authority} color="#60a5fa" />
            <StatBar label="EMPATHY" val={stats.empathy} color="#4ade80" />
            <StatBar label="RESOLVE" val={stats.resolve} color={RED2} />
            <div style={{ height: 1, background: "#111", margin: "16px 0" }} />
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#333", marginBottom: 12 }}>CONTACTS</div>
            <StatBar label="VIVIENNE COLE" val={rels.vivienne} color="#f9a8d4" />
            <StatBar label="THE GHOST" val={rels.ghost} color="#a78bfa" />
            <StatBar label="CRANE" val={rels.crane} color="#60a5fa" />
            <StatBar label="VOSS" val={rels.voss} color={RED2} />
            <button onClick={() => setShowStats(false)} style={{ marginTop: 16, fontSize: 8, letterSpacing: 3, color: "#333", background: "none", border: "none", cursor: "pointer" }}>CLOSE ×</button>
          </div>
        </div>
      )}

      {/* HUD */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0a0a0b", borderBottom: "1px solid #0f0f10", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, letterSpacing: 3, color: AMBER, fontWeight: 700 }}>BROKEN CITY</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => setShowEvidence(true)} style={{ fontSize: 8, letterSpacing: 2, color: clues.length > 0 ? AMBER2 : "#222", background: "none", border: "none", cursor: "pointer" }}>
            EVIDENCE{clues.length > 0 ? ` [${clues.length}]` : ""}
          </button>
          <button onClick={() => setShowStats(true)} style={{ fontSize: 8, letterSpacing: 2, color: "#333", background: "none", border: "none", cursor: "pointer" }}>DOSSIER</button>
        </div>
      </div>

      {/* Prose accumulation */}
      <div style={{ flex: 1, padding: "32px 24px 120px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {beats.map((beat, i) => {
          if (beat.type === "prose") return (
            <div key={i} style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, lineHeight: 1.9, color: "#b8b4ae", marginBottom: 22, animation: "fadeUp .5s ease" }}
              dangerouslySetInnerHTML={{ __html: beat.text.replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") }} />
          );
          if (beat.type === "heading") return (
            <div key={i} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: 5, color: AMBER, marginBottom: 24, marginTop: 16, animation: "fadeUp .5s ease" }}>{beat.text}</div>
          );
          if (beat.type === "examine") return (
            <div key={i} style={{ animation: "fadeUp .5s ease", marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: AMBER, marginBottom: 16 }}>{beat.prompt || "EXAMINE THE SCENE"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {beat.items.map((item, j) => (
                  <button key={j} onClick={() => {
                    if (item.clue) addClue(item.clue);
                    if (item.stat) applyStatDelta(item.stat);
                    setBeats(b => b.map((x, xi) => xi === i ? { ...x, items: x.items.filter((_, ji) => ji !== j), examined: [...(x.examined || []), item] } : x));
                    if (beat.items.length <= 1) {
                      setBeats(b => b.filter((_, xi) => xi !== i));
                      const scene = SCENES[window._currentScene];
                      if (scene) advanceBeats(scene.beats, nextBeatIdx, {}, window._currentScene);
                    }
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.background = "#0d0d0e"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e20"; e.currentTarget.style.background = "transparent"; }}
                    style={{ textAlign: "left", padding: "12px 16px", background: "transparent", border: "1px solid #1e1e20", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ fontSize: 12, color: AMBER2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 3 }}>→ {item.label}</div>
                    <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>{item.hint}</div>
                  </button>
                ))}
                {beat.items.length === 0 && (
                  <div style={{ fontSize: 11, color: "#333", fontStyle: "italic", marginTop: 8 }}>
                    <button onClick={() => {
                      setBeats(b => b.filter((_, xi) => xi !== i));
                      const scene = SCENES[window._currentScene];
                      if (scene) advanceBeats(scene.beats, nextBeatIdx, {}, window._currentScene);
                    }} style={{ fontSize: 8, letterSpacing: 3, color: "#444", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
                      DONE EXAMINING →
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
          return null;
        })}

        {/* Outcome text */}
        {outcome && (
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, lineHeight: 1.9, color: "#888", marginBottom: 22, fontStyle: "italic", borderLeft: `2px solid ${AMBER}`, paddingLeft: 16, animation: "fadeUp .4s ease" }}
            dangerouslySetInnerHTML={{ __html: outcome.replace(/\*([^*]+)\*/g, "<em>$1</em>") }} />
        )}

        {/* Continue button */}
        {waitingContinue && (
          <div style={{ animation: "fadeUp .4s ease", marginBottom: 24 }}>
            <button
              onClick={outcome ? handleContinueOutcome : handleContinue}
              onMouseEnter={e => { e.currentTarget.style.color = AMBER2; e.currentTarget.style.borderColor = AMBER2; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1e1e20"; }}
              style={{ fontSize: 8, letterSpacing: 4, color: "#333", background: "none", border: "1px solid #1e1e20", padding: "10px 24px", cursor: "pointer", transition: "all .3s", fontFamily: "'Barlow Condensed', sans-serif" }}>
              CONTINUE →
            </button>
          </div>
        )}

        {/* Choices */}
        {pendingChoices && (
          <div style={{ animation: "fadeUp .4s ease", marginTop: 8, marginBottom: 24 }}>
            <div style={{ fontSize: 7, letterSpacing: 4, color: "#2a2a2e", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>WHAT DO YOU DO?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingChoices.choices.map((c, i) => {
                // Check if unlocked by clue
                const locked = c.requiresClue && !clues.some(cl => cl.id === c.requiresClue);
                return (
                  <button key={i} onClick={() => !locked && handleChoice(c)}
                    onMouseEnter={e => { if (!locked) { e.currentTarget.style.background = "#0d0d0e"; e.currentTarget.style.borderColor = AMBER; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = locked ? "#0f0f10" : "#1e1e20"; }}
                    style={{ textAlign: "left", padding: "14px 18px", background: "transparent", border: `1px solid ${locked ? "#0f0f10" : "#1e1e20"}`, cursor: locked ? "default" : "pointer", transition: "all .2s", opacity: locked ? .4 : 1 }}>
                    <div style={{ fontSize: 14, color: locked ? "#333" : "#c8c4bc", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: .5, fontWeight: 600, marginBottom: locked ? 2 : 0 }}>{c.text}</div>
                    {locked && <div style={{ fontSize: 9, color: "#2a2a2e", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>[REQUIRES EVIDENCE]</div>}
                    {c.sub && !locked && <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", fontFamily: "'Playfair Display', serif", marginTop: 3 }}>{c.sub}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── SCENES ───────────────────────────────────────────────────────────────
// GROK EXPANSION GUIDE:
// Search for [GROK: ...] comments throughout this SCENES object.
// Each one is a prose string (inside backticks) that you should expand IN PLACE.
const SCENES = {
  prologue_1: {
    beats: [
      {
        type: "pause",
        text: (p) => `BROKEN CITY\n\n*Chapter One: The Dutton House*\n\n*"Every investigation starts the same way. Someone calls. Someone's already dead."*`,
      },
      {
        type: "prose",
        text: (p) => `The call comes in at 2:17 AM.\n\nThe bourbon sits heavy and warm in your gut while the television flickers its cold blue light across the cracked walls of your apartment. Sirens howl somewhere far below on the rain-slick streets, the endless metallic pulse of a city that never truly sleeps. Your eyes are half-closed in that hazy, half-drunk limbo when the phone starts ringing — sharp, insistent, slicing through the low drone like a switchblade.\n\nYou don't remember reaching for it, but it's already in your hand. On the other end is a woman's voice, clipped and tightly controlled, the kind of control that barely hides the fracture underneath.`,
      },
      {
        type: "prose",
        text: (p) => `"Is this ${p.name}?" A pause. "The investigator."`,
      },
      {
        type: "prose",
        text: (p) => `You say yes. You don't know why you say it like a question.\n\n"My name is Vivienne Cole. I work for Councilman Dutton. *Worked.*" The word lands like a spent shell casing — final and cold. There's a tremor beneath her composure, the kind that comes when someone is barely holding themselves together. "He's — " Another long pause, thick with everything she's not saying. "He's dead. The police are saying suicide. I don't believe that. I need someone who doesn't work for the city."\n\nThe name hits harder than it should. A supposedly clean politician in a filthy town, now just another corpse. This woman on the line is already measuring you, weighing whether you're the one who might drag the truth out of the dark — or get buried with it. You feel the last quiet moment slipping away and ask for the address anyway.`,
      },
      {
        type: "pause",
        text: () => `An hour later, you're standing at the edge of Dutton's townhouse on Aldrich Street, October rain cutting sideways through the sodium streetlights. Yellow police tape snaps and flutters in the wind like a dying flag. The air reeks of wet asphalt, diesel, and the faint coppery tang that always clings to fresh death.\n\nDetective Ray Crane stands near the door, arms crossed, collar turned up against the downpour. Six years on homicide have carved hard lines into his weathered face. His eyes are hooded and exhausted — the kind of man who's seen too many bodies and made too many compromises.`,
      },
      {
        type: "prose",
        text: () => `"Cole called you," Crane says. It isn't a question. "You know I can't let you inside."\n\n"I know."\n\n"Crime scene's sealed."\n\n"I know, Ray."`,
      },
      {
        type: "prose",
        text: () => `He stares at you through the rain for a long moment. Crane was two years ahead of you at the precinct before you both took different paths. Tonight he carries extra weight — you see it in the tight set of his jaw and the way his eyes keep flicking back to the house like it might bite.\n\nLetting you in costs him. He knows it. You both do. He steps aside anyway, just enough.\n\n"You didn't hear it from me. ME's calling it self-inflicted. Gunshot, study on the second floor. Nobody in the house." He stops. "Nobody *claims* to have been in the house."`,
      },
      {
        type: "pause",
        text: () => `He lets you through.\n\nThe house smells of old money and stale cigarette smoke, odd for a man who built his image on anti-tobacco crusades.\n\nUpstairs in the study, Councilman Dutton is slumped back in his leather chair like a broken puppet. The gunshot wound is a brutal, black-rimmed crater above his right temple. The exit wound has torn out the left side of his skull in a wet mess of bone fragments, brain matter, and dark blood that has spattered across the desk and up the wood-paneled wall. Thick blood pools glossy and congealing beneath the chair, one arm hanging limp with fingers curled in a final useless reach. The gun rests too neatly beside his left hand.\n\nThe staging is almost perfect — except the wound angle is wrong for suicide, and the blood spatter tells a much uglier story.`,
      },
      {
        type: "examine",
        prompt: "EXAMINE THE SCENE — Collect what you can before the window closes",
        items: [
          {
            label: "The ashtray on the end table",
            hint: "Dutton didn't smoke. Somebody did.",
            clue: { id: "ashtray", label: "Foreign Cigarette Butts", desc: "Three cigarette butts in an ashtray near the front door. Filtered. A European brand — Gauloises. Dutton was a documented non-smoker and publicly campaigned against tobacco. Someone else was here recently." },
          },
          {
            label: "Dutton's desk — the open drawer",
            hint: "Something's missing. You can feel it.",
            clue: { id: "drawer", label: "Empty Desk Drawer", desc: "The bottom-left drawer is open and empty, but the felt lining has rectangular impressions — something sat there for years. A flash drive, maybe. A documents folder. Gone now." },
          },
          {
            label: "The whiskey glass near the body",
            hint: "The angle is wrong.",
            clue: { id: "glass_position", label: "Glass Placement Anomaly", desc: "The whiskey glass is on the right side of the desk. Dutton was left-handed. You noticed his watch on his left wrist in the campaign photos on the wall. A right-handed pour that he never made." },
          },
          {
            label: "The window latch",
            hint: "Cold air somewhere it shouldn't be.",
            clue: { id: "window", label: "Unlatched Study Window", desc: "The study window is unlocked from the inside — but the latch is scratched, recent scratches on old brass. The window faces the rear alley. Someone could have come and gone without the front door." },
          },
        ],
      },
      {
        type: "pause",
        text: (p, flags, clues) => {
          const found = clues.length;
          if (found >= 3) return `You've seen enough. Maybe too much. The room is telling a story the official report will never admit.\n\nYou step back into the hall. Vivienne Cole waits at the foot of the stairs — tall, composed, her dark coat still damp from the rain and clinging to every curve of her body. She watches you descend with magnetic intensity, her eyes dark and unreadable, controlled grief and something far more dangerous simmering just beneath the surface.`;
          if (found >= 1) return `You've seen enough for now. There's more here if you come back with the right questions.\n\nVivienne Cole waits at the foot of the stairs — tall, composed, dark coat hugging her figure. She watches you with a mixture of fragile hope and cold calculation.`;
          return `You've done a first pass. Sometimes that's all you get.\n\nVivienne Cole stands at the foot of the stairs when you come down — tall, controlled, her gaze locked on you with careful, hungry focus.`;
        },
      },
      {
        type: "prose",
        text: () => `"What did you find?" she asks. Her voice is steadier than on the phone, but standing this close you can see the faint rapid pulse at the base of her throat and the way her lips part just slightly as she waits for your answer.\n\nYou hold her gaze, the air between you thick with unspoken tension. Neither of you gives anything away, but the proximity feels charged — dangerous in ways that have nothing to do with the dead man upstairs.`,
      },
      {
        type: "choice",
        choices: [
          {
            text: "Tell her everything. See how she reacts.",
            sub: "Information is leverage. But sharing it first means giving it away.",
            outcome: (p, flags, clues) => clues.some(c => c.id === "ashtray") || clues.some(c => c.id === "glass_position")
              ? `Her eyes tighten when you mention the cigarettes — a flash of recognition she kills almost instantly. Her full lips press into a thin line before she recovers. "I didn't know Dutton had guests," she says, but the lie sits heavy between you.\n\n"You said the police are calling it suicide," you reply. "Who told you first?"\n\n"His chief of staff. Deputy Mayor Voss's office called thirty seconds later." She leans in slightly, her voice dropping, the scent of her perfume cutting through the stale air. "Will you take the case?" Her eyes linger on yours a beat too long, dark and inviting.`
              : `She listens with her arms folded tight, tension radiating from her body. When you describe the study her expression fractures for a split second, fear and something hotter flashing across her face.\n\n"You believe me," she breathes.\n\n"I believe the room," you tell her, stepping closer. "Will you tell me who had access to this house?"`,
            delta: { rels: { vivienne: 8 }, stats: { empathy: 3 } },
          },
          {
            text: "Ask her where she was tonight before answering anything.",
            sub: "She hired you. That doesn't make her clean.",
            outcome: () => `She doesn't flinch. If anything, a spark of respect — maybe even dark amusement — flickers in her eyes. "Here. Until around eleven. Then he asked me to leave." She holds your gaze steadily. "Which he'd never done before. Fourteen months, and he'd never asked me to leave early."\n\nThe words hang between you. You watch her lips as she speaks, aware of how close you're standing, how easy it would be to close the distance. You almost wish you didn't have to test her this soon.\n\n"Okay," you say finally. "You want to know who killed him."\n\n"Yes."\n\n"Then stop lying to me about what you already know."`,
            delta: { stats: { instinct: 4, authority: 3 }, rels: { vivienne: 3 } },
          },
          {
            text: "Tell her the official story holds — for now — and you'll need payment upfront.",
            sub: "Keep your cards close. Professionals don't emote.",
            outcome: () => `She reads you perfectly. Without a word she opens her bag and slides a thick envelope across the newel post. "There's more if you find out what happened." Her fingers brush yours as she withdraws her hand, deliberate and slow. "I'm not stupid. I know how this looks — a dead politician and the woman who worked closest to him." She meets your eyes, voice low and husky. "I need someone in my corner who isn't already owned by this city."\n\nYou pick up the envelope, the heat of her touch still lingering.`,
            delta: { stats: { authority: 5, instinct: 2 }, rels: { vivienne: 4 } },
          },
          {
            text: "Show her the window evidence — ask if Dutton was afraid of anyone.",
            sub: "Only usable if you found it.",
            requiresClue: "window",
            outcome: () => `You describe the scratched window latch. Vivienne goes very still, the color draining from her face. For a moment her perfect composure cracks and you see raw fear — and something that looks almost like desire to be understood.\n\n"He had a locksmith re-key the whole house six weeks ago," she whispers, stepping closer until you can feel the warmth of her breath. "He didn't tell me why. I asked twice."\n\nThe proximity is electric. You catch the faint tremble in her voice before she locks it down again.\n\n"I'm going to need access to his calendar. Everything from the last two months."`,
            delta: { stats: { instinct: 6, resolve: 3 }, rels: { vivienne: 10 } },
          },
        ],
      },
      {
        type: "pause",
        text: () => `You're outside fifteen minutes later. The uniforms are gone. Crane's car is still there, engine running, exhaust curling into the cold rain.\n\nHe rolls down the window when you approach.`,
      },
      {
        type: "prose",
        text: () => `"She's not telling you everything," he says.\n\n"Nobody ever does."\n\n"This one especially." He stares straight ahead. "Dutton was supposed to testify next month. City contracts investigation. The kind that puts powerful people away." A beat. "People with money and patience."\n\nYou let that sit.\n\n"Who runs that investigation?" you ask.\n\nCrane just looks at you. "Deputy Mayor Voss." He rolls the window back up.`,
      },
      {
        type: "pause",
        text: () => `The city breathes around you at 3 AM — distant traffic, a far-off train, rain slicing through the October darkness and turning the streets into black mirrors. You've got a dead councilman with a wound that doesn't add up, a woman whose fear and allure are already under your skin, a detective who just handed you a suspect, and an empty drawer that used to hold something worth killing for.\n\nYou start walking, collar up, every shadow feeling like eyes on your back. The pieces are clicking together, and in this city that usually means someone ends up in a shallow grave.`,
      },
      {
        type: "choice",
        choices: [
          {
            text: "Go back to your apartment. Map out what you have before you move.",
            sub: "Slow and careful. Don't step on your own evidence.",
            outcome: () => `At 4 AM the case map spreads across your wall under a single harsh lamp — names, red string, gaps that feel like open mouths. Dutton. Voss. Vivienne. The cigarettes. The window. The drawer. A six-week hole that feels like it's waiting to swallow you.\n\nOutside the city keeps grinding on. You fall asleep in the chair, exhausted and wired, waking at seven with a plan that already feels one step behind the darkness closing in.`,
            delta: { stats: { instinct: 5, resolve: 4 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Go to the morgue. The body tells a story the police report won't.",
            sub: "You still have contacts there. Maybe.",
            outcome: () => `The morgue reeks of industrial bleach barely covering the sweet-rot stench of death. Fluorescent lights buzz overhead as Ferris pulls back the sheet. Dutton lies pale and waxy, the left side of his skull a shattered ruin of torn flesh, bone splinters, and dried brain matter. The entry wound is a ugly black hole above the right temple.\n\nThe ME's notes are clinical, but the trajectory doesn't match a self-inflicted shot — too steep, wrong angle for the gun's position. Someone deliberately ignored it.\n\nYou stare at the ruined body under the cold lights, the metallic smell of blood still clinging to the air, and feel the case turning into something much uglier than you expected.`,
            delta: { stats: { instinct: 7, authority: 2 }, rels: { crane: 3 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Find out who smokes Gauloises in this city.",
            sub: "Niche cigarettes are a fingerprint.",
            requiresClue: "ashtray",
            outcome: () => `Two hours of calling in favors later you have a name: Valentine Morrow. He works directly for Deputy Mayor Voss.\n\nThere's your first solid thread — and the first clear sign that this goes all the way up.`,
            delta: { stats: { instinct: 8, resolve: 3 }, rels: { ghost: 5 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Call Vivienne back. The thing she's not telling you — push now, before she builds the wall higher.",
            sub: "Information gaps close fast when people lawyer up.",
            outcome: () => `She answers on the second ring, voice softer and huskier at nearly 4 AM, stripped of its daytime armor. "Dutton was keeping something for someone," she says after a long silence. "About eight weeks ago a visitor came to the office. I was told to leave the room. That's when the paranoia started."\n\n"Who was he?"\n\n"I only saw him from behind. Tall. Expensive coat. Gold ring with a bird on it — a hawk or eagle." Her voice drops even lower, intimate in the dark. "I shouldn't be telling you this... but I don't know who else I can trust right now."\n\nYou listen to her breathe on the line and feel how easily this is sliding from business into something far more dangerous — and how little you want to stop it.`,
            delta: { stats: { empathy: 4, instinct: 5 }, rels: { vivienne: 8 } },
            nextScene: "chapter2_intro",
          },
        ],
      },
    ],
  },
  chapter2_intro: {
    beats: [
      {
        type: "pause",
        text: () => `*Chapter Two: What the City Buries*\n\nThree days have passed in a haze of rain, paranoia, and dead ends. You've been watching your back, sleeping lightly, chasing ghosts through the city's underbelly. Then the unmarked email from Vivienne arrives.`,
      },
      {
        type: "prose",
        text: () => `The diner on Corver Street hasn't changed in forty years — red vinyl, weak coffee, the smell of grease and old secrets. Vivienne is already there when you arrive, dark coat still on, hugging her curves, hands wrapped around a mug. Her eyes lock on you the moment you walk in, exhausted but sharp, the kind of look that makes the air feel heavier.\n\nShe looks like sin and survival wrapped in one dangerous package.`,
      },
      {
        type: "prose",
        text: () => `"I found something," she says before you even sit. "In his second phone." She slides a folded paper across the table. "He printed this three nights before he died. I think it's what was missing from the drawer."`,
      },
      {
        type: "pause",
        text: (p, flags, clues) => {
          const hasDrawer = clues.some(c => c.id === "drawer");
          return hasDrawer
            ? `The paper shows account numbers, transfers, *Herongate Holdings*, and at the bottom, circled hard in blue pen: *Marcus Voss.*\n\nYou fold it slowly. The empty drawer suddenly makes brutal sense. The silence between you feels loaded — this single sheet could get you both killed.`
            : `The paper shows account numbers, transfers, *Herongate Holdings*, and at the bottom, circled in blue pen: *Marcus Voss.*\n\n"How many people know you have this?" you ask.\n\nShe looks straight into your eyes. "You. And now you."`;
        },
      },
      {
        type: "choice",
        choices: [
          {
            text: "This needs to go somewhere safe before it gets you both killed.",
            sub: "The document is everything. Protecting it is protecting her.",
            outcome: () => `You spend the next hour making copies in three different locations, moving through rain-slick streets together. Your shoulders brush in narrow doorways. Vivienne watches you with dark, hungry eyes, gratitude mixing with something far more heated.\n\nWhen the last copy is secured she steps close, her body nearly pressing against yours. "Thank you," she murmurs, voice low and throaty. For a moment it looks like she's going to say more — or do more — but she holds back, the tension crackling between you like live wire.`,
            delta: { stats: { resolve: 6, authority: 4 }, rels: { vivienne: 6 } },
          },
          {
            text: "Take it straight to Crane. This is bigger than a PI case now.",
            sub: "You trust him. Mostly.",
            outcome: () => `Crane meets you in a dimly lit parking structure, concrete pillars casting long shadows. He reads the document twice, face hardening. Fear flickers in his eyes — real fear.\n\n"This goes public, Voss will know in an hour," he mutters. "He's got eyes everywhere."\n\nThe paper sits between you like a loaded gun. Crane finally pockets it. "Give me 48 hours." His voice is tight. You both know how easily this could end with both of you face-down in the river.`,
            delta: { stats: { authority: 5, instinct: 3 }, rels: { crane: 12, voss: -5 } },
          },
          {
            text: "You need to get to Herongate Holdings before Voss realizes the document exists.",
            sub: "Follow the money. It goes somewhere physical.",
            outcome: () => `The address leads to a nondescript brick building on Merchant Row. Something feels wrong the moment you arrive — too quiet, windows too dark. As you watch from across the street, the unmistakable prickle of being watched crawls up your spine. You turn, but the sidewalk is empty. The city is already closing in.`,
            delta: { stats: { instinct: 7, resolve: 5 }, rels: { ghost: 8 } },
          },
          
function Title({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{G}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 60%, rgba(184,134,11,.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, rgba(139,26,26,.05) 0%, transparent 50%)" }} />
      <div style={{ animation: "fadeUp .9s ease", position: "relative", maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 7, letterSpacing: 7, color: AMBER, marginBottom: 20, fontFamily: "'IBM Plex Mono', monospace" }}>A NARRATIVE INVESTIGATION</div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(72px,14vw,120px)", fontWeight: 700, letterSpacing: 6, color: "#d4cfc8", lineHeight: .85, marginBottom: 16 }}>
          BROKEN<br /><span style={{ color: AMBER2 }}>CITY</span>
        </h1>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`, margin: "28px auto", width: 200, opacity: .3 }} />
        <p style={{ color: "#2a2a2e", fontSize: 13, lineHeight: 1.9, marginBottom: 40, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
          A dead councilman. A city built on lies.<br />The truth is buried somewhere underneath.
        </p>
        <button onClick={onStart}
          onMouseEnter={e => { e.currentTarget.style.background = AMBER; e.currentTarget.style.color = "#000"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = AMBER2; }}
          style={{ padding: "15px 50px", background: "transparent", border: `1px solid ${AMBER}`, color: AMBER2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 5, fontSize: 14, cursor: "pointer", transition: "all .3s" }}>
          OPEN THE CASE →
        </button>
        <div style={{ marginTop: 28, fontSize: 7, color: "#1a1a1c", letterSpacing: 3, fontFamily: "'IBM Plex Mono', monospace" }}>CHAPTER ONE — THE DUTTON HOUSE</div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("title");
  const [player, setPlayer] = useState(null);

  if (phase === "title") return <Title onStart={() => setPhase("create")} />;
  if (phase === "create") return <CharCreate onStart={p => { setPlayer(p); setPhase("game"); }} />;
  if (phase === "game" && player) return <Game player={player} />;
  return null;
}
            text: "Ask Vivienne who else Dutton trusted. Someone gave him that list.",
            sub: "No one builds a file like this alone.",
            outcome: () => `She hesitates for a long moment, then leans in closer across the booth, her voice barely above a whisper. "There was someone he called late at night. He called them... Ghost." The word hangs heavy and intimate between you. "I never met them. I thought it was just a nickname."\n\nHer eyes stay locked on yours, something vulnerable and heated flickering there. You promise you'll find Ghost. She doesn't thank you with words — the slow, lingering look she gives you says far more.`,
            delta: { stats: { empathy: 5, instinct: 6 }, rels: { vivienne: 8, ghost: 10 } },
          },
        ],
      },
    ],
  },
};
