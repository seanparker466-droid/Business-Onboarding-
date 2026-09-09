 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, Check, ChevronRight, ClipboardCheck,
  Clock3, Compass, Database, Hammer, Layers3, Mail, MapPin, Sparkles,
  TrendingUp, UserRound, X, Zap
} from "lucide-react";
import { sections } from "../lib/questions";
import { createClient } from "../lib/supabase-browser";

type Answers = Record<string, string[] | string>;
const KEY = "renovationDiscovery_v5_first_client";

const icons = [Compass, Hammer, TrendingUp, ClipboardCheck, Layers3, MapPin, Database, UserRound, BarChart3, Clock3, Mail, Zap, Sparkles, Database, TrendingUp];

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const submitLock = useRef(false);

  const sec = sections[step];
  const answeredCount = Object.values(answers).filter(v => Array.isArray(v) ? v.length > 0 : String(v).trim().length > 0).length;
  const totalQuestions = sections.reduce((n, s) => n + s.qs.length, 0);
  const pct = Math.round(((step + 1) / sections.length) * 100);
  const questionsInSection = sec.qs.length;
  const sectionAnswered = sec.qs.filter(q => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : String(v || "").trim().length > 0;
  }).length;

  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "null");
      if (x) {
        setAnswers(x.answers || {});
        setContact(x.contact || { name: "", email: "", company: "" });
        setStep(Math.min(Number(x.step) || 0, sections.length - 1));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ answers, contact, step }));
    setSavedAt(new Date());
  }, [answers, contact, step]);

  function startOver() {
    if (!window.confirm("Start over? This will clear all saved answers for this assessment.")) return;
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(`${KEY}:submitted`);
    setAnswers({});
    setContact({ name: "", email: "", company: "" });
    setStep(0);
    setSubmitError("");
  }

  function choose(id: string, type: string, value: string) {
    setAnswers(a => {
      if (type === "single") {
        const next = { ...a, [id]: [value] };
        if (value !== "Other") delete next[`${id}_other`];
        return next;
      }
      const cur = Array.isArray(a[id]) ? a[id] as string[] : [];
      const isSelected = cur.includes(value);
      const nextValues = isSelected ? cur.filter(x => x !== value) : [...cur, value];
      const next = { ...a, [id]: nextValues };
      if (value === "Other" && isSelected) delete next[`${id}_other`];
      return next;
    });
  }

  function val(id: string) { return answers[id] || []; }

  function next() {
    if (step < sections.length - 1) setStep(step + 1);
  }

  async function submit() {
    setSubmitError("");
    if (!contact.name.trim() || !contact.company.trim() || !contact.email.trim()) {
      setSubmitError("Please complete your name, company name, and email before submitting.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setSubmitError("Please enter a valid email address before submitting.");
      return;
    }
    if (saving || submitLock.current) return;
    submitLock.current = true;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("assessments").insert({
        contact_name: contact.name || null,
        company_name: contact.company || null,
        email: contact.email || null,
        answers
      });
      if (error) {
        console.error(error);
        setSubmitError(`I couldn't save the assessment. ${error.message}`);
        return;
      }
      localStorage.removeItem(KEY);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError("I couldn't connect to the database. Please check your connection and try again.");
    } finally {
      setSaving(false);
      submitLock.current = false;
    }
  }

  if (submitted) return <Result answers={answers} contact={contact} />;

  const Icon = icons[step % icons.length];

  return (
    <>
      <style jsx global>{`
        .other-answer-wrap { margin-top:14px; padding:14px; border:1px solid rgba(255,255,255,.10); border-radius:14px; background:rgba(255,255,255,.025); }
        .other-answer-label { display:block; margin-bottom:8px; font-size:12px; font-weight:700; letter-spacing:.04em; color:rgba(255,255,255,.72); }
        .other-answer-field { width:100%; }
  html, body { overflow-x: hidden; }
  .header-actions { display:flex; align-items:center; gap:12px; }
  .start-over-btn { border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.035); color:rgba(255,255,255,.72); border-radius:10px; padding:8px 11px; font-size:11px; font-weight:700; cursor:pointer; }
  .start-over-btn:hover { background:rgba(255,255,255,.07); color:#fff; }
  .start-over-btn:disabled { opacity:.45; cursor:not-allowed; }
  .privacy-note { margin-top:8px; text-align:center; color:rgba(255,255,255,.36); font-size:10px; }

  *, *::before, *::after { box-sizing: border-box; }

  @media (max-width: 820px) {
    .app-shell { width:100%; min-height:100dvh; overflow-x:hidden; }
    .app-header { padding:10px 14px; }
    .header-inner { min-height:38px; gap:8px; }
    .wordmark { font-size:10px; letter-spacing:.12em; white-space:nowrap; }
    .wordmark-mark { width:25px; height:25px; }
    .save-status { font-size:9px; white-space:nowrap; }
    .header-actions { gap:7px; }
    .start-over-btn { padding:7px 9px; font-size:9px; }
    .progress-wrap { padding:9px 14px 10px; }
    .progress-top { font-size:10px; margin-bottom:6px; }
    .workspace { display:block; width:100%; }
    .section-rail { display:none !important; }
    .content { width:100%; max-width:100%; padding:22px 14px 120px; margin:0; }
    .section-intro { margin-bottom:18px; }
    .section-kicker { font-size:10px; letter-spacing:.12em; }
    .section-intro h1 { font-size:clamp(26px,8vw,34px); line-height:1.05; margin:9px 0 8px; max-width:100%; overflow-wrap:anywhere; }
    .section-intro p { font-size:14px; line-height:1.55; margin:0; }
    .section-stats { flex-wrap:wrap; gap:8px 14px; margin-top:12px; font-size:11px; }
    .identity-card { display:block !important; padding:16px !important; margin-bottom:14px; }
    .identity-copy { margin-bottom:15px; }
    .identity-copy h2 { font-size:19px; line-height:1.2; margin:5px 0 6px; }
    .identity-copy p { font-size:13px; line-height:1.5; }
    .identity-fields { display:grid !important; grid-template-columns:1fr !important; gap:11px !important; }
    .identity-fields input, .field, .field.area { width:100%; max-width:100%; min-width:0; font-size:16px; }
    .question-stack { gap:12px; }
    .question-card { display:block !important; width:100%; padding:16px !important; border-radius:14px; }
    .question-number { margin-bottom:8px; font-size:10px; }
    .question-body { width:100%; min-width:0; }
    .question-body h2 { font-size:18px; line-height:1.3; margin-bottom:8px; }
    .question-hint { font-size:12px; line-height:1.45; margin-bottom:12px; }
    .choice-grid { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; width:100%; }
    .choice-card { width:100%; min-height:48px; padding:12px 13px !important; text-align:left; font-size:14px; line-height:1.25; touch-action:manipulation; }
    .choice-marker { flex:0 0 22px; width:22px; height:22px; }
    .error-banner { margin-top:12px; font-size:12px; line-height:1.4; }
    .bottom-nav { position:sticky; bottom:0; z-index:20; width:calc(100% + 28px); margin-left:-14px; margin-right:-14px; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); background:rgba(10,14,20,.96); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-top:1px solid rgba(255,255,255,.08); gap:8px; }
    .secondary-btn, .primary-btn { min-height:46px; padding:10px 13px !important; font-size:13px; touch-action:manipulation; }
    .secondary-btn { flex:0 0 auto; }
    .primary-btn { flex:1 1 auto; justify-content:center; }
    .nav-progress { display:none; }
    .footer-note { margin-top:14px; font-size:10px; line-height:1.45; }
    .results-page { width:100%; padding:18px 14px 40px; }
    .results-hero-grid, .results-grid { grid-template-columns:1fr !important; }
    .results-hero { padding:18px !important; }
    .results-hero h1 { font-size:clamp(26px,8vw,36px); overflow-wrap:anywhere; }
    .readiness-ring { margin:4px auto 0; }
    .result-heading { display:block !important; }
    .signal-count { display:inline-block; margin-top:7px; }
    .result-module { grid-template-columns:30px 1fr auto !important; gap:10px !important; padding:13px !important; }
    .module-main h3 { font-size:15px; }
    .module-main p { font-size:12px; line-height:1.45; }
    .next-card { padding:18px !important; }
  }
  @media (max-width:390px) {
    .content { padding-left:11px; padding-right:11px; }
    .progress-wrap { padding-left:11px; padding-right:11px; }
    .bottom-nav { width:calc(100% + 22px); margin-left:-11px; margin-right:-11px; padding-left:11px; padding-right:11px; }
    .save-status { display:none; }
    .start-over-btn { font-size:9px; }
    .question-card, .identity-card { padding:14px !important; }
    .choice-card { min-height:46px; padding:11px !important; }
  }
`}</style>
      <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark"><span className="wordmark-mark"><Layers3 size={17}/></span> RENOVATION DISCOVERY</div>
          <div className="header-actions">
            <div className="save-status"><span className="live-dot"/> {savedAt ? "Progress saved" : "Ready to save"}</div>
            <button type="button" className="start-over-btn" onClick={startOver} disabled={saving}>Start over</button>
          </div>
        </div>
      </header>

      <div className="progress-wrap">
        <div className="progress-top">
          <span>Business discovery</span>
          <strong>{pct}% complete</strong>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
      </div>

      <div className="workspace">
        <aside className="section-rail">
          <div className="rail-heading">DISCOVERY MAP</div>
          <div className="rail-list">
            {sections.map((s, i) => {
              const RailIcon = icons[i % icons.length];
              return (
                <button key={s.id} className={`rail-item ${i === step ? "current" : ""} ${i < step ? "complete" : ""}`} onClick={() => setStep(i)}>
                  <span className="rail-icon">{i < step ? <Check size={14}/> : <RailIcon size={14}/>}</span>
                  <span className="rail-copy"><b>{String(i + 1).padStart(2, "0")}</b>{s.title}</span>
                  {i === step && <ChevronRight size={15}/>}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="content">
          <div className="section-intro animate-in">
            <div className="section-kicker"><span className="kicker-icon"><Icon size={18}/></span> MODULE {String(step + 1).padStart(2, "0")}</div>
            <h1>{sec.title}</h1>
            <p>{sec.desc}</p>
            <div className="section-stats">
              <span><ClipboardCheck size={14}/> {sectionAnswered} of {questionsInSection} answered</span>
              <span><Clock3 size={14}/> ~2 min</span>
            </div>
          </div>

          {step === 0 && (
            <div className="identity-card animate-in delay-1">
              <div className="card-icon"><UserRound size={20}/></div>
              <div className="identity-copy">
                <div className="eyebrow">A QUICK INTRO</div>
                <h2>Let's start with the basics</h2>
                <p>I'm Sean. I want to understand how you actually run your business so I can build the right systems around the way you work.</p>
              </div>
              <div className="identity-fields">
                <label><span>Your name</span><input value={contact.name} placeholder="Jane Smith" onChange={e => setContact({...contact, name: e.target.value})}/></label>
                <label><span>Company name</span><input value={contact.company} placeholder="Smith Renovation Co." onChange={e => setContact({...contact, company: e.target.value})}/></label>
                <label><span>Email</span><input type="email" value={contact.email} placeholder="you@company.com" onChange={e => setContact({...contact, email: e.target.value})}/></label>
              </div>
            </div>
          )}

          <div className="question-stack">
            {sec.qs.map((q, qi) => (
              <div className="question-card animate-in" style={{ animationDelay: `${Math.min(qi * 45, 180)}ms` }} key={q.id}>
                <div className="question-number">{String(qi + 1).padStart(2, "0")}</div>
                <div className="question-body">
                  <h2>{q.q}</h2>
                  {q.hint && <p className="question-hint">{q.hint}</p>}
                  {q.type === "textarea" ? (
                    <textarea className="field area" value={String(answers[q.id] || "")} placeholder="Add any details that would help me understand your process..." onChange={e => setAnswers({...answers, [q.id]: e.target.value})}/>
                  ) : q.type === "text" ? (
                    <input className="field" value={String(answers[q.id] || "")} placeholder="Type your answer..." onChange={e => setAnswers({...answers, [q.id]: e.target.value})}/>
                  ) : (
                    <>
                      <div className="choice-grid">
                        {q.opts.map((o, oi) => {
                          const selected = Array.isArray(val(q.id)) && (val(q.id) as string[]).includes(o);
                          return (
                            <button type="button" key={o} className={`choice-card ${selected ? "selected" : ""}`} onClick={() => choose(q.id, q.type, o)}>
                              <span className="choice-marker">{selected ? <Check size={15}/> : <span/>}</span>
                              <span>{o}</span>
                            </button>
                          );
                        })}
                      </div>
                      {q.opts.includes("Other") && Array.isArray(val(q.id)) && (val(q.id) as string[]).includes("Other") && (
                        <div className="other-answer-wrap animate-in">
                          <label className="other-answer-label">Tell me what you mean by “Other”</label>
                          <input
                            className="field other-answer-field"
                            value={String(answers[`${q.id}_other`] || "")}
                            placeholder="Type your answer..."
                            onChange={e => setAnswers(prev => ({ ...prev, [`${q.id}_other`]: e.target.value }))}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {submitError && <div className="error-banner"><X size={17}/><span>{submitError}</span></div>}

          <div className="bottom-nav">
            <button className="secondary-btn" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}><ArrowLeft size={17}/> Back</button>
            <div className="nav-progress"><b>{String(step + 1).padStart(2, "0")}</b> / {String(sections.length).padStart(2, "0")}</div>
            {step < sections.length - 1
              ? <button className="primary-btn" onClick={next}>Continue <ArrowRight size={17}/></button>
              : <button className="primary-btn" disabled={saving} onClick={submit}>{saving ? "Saving..." : "Complete discovery"} {saving ? null : <Check size={17}/>}</button>}
          </div>

          <div className="footer-note"><Sparkles size={13}/> Your responses help build a practical technology and automation roadmap around the way your business actually operates.</div>
          <div className="privacy-note">Your answers are securely submitted for assessment and planning purposes.</div>
        </main>
      </div>
      </div>
    </>
  );
}

function Result({ answers, contact }: { answers: Answers, contact: {name:string,email:string,company:string} }) {
  const modules = useMemo(() => {
    const flat = Object.values(answers).flatMap(v => Array.isArray(v) ? v : [v]).join(" | ").toLowerCase();
    const rules: ReadonlyArray<readonly [string, string, string[]]> = [
      ["Scheduling & Dispatch", "Centralize crew assignments, job timing, material readiness, weather and changes.", ["scheduling","schedule","crew availability","weather"]],
      ["Lead & Sales CRM", "Capture leads, automate follow-up and keep estimates and proposals in one pipeline.", ["lead","estimate","follow-up","proposal"]],
      ["Project Management", "Create one source of truth from signed contract through completion and warranty.", ["project","progress","job status"]],
      ["Materials & Purchasing", "Connect material lists, purchasing, delivery status, receipts and job allocation.", ["material","purchasing","receipts"]],
      ["Job Costing", "Compare estimated and actual labor, materials and subcontractor costs.", ["job profit","job costing","labor cost","material cost"]],
      ["Field Operations", "Give crews mobile access to job instructions, photos, hours, issues and daily reports.", ["job-site","photos","hours","field"]],
      ["Customer Experience", "Create a clear customer communication trail for updates, approvals and scheduling.", ["customer","messages","status calls"]],
      ["Document Hub", "Keep contracts, permits, photos, receipts, change orders and warranty records organized.", ["documents","document","paper","folders"]],
      ["Automation & AI", "Reduce repeated entry, reminders, follow-ups and administrative reporting.", ["re-entering","data entry","reminders","repeating information"]]
    ];
    return rules.map(([name, desc, keys]) => ({
      name, desc, score: keys.filter(k => flat.includes(k)).length
    })).sort((a,b) => b.score - a.score);
  }, [answers]);

  const maxScore = Math.max(1, modules[0]?.score || 1);
  const totalSignals = modules.reduce((n,m) => n + m.score, 0);
  const readiness = Math.min(98, Math.max(62, 58 + totalSignals * 2));

  return (
    <>
      <style jsx global>{`
  @media (max-width:820px) {
    .result-shell .app-header { padding-left:14px; padding-right:14px; }
  }
`}</style>
      <div className="app-shell result-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark"><span className="wordmark-mark"><Layers3 size={17}/></span> RENOVATION DISCOVERY</div>
          <div className="save-status"><Check size={14}/> Assessment submitted</div>
        </div>
      </header>
      <main className="results-page">
        <div className="results-hero animate-in">
          <div className="success-badge"><Check size={16}/> DISCOVERY COMPLETE</div>
          <div className="results-hero-grid">
            <div>
              <div className="eyebrow">YOUR OPERATIONS BLUEPRINT</div>
              <h1>{contact.company || "Your business"}</h1>
              <p>I've mapped the way your business operates and identified the systems with the strongest potential to improve efficiency, visibility and customer experience.</p>
            </div>
            <div className="readiness-ring">
              <div><strong>{readiness}</strong><span>/100</span></div>
              <small>system<br/>readiness</small>
            </div>
          </div>
        </div>

        <div className="results-grid">
          <section>
            <div className="result-heading"><div><span className="eyebrow">PRIORITY MAP</span><h2>Where to focus first</h2></div><span className="signal-count">{totalSignals} signals identified</span></div>
            <div className="module-list">
              {modules.slice(0, 6).map((m, i) => (
                <div className="result-module" key={m.name}>
                  <div className="module-rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="module-main"><h3>{m.name}</h3><p>{m.desc}</p><div className="score-bar"><i style={{width:`${Math.max(14,(m.score/maxScore)*100)}%`}}/></div></div>
                  <TrendingUp size={18} className="trend-icon"/>
                </div>
              ))}
            </div>
          </section>

          <aside className="next-card">
            <div className="next-icon"><Zap size={21}/></div>
            <span className="eyebrow">RECOMMENDED NEXT STEP</span>
            <h2>Turn the answers into a system.</h2>
            <p>The next phase is to translate these findings into a practical workflow: lead → estimate → contract → materials → schedule → build → closeout → warranty.</p>
            <div className="next-points"><span><Check size={14}/> Prioritize highest-impact workflows</span><span><Check size={14}/> Identify automation opportunities</span><span><Check size={14}/> Design the tools around your actual process</span></div>
          </aside>
        </div>

        <div className="results-footer"><Mail size={15}/> A copy of your discovery data has been securely submitted for the next planning phase.</div>
      </main>
      </div>
    </>
  );
}