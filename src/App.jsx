import { useState, useEffect, useRef } from "react";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400&family=Barlow+Condensed:wght@300;400;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#0a0a0b;color:#d4cfc8;font-family:'Barlow Condensed',sans-serif;overflow-x:hidden;}
  ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#b8860b;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes notifIn{from{transform:translateX(110%);opacity:0;}to{transform:translateX(0);opacity:1;}}
`;

const AMBER = "#b8860b";
const AMBER2 = "#d4a017";
const RED2 = "#c0392b";

const defaultStats = { instinct: 50, authority: 40, empathy: 50, resolve: 45 };
const defaultRels = { vivienne: 20, ghost: 0, crane: 15, voss: 5 };

function applyDelta(obj, delta) {
  const n = { ...obj };
  for (const [k, v] of Object.entries(delta || {}))
    n[k] = Math.min(100, Math.max(0, (n[k] || 0) + v));
  return n;
}

function Notif({ n, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, []);
  const colors = { clue: AMBER2, rel: "#60a5fa", stat: "#4ade80", warn: RED2 };
  const labels = { clue: "EVIDENCE", rel: "RELATIONSHIP", stat: "STAT", warn: "DANGER" };
  return (
    <div style={{ background: "#0d0d0e", border: `1px solid #1e1e20`, borderLeft: `3px solid ${colors[n.type] || AMBER}`, padding: "10px 14px", borderRadius: 2, maxWidth: 240, animation: "notifIn .3s ease", fontSize: 11, color: "#888", boxShadow: "0 8px 32px rgba(0,0,0,.9)", position: "relative", marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ fontSize: 7, letterSpacing: 2.5, color: colors[n.type] || AMBER, marginBottom: 4 }}>{labels[n.type] || "UPDATE"}</div>
      {n.text}
      <button onClick={onClose} style={{ position: "absolute", top: 7, right: 9, background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 14 }}>×</button>
    </div>
  );
}

function StatBar({ label, val, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 8, letterSpacing: 2, color: "#444" }}>{label}</span>
        <span style={{ fontSize: 8, color: color || AMBER, fontFamily: "'IBM Plex Mono', monospace" }}>{val}</span>
      </div>
      <div style={{ height: 1, background: "#111" }}>
        <div style={{ height: 1, background: color || AMBER, width: `${val}%`, transition: "width .8s ease" }} />
      </div>
    </div>
  );
}

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

function CharCreate({ onStart }) {
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState({ name: "", background: "", style: "" });
  const [input, setInput] = useState("");

  const steps = [
    { prompt: "The city doesn't care who you are. But the record needs a name.\n\nWhat do they call you?", field: "name", type: "text", placeholder: "Enter your name..." },
    {
      prompt: "Before the PI license. Before the city ate you up and spit you out. Where'd you come from?",
      field: "background", type: "choice",
      choices: [
        { label: "Army Ranger — Two tours, Kandahar.", sub: "You read rooms the way most people read text. Violence was a tool once. Now it's a ghost.", value: "ranger" },
        { label: "NYPD Homicide — Eight years on the job.", sub: "You know how the system works. You also know exactly how it fails.", value: "cop" },
        { label: "Military Intelligence — Analyst, then operative.", sub: "You were never officially there. Half your records don't exist.", value: "intel" },
        { label: "Marine Force Recon — EOD specialist.", sub: "Bombs, booby traps, pressure plates. You learned to read the thing underneath the thing.", value: "recon" },
      ],
    },
    {
      prompt: "Everybody's got a method. How do you work a scene?",
      field: "style", type: "choice",
      choices: [
        { label: "Patient. Systematic. Every detail matters.", sub: "You miss nothing. You also move slow.", value: "methodical" },
        { label: "Instinct. Trust the gut, ask questions later.", sub: "You're usually right. When you're not, it costs you.", value: "instinct" },
        { label: "People first. The room is made of liars.", sub: "You read faces, not floors.", value: "social" },
        { label: "Push until something breaks.", sub: "Pressure reveals. It also leaves marks.", value: "aggressive" },
      ],
    },
  ];

  const current = steps[step];
  const bgLabels = { ranger: "Army Ranger", cop: "Former NYPD", intel: "MI Operative", recon: "Force Recon" };
  const styleLabels = { methodical: "Methodical", instinct: "Gut Instinct", social: "People Reader", aggressive: "Pressure Player" };

  function handleChoice(val) {
    const updated = { ...player, [current.field]: val };
    setPlayer(updated);
    if (step < steps.length - 1) setStep(step + 1);
    else onStart(updated);
  }

  function handleText() {
    if (!input.trim()) return;
    setPlayer({ ...player, name: input.trim() });
    setInput("");
    setStep(step + 1);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <style>{G}</style>
      <div style={{ maxWidth: 460, width: "100%", animation: "fadeUp .7s ease" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 7, letterSpacing: 5, color: AMBER, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }}>CASE FILE — SUBJECT IDENTITY</div>
          <div style={{ height: 1, background: "#111", marginBottom: 20 }} />
          {step > 0 && (
            <div style={{ marginBottom: 20 }}>
              {player.name && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>NAME: <span style={{ color: "#555" }}>{player.name}</span></div>}
              {player.background && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>BACKGROUND: <span style={{ color: "#555" }}>{bgLabels[player.background]}</span></div>}
              {player.style && <div style={{ fontSize: 11, color: "#333", fontFamily: "'IBM Plex Mono', monospace" }}>METHOD: <span style={{ color: "#555" }}>{styleLabels[player.style]}</span></div>}
            </div>
          )}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, lineHeight: 1.75, color: "#c8c4bc", marginBottom: 32, whiteSpace: "pre-line" }}>{current.prompt}</div>
        {current.type === "text" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleText()} placeholder={current.placeholder}
              style={{ background: "transparent", border: "none", borderBottom: `1px solid #222`, padding: "12px 0", color: "#d4cfc8", fontSize: 20, fontFamily: "'Playfair Display', serif", fontStyle: "italic", outline: "none", caretColor: AMBER2 }} />
            <button onClick={handleText}
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

function Game({ player }) {
  const [sceneId, setSceneId] = useState("prologue_1");
  const [beats, setBeats] = useState([]);
  const [pendingChoices, setPendingChoices] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [waitingContinue, setWaitingContinue] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [rels, setRels] = useState(defaultRels);
  const [clues, setClues] = useState([]);
  const [flags, setFlags] = useState({});
  const [notifs, setNotifs] = useState([]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [nextBeatIdx, setNextBeatIdx] = useState(0);
  const bottomRef = useRef(null);
  const notifId = useRef(0);

  function addNotif(type, text) {
    const id = notifId.current++;
    setNotifs(n => [...n, { id, type, text }]);
  }
  function removeNotif(id) { setNotifs(n => n.filter(x => x.id !== id)); }
  function addClue(clue) { setClues(c => [...c, clue]); addNotif("clue", `Evidence: ${clue.label}`); }
  function applyStatDelta(sd) {
    if (!sd) return;
    if (sd.stats) setStats(s => applyDelta(s, sd.stats));
    if (sd.rels) setRels(r => applyDelta(r, sd.rels));
    if (sd.clue) addClue(sd.clue);
    if (sd.flag) setFlags(f => ({ ...f, [sd.flag]: true }));
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [beats, outcome, pendingChoices]);
  useEffect(() => { startScene(sceneId); }, [sceneId]);

  function startScene(id) {
    const scene = SCENES[id];
    if (!scene) return;
    setBeats([]);
    setPendingChoices(null);
    setOutcome(null);
    setWaitingContinue(false);
    setNextBeatIdx(0);
    advanceBeats(scene.beats, 0, id);
  }

  function advanceBeats(sceneBs, idx, sid) {
    if (!sceneBs || idx >= sceneBs.length) return;
    const beat = sceneBs[idx];
    if (beat.type === "prose") {
      setBeats(b => [...b, { type: "prose", text: beat.text(player, flags, clues, stats, rels) }]);
      advanceBeats(sceneBs, idx + 1, sid);
    } else if (beat.type === "pause") {
      setBeats(b => [...b, { type: "prose", text: beat.text(player, flags, clues, stats, rels) }]);
      setWaitingContinue(true);
      setNextBeatIdx(idx + 1);
      window._currentScene = sid;
    } else if (beat.type === "examine") {
      setBeats(b => [...b, { type: "examine", items: beat.items, prompt: beat.prompt }]);
      setNextBeatIdx(idx + 1);
      window._currentScene = sid;
    } else if (beat.type === "choice") {
      setPendingChoices({ choices: beat.choices, sceneBs, idx, sid });
    }
  }

  function handleContinue() {
    setWaitingContinue(false);
    const scene = SCENES[window._currentScene];
    if (scene) advanceBeats(scene.beats, nextBeatIdx, window._currentScene);
  }

  function handleChoice(choice) {
    if (!pendingChoices) return;
    const { sceneBs, idx, sid } = pendingChoices;
    setPendingChoices(null);
    if (choice.delta) applyStatDelta(choice.delta);
    if (choice.outcome) {
      setOutcome(choice.outcome(player, flags, clues, stats, rels));
      setWaitingContinue(true);
      window._afterOutcome = () => {
        setOutcome(null);
        if (choice.nextScene) { setSceneId(choice.nextScene); return; }
        advanceBeats(sceneBs, idx + 1, sid);
      };
      window._currentScene = "__outcome__";
    } else if (choice.nextScene) {
      setSceneId(choice.nextScene);
    } else {
      advanceBeats(sceneBs, idx + 1, sid);
    }
  }

  function handleContinueOutcome() {
    setWaitingContinue(false);
    if (window._afterOutcome) { const fn = window._afterOutcome; window._afterOutcome = null; fn(); }
    else handleContinue();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
      <style>{G}</style>
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {notifs.map(n => <Notif key={n.id} n={n} onClose={() => removeNotif(n.id)} />)}
      </div>
      {showEvidence && <EvidencePanel clues={clues} onClose={() => setShowEvidence(false)} />}
      {showStats && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.9)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowStats(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 300, background: "#0a0a0b", border: `1px solid #1e1e20`, borderTop: `2px solid ${AMBER}`, padding: 24 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: AMBER, marginBottom: 20 }}>{player.name?.toUpperCase()}</div>
            <StatBar label="INSTINCT" val={stats.instinct} color={AMBER2} />
            <StatBar label="AUTHORITY" val={stats.authority} color="#60a5fa" />
            <StatBar label="EMPATHY" val={stats.empathy} color="#4ade80" />
            <StatBar label="RESOLVE" val={stats.resolve} color={RED2} />
            <div style={{ height: 1, background: "#111", margin: "16px 0" }} />
            <StatBar label="VIVIENNE" val={rels.vivienne} color="#f9a8d4" />
            <StatBar label="GHOST" val={rels.ghost} color="#a78bfa" />
            <StatBar label="CRANE" val={rels.crane} color="#60a5fa" />
            <StatBar label="VOSS" val={rels.voss} color={RED2} />
            <button onClick={() => setShowStats(false)} style={{ marginTop: 16, fontSize: 8, letterSpacing: 3, color: "#333", background: "none", border: "none", cursor: "pointer" }}>CLOSE ×</button>
          </div>
        </div>
      )}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0a0a0b", borderBottom: "1px solid #0f0f10", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, letterSpacing: 3, color: AMBER, fontWeight: 700 }}>BROKEN CITY</div>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => setShowEvidence(true)} style={{ fontSize: 8, letterSpacing: 2, color: clues.length > 0 ? AMBER2 : "#222", background: "none", border: "none", cursor: "pointer" }}>EVIDENCE{clues.length > 0 ? ` [${clues.length}]` : ""}</button>
          <button onClick={() => setShowStats(true)} style={{ fontSize: 8, letterSpacing: 2, color: "#333", background: "none", border: "none", cursor: "pointer" }}>DOSSIER</button>
        </div>
      </div>
      <div style={{ flex: 1, padding: "32px 24px 120px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        {beats.map((beat, i) => {
          if (beat.type === "prose") return (
            <div key={i} style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, lineHeight: 1.9, color: "#b8b4ae", marginBottom: 22, animation: "fadeUp .5s ease" }}
              dangerouslySetInnerHTML={{ __html: beat.text.replace(/\*([^*]+)\*/g, "<em>$1</em>") }} />
          );
          if (beat.type === "examine") return (
            <div key={i} style={{ animation: "fadeUp .5s ease", marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: AMBER, marginBottom: 16 }}>{beat.prompt || "EXAMINE THE SCENE"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {beat.items.map((item, j) => (
                  <button key={j} onClick={() => {
                    if (item.clue) addClue(item.clue);
                    if (item.stat) applyStatDelta(item.stat);
                    setBeats(b => b.map((x, xi) => xi === i ? { ...x, items: x.items.filter((_, ji) => ji !== j) } : x));
                    if (beat.items.length <= 1) {
                      setBeats(b => b.filter((_, xi) => xi !== i));
                      const scene = SCENES[window._currentScene];
                      if (scene) advanceBeats(scene.beats, nextBeatIdx, window._currentScene);
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
                  <button onClick={() => {
                    setBeats(b => b.filter((_, xi) => xi !== i));
                    const scene = SCENES[window._currentScene];
                    if (scene) advanceBeats(scene.beats, nextBeatIdx, window._currentScene);
                  }} style={{ fontSize: 8, letterSpacing: 3, color: "#444", background: "none", border: "none", cursor: "pointer", padding: "8px 0", textAlign: "left" }}>
                    DONE EXAMINING →
                  </button>
                )}
              </div>
            </div>
          );
          return null;
        })}
        {outcome && (
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, lineHeight: 1.9, color: "#888", marginBottom: 22, fontStyle: "italic", borderLeft: `2px solid ${AMBER}`, paddingLeft: 16, animation: "fadeUp .4s ease" }}
            dangerouslySetInnerHTML={{ __html: outcome.replace(/\*([^*]+)\*/g, "<em>$1</em>") }} />
        )}
        {waitingContinue && (
          <div style={{ animation: "fadeUp .4s ease", marginBottom: 24 }}>
            <button onClick={outcome ? handleContinueOutcome : handleContinue}
              onMouseEnter={e => { e.currentTarget.style.color = AMBER2; e.currentTarget.style.borderColor = AMBER2; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#1e1e20"; }}
              style={{ fontSize: 8, letterSpacing: 4, color: "#333", background: "none", border: "1px solid #1e1e20", padding: "10px 24px", cursor: "pointer", transition: "all .3s", fontFamily: "'Barlow Condensed', sans-serif" }}>
              CONTINUE →
            </button>
          </div>
        )}
        {pendingChoices && (
          <div style={{ animation: "fadeUp .4s ease", marginTop: 8, marginBottom: 24 }}>
            <div style={{ fontSize: 7, letterSpacing: 4, color: "#2a2a2e", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>WHAT DO YOU DO?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingChoices.choices.map((c, i) => {
                const locked = c.requiresClue && !clues.some(cl => cl.id === c.requiresClue);
                return (
                  <button key={i} onClick={() => !locked && handleChoice(c)}
                    onMouseEnter={e => { if (!locked) { e.currentTarget.style.background = "#0d0d0e"; e.currentTarget.style.borderColor = AMBER; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = locked ? "#0f0f10" : "#1e1e20"; }}
                    style={{ textAlign: "left", padding: "14px 18px", background: "transparent", border: `1px solid ${locked ? "#0f0f10" : "#1e1e20"}`, cursor: locked ? "default" : "pointer", transition: "all .2s", opacity: locked ? .4 : 1 }}>
                    <div style={{ fontSize: 14, color: locked ? "#333" : "#c8c4bc", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: .5, fontWeight: 600, marginBottom: c.sub && !locked ? 3 : 0 }}>{c.text}</div>
                    {locked && <div style={{ fontSize: 9, color: "#2a2a2e", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>[REQUIRES EVIDENCE]</div>}
                    {c.sub && !locked && <div style={{ fontSize: 11, color: "#444", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>{c.sub}</div>}
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
// HOW TO USE GROK PLACEHOLDERS:
// Search for "GROK_PLACEHOLDER" in this file.
// Each one is a backtick string you paste Grok's prose into.
// Only replace what's between the backticks on that line.
// Do NOT touch anything else.

const SCENES = {
  prologue_1: {
    beats: [
      {
        type: "pause",
        text: () => `BROKEN CITY\n\n*Chapter One: The Dutton House*\n\n*"Every investigation starts the same way. Someone calls. Someone's already dead."*`,
      },
      {
        type: "prose",
        text: (p) => `The call comes in at 2:17 AM.
You don’t remember answering it. You remember the bourbon burning down your throat, the cheap television glow flickering across your bare chest and the half-empty bottle on the table. Your cock is still half-hard from the half-hearted stroke session that went nowhere. Then the phone is in your hand and a woman’s voice slices through the stale air—clipped, controlled, the kind of tight control that means she’s barely holding her shit together.
      {
        type: "prose",
      text: (p) => `"Is this ${p.name}?" A pause. "The investigator."`,
      },
      {
        type: "prose",
        text: (p) => `You say yes before you even think about it.
“My name is Vivienne Cole. I worked for Councilman Dutton.” A sharp inhale. “He’s dead. The police are calling it suicide. I don’t believe that for a second. I need someone who doesn’t suck the city’s dick… someone who still knows how to dig when the truth is ugly and bloody.”
      },
      {
        type: "pause",
        text: () => `An hour later you’re standing in the cold rain outside Dutton’s townhouse on Aldrich Street. The yellow police tape snaps and flutters like it’s trying to escape. Two uniforms huddle by the cruiser, bored and wet. Detective Ray Crane stands near the door—tall, weathered, face like worn leather, arms crossed over a chest that’s seen too many bodies. His eyes lock on you immediately, tired and hard.`,
      },
      {
        type: "prose",
        text: () => `"Cole called you," Crane says. It isn't a question. He's got the specific exhaustion of someone who made peace with the bureaucracy a long time ago. "You know I can't let you inside."\n\n"I know."\n\n"Crime scene's sealed."\n\n"I know, Ray."`,
      },
      {
        type: "prose",
        text: () => `He stares at you for a long beat. Crane knew you back when you both still gave a fuck about the badge. He knows exactly what kind of man you became after you walked away.
Without a word he shifts just enough to let you pass. “You didn’t hear it from me,” he growls low. “ME’s calling it self-inflicted. Gunshot, study upstairs. Nobody in the house.” His jaw tightens. “Nobody claims to have been in the fucking house."`,
      },
      {
        type: "pause",
        text: () => `he house reeks of old money, stale cigarette smoke, and the coppery tang of fresh blood.
Upstairs, the study door creaks open. Councilman Marcus Dutton is slumped in his leather chair, brains and blood sprayed across the expensive oak desk and the wall behind him. The gunshot wound is a ragged, wet hole in his right temple. The gun lies near his right hand like it was placed there by someone who didn’t know he was left-handed. His eyes are still open, glassy and surprised. The staging is too clean. Too perfect. Someone wanted this closed fast and dirty.`,
      },
      {
        type: "examine",
        prompt: "EXAMINE THE SCENE — Collect what you can before the window closes",
        items: [
          {
            label: "The ashtray on the end table",
            hint: "Dutton didn't smoke. Somebody did.",
            clue: { id: "ashtray", label: "Foreign Cigarette Butts", desc: "Three cigarette butts. A European brand — Gauloises. Dutton was a documented non-smoker. Someone else was here recently." },
          },
          {
            label: "Dutton's desk — the open drawer",
            hint: "Something's missing. You can feel it.",
            clue: { id: "drawer", label: "Empty Desk Drawer", desc: "The bottom-left drawer is open and empty, but the felt lining has rectangular impressions — something sat there for years. Gone now." },
          },
          {
            label: "The whiskey glass near the body",
            hint: "The angle is wrong.",
            clue: { id: "glass_position", label: "Glass Placement Anomaly", desc: "The whiskey glass is on the right side of the desk. Dutton was left-handed — his watch confirms it. A right-handed pour that he never made." },
          },
          {
            label: "The window latch",
            hint: "Cold air somewhere it shouldn't be.",
            clue: { id: "window", label: "Unlatched Study Window", desc: "The study window is unlocked from the inside — but the latch has fresh scratches on old brass. The window faces the rear alley. Someone could have come and gone." },
          },
        ],
      },
      {
        type: "pause",
       text: (p, flags, clues) => {
  const found = clues.length;
  if (found >= 3) return `You've seen enough. Maybe too much. The room is screaming a story that doesn't match the official lie.\n\nVivienne Cole waits at the foot of the stairs—tall, dark coat hugging every curve, rain still clinging to her dark hair. She watches you descend with hungry, calculating eyes, like she's already imagining what you'll do to the people who did this.`;
  if (found >= 1) return `You've seen enough for now.\n\nVivienne Cole stands at the foot of the stairs—tall, composed, dark coat clinging to her body. She tracks every step you take, her gaze heavy with something raw between desperation and raw want.`;
  return `You've done a first pass.\n\nVivienne Cole is waiting at the bottom of the stairs—tall, controlled, eyes locked on you like she’s measuring exactly how dangerous you could be between her thighs or in her corner.`;
},
      },
      {
        type: "prose",
        text: () => `“What did you find?” she asks, voice lower and rougher than on the phone.
You step close enough that you can smell rain on her coat mixed with warm skin and faint perfume. Her breasts rise and fall under the dark fabric as she breathes. For a second the dead man upstairs disappears and all you feel is the charged space between your bodies—close enough that one wrong move could turn professional into something much filthier.`,
      },
      {
        type: "choice",
        choices: [
          {
            text: "Tell her everything. See how she reacts.",
            sub: "Information is leverage. But sharing it first means giving it away.",
            outcome: (p, flags, clues) => clues.some(c => c.id === "ashtray") || clues.some(c => c.id === "glass_position")
  ? `// GROK_PLACEHOLDER_08 — ROMANCE/VIVIENNE: her reaction to what you share. What her face does. Keep the clue conditional — two different responses based on whether ashtray/glass clues were found.
outcome: (p, flags, clues) => clues.some(c => c.id === "ashtray") || clues.some(c => c.id === "glass_position")
  ? `The moment the words leave her mouth the tension snaps.

You grab her by the coat and shove her back against the wall hard enough that a picture frame rattles. Vivienne gasps, but her hands are already fisting your shirt, pulling you in instead of pushing away.

“Fuck you for making me wait,” she growls, voice raw.

You rip her coat open, buttons scattering across the hardwood. Her blouse is next — you yank it down, exposing full, heavy tits with dark, stiff nipples. She moans when you pinch one hard, arching into your hand. Your other hand shoves up her skirt, finding her cunt already soaked through her panties. You rip them aside and slide two thick fingers straight into her tight, dripping hole.

“Jesus—fuck—” she hisses, hips bucking against your hand.

You finger-fuck her rough and deep while your mouth attacks her neck, biting hard enough to leave marks. Her walls clench around your fingers like she’s starving for it. She’s loud, unashamed, grinding down on your hand while rain beats against the windows and a dead man lies one floor above.

You pull your fingers out, slick with her juices, and shove them into her mouth. She sucks them clean, eyes wild.

“On your knees,” you order.

She drops instantly, fingers tearing at your belt. The second your cock springs free — thick, heavy, already leaking — she takes you deep into her throat with a wet gag. No teasing. She fucks her own face on your dick, saliva dripping down her chin onto her tits while she looks up at you with pure filthy need.

You grab her hair and thrust harder, fucking her mouth until her mascara runs. When you finally pull out she’s gasping, strings of spit connecting her lips to your glistening cock.

“Fuck me,” she demands, voice wrecked. “Right here. Make it hurt.”

You spin her around, bend her over the newel post, and slam into her cunt in one brutal thrust. She cries out — half pain, half pleasure — as you bury yourself balls-deep. Her pussy is scorching hot and soaking wet, gripping you like a vice.

You fuck her hard and fast, the sound of skin slapping skin echoing through the dead man’s house. One hand wraps in her hair, the other slaps her ass hard enough to leave red handprints. Every thrust forces a broken moan out of her.

“Harder—fuck—don’t stop—” she gasps, pushing back onto your cock like she wants to be ruined.

You feel her start to come first — her cunt fluttering and squeezing around you. You don’t slow down. You pound her through it until her legs shake and she’s almost sobbing with pleasure.

Only then do you let go, burying yourself to the hilt and flooding her pussy with thick, hot cum. You keep thrusting through your orgasm, pushing your load deeper while she milks every drop.

When you finally pull out, cum drips down her thighs onto the floor. Vivienne stays bent over, breathing hard, a dark, satisfied smile on her wrecked face.

“We’re not done,” she says hoarsely. “Not even close.”`
  : `She listens with her arms crossed tight, pushing her breasts up against the coat. Something shifts in her posture when you describe the study—her thighs pressing together just slightly, a soft sound escaping her throat. “You believe me,” she whispers, voice thick with need.\n\n“I believe the room,” you reply, eyes dropping to her mouth for a beat too long. “Who had access to this house?”`,
delta: { rels: { vivienne: 15 }, stats: { instinct: 6, resolve: -2 } },
            delta: { rels: { vivienne: 8 }, stats: { empathy: 3 } },
          },
          {
            text: "Ask her where she was tonight before answering anything.",
            sub: "She hired you. That doesn't make her clean.",
            outcome: () => `She doesn’t flinch. Doesn’t look away. Her eyes stay locked on yours, steady and challenging.
“Here. Until around eleven. Then he asked me to leave.” She pauses, tongue touching her lower lip. “Which he’d never done before. Fourteen months, and the bastard had never sent me home early.”
You watch the way her pulse jumps in her throat. That’s either the truth or the best goddamn lie you’ve heard in years. Part of you wants to push her against the wall and find out which it is with your hands."`,
            delta: { stats: { instinct: 4, authority: 3 }, rels: { vivienne: 3 } },
          },
          {
            text: "Keep your cards close. Tell her nothing — you'll need payment upfront.",
            sub: "Professionals don't emote.",
            outcome: () => `She reads you correctly — that this is a negotiation. She opens her bag. An envelope. Thick.\n\n"There's more if you find out what happened." She sets it on the newel post. "I need someone in my corner who isn't already owned by this city."\n\nYou pick up the envelope.`,
            delta: { stats: { authority: 5, instinct: 2 }, rels: { vivienne: 4 } },
          },
          {
            text: "Show her the window evidence — ask if Dutton was afraid of anyone.",
            sub: "Only available if you found it.",
            requiresClue: "window",
            outcome: () => `You describe the scratched window latch. Vivienne goes completely still, her full lips parting in surprise. For a moment the polished mask shatters and you see raw fear—and something hotter—flash across her face.
“He had a locksmith re-key the whole house six weeks ago,” she breathes, voice low and shaky. “He wouldn’t tell me why. I asked twice.”
Her chest rises faster now. Whatever Marcus Dutton was afraid of, it started six weeks ago—and it’s making her nipples tighten against the fabric of her blouse."`,
            delta: { stats: { instinct: 6, resolve: 3 }, rels: { vivienne: 10 } },
          },
        ],
      },
      {
        type: "pause",
        text: () => `You're outside fifteen minutes later. Crane's car is still there, engine running, exhaust curling into the cold air.\n\nHe rolls down the window when you approach.`,
      },
      {
        type: "prose",
        text: () => `"She's not telling you everything," he says.\n\n"Nobody ever does."\n\n"This one especially." He looks straight ahead. "Dutton was supposed to testify next month. City contracts. The kind of testimony that puts people away." A beat. "People with money and patience."\n\n"Who runs that investigation?"\n\nCrane just looks at you. "Deputy Mayor Voss." He rolls the window back up.`,
      },
      {
        type: "pause",
        text: () => `The city pulses around you—traffic hum, distant sirens, cold rain sliding down your neck and soaking through your shirt.
You walk alone through the empty streets at 3 AM, every shadow feeling like eyes on your back. The pieces are clicking together too fast, and the picture forming is violent, filthy, and dangerous. People with real power don’t stage suicides this cleanly unless the truth involves blood, money, and bodies.`,
      },
      {
        type: "choice",
        choices: [
          {
            text: "Go back to your apartment. Map out what you have before you move.",
            sub: "Slow and careful. Don't step on your own evidence.",
            outcome: () => `Back in your apartment at 4 AM the case map covers your wall—red string, names, gaps that feel like open wounds. Dutton. Voss. Vivienne’s dark eyes and tighter curves. The cigarettes. The window. The drawer.
You jerk off once in the shower just to take the edge off the adrenaline and frustration, then fall asleep in the chair. When you wake at seven the plan is razor sharp and your cock is hard again from the dreams.`,
            delta: { stats: { instinct: 5, resolve: 4 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Go to the morgue. The body tells a story the police report won't.",
            sub: "You still have contacts there. Maybe.",
            outcome: () => `The morgue smells like bleach, old blood, and refrigerated death. Ferris lets you in with a grunt and gives you twenty minutes.
You pull back the sheet. Dutton’s body is pale and stiff, the ragged exit wound in the back of his skull ugly and wet-looking even hours later. The entry wound angle is all wrong for a self-inflicted shot—too shallow, too awkward. Someone pressed the gun to his head from the side while he was sitting, then tried to make it look clean. The smell of shit and piss from when his bowels let go still clings faintly to the air. Whoever did this didn’t care about dignity.`,
            delta: { stats: { instinct: 7, authority: 2 }, rels: { crane: 3 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Find out who smokes Gauloises in this city.",
            sub: "Niche cigarettes are a fingerprint.",
            requiresClue: "ashtray",
            outcome: () => `It takes two hours of calling in favors. Three import shops in the city stock Gauloises. You get a name from the third one.\n\nValentine Morrow. Morrow works for Deputy Mayor Voss.\n\nThere's your first connection.`,
            delta: { stats: { instinct: 8, resolve: 3 }, rels: { ghost: 5 } },
            nextScene: "chapter2_intro",
          },
          {
            text: "Call Vivienne back. Push now, before she builds the wall higher.",
            sub: "Information gaps close fast when people lawyer up.",
            // GROK_PLACEHOLDER_14 — ROMANCE/VIVIENNE: late night call, 4AM. Her voice is different — less armor. She says more than she means to. Protagonist aware this is getting too close. 4 paragraphs.
            outcome: () => `// GROK_PLACEHOLDER_14 — ROMANCE/VIVIENNE: late night call, 4AM. Her voice is different — less armor. She says more than she means to. Protagonist aware this is getting too close. 4 paragraphs.
outcome: () => `The second you step into her apartment the door barely clicks shut before she’s on you.

Vivienne pushes you against the wall, kissing you like she’s trying to devour you — all teeth and tongue and desperation. Her hands are already undoing your belt while yours rip her blouse open. You shove her bra down and take one hard nipple into your mouth, sucking and biting until she moans loud enough to wake the neighbors.

She drops to her knees right there in the hallway, yanks your pants down, and swallows your cock in one greedy motion. The wet heat of her throat is obscene. She gags herself on you, spit running down her chin onto her tits as she bobs fast and sloppy, eyes watering but never breaking eye contact.

You fist her hair and fuck her face until her mascara streaks black down her cheeks. When you finally pull her off, she’s gasping, lips swollen and shiny.

“Bedroom,” she pants. “Now.”

You don’t make it that far.

You bend her over the back of the couch, flip her skirt up, and slam into her dripping cunt from behind. She’s soaked — obscenely wet — and the first thrust makes her scream into the cushions. You fuck her deep and brutal, hips snapping against her ass, one hand gripping her hip hard enough to bruise while the other reaches around to rub her swollen clit.

“Harder,” she begs, voice breaking. “Fuck me like you hate me.”

You give her exactly what she wants — pounding her so hard the couch scrapes across the floor. Her pussy clenches and flutters around your cock as she comes violently, squirting down her thighs and soaking your balls.

You don’t stop. You flip her onto her back on the couch, throw her legs over your shoulders, and drive back in even deeper. The new angle makes her eyes roll back. You choke her lightly while you rail her, watching her face twist in pleasure-pain.

When you finally come you bury yourself to the root and pump rope after thick rope of cum straight into her spasming cunt. She milks you dry, trembling underneath you, whispering filthy praise against your neck.

For a long moment the only sound is both of you breathing hard, sweat-slick and spent.

Vivienne laughs softly, voice hoarse. “I knew you’d fuck like that.”`,
delta: { rels: { vivienne: 18 }, stats: { instinct: 8, empathy: -3 } },"`,
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
        text: () => `*Chapter Two: What the City Buries*\n\nThree days of chasing ghosts, dead ends, and the constant itch between your shoulder blades like someone's watching. Three days of waking up hard and falling asleep with the case map burning behind your eyes.\n\nThen the unmarked email hits your inbox: a meeting request from Vivienne Cole.`,
      },
      {
        type: "prose",
        text: () => `The old diner on Corver Street hasn't changed in decades. Red vinyl, weak coffee, a counter that's absorbed forty years of bad news. She's already in the booth when you arrive — dark coat open just enough, hands wrapped tight around a mug. Her eyes find you instantly, dark and watchful, like she's been measuring exactly how dangerous you look in person.`,
      },
      {
        type: "prose",
        text: () => `"I found something," she says, before you've fully sat down. "In his second phone. The one I didn't tell the police about." She slides a folded piece of paper across the table. "He printed this out three nights before he died. I think it's what was in the drawer."`,
      },
      {
        type: "pause",
        text: (p, flags, clues) => {
          const hasDrawer = clues.some(c => c.id === "drawer");
          return hasDrawer
            ? `The paper is a partial list — account numbers, dirty transfers, a shell company. *Herongate Holdings.* At the bottom, circled viciously in blue pen: *Marcus Voss.*\n\nYou fold it slowly. The empty drawer suddenly makes a lot more sense.`
            : `The paper is a partial list — account numbers, dirty transfers, a shell company. *Herongate Holdings.* At the bottom, circled viciously in blue pen: *Marcus Voss.*\n\n"How many people know you have this?"\n\nShe looks at you, lips pressed tight. "You. And now you."`;
        },
      },
      {
        type: "choice",
        choices: [
          {
            text: "This needs to go somewhere safe before it gets you both killed.",
            sub: "The document is everything. Protecting it is protecting her.",
            // GROK_PLACEHOLDER_18 — ROMANCE/VIVIENNE: the hour making copies together. Proximity. She watches protagonist work, something shifts. A moment where she almost says something and doesn't. 4 paragraphs.
            outcome: () => `You spend the next hour making copies — lawyer, anonymous drop, old alias safety box.\n\nVivienne stays close the whole time, her body brushing yours more than necessary. You can feel the heat coming off her. At one point she leans in so close you feel her breath on your neck and almost says something before she catches herself.\n\n"Now," you say finally. "Tell me what Dutton was afraid of. All of it."`,
            delta: { stats: { resolve: 6, authority: 4 }, rels: { vivienne: 6 } },
          },
          {
            text: "Take it straight to Crane. This is bigger than a PI case now.",
            sub: "You trust him. Mostly.",
            // GROK_PLACEHOLDER_19 — VIOLENCE/ATMOSPHERE: parking structure with Crane. Dark, exposed, dangerous. Crane is scared and that's worse than anything. 4 paragraphs.
            outcome: () => `Crane meets you in the dark parking structure. Concrete and shadows, the kind of place where bad decisions get made permanent.\n\nHe reads the paper, face going tight and angry. "This leaks, Voss will have both our heads by morning. He owns half this city."\n\nYou step closer. "I'm asking if you still give a damn that a man had his brains blown out."\n\nCrane stares into the dark for a long time, then pockets the paper. "Forty-eight hours. After that we're both probably dead."`,
            delta: { stats: { authority: 5, instinct: 3 }, rels: { crane: 12, voss: -5 } },
          },
          {
            text: "Get to Herongate Holdings before Voss realizes the document exists.",
            sub: "Follow the money. It goes somewhere physical.",
            // GROK_PLACEHOLDER_20 — VIOLENCE/ATMOSPHERE: tracking Herongate to a physical location. Something wrong about the building. Protagonist is being watched and doesn't know it yet. End on dread. 4 paragraphs.
            outcome: () => `The shell company leads to a quiet building on Merchant Row. The registered agent is tied to a construction firm that pocketed forty million in dirty city contracts.\n\nYou stand across the street in the rain watching the dark windows. The place feels wrong — too still, too watchful. You can feel eyes on you even though the street looks empty.\n\nThe paranoia crawls up your spine and settles heavy. You're building the picture. It's an ugly one.`,
            delta: { stats: { instinct: 7, resolve: 5 }, rels: { ghost: 8 } },
          },
          {
            text: "Ask Vivienne who else Dutton trusted. Someone gave him that list.",
            sub: "No one builds a file like this alone.",
            // GROK_PLACEHOLDER_21 — ROMANCE/VIVIENNE: she gives up the Ghost detail. Something intimate about the admission — things Dutton never told her. Protagonist promises to find Ghost. She doesn't say thank you. She doesn't have to. 4 paragraphs.
            outcome: () => `She stares into her coffee for a long time, then speaks low.\n\n"There was someone he called late at night. He called them Ghost." Her voice drops. "I thought it was code. He never told me details, but sometimes after those calls he'd look at me like he wanted to confess everything."\n\nYou nod slowly. "Then I'll find Ghost."\n\nShe doesn't say thank you. She doesn't have to.`,
            delta: { stats: { empathy: 5, instinct: 6 }, rels: { vivienne: 8, ghost: 10 } },
          },
        ],
      },
    ],
  },
};

// ─── TITLE ────────────────────────────────────────────────────────────────
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
