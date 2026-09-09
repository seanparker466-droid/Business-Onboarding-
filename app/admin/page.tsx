"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CheckCircle2,
  Copy,
  Download,
  Clock3,
  FileText,
  Layers3,
  LogOut,
  Mail,
  Package,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "../../lib/supabase-browser";
import {
  getModules,
  getPriorityLabel,
  getReadiness,
  getQuestionText,
  getModuleKeywordMap,
  type Answers,
} from "../../lib/assessment-analysis";
import { INDUSTRIES, DEFAULT_INDUSTRY, industryLabel } from "../../lib/industries";
import {
  getBlueprintTemplate,
  getSpecTitle,
  getRecommendations,
  getAutomationFor,
  getOpportunityImpact,
  getFirstBuild,
} from "../../lib/blueprint-content";

interface Assessment {
  id: string;
  created_at: string;
  contact_name: string | null;
  company_name: string | null;
  email: string | null;
  industry?: string | null;
  answers: Answers;
  status?: "submitted" | "reviewed";
  reviewed_at?: string | null;
}

type View = "overview" | "businesses" | "opportunities" | "workflows" | "automation" | "reports" | "blueprint";

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={17} /> },
  { id: "businesses", label: "Businesses", icon: <Building2 size={17} /> },
  { id: "opportunities", label: "Opportunities", icon: <Target size={17} /> },
  { id: "workflows", label: "Workflows", icon: <Workflow size={17} /> },
  { id: "automation", label: "Automation", icon: <Zap size={17} /> },
  { id: "reports", label: "Reports", icon: <FileText size={17} /> },
  { id: "blueprint", label: "System Blueprint", icon: <Layers3 size={17} /> },
];

export default function AdminPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("overview");
  const [search, setSearch] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [blueprintBusinessId, setBlueprintBusinessId] = useState<string | null>(null);
  const [reportBusinessId, setReportBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) setLoginError(error.message);
      setSession(data.session ?? null);
      setSessionReady(true);

      if (data.session) await loadAssessments();
    }

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);

      if (nextSession) {
        window.setTimeout(() => {
          if (active) void loadAssessments();
        }, 0);
      } else {
        setAssessments([]);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadAssessments() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("assessments")
      .select("id,created_at,contact_name,company_name,email,industry,answers")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setAssessments([]);
    } else {
      // Keep the Admin usable against older assessments tables too. Status/reviewed_at
      // are optional until the first-client migration is run; industry is optional
      // until the multi-industry migration is run.
      setAssessments(((data as Assessment[]) || []).map((item) => ({
        ...item,
        status: item.status || "submitted",
        industry: item.industry || DEFAULT_INDUSTRY,
      })));
    }
    setLoading(false);
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    setResetMessage("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setLoginError("Unable to sign in. Check the email and password for your admin account.");
      setLoggingIn(false);
      return;
    }

    setSession(data.session ?? null);
    if (data.session) await loadAssessments();
    setLoggingIn(false);
  }

  async function sendPasswordReset() {
    const targetEmail = email.trim();
    setLoginError("");
    setResetMessage("");

    if (!targetEmail) {
      setLoginError("Enter your admin email first, then click Forgot password.");
      return;
    }

    setResetting(true);
    const redirectTo = `${window.location.origin}/admin/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo,
    });

    if (resetError) setLoginError(resetError.message);
    else setResetMessage("Password reset email sent. Check your inbox.");

    setResetting(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setAssessments([]);
    setSelectedId(null);
  }

  async function updateAssessmentStatus(id: string, status: "submitted" | "reviewed") {
    setError("");
    const payload = { status, reviewed_at: status === "reviewed" ? new Date().toISOString() : null };
    const { error: updateError } = await supabase.from("assessments").update(payload).eq("id", id);
    if (updateError) {
      if (/column .*status.*does not exist/i.test(updateError.message)) {
        setError("Review status is not enabled in Supabase yet. Run the first-client migration in supabase/first-client-migration.sql.");
      } else {
        setError(updateError.message);
      }
      return;
    }
    setAssessments((current) => current.map((item) => item.id === id ? { ...item, ...payload } : item));
  }

  async function deleteAssessment(id: string) {
    const target = assessments.find((item) => item.id === id);
    if (!target) return;

    if (!window.confirm(`Delete the assessment for ${target.company_name || "this business"}? This cannot be undone.`)) {
      return;
    }

    const { error: deleteError } = await supabase.from("assessments").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setAssessments((current) => current.filter((item) => item.id !== id));
    setSelectedId(null);
  }

  if (!sessionReady) {
    return (
      <div className="ops-loading">
        <div className="ops-spinner" />
        <span>Checking admin access…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginScreen
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          loginError={loginError}
          resetMessage={resetMessage}
          loggingIn={loggingIn}
          resetting={resetting}
          signIn={signIn}
          sendPasswordReset={sendPasswordReset}
        />
        <OperationsStyles />
      </>
    );
  }

  const selected = assessments.find((item) => item.id === selectedId) || null;

  return (
    <>
      <div className="ops-app">
        <aside className="ops-sidebar">
          <div className="ops-brand">
            <span className="ops-brand-mark"><BarChart3 size={18} /></span>
            <div>
              <strong>BUSINESS</strong>
              <span>DISCOVERY</span>
            </div>
          </div>

          <div className="ops-workspace">
            <span className="ops-workspace-label">PRIVATE WORKSPACE</span>
            <div className="ops-workspace-name">
              <span className="ops-workspace-dot" />
              Operations Intelligence
            </div>
          </div>

          <nav className="ops-nav">
            {NAV.map((item) => (
              <button
                key={item.id}
                className={view === item.id && !selected ? "ops-nav-item active" : "ops-nav-item"}
                onClick={() => {
                  setView(item.id);
                  setSelectedId(null);
                  setSelectedOpportunity(null);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "opportunities" && assessments.length > 0 && (
                  <b>{aggregateOpportunities(assessments, assessments[0]?.industry || DEFAULT_INDUSTRY).filter((m) => m.priority === "High opportunity").length}</b>
                )}
              </button>
            ))}
          </nav>

          <div className="ops-sidebar-bottom">
            <div className="ops-sidebar-status">
              <ShieldCheck size={15} />
              <div>
                <strong>Secure</strong>
                <span>Supabase Auth</span>
              </div>
            </div>
            <button className="ops-signout" onClick={signOut}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        <main className="ops-main">
          <header className="ops-topbar">
            <div className="ops-breadcrumb">
              <span>OPERATIONS INTELLIGENCE</span>
              <ChevronRight size={13} />
              <strong>{selected ? selected.company_name || "Business" : NAV.find((n) => n.id === view)?.label}</strong>
            </div>
            <div className="ops-top-actions">
              <button className="ops-icon-btn" onClick={() => void loadAssessments()} title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button className="ops-header-user">
                <span>{email || "Admin"}</span>
                <ShieldCheck size={15} />
              </button>
            </div>
          </header>

          <div className="ops-content">
            {error && (
              <div className="ops-error">
                <X size={16} /> {error}
              </div>
            )}

            {selected ? (
              <BusinessDetail
                assessment={selected}
                onBack={() => setSelectedId(null)}
                onDelete={deleteAssessment}
                onUpdateStatus={updateAssessmentStatus}
                onOpenOpportunity={(name) => {
                  setSelectedId(null);
                  setSelectedOpportunity(name);
                  setView("opportunities");
                }}
                onOpenBlueprint={() => {
                  setBlueprintBusinessId(selected.id);
                  setSelectedId(null);
                  setView("blueprint");
                }}
                onOpenReport={() => {
                  setReportBusinessId(selected.id);
                  setSelectedId(null);
                  setView("reports");
                }}
              />
            ) : (
              <>
                {view === "overview" && (
                  <Overview
                    assessments={assessments}
                    loading={loading}
                    onOpenBusiness={(id) => setSelectedId(id)}
                    onOpenView={setView}
                  />
                )}

                {view === "businesses" && (
                  <Businesses
                    assessments={assessments}
                    search={search}
                    setSearch={setSearch}
                    onOpenBusiness={(id) => setSelectedId(id)}
                  />
                )}

                {view === "opportunities" && (
                  <Opportunities
                    assessments={assessments}
                    selectedOpportunity={selectedOpportunity}
                    setSelectedOpportunity={setSelectedOpportunity}
                  />
                )}

                {view === "workflows" && <Workflows assessments={assessments} />}

                {view === "automation" && <Automation assessments={assessments} />}

                {view === "reports" && <Reports assessments={assessments} initialReportId={reportBusinessId} />}

                {view === "blueprint" && (
                  <SystemBlueprint
                    assessments={assessments}
                    onOpenBusiness={(id) => setSelectedId(id)}
                    initialBusinessId={blueprintBusinessId}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <OperationsStyles />
    </>
  );
}

function LoginScreen(props: {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  loginError: string;
  resetMessage: string;
  loggingIn: boolean;
  resetting: boolean;
  signIn: (e: FormEvent) => void;
  sendPasswordReset: () => void;
}) {
  return (
    <div className="ops-login-page">
      <div className="ops-login-glow" />
      <div className="ops-login-card">
        <div className="ops-login-logo"><BarChart3 size={23} /></div>
        <span className="ops-kicker">PRIVATE ADMIN AREA</span>
        <h1>Business Discovery</h1>
        <p>Turn business answers into an operational system roadmap.</p>

        <form onSubmit={props.signIn}>
          <label>Admin email
            <input type="email" value={props.email} onChange={(e) => props.setEmail(e.target.value)} placeholder="admin@yourcompany.com" autoComplete="email" required />
          </label>
          <label>Password
            <input type="password" value={props.password} onChange={(e) => props.setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
          </label>

          {props.loginError && <div className="ops-error"><X size={16} />{props.loginError}</div>}
          {props.resetMessage && <div className="ops-success"><Check size={16} />{props.resetMessage}</div>}

          <button className="ops-primary-btn" disabled={props.loggingIn || props.resetting}>
            {props.loggingIn ? "Signing in…" : "Sign in"} <ChevronRight size={17} />
          </button>
        </form>

        <button className="ops-forgot" onClick={props.sendPasswordReset} disabled={props.loggingIn || props.resetting}>
          {props.resetting ? "Sending reset email…" : "Forgot password?"}
        </button>

        <div className="ops-login-note"><ShieldCheck size={14} /> Assessment data is protected by Supabase Authentication.</div>
      </div>
    </div>
  );
}

function Overview({
  assessments,
  loading,
  onOpenBusiness,
  onOpenView,
}: {
  assessments: Assessment[];
  loading: boolean;
  onOpenBusiness: (id: string) => void;
  onOpenView: (view: View) => void;
}) {
  const average = assessments.length
    ? Math.round(assessments.reduce((sum, item) => sum + getReadiness(item.answers || {}, item.industry || DEFAULT_INDUSTRY), 0) / assessments.length)
    : 0;

  const [industryFilter, setIndustryFilter] = useState(() => assessments[0]?.industry || DEFAULT_INDUSTRY);
  const opportunities = aggregateOpportunities(assessments, industryFilter);
  const top = opportunities[0];
  const highCount = opportunities.filter((o) => o.priority === "High opportunity").length;

  return (
    <div>
      <PageHeader
        kicker="OVERVIEW"
        title="Business discovery dashboard"
        subtitle="See what the assessments are telling you, where the friction is, and what the system should solve first."
        action={<button className="ops-outline-btn" onClick={() => onOpenView("businesses")}><Building2 size={15} /> View businesses</button>}
      />

      <div className="ops-stat-grid">
        <Stat label="Businesses discovered" value={assessments.length} icon={<Building2 />} detail={assessments.length ? "Submitted assessments" : "Waiting for submissions"} />
        <Stat label="Average readiness" value={average ? `${average}/100` : "—"} icon={<TrendingIcon />} detail={average >= 80 ? "Strong process maturity" : "Room for improvement"} />
        <Stat label="Highest opportunity" value={top?.name || "—"} icon={<Target />} detail={top ? `${top.score} signals detected` : "No data yet"} />
        <Stat label="High-priority areas" value={highCount} icon={<Zap />} detail="Across discovered businesses" />
      </div>

      <div className="ops-grid-two">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <div>
              <span className="ops-kicker">PRIORITY MAP</span>
              <h2>Where the system can make the biggest difference</h2>
            </div>
            <div className="ops-panel-head-actions">
              <select className="ops-inline-select" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
                {INDUSTRIES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
              <button className="ops-text-btn" onClick={() => onOpenView("opportunities")}>Explore all <ChevronRight size={15} /></button>
            </div>
          </div>

          {opportunities.slice(0, 5).map((item, index) => (
            <button className="ops-opportunity-row" key={item.name} onClick={() => onOpenView("opportunities")}>
              <span className="ops-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="ops-opportunity-icon">{moduleIcon(item.name)}</span>
              <span className="ops-opportunity-copy">
                <strong>{item.name}</strong>
                <small>{item.score} signals across {item.businesses} business{item.businesses === 1 ? "" : "es"}</small>
              </span>
              <span className="ops-mini-bar"><i style={{ width: `${Math.min(100, item.percent)}%` }} /></span>
              <span className="ops-priority">{item.priority}</span>
              <ChevronRight size={16} />
            </button>
          ))}

          {!opportunities.length && <Empty title="No opportunity data yet" text="Complete a business assessment and the operational map will appear here." />}
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <div>
              <span className="ops-kicker">LATEST DISCOVERY</span>
              <h2>Recently submitted</h2>
            </div>
            <button className="ops-text-btn" onClick={() => onOpenView("businesses")}>View all <ChevronRight size={15} /></button>
          </div>

          {loading && <div className="ops-inline-loading"><RefreshCw size={16} className="ops-spin" /> Loading…</div>}

          {!loading && assessments.slice(0, 5).map((item) => (
            <button className="ops-business-row" key={item.id} onClick={() => onOpenBusiness(item.id)}>
              <span className="ops-avatar"><Building2 size={17} /></span>
              <span className="ops-business-copy">
                <strong>{item.company_name || "Unnamed business"}</strong>
                <small>{item.contact_name || "No contact name"} · {formatDate(item.created_at)}</small>
              </span>
              <span className="ops-readiness">
                <strong>{getReadiness(item.answers || {}, item.industry || DEFAULT_INDUSTRY)}</strong>
                <small>/100</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}

          {!loading && !assessments.length && <Empty title="No businesses yet" text="Completed assessments will appear here." />}
        </section>
      </div>

      <section className="ops-next-banner">
        <div className="ops-next-icon"><Sparkles size={20} /></div>
        <div>
          <span className="ops-kicker">SYSTEM DESIGN PRINCIPLE</span>
          <h2>Fix the workflow, not just the symptom.</h2>
          <p>Connect lead capture, estimating, scheduling, materials, field work, billing and closeout so information only has to be entered once.</p>
        </div>
        <button className="ops-primary-btn" onClick={() => onOpenView("workflows")}>View workflow model <ChevronRight size={16} /></button>
      </section>
    </div>
  );
}

function Businesses({
  assessments,
  search,
  setSearch,
  onOpenBusiness,
}: {
  assessments: Assessment[];
  search: string;
  setSearch: (v: string) => void;
  onOpenBusiness: (id: string) => void;
}) {
  const [industryFilter, setIndustryFilter] = useState("all");
  const filtered = assessments.filter((item) => {
    if (industryFilter !== "all" && (item.industry || DEFAULT_INDUSTRY) !== industryFilter) return false;
    const needle = search.toLowerCase().trim();
    if (!needle) return true;
    return [item.company_name, item.contact_name, item.email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  return (
    <div>
      <PageHeader
        kicker="BUSINESS DIRECTORY"
        title="Discovered businesses"
        subtitle="Open a business to inspect its answers, operational signals, workflow and recommended system direction."
      />

      <div className="ops-toolbar">
        <div className="ops-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, contact or email" /><span>{filtered.length}</span></div>
        <select className="ops-inline-select" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="all">All industries</option>
          {INDUSTRIES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </div>

      <section className="ops-panel ops-directory">
        <div className="ops-directory-head">
          <span>Business</span><span>Industry</span><span>Contact</span><span>Readiness</span><span>Top opportunity</span><span>Submitted</span><span />
        </div>

        {filtered.map((item) => {
          const industry = item.industry || DEFAULT_INDUSTRY;
          const modules = getModules(item.answers || {}, industry);
          const top = modules[0];
          return (
            <button className="ops-directory-row" key={item.id} onClick={() => onOpenBusiness(item.id)}>
              <span className="ops-business-cell"><span className="ops-avatar"><Building2 size={17} /></span><span><strong>{item.company_name || "Unnamed business"}</strong><small>{item.email || "No email"}</small></span></span>
              <span><span className="ops-industry-badge">{industryLabel(industry)}</span></span>
              <span>{item.contact_name || "—"}</span>
              <span><b className="ops-score-pill">{getReadiness(item.answers || {}, industry)}</b><small>/100</small></span>
              <span><strong>{top?.name || "—"}</strong><small>{top ? getPriorityLabel(top.score, top.percent) : ""}</small></span>
              <span>{formatDate(item.created_at)}</span>
              <ChevronRight size={16} />
            </button>
          );
        })}

        {!filtered.length && <Empty title="No businesses found" text={search ? "Try a different search." : "Completed assessments will appear here."} />}
      </section>
    </div>
  );
}


type OpportunitySignal = {
  business: string;
  section: string;
  question: string;
  answer: string;
};

function getOpportunitySignals(assessments: Assessment[], opportunityName: string, industry: string = DEFAULT_INDUSTRY): OpportunitySignal[] {
  const keywordMap = getModuleKeywordMap(industry);
  const keywords = keywordMap[opportunityName] || [];
  const signals: OpportunitySignal[] = [];

  assessments.forEach((assessment) => {
    Object.entries(assessment.answers || {}).forEach(([id, value]) => {
      const meta = getQuestionText(id, assessment.industry || industry);
      const answer = formatAnswer(id, value, assessment.answers || {});
      if (!answer.trim()) return;

      const haystack = `${meta.section} ${meta.question} ${answer}`.toLowerCase();
      if (!keywords.some((keyword) => haystack.includes(keyword))) return;

      signals.push({
        business: assessment.company_name || "Unnamed business",
        section: meta.section,
        question: meta.question,
        answer,
      });
    });
  });

  // Keep the detail useful rather than flooding the page with every loosely related answer.
  return signals.slice(0, 24);
}

function Opportunities({
  assessments,
  selectedOpportunity,
  setSelectedOpportunity,
}: {
  assessments: Assessment[];
  selectedOpportunity: string | null;
  setSelectedOpportunity: (name: string | null) => void;
}) {
  const [industryFilter, setIndustryFilter] = useState(() => assessments[0]?.industry || DEFAULT_INDUSTRY);
  const opportunities = aggregateOpportunities(assessments, industryFilter);
  const selected = opportunities.find((item) => item.name === selectedOpportunity) || opportunities[0] || null;

  return (
    <div>
      <PageHeader
        kicker="OPERATIONAL OPPORTUNITIES"
        title="Where the business is losing time"
        subtitle="These are not generic software recommendations. They are signals extracted from the answers businesses gave you."
        action={
          <select className="ops-inline-select" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        }
      />

      <div className="ops-opportunity-layout">
        <section className="ops-panel ops-opportunity-list">
          <div className="ops-panel-head"><div><span className="ops-kicker">OPPORTUNITY INDEX</span><h2>{opportunities.length} operational areas</h2></div></div>
          {opportunities.map((item, index) => (
            <button className={selected?.name === item.name ? "ops-large-op active" : "ops-large-op"} key={item.name} onClick={() => setSelectedOpportunity(item.name)}>
              <span className="ops-rank">{String(index + 1).padStart(2, "0")}</span>
              <span className="ops-opportunity-icon">{moduleIcon(item.name)}</span>
              <span className="ops-opportunity-copy"><strong>{item.name}</strong><small>{item.businesses} business{item.businesses === 1 ? "" : "es"} · {item.score} signals</small></span>
              <span className="ops-priority">{item.priority}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>

        {selected && (
          <section className="ops-panel ops-opportunity-detail">
            <div className="ops-detail-top">
              <span className="ops-opportunity-icon large">{moduleIcon(selected.name)}</span>
              <div><span className="ops-kicker">OPPORTUNITY {String(opportunities.indexOf(selected) + 1).padStart(2, "0")}</span><h2>{selected.name}</h2><span className="ops-priority">{selected.priority}</span></div>
            </div>

            <p className="ops-lead">{selected.description}</p>

            <div className="ops-signal-box">
              <div><strong>{selected.score}</strong><span>signals detected</span></div>
              <div><strong>{selected.businesses}</strong><span>businesses affected</span></div>
              <div><strong>{selected.percent}%</strong><span>opportunity strength</span></div>
            </div>

            <h3>Why this is an opportunity</h3>
            <p>{getOpportunityImpact(industryFilter, selected.name)}</p>

            <div className="ops-first-build">
              <div className="ops-first-build-icon"><Sparkles size={17} /></div>
              <div><span className="ops-kicker">RECOMMENDED FIRST BUILD</span><strong>{getFirstBuild(industryFilter, selected.name)}</strong></div>
            </div>

            <h3>Evidence from the discovery</h3>
            <div className="ops-signal-list">
              {getOpportunitySignals(assessments.filter((a) => (a.industry || DEFAULT_INDUSTRY) === industryFilter), selected.name, industryFilter).map((signal, index) => (
                <div className="ops-signal-card" key={`${signal.business}-${signal.question}-${index}`}>
                  <div className="ops-signal-card-head">
                    <span>{signal.business}</span>
                    <em>{signal.section}</em>
                  </div>
                  <strong>{signal.question}</strong>
                  <p>{signal.answer}</p>
                </div>
              ))}
              {!getOpportunitySignals(assessments.filter((a) => (a.industry || DEFAULT_INDUSTRY) === industryFilter), selected.name, industryFilter).length && (
                <div className="ops-no-signal">No direct answer-level evidence was matched to this opportunity yet.</div>
              )}
            </div>

            <h3>Recommended system components</h3>
            <div className="ops-chip-grid">
              {getRecommendations(industryFilter, selected.name).map((item) => <span key={item}><Check size={14} /> {item}</span>)}
            </div>

            <h3>Potential automation</h3>
            <div className="ops-automation-callout"><Zap size={18} /><div><strong>{getAutomationFor(industryFilter, selected.name).title}</strong><p>{getAutomationFor(industryFilter, selected.name).description}</p></div></div>
          </section>
        )}
      </div>
    </div>
  );
}

function Workflows({ assessments }: { assessments: Assessment[] }) {
  const [businessId, setBusinessId] = useState(assessments[0]?.id || "");
  const assessment = assessments.find((item) => item.id === businessId) || assessments[0] || null;
  const industry = assessment?.industry || DEFAULT_INDUSTRY;
  const stages = getBlueprintTemplate(industry).stages;

  return (
    <div>
      <PageHeader
        kicker="WORKFLOW MODEL"
        title="From first contact to closeout"
        subtitle="This is the operating system the questionnaire is helping us design. Each stage should pass information to the next without re-entry."
        action={assessments.length > 1 ? (
          <select className="ops-inline-select" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
            {assessments.map((item) => <option key={item.id} value={item.id}>{item.company_name || "Unnamed business"}</option>)}
          </select>
        ) : undefined}
      />

      {!assessment ? (
        <Empty title="No workflow to model yet" text="Complete a business assessment first." />
      ) : (
        <>
          <section className="ops-panel">
            <div className="ops-panel-head"><div><span className="ops-kicker">CORE WORKFLOW · {industryLabel(industry).toUpperCase()}</span><h2>{assessment.company_name || "Business"} operating model</h2></div><span className="ops-live-badge"><span /> Derived from assessment</span></div>
            <div className="ops-flow">
              {stages.map((stage, index) => (
                <div className="ops-flow-stage" key={stage.name}>
                  <div className="ops-flow-node">{moduleIcon(stage.system)}</div>
                  <div className="ops-flow-copy"><span>0{index + 1}</span><strong>{stage.name}</strong><p>{stage.input} → {stage.output}</p></div>
                  {index < stages.length - 1 && <ChevronRight className="ops-flow-arrow" size={19} />}
                </div>
              ))}
            </div>
          </section>

          <div className="ops-grid-two">
            <section className="ops-panel">
              <div className="ops-panel-head"><div><span className="ops-kicker">SYSTEM PRINCIPLE</span><h2>Enter information once</h2></div></div>
              <div className="ops-principle-list">
                <div><Check /><span><strong>Customer data</strong><small>Flows from lead → estimate → contract → job → closeout.</small></span></div>
                <div><Check /><span><strong>Job data</strong><small>Flows from estimate → schedule → field → invoice.</small></span></div>
                <div><Check /><span><strong>Material data</strong><small>Flows from scope → purchase → delivery → job cost.</small></span></div>
                <div><Check /><span><strong>Documents</strong><small>Stay attached to the project instead of scattered across systems.</small></span></div>
              </div>
            </section>

            <section className="ops-panel">
              <div className="ops-panel-head"><div><span className="ops-kicker">NEXT DESIGN STEP</span><h2>Turn each stage into a module</h2></div></div>
              <p className="ops-panel-text">Each stage becomes a defined module with owners, required data, approvals, documents, automations and handoffs. The goal is a system specification that can be built instead of a generic software list.</p>
              <div className="ops-roadmap-mini">
                <div><span>PHASE 1</span><strong>Stabilize</strong><small>Centralize the highest-friction workflow.</small></div>
                <div><span>PHASE 2</span><strong>Connect</strong><small>Link people, jobs, materials and documents.</small></div>
                <div><span>PHASE 3</span><strong>Automate</strong><small>Remove repetitive reminders and data entry.</small></div>
                <div><span>PHASE 4</span><strong>Optimize</strong><small>Add AI reporting and proactive decision support.</small></div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Automation({ assessments }: { assessments: Assessment[] }) {
  const [industryFilter, setIndustryFilter] = useState(() => assessments[0]?.industry || DEFAULT_INDUSTRY);
  const opportunities = aggregateOpportunities(assessments, industryFilter);
  const automationItems = opportunities.slice(0, 7).map((item) => ({
    ...item,
    automation: getAutomationFor(industryFilter, item.name),
  }));

  return (
    <div>
      <PageHeader
        kicker="AUTOMATION & AI"
        title="What should stop being manual?"
        subtitle="Potential automations are derived from the operational friction identified in the assessments."
        action={
          <select className="ops-inline-select" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        }
      />

      <div className="ops-automation-summary">
        <div><Sparkles size={19} /><strong>{automationItems.length}</strong><span>automation opportunities</span></div>
        <div><Zap size={19} /><strong>1×</strong><span>enter information, reuse everywhere</span></div>
        <div><Settings2 size={19} /><strong>9</strong><span>system modules available</span></div>
      </div>

      <div className="ops-grid-two">
        {automationItems.map((item) => (
          <section className="ops-panel ops-automation-card" key={item.name}>
            <div className="ops-automation-title">
              <span className="ops-opportunity-icon">{moduleIcon(item.name)}</span>
              <div><span className="ops-kicker">{item.name}</span><h2>{item.automation.title}</h2></div>
            </div>
            <p>{item.automation.description}</p>
            <div className="ops-automation-flow">
              <span>Trigger</span><ChevronRight size={14} /><span>System action</span><ChevronRight size={14} /><span>Notification / record</span>
            </div>
          </section>
        ))}
      </div>

      {!automationItems.length && <Empty title="No automation opportunities yet" text="Complete a business assessment to generate recommendations." />}
    </div>
  );
}


function SystemBlueprint({
  assessments,
  onOpenBusiness,
  initialBusinessId,
}: {
  assessments: Assessment[];
  onOpenBusiness: (id: string) => void;
  initialBusinessId?: string | null;
}) {
  const [businessId, setBusinessId] = useState(initialBusinessId || assessments[0]?.id || "");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const selected = assessments.find((item) => item.id === businessId) || assessments[0] || null;

  if (!selected) {
    return (
      <div>
        <PageHeader kicker="SYSTEM BLUEPRINT" title="Design the operating system" subtitle="Turn discovery answers into a buildable workflow, data model and automation roadmap." />
        <Empty title="No business to blueprint yet" text="Complete a business assessment first." />
      </div>
    );
  }

  const industry = selected.industry || DEFAULT_INDUSTRY;
  const answers = selected.answers || {};
  const modules = getModules(answers, industry);
  const topModules = modules.slice(0, 6);
  const readiness = getReadiness(answers, industry);
  const evidence = (name: string) => getOpportunitySignals([selected], name, industry).slice(0, 4);

  const template = getBlueprintTemplate(industry);
  const blueprintStages = template.stages;

  const stage = blueprintStages.find((item) => item.name === selectedStage) || null;
  const selectedSignals = stage ? getOpportunitySignals([selected], stage.name, industry).slice(0, 5) : [];

  return (
    <div>
      <PageHeader
        kicker="SYSTEM BLUEPRINT"
        title="From discovery to a buildable system"
        subtitle="Define the screens, data, users, automations and AI functions that should exist behind each business workflow."
        action={
          <div className="ops-blueprint-actions">
            <button className="ops-outline-btn" onClick={() => copyBlueprintSpec(selected, template, topModules, readiness)}><Copy size={15} /> Copy build spec</button>
            <button className="ops-outline-btn" onClick={() => downloadBlueprintSpec(selected, template, topModules, readiness)}><Download size={15} /> Download spec</button>
            <div className="ops-blueprint-select">
              <label>Business<select value={selected.id} onChange={(e) => { setBusinessId(e.target.value); setSelectedStage(null); }}>{assessments.map((item) => <option key={item.id} value={item.id}>{item.company_name || "Unnamed business"}</option>)}</select></label>
            </div>
          </div>
        }
      />

      <section className="ops-blueprint-hero">
        <div>
          <span className="ops-kicker">BUILD TARGET · {industryLabel(industry).toUpperCase()}</span>
          <h2>{selected.company_name || "Unnamed business"}</h2>
          <p>Design the system around the business's actual friction instead of forcing the business into a generic software package.</p>
        </div>
        <div className="ops-blueprint-readiness"><span>Discovery readiness</span><strong>{readiness}<small>/100</small></strong></div>
      </section>

      <div className="ops-blueprint-grid">
        <section className="ops-panel">
          <div className="ops-panel-head"><div><span className="ops-kicker">1 · SYSTEM PRIORITIES</span><h2>What the build should solve</h2></div></div>
          <div className="ops-blueprint-priorities">
            {topModules.map((module, index) => (
              <button key={module.name} onClick={() => onOpenBusiness(selected.id)}>
                <span className="ops-rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="ops-opportunity-icon">{moduleIcon(module.name)}</span>
                <span><strong>{module.name}</strong><small>{module.description}</small><em>{module.score} discovery signals · {getPriorityLabel(module.score, module.percent)}</em></span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head"><div><span className="ops-kicker">2 · OPERATING PRINCIPLES</span><h2>Rules for the system</h2></div></div>
          <div className="ops-blueprint-rules">
            <div><Check /><span><strong>One source of truth</strong><small>Customer, project, schedule, material and cost data should live on the same project record.</small></span></div>
            <div><Check /><span><strong>Enter once, reuse everywhere</strong><small>Information captured during intake should flow forward without re-keying.</small></span></div>
            <div><Check /><span><strong>Exceptions drive attention</strong><small>The system should alert people to missing, late or conflicting information instead of creating more noise.</small></span></div>
            <div><Check /><span><strong>Field data belongs to the job</strong><small>Photos, measurements, hours, notes and issues should attach directly to the correct project.</small></span></div>
          </div>
        </section>
      </div>

      <section className="ops-panel ops-blueprint-workflow-panel">
        <div className="ops-panel-head"><div><span className="ops-kicker">3 · WORKFLOW SPECIFICATION</span><h2>Information flow through the business</h2></div><span className="ops-live-badge"><span /> Click a stage to design it</span></div>
        <div className="ops-blueprint-stage-strip">
          {blueprintStages.map((item, index) => (
            <button key={item.name} className={selectedStage === item.name ? "active" : ""} onClick={() => setSelectedStage(item.name)}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong><ChevronRight size={14} />
            </button>
          ))}
        </div>
        <div className="ops-blueprint-table-wrap">
          <table className="ops-blueprint-table"><thead><tr><th>Stage</th><th>Owner</th><th>Required input</th><th>System record</th><th>Output</th><th>Automation candidate</th></tr></thead><tbody>
            {blueprintStages.map((item) => <tr key={item.name} className={selectedStage === item.name ? "selected" : ""} onClick={() => setSelectedStage(item.name)}><td><strong>{item.name}</strong></td><td>{item.owner}</td><td>{item.input}</td><td><b>{item.system}</b></td><td>{item.output}</td><td><span className="ops-table-automation"><Zap size={12} /> {item.automation}</span></td></tr>)}
          </tbody></table>
        </div>
      </section>

      {stage && (
        <section className="ops-panel ops-stage-designer">
          <div className="ops-stage-designer-head">
            <div><span className="ops-kicker">4 · MODULE DESIGN · {stage.priority.toUpperCase()}</span><h2>{stage.name}</h2><p>Translate this workflow stage into a real software module.</p></div>
            <button className="ops-outline-btn" onClick={() => setSelectedStage(null)}><X size={15} /> Close</button>
          </div>
          <div className="ops-module-design-grid">
            <div className="ops-design-card"><span className="ops-kicker">SCREENS</span><h3>What users need</h3><p>{stage.screens}</p></div>
            <div className="ops-design-card"><span className="ops-kicker">DATA FIELDS</span><h3>What the system stores</h3><p>{stage.fields}</p></div>
            <div className="ops-design-card"><span className="ops-kicker">USERS & PERMISSIONS</span><h3>Who works here</h3><p>{stage.roles}</p></div>
            <div className="ops-design-card"><span className="ops-kicker">DEPENDENCY</span><h3>What must exist first</h3><p>{stage.dependency}</p></div>
          </div>
          <div className="ops-design-flow">
            <div><span>INPUT</span><strong>{stage.input}</strong></div><ChevronRight size={18}/><div><span>SYSTEM ACTION</span><strong>{stage.automation}</strong></div><ChevronRight size={18}/><div><span>OUTPUT</span><strong>{stage.output}</strong></div>
          </div>
          <div className="ops-stage-bottom-grid">
            <div className="ops-design-card ops-ai-card"><span className="ops-kicker">AI FUNCTION</span><h3>Where AI can help</h3><p>{stage.ai}</p><div className="ops-ai-badge"><Sparkles size={13}/> Candidate for AI-assisted workflow</div></div>
            <div className="ops-design-card"><span className="ops-kicker">DISCOVERY EVIDENCE</span><h3>Why this belongs in the build</h3>{selectedSignals.length ? selectedSignals.map((signal, i) => <div className="ops-mini-evidence" key={i}><strong>{signal.question}</strong><span>{signal.answer}</span></div>) : <p>This stage is part of the core operating model; no direct answer-level signal was matched to its exact stage name.</p>}</div>
          </div>
        </section>
      )}

      <div className="ops-blueprint-grid">
        <section className="ops-panel">
          <div className="ops-panel-head"><div><span className="ops-kicker">5 · DATA MODEL</span><h2>Core records to build</h2></div></div>
          <div className="ops-data-model">
            {template.dataModel.map(([name, detail]) => <div key={name}><span className="ops-opportunity-icon">{moduleIcon(name)}</span><span><strong>{name}</strong><small>{detail}</small></span></div>)}
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head"><div><span className="ops-kicker">6 · EVIDENCE</span><h2>Why these modules exist</h2></div></div>
          <div className="ops-evidence-stack">
            {topModules.slice(0, 4).map((module) => {
              const items = evidence(module.name);
              return <div key={module.name} className="ops-evidence-module"><div><span className="ops-opportunity-icon">{moduleIcon(module.name)}</span><strong>{module.name}</strong></div>{items.length ? items.map((item, i) => <p key={i}><b>{item.section}:</b> {item.answer}</p>) : <p>No direct answer-level evidence matched this module.</p>}</div>;
            })}
          </div>
        </section>
      </div>

      <section className="ops-panel ops-build-roadmap">
        <div className="ops-panel-head"><div><span className="ops-kicker">7 · IMPLEMENTATION ROADMAP</span><h2>Build in the right order</h2></div></div>
        <div className="ops-roadmap-large">
          {template.roadmap.map(([number, title, detail]) => <div key={number}><span>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></div>)}
        </div>
        <div className="ops-blueprint-footer"><span><Sparkles size={15} /> Recommended starting point: <strong>{getFirstBuild(industry, topModules[0]?.name || "")}</strong></span><button className="ops-outline-btn" onClick={() => onOpenBusiness(selected.id)}>Review business evidence <ChevronRight size={15} /></button></div>
      </section>
    </div>
  );
}

function Reports({ assessments, initialReportId }: { assessments: Assessment[]; initialReportId?: string | null }) {
  const [reportId, setReportId] = useState(initialReportId || assessments[0]?.id || "");
  const selected = assessments.find((item) => item.id === reportId) || assessments[0] || null;

  if (!selected) {
    return (
      <div>
        <PageHeader kicker="REPORTS" title="Business operations reports" subtitle="Generate a printable discovery report from any completed assessment." />
        <Empty title="No reports available" text="Complete a business assessment first." />
      </div>
    );
  }

  const industry = selected.industry || DEFAULT_INDUSTRY;
  const modules = getModules(selected.answers || {}, industry);
  const readiness = getReadiness(selected.answers || {}, industry);
  const answers = Object.entries(selected.answers || {});

  return (
    <div>
      <PageHeader
        kicker="REPORTS"
        title="Business operations report"
        subtitle="A clean, printable summary of the discovery findings."
        action={
          <button className="ops-primary-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save PDF
          </button>
        }
      />

      <div className="ops-report-toolbar">
        <label>Business
          <select value={reportId} onChange={(e) => setReportId(e.target.value)}>
            {assessments.map((item) => <option key={item.id} value={item.id}>{item.company_name || "Unnamed business"}</option>)}
          </select>
        </label>
      </div>

      <article className="ops-report">
        <div className="ops-report-cover">
          <div><span className="ops-kicker">{industryLabel(industry).toUpperCase()} · OPERATIONS REPORT</span><h2>{selected.company_name || "Unnamed business"}</h2><p>{selected.contact_name || "No contact name"} · {selected.email || "No email"}</p><span className="ops-report-status">{selected.status === "reviewed" ? "Reviewed" : "New assessment"}</span></div>
          <div className="ops-report-score"><span>System readiness</span><strong>{readiness}<small>/100</small></strong></div>
        </div>

        <div className="ops-report-section">
          <span className="ops-kicker">EXECUTIVE FINDING</span>
          <h3>Build around the highest-friction workflows.</h3>
          <p>The discovery identifies the operational areas below as the strongest opportunities for systemization, centralization and automation.</p>
        </div>

        <div className="ops-report-modules">
          {modules.map((module, index) => (
            <div key={module.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{module.name}</strong>
              <p>{module.description}</p>
              <b>{module.score} signals</b>
            </div>
          ))}
        </div>

        <div className="ops-report-section">
          <span className="ops-kicker">DISCOVERY RESPONSES</span>
          <h3>What the business told us</h3>
          <div className="ops-report-answers">
            {answers.map(([id, value]) => {
              const meta = getQuestionText(id, industry);
              const display = formatAnswer(id, value, selected.answers || {});
              return (
                <div key={id}>
                  <span>{meta.section}</span>
                  <strong>{meta.question}</strong>
                  <p>{display || "Not answered"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
}

function BusinessDetail({
  assessment,
  onBack,
  onDelete,
  onUpdateStatus,
  onOpenOpportunity,
  onOpenBlueprint,
  onOpenReport,
}: {
  assessment: Assessment;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: "submitted" | "reviewed") => void;
  onOpenOpportunity: (name: string) => void;
  onOpenBlueprint: () => void;
  onOpenReport: () => void;
}) {
  const industry = assessment.industry || DEFAULT_INDUSTRY;
  const modules = getModules(assessment.answers || {}, industry);
  const readiness = getReadiness(assessment.answers || {}, industry);
  const answerCount = Object.values(assessment.answers || {}).filter((value) =>
    Array.isArray(value) ? value.length > 0 : String(value ?? "").trim()
  ).length;

  return (
    <div>
      <button className="ops-back" onClick={onBack}><ArrowLeft size={15} /> Back to businesses</button>

      <div className="ops-business-hero">
        <div>
          <span className="ops-kicker">BUSINESS PROFILE · {industryLabel(industry).toUpperCase()}</span>
          <h1>{assessment.company_name || "Unnamed business"}</h1>
          <div className="ops-contact-line">
            <span><UserRound size={14} /> {assessment.contact_name || "No contact name"}</span>
            <span><Mail size={14} /> {assessment.email || "No email"}</span>
            <span><Clock3 size={14} /> Submitted {formatDate(assessment.created_at)}</span>
          </div>
        </div>
        <div className="ops-hero-score"><span>System readiness</span><strong>{readiness}<small>/100</small></strong></div>
      </div>

      <div className="ops-detail-actions">
        <span className={`ops-status-badge ${assessment.status === "reviewed" ? "reviewed" : "submitted"}`}>
          {assessment.status === "reviewed" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {assessment.status === "reviewed" ? "Reviewed" : "New assessment"}
        </span>
        {assessment.status === "reviewed" ? (
          <button className="ops-outline-btn" onClick={() => onUpdateStatus(assessment.id, "submitted")}><Clock3 size={15} /> Mark new</button>
        ) : (
          <button className="ops-outline-btn" onClick={() => onUpdateStatus(assessment.id, "reviewed")}><CheckCircle2 size={15} /> Mark reviewed</button>
        )}
        <button className="ops-primary-btn" onClick={onOpenBlueprint}><Layers3 size={16} /> Open system blueprint</button>
        <button className="ops-outline-btn" onClick={() => onOpenOpportunity(modules[0]?.name || "")}><Target size={15} /> Work on top opportunity</button>
        <button className="ops-outline-btn" onClick={onOpenReport}><Printer size={15} /> Open report</button>
        <button className="ops-danger-btn" onClick={() => onDelete(assessment.id)}><Trash2 size={15} /> Delete assessment</button>
      </div>

      <div className="ops-detail-grid">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <div><span className="ops-kicker">PRIORITY MAP</span><h2>Operational opportunities</h2></div>
            <span className="ops-answer-count">{answerCount} questions answered</span>
          </div>

          <div className="ops-detail-modules">
            {modules.map((module, index) => (
              <button className="ops-detail-module" key={module.name} onClick={() => onOpenOpportunity(module.name)}>
                <span className="ops-rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="ops-opportunity-icon">{moduleIcon(module.name)}</span>
                <span className="ops-module-copy">
                  <strong>{module.name}</strong>
                  <small>{module.description}</small>
                  <i><b style={{ width: `${Math.max(7, module.percent)}%` }} /></i>
                </span>
                <span className="ops-module-meta"><strong>{module.score}</strong><small>signals</small><em>{getPriorityLabel(module.score, module.percent)}</em></span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>

        <aside className="ops-panel ops-direction-panel">
          <span className="ops-kicker">RECOMMENDED DIRECTION</span>
          <div className="ops-direction-icon"><Sparkles size={19} /></div>
          <h2>Connect the workflow from lead through closeout.</h2>
          <p>Information should move between people, jobs and system modules without being repeatedly re-entered.</p>
          <div className="ops-check-list">
            <span><Check size={14} /> Prioritize high-impact bottlenecks</span>
            <span><Check size={14} /> Connect people, jobs and information</span>
            <span><Check size={14} /> Automate repetitive administration</span>
            <span><Check size={14} /> Keep project records together</span>
          </div>
        </aside>
      </div>

      <section className="ops-panel ops-findings-panel">
        <div className="ops-panel-head">
          <div><span className="ops-kicker">BUSINESS FINDINGS</span><h2>What we should solve first</h2></div>
        </div>
        <div className="ops-findings-grid">
          {modules.slice(0, 5).map((module, index) => (
            <div className="ops-finding-card" key={module.name}>
              <span className="ops-finding-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="ops-opportunity-icon">{moduleIcon(module.name)}</span>
              <div>
                <strong>{module.name}</strong>
                <p>{getOpportunityImpact(industry, module.name)}</p>
                <em>{getFirstBuild(industry, module.name)}</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-panel ops-answers-panel">
        <div className="ops-panel-head"><div><span className="ops-kicker">DISCOVERY RESPONSES</span><h2>What the business told us</h2></div></div>
        <div className="ops-answer-grid">
          {Object.entries(assessment.answers || {}).map(([id, value]) => {
            const meta = getQuestionText(id, industry);
            const display = formatAnswer(id, value, assessment.answers || {});
            return (
              <div className="ops-answer-card" key={id}>
                <span>{meta.section}</span>
                <strong>{meta.question}</strong>
                <p>{display || "Not answered"}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="ops-page-header">
      <div><span className="ops-kicker">{kicker}</span><h1>{title}</h1><p>{subtitle}</p></div>
      {action}
    </div>
  );
}

function Stat({ label, value, icon, detail }: { label: string; value: string | number; icon: React.ReactNode; detail: string }) {
  return (
    <div className="ops-stat">
      <span className="ops-stat-icon">{icon}</span>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return <div className="ops-empty"><Building2 size={25} /><h3>{title}</h3><p>{text}</p></div>;
}

function TrendingIcon() {
  return <Target />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatAnswer(id: string, value: string[] | string, answers: Answers) {
  if (id.endsWith("_other")) return String(value ?? "");
  const base = Array.isArray(value) ? value : [value];
  const other = answers[`${id}_other`];
  const custom = typeof other === "string" ? other.trim() : "";
  if (base.includes("Other") && custom) {
    return [...base.filter((item) => item !== "Other"), `Other: ${custom}`].join(" · ");
  }
  return base.filter(Boolean).join(" · ");
}

function buildBlueprintSpec(selected: Assessment, template: ReturnType<typeof getBlueprintTemplate>, modules: ReturnType<typeof getModules>, readiness: number) {
  const industry = selected.industry || DEFAULT_INDUSTRY;
  const lines: string[] = [
    getSpecTitle(industry),
    "",
    `Business: ${selected.company_name || "Unnamed business"}`,
    `Contact: ${selected.contact_name || "—"}`,
    `Email: ${selected.email || "—"}`,
    `Discovery readiness: ${readiness}/100`,
    "",
    "SYSTEM PRIORITIES",
    ...modules.slice(0, 6).map((m, i) => `${i + 1}. ${m.name} — ${m.score} signals — ${getPriorityLabel(m.score, m.percent)}`),
    "",
    "WORKFLOW MODULES",
  ];
  template.stages.forEach((stage, i) => {
    lines.push(
      `${i + 1}. ${stage.name}`,
      `   Owner: ${stage.owner}`,
      `   Screens: ${stage.screens}`,
      `   Data: ${stage.fields}`,
      `   Roles: ${stage.roles}`,
      `   Dependency: ${stage.dependency}`,
      `   Input → Action → Output: ${stage.input} → ${stage.automation} → ${stage.output}`,
      `   AI: ${stage.ai}`,
      `   Priority: ${stage.priority}`,
      ""
    );
  });
  lines.push("CORE DATA MODEL");
  template.dataModel.forEach(([name, detail]) => lines.push(`${name} — ${detail}`));
  lines.push("", "IMPLEMENTATION ORDER");
  template.roadmap.forEach(([number, title, detail]) => lines.push(`${number} ${title} — ${detail}`));
  return lines.join("\n");
}

async function copyBlueprintSpec(selected: Assessment, template: ReturnType<typeof getBlueprintTemplate>, modules: ReturnType<typeof getModules>, readiness: number) {
  const text = buildBlueprintSpec(selected, template, modules, readiness);
  try {
    await navigator.clipboard.writeText(text);
    window.alert("Build specification copied to your clipboard.");
  } catch {
    window.alert("I couldn't access the clipboard. Use Download spec instead.");
  }
}

function downloadBlueprintSpec(selected: Assessment, template: ReturnType<typeof getBlueprintTemplate>, modules: ReturnType<typeof getModules>, readiness: number) {
  const text = buildBlueprintSpec(selected, template, modules, readiness);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(selected.company_name || "business").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "business"}-software-build-spec.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function moduleIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("material") || n.includes("inventory") || n.includes("merchandise") || n.includes("product")) return <Package size={18} />;
  if (n.includes("schedul") || n.includes("staff") || n.includes("shift")) return <CalendarDays size={18} />;
  if (n.includes("lead") || n.includes("reservation") || n.includes("order") || n.includes("guest")) return <UserRound size={18} />;
  if (n.includes("project")) return <Layers3 size={18} />;
  if (n.includes("cost") || n.includes("money") || n.includes("margin") || n.includes("financial")) return <BarChart3 size={18} />;
  if (n.includes("field") || n.includes("kitchen") || n.includes("floor")) return <Settings2 size={18} />;
  if (n.includes("customer") || n.includes("vendor")) return <Mail size={18} />;
  if (n.includes("document")) return <FileText size={18} />;
  return <Zap size={18} />;
}

function aggregateOpportunities(assessments: Assessment[], industry: string = DEFAULT_INDUSTRY) {
  const map = new Map<string, {
    name: string;
    description: string;
    score: number;
    percent: number;
    businesses: number;
    priority: string;
  }>();

  assessments
    .filter((assessment) => (assessment.industry || DEFAULT_INDUSTRY) === industry)
    .forEach((assessment) => {
    getModules(assessment.answers || {}, industry).forEach((module) => {
      const existing = map.get(module.name);
      if (!existing) {
        map.set(module.name, {
          name: module.name,
          description: module.description,
          score: module.score,
          percent: module.percent,
          businesses: 1,
          priority: getPriorityLabel(module.score, module.percent),
        });
      } else {
        existing.score += module.score;
        existing.percent = Math.round((existing.percent + module.percent) / 2);
        existing.businesses += 1;
        existing.priority = getPriorityLabel(existing.score, existing.percent);
      }
    });
  });

  return [...map.values()].sort((a, b) => b.score - a.score);
}

function OperationsStyles() {
  return (
    <style jsx global>{`
      :root { --ops-bg:#071016; --ops-panel:#0c171f; --ops-panel-2:#101d26; --ops-line:rgba(255,255,255,.09); --ops-text:#eef5f7; --ops-muted:#91a3ac; --ops-accent:#6fe0c2; --ops-accent-2:#7db8ff; --ops-danger:#ff7f87; }
      * { box-sizing:border-box; }
      body { background:var(--ops-bg); }
      button,input,select { font:inherit; }
      button { cursor:pointer; }
      .ops-app { min-height:100vh; display:flex; background:radial-gradient(circle at 75% -10%,rgba(70,135,160,.14),transparent 35%),var(--ops-bg); color:var(--ops-text); }
      .ops-sidebar { width:244px; min-height:100vh; position:fixed; inset:0 auto 0 0; border-right:1px solid var(--ops-line); background:rgba(6,14,20,.94); display:flex; flex-direction:column; z-index:20; }
      .ops-brand { height:76px; padding:0 22px; display:flex; align-items:center; gap:11px; border-bottom:1px solid var(--ops-line); }
      .ops-brand-mark,.ops-login-logo { width:38px;height:38px;border:1px solid rgba(111,224,194,.35);background:rgba(111,224,194,.09);color:var(--ops-accent);display:grid;place-items:center;border-radius:11px; }
      .ops-brand strong,.ops-brand span { display:block; letter-spacing:.12em; font-size:11px; }
      .ops-brand strong { color:#fff; }
      .ops-brand span { color:var(--ops-muted); margin-top:2px; }
      .ops-workspace { padding:22px 18px 15px; }
      .ops-workspace-label,.ops-kicker { font-size:10px; letter-spacing:.16em; color:#71848e; font-weight:800; }
      .ops-workspace-name { margin-top:9px; border:1px solid var(--ops-line); border-radius:9px; padding:10px 11px; font-size:11px; color:#cdd8dc; display:flex; align-items:center; gap:8px; }
      .ops-workspace-dot { width:7px;height:7px;border-radius:50%;background:var(--ops-accent);box-shadow:0 0 12px var(--ops-accent); }
      .ops-nav { padding:6px 12px; display:grid; gap:3px; }
      .ops-nav-item { border:0; background:transparent; color:#91a3ac; display:flex; align-items:center; gap:11px; padding:11px 12px; border-radius:9px; text-align:left; font-size:12px; }
      .ops-nav-item:hover,.ops-nav-item.active { background:rgba(255,255,255,.06); color:#fff; }
      .ops-nav-item.active { box-shadow:inset 2px 0 var(--ops-accent); }
      .ops-nav-item b { margin-left:auto; min-width:20px; padding:2px 5px; border-radius:10px; background:rgba(111,224,194,.12); color:var(--ops-accent); text-align:center; font-size:10px; }
      .ops-sidebar-bottom { margin-top:auto; padding:16px; border-top:1px solid var(--ops-line); }
      .ops-sidebar-status { display:flex; gap:9px; color:var(--ops-accent); margin-bottom:14px; }
      .ops-sidebar-status strong,.ops-sidebar-status span { display:block; }
      .ops-sidebar-status strong { font-size:11px; color:#dbe7ea; }
      .ops-sidebar-status span { font-size:10px; color:#687a83; margin-top:2px; }
      .ops-signout { width:100%; border:1px solid var(--ops-line); background:transparent; color:#91a3ac; padding:9px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:7px; font-size:11px; }
      .ops-main { width:calc(100% - 244px); margin-left:244px; min-width:0; }
      .ops-topbar { height:64px; border-bottom:1px solid var(--ops-line); display:flex; align-items:center; justify-content:space-between; padding:0 30px; background:rgba(7,16,22,.72); position:sticky; top:0; z-index:10; backdrop-filter:blur(12px); }
      .ops-breadcrumb { display:flex;align-items:center;gap:7px;color:#667982;font-size:10px;letter-spacing:.08em; }
      .ops-breadcrumb strong { color:#b9c7cc; letter-spacing:0; font-size:12px; }
      .ops-top-actions { display:flex;align-items:center;gap:8px; }
      .ops-icon-btn,.ops-header-user { border:1px solid var(--ops-line); background:rgba(255,255,255,.025); color:#aab9bf; border-radius:8px; padding:8px 10px; display:flex;align-items:center;gap:7px; }
      .ops-header-user { font-size:11px; }
      .ops-content { max-width:1450px; margin:auto; padding:34px 38px 60px; }
      .ops-page-header { display:flex; justify-content:space-between; align-items:flex-end; gap:25px; margin-bottom:28px; }
      .ops-page-header h1 { font-size:30px; line-height:1.1; margin:7px 0 8px; letter-spacing:-.03em; }
      .ops-page-header p { margin:0; color:var(--ops-muted); font-size:13px; max-width:700px; line-height:1.6; }
      .ops-primary-btn,.ops-outline-btn,.ops-danger-btn,.ops-text-btn { border:0; display:inline-flex; align-items:center; justify-content:center; gap:7px; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:700; }
      .ops-primary-btn { background:var(--ops-accent); color:#06120f; box-shadow:0 8px 28px rgba(111,224,194,.12); }
      .ops-outline-btn { border:1px solid var(--ops-line); background:rgba(255,255,255,.025); color:#c6d1d5; }
      .ops-danger-btn { background:rgba(255,127,135,.08); color:var(--ops-danger); border:1px solid rgba(255,127,135,.18); }
      .ops-text-btn { background:transparent; color:var(--ops-accent); padding:5px; }
      .ops-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
      .ops-stat { min-height:118px; border:1px solid var(--ops-line); background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.015)); border-radius:12px; padding:18px; display:flex; gap:13px; }
      .ops-stat-icon { width:37px;height:37px;border-radius:9px;background:rgba(111,224,194,.08);color:var(--ops-accent);display:grid;place-items:center;flex:none; }
      .ops-stat span,.ops-stat strong,.ops-stat small { display:block; }
      .ops-stat span { color:#788b94;font-size:10px;letter-spacing:.04em; }
      .ops-stat strong { font-size:24px; margin-top:6px; letter-spacing:-.03em; }
      .ops-stat small { color:#64767e;font-size:10px;margin-top:5px; }
      .ops-grid-two { display:grid; grid-template-columns:1.18fr .82fr; gap:16px; margin-top:16px; }
      .ops-panel { border:1px solid var(--ops-line); background:rgba(12,23,31,.86); border-radius:13px; overflow:hidden; }
      .ops-panel-head { padding:20px 21px; display:flex; justify-content:space-between; align-items:center; gap:15px; border-bottom:1px solid var(--ops-line); }
      .ops-panel-head h2 { font-size:16px; margin:6px 0 0; letter-spacing:-.02em; }
      .ops-opportunity-row,.ops-business-row { width:100%; border:0; border-bottom:1px solid var(--ops-line); background:transparent; color:inherit; display:flex; align-items:center; gap:12px; padding:13px 19px; text-align:left; }
      .ops-opportunity-row:hover,.ops-business-row:hover,.ops-directory-row:hover,.ops-large-op:hover { background:rgba(255,255,255,.025); }
      .ops-opportunity-row:last-child,.ops-business-row:last-child { border-bottom:0; }
      .ops-rank { width:27px;color:#4f646d;font-size:10px;font-weight:800; }
      .ops-opportunity-icon { width:34px;height:34px;border-radius:9px;background:rgba(125,184,255,.08);color:var(--ops-accent-2);display:grid;place-items:center;flex:none; }
      .ops-opportunity-icon.large { width:46px;height:46px; }
      .ops-opportunity-copy { flex:1;min-width:0; }
      .ops-opportunity-copy strong,.ops-opportunity-copy small { display:block; }
      .ops-opportunity-copy strong { font-size:12px; color:#e7eef0; }
      .ops-opportunity-copy small { margin-top:4px;color:#71838c;font-size:10px; }
      .ops-mini-bar { width:70px;height:4px;background:#182a33;border-radius:5px;overflow:hidden; }
      .ops-mini-bar i { display:block;height:100%;background:var(--ops-accent);border-radius:5px; }
      .ops-priority { color:var(--ops-accent);font-size:9px;font-weight:800;white-space:nowrap; }
      .ops-avatar { width:34px;height:34px;border-radius:9px;background:#17252d;color:#8ca1aa;display:grid;place-items:center;flex:none; }
      .ops-business-copy { flex:1;min-width:0; }
      .ops-business-copy strong,.ops-business-copy small { display:block; }
      .ops-business-copy strong { font-size:12px; }
      .ops-business-copy small { color:#71838c;font-size:10px;margin-top:3px; }
      .ops-readiness { text-align:right;min-width:60px; }
      .ops-readiness strong { color:var(--ops-accent);font-size:16px; }
      .ops-readiness small { color:#61747d;font-size:9px; }
      .ops-next-banner { margin-top:16px; border:1px solid rgba(111,224,194,.17); background:linear-gradient(100deg,rgba(111,224,194,.07),rgba(125,184,255,.035)); border-radius:13px; padding:20px; display:flex; align-items:center; gap:15px; }
      .ops-next-icon { width:42px;height:42px;border-radius:10px;background:rgba(111,224,194,.1);color:var(--ops-accent);display:grid;place-items:center;flex:none; }
      .ops-next-banner>div:nth-child(2) { flex:1; }
      .ops-next-banner h2 { font-size:15px;margin:5px 0; }
      .ops-next-banner p { color:#82959e;font-size:11px;line-height:1.55;margin:0;max-width:780px; }
      .ops-toolbar { margin-bottom:13px;display:flex;align-items:center;gap:10px; }
      .ops-search { width:min(470px,100%);height:40px;border:1px solid var(--ops-line);background:rgba(255,255,255,.025);border-radius:9px;display:flex;align-items:center;padding:0 11px;color:#667982;gap:8px; }
      .ops-search input { flex:1;background:transparent;border:0;outline:0;color:#e7eef0;font-size:11px; }
      .ops-search span { font-size:10px;color:#60737b; }
      .ops-directory-head,.ops-directory-row { display:grid;grid-template-columns:2fr .9fr 1.1fr .8fr 1.4fr 1fr 25px;align-items:center;gap:12px; }
      .ops-directory-head { padding:11px 18px;color:#52666f;font-size:9px;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--ops-line); }
      .ops-directory-row { width:100%;border:0;border-bottom:1px solid var(--ops-line);background:transparent;color:#bcc9cd;text-align:left;padding:14px 18px;font-size:11px; }
      .ops-directory-row:last-child { border-bottom:0; }
      .ops-business-cell { display:flex;align-items:center;gap:10px;min-width:0; }
      .ops-business-cell>span:last-child { min-width:0; }
      .ops-business-cell strong,.ops-business-cell small,.ops-directory-row>span:nth-child(5) strong,.ops-directory-row>span:nth-child(5) small { display:block; }
      .ops-business-cell strong { color:#e7eef0;font-size:12px; }
      .ops-business-cell small,.ops-directory-row>span:nth-child(5) small { color:#6d8089;font-size:9px;margin-top:3px; }
      .ops-score-pill { color:var(--ops-accent);font-size:15px; }
      .ops-directory-row>span:nth-child(4)>small { color:#5f727a;font-size:9px; }
      .ops-industry-badge { display:inline-block;padding:3px 9px;border-radius:999px;background:rgba(125,184,255,.12);color:var(--ops-accent-2);font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase; }
      .ops-inline-select { background:rgba(255,255,255,.04);border:1px solid var(--ops-line);color:#cdd8dc;border-radius:9px;padding:9px 11px;font-size:11px; }
      .ops-panel-head-actions { display:flex;align-items:center;gap:10px; }
      .ops-opportunity-layout { display:grid;grid-template-columns:.82fr 1.18fr;gap:16px; }
      .ops-large-op { width:100%;border:0;border-bottom:1px solid var(--ops-line);background:transparent;color:inherit;display:flex;align-items:center;gap:11px;text-align:left;padding:14px 18px; }
      .ops-large-op.active { background:rgba(111,224,194,.055);box-shadow:inset 2px 0 var(--ops-accent); }
      .ops-opportunity-detail { padding:24px; }
      .ops-detail-top { display:flex;gap:13px;align-items:center; }
      .ops-detail-top h2 { margin:4px 0 7px;font-size:21px; }
      .ops-lead { color:#9aadb5;font-size:13px;line-height:1.7;margin:21px 0; }
      .ops-signal-box { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:25px; }
      .ops-signal-box>div { border:1px solid var(--ops-line);border-radius:9px;padding:13px;background:rgba(255,255,255,.018); }
      .ops-signal-box strong,.ops-signal-box span { display:block; }
      .ops-signal-box strong { font-size:19px;color:#eef5f7; }
      .ops-signal-box span { color:#647780;font-size:9px;margin-top:3px; }
      .ops-opportunity-detail h3 { font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#9eb0b7;margin:20px 0 9px; }
      .ops-opportunity-detail>p:not(.ops-lead) { color:#748891;font-size:11px;line-height:1.7; }
      .ops-chip-grid { display:flex;flex-wrap:wrap;gap:7px; }
      .ops-chip-grid span { padding:7px 9px;border:1px solid var(--ops-line);border-radius:7px;color:#b7c5ca;font-size:10px;display:flex;align-items:center;gap:5px; }
      .ops-chip-grid svg { color:var(--ops-accent); }
      .ops-automation-callout { display:flex;gap:10px;padding:13px;border:1px solid rgba(111,224,194,.13);background:rgba(111,224,194,.04);border-radius:9px;color:var(--ops-accent); }
      .ops-automation-callout strong { color:#dce8e8;font-size:11px; }
      .ops-automation-callout p { color:#7e929a;margin:4px 0 0;font-size:10px;line-height:1.6; }
      .ops-live-badge { font-size:9px;color:#7e939c;display:flex;gap:6px;align-items:center; }
      .ops-live-badge span { width:6px;height:6px;border-radius:50%;background:var(--ops-accent); }
      .ops-flow { padding:23px 20px;display:grid;grid-template-columns:repeat(8,1fr);gap:5px; }
      .ops-flow-stage { position:relative;min-width:0; }
      .ops-flow-node { width:40px;height:40px;border-radius:10px;background:rgba(111,224,194,.07);color:var(--ops-accent);display:grid;place-items:center;margin-bottom:10px; }
      .ops-flow-node svg { width:18px; }
      .ops-flow-copy>span { color:#4e626a;font-size:9px; }
      .ops-flow-copy strong { display:block;font-size:11px;margin:4px 0;color:#e5edef; }
      .ops-flow-copy p { color:#71858d;font-size:9px;line-height:1.55;margin:0; }
      .ops-flow-copy em { display:inline-flex;align-items:center;gap:4px;color:var(--ops-accent);font-size:8px;font-style:normal;margin-top:7px; }
      .ops-flow-arrow { position:absolute;right:-3px;top:12px;color:#334850; }
      .ops-principle-list { padding:8px 20px 17px; }
      .ops-principle-list>div { display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--ops-line); }
      .ops-principle-list>div:last-child { border-bottom:0; }
      .ops-principle-list svg { color:var(--ops-accent);flex:none;margin-top:2px;width:15px; }
      .ops-principle-list strong,.ops-principle-list small { display:block; }
      .ops-principle-list strong { font-size:11px; }
      .ops-principle-list small { color:#71858d;font-size:10px;margin-top:3px;line-height:1.5; }
      .ops-panel-text { color:#758991;font-size:11px;line-height:1.7;padding:0 20px 18px; }
      .ops-panel>.ops-primary-btn { margin:0 20px 20px; }
      .ops-automation-summary { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px; }
      .ops-automation-summary>div { border:1px solid var(--ops-line);border-radius:11px;padding:16px;display:grid;grid-template-columns:22px 1fr;column-gap:9px;align-items:center;background:rgba(255,255,255,.02); }
      .ops-automation-summary svg { grid-row:span 2;color:var(--ops-accent); }
      .ops-automation-summary strong { font-size:20px; }
      .ops-automation-summary span { color:#6f828b;font-size:9px; }
      .ops-automation-card { padding:20px; }
      .ops-automation-title { display:flex;gap:11px;align-items:center; }
      .ops-automation-title h2 { margin:5px 0 0;font-size:14px; }
      .ops-automation-card>p { color:#778a92;font-size:11px;line-height:1.65;margin:17px 0; }
      .ops-automation-flow { border:1px solid var(--ops-line);border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between;color:#657982;font-size:9px; }
      .ops-report-toolbar { margin-bottom:14px; }
      .ops-report-toolbar label { color:#71848c;font-size:10px;display:grid;gap:6px;width:260px; }
      .ops-report-toolbar select { background:#0d1a22;color:#dfe8eb;border:1px solid var(--ops-line);border-radius:8px;padding:9px;outline:0; }
      .ops-report { background:#f6f8f8;color:#152128;border-radius:12px;overflow:hidden;max-width:1050px; }
      .ops-report-cover { background:#101c24;color:white;padding:30px;display:flex;justify-content:space-between;gap:25px; }
      .ops-report-cover .ops-kicker { color:#718891; }
      .ops-report-cover h2 { font-size:30px;margin:8px 0; }
      .ops-report-cover p { color:#8fa2aa;font-size:11px;margin:0; }
      .ops-report-score { text-align:right;align-self:center; }
      .ops-report-score span,.ops-report-score strong { display:block; }
      .ops-report-score span { color:#81949c;font-size:10px; }
      .ops-report-score strong { color:var(--ops-accent);font-size:38px; }
      .ops-report-score small { font-size:14px;color:#71838a; }
      .ops-report-section { padding:25px 30px;border-bottom:1px solid #dfe5e7; }
      .ops-report-section h3 { font-size:19px;margin:7px 0; }
      .ops-report-section p { color:#5f7078;font-size:11px;line-height:1.65; }
      .ops-report-modules { display:grid;grid-template-columns:1fr 1fr;background:#fff; }
      .ops-report-modules>div { padding:17px 22px;border-bottom:1px solid #e2e7e9;border-right:1px solid #e2e7e9;display:grid;grid-template-columns:25px 1fr auto;gap:8px;align-items:start; }
      .ops-report-modules span { color:#82939a;font-size:10px; }
      .ops-report-modules strong { font-size:11px; }
      .ops-report-modules p { grid-column:2/3;color:#697a82;font-size:9px;line-height:1.5;margin:0; }
      .ops-report-modules b { color:#438f7c;font-size:9px; }
      .ops-report-answers { display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#dfe5e7; }
      .ops-report-answers>div { background:#fff;padding:13px; }
      .ops-report-answers span,.ops-report-answers strong,.ops-report-answers p { display:block; }
      .ops-report-answers span { color:#82939a;font-size:8px;text-transform:uppercase;letter-spacing:.08em; }
      .ops-report-answers strong { font-size:10px;margin:5px 0; }
      .ops-report-answers p { color:#697a82;font-size:9px;margin:0;line-height:1.5; }
      .ops-back { border:0;background:transparent;color:#78909a;display:flex;align-items:center;gap:6px;font-size:10px;padding:0;margin-bottom:20px; }
      .ops-business-hero { display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:17px; }
      .ops-business-hero h1 { font-size:29px;margin:7px 0 10px;letter-spacing:-.03em; }
      .ops-contact-line { display:flex;gap:15px;flex-wrap:wrap;color:#71858d;font-size:10px; }
      .ops-contact-line span { display:flex;align-items:center;gap:5px; }
      .ops-hero-score { text-align:right;border-left:1px solid var(--ops-line);padding-left:30px; }
      .ops-hero-score span,.ops-hero-score strong { display:block; }
      .ops-hero-score span { color:#70838c;font-size:10px; }
      .ops-hero-score strong { color:var(--ops-accent);font-size:36px;line-height:1.1;margin-top:5px; }
      .ops-hero-score small { color:#64777f;font-size:13px; }
      .ops-detail-actions { display:flex;gap:8px;margin-bottom:16px; }
      .ops-detail-grid { display:grid;grid-template-columns:1.2fr .8fr;gap:16px; }
      .ops-detail-modules { padding:4px 0; }
      .ops-detail-module { width:100%;border:0;border-bottom:1px solid var(--ops-line);background:transparent;color:inherit;display:flex;align-items:center;gap:10px;padding:15px 19px;text-align:left; }
      .ops-detail-module:last-child { border-bottom:0; }
      .ops-detail-module:hover { background:rgba(255,255,255,.025); }
      .ops-module-copy { flex:1;min-width:0; }
      .ops-module-copy strong,.ops-module-copy small { display:block; }
      .ops-module-copy strong { font-size:12px; }
      .ops-module-copy small { color:#71858d;font-size:9px;margin:4px 0 8px;line-height:1.45; }
      .ops-module-copy i { display:block;height:4px;background:#182a33;border-radius:5px;overflow:hidden; }
      .ops-module-copy i b { display:block;height:100%;background:var(--ops-accent);border-radius:5px; }
      .ops-module-meta { min-width:70px;text-align:right; }
      .ops-module-meta strong { display:block;font-size:15px;color:#dce7e9; }
      .ops-module-meta small { display:block;color:#566b74;font-size:8px; }
      .ops-module-meta em { display:block;color:var(--ops-accent);font-style:normal;font-size:8px;margin-top:4px; }
      .ops-direction-panel { padding:22px; }
      .ops-direction-icon { width:40px;height:40px;border-radius:10px;background:rgba(111,224,194,.08);color:var(--ops-accent);display:grid;place-items:center;margin:16px 0 12px; }
      .ops-direction-panel h2 { font-size:17px;line-height:1.3;margin:0 0 10px; }
      .ops-direction-panel>p { color:#71858d;font-size:11px;line-height:1.65; }
      .ops-check-list { display:grid;gap:9px;margin-top:17px; }
      .ops-check-list span { display:flex;gap:7px;align-items:center;color:#a7b7bc;font-size:10px; }
      .ops-check-list svg { color:var(--ops-accent); }
      .ops-answers-panel { margin-top:16px; }
      .ops-answer-grid { display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--ops-line); }
      .ops-answer-card { background:var(--ops-panel);padding:15px 18px;min-height:100px; }
      .ops-answer-card>span { color:#657a83;font-size:8px;text-transform:uppercase;letter-spacing:.1em; }
      .ops-answer-card strong { display:block;color:#dce6e8;font-size:11px;margin:5px 0;line-height:1.45; }
      .ops-answer-card p { color:#81949c;font-size:10px;line-height:1.55;margin:0; }
      .ops-answer-count { color:#627780;font-size:9px; }
      .ops-first-build { margin:14px 0 18px; border:1px solid rgba(111,224,194,.16); background:rgba(111,224,194,.045); border-radius:10px; padding:13px; display:flex; gap:11px; align-items:flex-start; }
      .ops-first-build-icon { width:32px;height:32px;border-radius:8px;background:rgba(111,224,194,.09);color:var(--ops-accent);display:grid;place-items:center;flex:none; }
      .ops-first-build strong { display:block;font-size:11px;line-height:1.5;margin-top:4px;color:#dce8ea; }
      .ops-signal-list { display:grid; gap:8px; margin-bottom:20px; }
      .ops-signal-card { border:1px solid var(--ops-line);background:rgba(255,255,255,.018);border-radius:9px;padding:12px 13px; }
      .ops-signal-card-head { display:flex;justify-content:space-between;gap:10px;margin-bottom:6px; }
      .ops-signal-card-head span { color:var(--ops-accent);font-size:9px;font-weight:800; }
      .ops-signal-card-head em { color:#60747d;font-size:8px;font-style:normal;text-transform:uppercase;letter-spacing:.08em; }
      .ops-signal-card strong { display:block;font-size:10px;color:#d8e3e6;line-height:1.45; }
      .ops-signal-card p { margin:5px 0 0;color:#80939b;font-size:10px;line-height:1.55; }
      .ops-no-signal { padding:16px;border:1px dashed var(--ops-line);border-radius:9px;color:#6f838c;font-size:10px; }
      .ops-findings-panel { margin-top:16px; }
      .ops-findings-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--ops-line); }
      .ops-finding-card { background:var(--ops-panel);padding:16px;display:grid;grid-template-columns:24px 34px 1fr;gap:10px;align-items:start; }
      .ops-finding-number { color:#50656e;font-size:9px;font-weight:800;padding-top:10px; }
      .ops-finding-card strong { display:block;font-size:11px;color:#e0eaec; }
      .ops-finding-card p { color:#758991;font-size:9px;line-height:1.5;margin:5px 0; }
      .ops-finding-card em { color:var(--ops-accent);font-size:8px;line-height:1.45;font-style:normal;display:block; }
      .ops-roadmap-mini { display:grid;gap:8px;margin-top:17px; }
      .ops-roadmap-mini>div { border:1px solid var(--ops-line);border-radius:8px;padding:11px;display:grid;grid-template-columns:65px 1fr;column-gap:8px; }
      .ops-roadmap-mini span { grid-row:1/3;color:#637780;font-size:8px;letter-spacing:.08em; }
      .ops-roadmap-mini strong { font-size:10px; }
      .ops-roadmap-mini small { color:#71858d;font-size:9px;line-height:1.45;margin-top:3px; }
      .ops-blueprint-select label { display:grid;gap:5px;color:#71848c;font-size:9px; }
      .ops-blueprint-select select { min-width:220px;background:#0d1a22;color:#dfe8eb;border:1px solid var(--ops-line);border-radius:8px;padding:9px;outline:0; }
      .ops-blueprint-hero { margin-bottom:16px;border:1px solid rgba(111,224,194,.16);background:linear-gradient(110deg,rgba(111,224,194,.07),rgba(125,184,255,.035));border-radius:13px;padding:23px;display:flex;justify-content:space-between;gap:20px;align-items:center; }
      .ops-blueprint-hero h2 { font-size:23px;margin:7px 0 6px;letter-spacing:-.03em; }
      .ops-blueprint-hero p { color:#82959e;font-size:11px;line-height:1.6;margin:0;max-width:700px; }
      .ops-blueprint-readiness { text-align:right;min-width:130px; }
      .ops-blueprint-readiness span { display:block;color:#657982;font-size:9px;text-transform:uppercase;letter-spacing:.08em; }
      .ops-blueprint-readiness strong { display:block;color:var(--ops-accent);font-size:30px;margin-top:4px; }
      .ops-blueprint-readiness small { color:#60747d;font-size:11px; }
      .ops-blueprint-grid { display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:16px; }
      .ops-blueprint-priorities button { width:100%;border:0;border-bottom:1px solid var(--ops-line);background:transparent;color:inherit;display:grid;grid-template-columns:27px 34px 1fr 15px;gap:10px;align-items:center;text-align:left;padding:13px 18px; }
      .ops-blueprint-priorities button:hover { background:rgba(255,255,255,.025); }
      .ops-blueprint-priorities button:last-child { border-bottom:0; }
      .ops-blueprint-priorities strong,.ops-blueprint-priorities small,.ops-blueprint-priorities em { display:block; }
      .ops-blueprint-priorities strong { font-size:11px; }
      .ops-blueprint-priorities small { color:#70838b;font-size:9px;line-height:1.45;margin-top:3px; }
      .ops-blueprint-priorities em { color:var(--ops-accent);font-size:8px;font-style:normal;margin-top:5px; }
      .ops-blueprint-rules { padding:8px 20px 17px; }
      .ops-blueprint-rules>div { display:flex;gap:10px;padding:13px 0;border-bottom:1px solid var(--ops-line); }
      .ops-blueprint-rules>div:last-child { border-bottom:0; }
      .ops-blueprint-rules svg { width:15px;color:var(--ops-accent);flex:none;margin-top:2px; }
      .ops-blueprint-rules strong,.ops-blueprint-rules small { display:block; }
      .ops-blueprint-rules strong { font-size:10px; }
      .ops-blueprint-rules small { color:#71858d;font-size:9px;line-height:1.5;margin-top:4px; }
      .ops-blueprint-workflow-panel { margin-top:16px; }
      .ops-blueprint-table-wrap { overflow:auto; }
      .ops-blueprint-table { width:100%;border-collapse:collapse;min-width:980px; }
      .ops-blueprint-table th { text-align:left;color:#566a73;font-size:8px;text-transform:uppercase;letter-spacing:.08em;padding:11px 13px;border-bottom:1px solid var(--ops-line);font-weight:800; }
      .ops-blueprint-table td { color:#778a92;font-size:9px;line-height:1.45;padding:12px 13px;border-bottom:1px solid var(--ops-line);vertical-align:top; }
      .ops-blueprint-table tbody tr:last-child td { border-bottom:0; }
      .ops-blueprint-table td:first-child { color:#e0e9eb;min-width:105px; }
      .ops-blueprint-table td b { color:#a9bbc1;font-weight:700; }
      .ops-table-automation { color:var(--ops-accent);display:flex;gap:5px;align-items:flex-start; }
      .ops-data-model { display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--ops-line); }
      .ops-data-model>div { background:var(--ops-panel);padding:13px;display:flex;gap:9px;align-items:flex-start; }
      .ops-data-model strong,.ops-data-model small { display:block; }
      .ops-data-model strong { font-size:10px; }
      .ops-data-model small { color:#71858d;font-size:8px;line-height:1.5;margin-top:4px; }
      .ops-evidence-stack { padding:10px 18px 18px;display:grid;gap:9px; }
      .ops-evidence-module { border:1px solid var(--ops-line);border-radius:9px;padding:11px;background:rgba(255,255,255,.015); }
      .ops-evidence-module>div { display:flex;align-items:center;gap:8px;margin-bottom:8px; }
      .ops-evidence-module>div strong { font-size:10px; }
      .ops-evidence-module p { margin:5px 0 0;color:#778b93;font-size:9px;line-height:1.5; }
      .ops-evidence-module p b { color:#aebec3; }
      .ops-build-roadmap { margin-top:16px; }
      .ops-roadmap-large { display:grid;grid-template-columns:repeat(5,1fr);padding:18px;gap:8px; }
      .ops-roadmap-large>div { border:1px solid var(--ops-line);border-radius:9px;padding:13px;min-height:120px; }
      .ops-roadmap-large>div>span { color:var(--ops-accent);font-size:9px;font-weight:800; }
      .ops-roadmap-large strong { display:block;font-size:11px;margin-top:8px; }
      .ops-roadmap-large p { color:#71858d;font-size:9px;line-height:1.5;margin:5px 0 0; }
      .ops-blueprint-footer { border-top:1px solid var(--ops-line);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:15px; }
      .ops-blueprint-footer>span { color:#7f939b;font-size:10px;display:flex;gap:6px;align-items:center; }
      .ops-blueprint-footer svg { color:var(--ops-accent);flex:none; }
      .ops-blueprint-footer strong { color:#cbd8dc; }
      .ops-error,.ops-success { padding:10px 12px;border-radius:8px;display:flex;align-items:center;gap:7px;font-size:10px;margin-bottom:12px; }
      .ops-error { color:#ff9aa0;background:rgba(255,127,135,.08);border:1px solid rgba(255,127,135,.15); }
      .ops-success { color:#79e4c7;background:rgba(111,224,194,.07);border:1px solid rgba(111,224,194,.13); }
      .ops-empty { padding:55px 20px;text-align:center;color:#5f747d; }
      .ops-empty svg { margin:auto;opacity:.45; }
      .ops-empty h3 { color:#aebdc2;font-size:13px;margin:10px 0 5px; }
      .ops-empty p { font-size:10px;margin:0; }
      .ops-inline-loading { padding:30px;text-align:center;color:#70848d;font-size:10px;display:flex;justify-content:center;gap:8px;align-items:center; }
      .ops-loading { min-height:100vh;background:var(--ops-bg);color:#82969f;display:grid;place-items:center;gap:10px;font-size:11px;align-content:center; }
      .ops-spinner { width:24px;height:24px;border:2px solid #1b3039;border-top-color:var(--ops-accent);border-radius:50%;animation:opsSpin .8s linear infinite; }
      .ops-spin { animation:opsSpin .8s linear infinite; }
      @keyframes opsSpin { to { transform:rotate(360deg); } }
      .ops-login-page { min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 50% 20%,rgba(111,224,194,.08),transparent 30%),#061016;color:#eef5f7;position:relative;overflow:hidden; }
      .ops-login-glow { position:absolute;width:500px;height:500px;border:1px solid rgba(111,224,194,.08);border-radius:50%;box-shadow:0 0 100px rgba(111,224,194,.04); }
      .ops-login-card { position:relative;width:min(410px,calc(100% - 32px));padding:34px;border:1px solid var(--ops-line);background:rgba(10,23,31,.92);border-radius:15px;box-shadow:0 30px 80px rgba(0,0,0,.3); }
      .ops-login-logo { margin-bottom:22px; }
      .ops-login-card h1 { font-size:25px;margin:7px 0 8px; }
      .ops-login-card>p { color:#7d929b;font-size:11px;line-height:1.6;margin:0 0 22px; }
      .ops-login-card form { display:grid;gap:13px; }
      .ops-login-card label { display:grid;gap:6px;color:#82959d;font-size:10px; }
      .ops-login-card input { background:#08141b;border:1px solid var(--ops-line);border-radius:8px;padding:11px;color:#e9f0f2;outline:0;font-size:11px; }
      .ops-login-card input:focus { border-color:rgba(111,224,194,.4); }
      .ops-login-card .ops-primary-btn { width:100%;padding:12px;margin-top:3px; }
      .ops-forgot { width:100%;border:0;background:transparent;color:#70858e;font-size:10px;margin-top:14px; }
      .ops-login-note { border-top:1px solid var(--ops-line);margin-top:20px;padding-top:15px;color:#536871;font-size:9px;display:flex;gap:6px;line-height:1.5; }
      @media(max-width:1050px) { .ops-stat-grid{grid-template-columns:1fr 1fr}.ops-grid-two,.ops-detail-grid,.ops-opportunity-layout{grid-template-columns:1fr}.ops-sidebar{width:210px}.ops-main{width:calc(100% - 210px);margin-left:210px}.ops-flow{grid-template-columns:repeat(4,1fr);gap:20px}.ops-flow-arrow{display:none}.ops-directory-head,.ops-directory-row{grid-template-columns:2fr .8fr 1fr .8fr 1.2fr 1fr 20px}.ops-content{padding:28px 22px 50px} }
      @media(max-width:760px) { .ops-blueprint-actions{width:100%;justify-content:flex-start}.ops-blueprint-actions .ops-blueprint-select{width:100%}.ops-blueprint-stage-strip{grid-template-columns:1fr 1fr}.ops-module-design-grid{grid-template-columns:1fr 1fr}.ops-design-flow{grid-template-columns:1fr}.ops-design-flow>svg{display:none}.ops-stage-bottom-grid{grid-template-columns:1fr}.ops-stage-designer-head{align-items:flex-start;flex-direction:column}.ops-blueprint-grid{grid-template-columns:1fr}.ops-blueprint-hero{align-items:flex-start;flex-direction:column}.ops-blueprint-readiness{text-align:left}.ops-roadmap-large{grid-template-columns:1fr 1fr}.ops-data-model{grid-template-columns:1fr}.ops-blueprint-footer{align-items:flex-start;flex-direction:column}.ops-blueprint-select select{min-width:180px}.ops-findings-grid{grid-template-columns:1fr}.ops-sidebar{position:relative;width:100%;min-height:auto;border-right:0;border-bottom:1px solid var(--ops-line)}.ops-app{display:block}.ops-main{width:100%;margin-left:0}.ops-sidebar-bottom{display:none}.ops-nav{grid-template-columns:repeat(3,1fr)}.ops-nav-item{justify-content:center}.ops-nav-item span{display:none}.ops-workspace{display:none}.ops-brand{height:62px}.ops-topbar{padding:0 15px}.ops-content{padding:22px 14px 45px}.ops-page-header{align-items:flex-start;flex-direction:column}.ops-page-header h1{font-size:24px}.ops-stat-grid{grid-template-columns:1fr 1fr}.ops-stat{min-height:105px;padding:13px}.ops-stat strong{font-size:19px}.ops-directory{overflow:auto}.ops-directory-head{display:none}.ops-directory-row{display:grid;grid-template-columns:1fr auto;gap:8px}.ops-directory-row>span:not(:first-child):not(:last-child){display:none}.ops-answer-grid,.ops-report-answers,.ops-report-modules{grid-template-columns:1fr}.ops-next-banner{align-items:flex-start;flex-direction:column}.ops-detail-actions{flex-wrap:wrap}.ops-business-hero{align-items:flex-start;flex-direction:column}.ops-hero-score{text-align:left;border-left:0;padding-left:0}.ops-flow{grid-template-columns:1fr 1fr}.ops-automation-summary{grid-template-columns:1fr}.ops-report-cover{flex-direction:column}.ops-report-score{text-align:left}.ops-login-card{padding:25px}.ops-opportunity-detail{padding:18px} }
      .ops-blueprint-stage-strip { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:14px 18px;border-bottom:1px solid var(--ops-line); }
      .ops-blueprint-stage-strip button { border:1px solid var(--ops-line);background:rgba(255,255,255,.015);color:#71858d;border-radius:8px;padding:10px;text-align:left;display:grid;grid-template-columns:24px 1fr 14px;align-items:center;gap:7px;cursor:pointer; }
      .ops-blueprint-stage-strip button:hover,.ops-blueprint-stage-strip button.active { border-color:rgba(111,224,194,.35);background:rgba(111,224,194,.05);color:#dbe7e9; }
      .ops-blueprint-stage-strip span { font-size:8px;color:#536870;font-weight:800; }
      .ops-blueprint-stage-strip strong { font-size:9px;line-height:1.35; }
      .ops-blueprint-table tbody tr { cursor:pointer;transition:background .15s ease; }
      .ops-blueprint-table tbody tr:hover,.ops-blueprint-table tbody tr.selected { background:rgba(111,224,194,.035); }
      .ops-stage-designer { margin-top:16px;border-color:rgba(111,224,194,.2); }
      .ops-stage-designer-head { padding:18px;display:flex;align-items:flex-start;justify-content:space-between;gap:15px;border-bottom:1px solid var(--ops-line); }
      .ops-stage-designer-head h2 { margin:4px 0 3px;font-size:20px; }
      .ops-stage-designer-head p { margin:0;color:#71858d;font-size:10px; }
      .ops-module-design-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--ops-line); }
      .ops-design-card { background:var(--ops-panel);padding:15px;min-height:120px; }
      .ops-design-card h3 { margin:5px 0 6px;font-size:11px;color:#dbe5e7; }
      .ops-design-card p { margin:0;color:#788c94;font-size:9px;line-height:1.55; }
      .ops-design-flow { display:grid;grid-template-columns:1fr 22px 1fr 22px 1fr;align-items:center;gap:8px;padding:15px 18px;border-top:1px solid var(--ops-line);border-bottom:1px solid var(--ops-line); }
      .ops-design-flow>div { border:1px solid var(--ops-line);border-radius:8px;padding:11px;min-height:58px; }
      .ops-design-flow span { display:block;color:#566b74;font-size:8px;letter-spacing:.08em;font-weight:800; }
      .ops-design-flow strong { display:block;color:#cbd8dc;font-size:9px;line-height:1.45;margin-top:4px; }
      .ops-design-flow>svg { color:#52666f; }
      .ops-stage-bottom-grid { display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--ops-line); }
      .ops-ai-card { min-height:150px; }
      .ops-ai-badge { margin-top:12px;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(111,224,194,.18);background:rgba(111,224,194,.045);color:var(--ops-accent);border-radius:999px;padding:6px 8px;font-size:8px; }
      .ops-mini-evidence { border-top:1px solid var(--ops-line);padding:8px 0;display:grid;gap:3px; }
      .ops-mini-evidence:first-of-type { margin-top:8px; }
      .ops-mini-evidence strong { color:#cddadd;font-size:9px;line-height:1.4; }
      .ops-mini-evidence span { color:#71858d;font-size:9px;line-height:1.45; }
      .ops-status-badge { display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:999px;font-size:9px;font-weight:800;border:1px solid var(--ops-line); }
      .ops-status-badge.submitted { color:#f0c36a;background:rgba(240,195,106,.06);border-color:rgba(240,195,106,.16); }
      .ops-status-badge.reviewed { color:var(--ops-accent);background:rgba(111,224,194,.06);border-color:rgba(111,224,194,.16); }
      .ops-blueprint-actions { display:flex;align-items:flex-end;gap:7px;flex-wrap:wrap;justify-content:flex-end; }
      .ops-report-status { display:inline-flex;margin-top:9px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.08);font-size:9px;color:#b8c5d5; }
      @media print { .ops-sidebar,.ops-topbar,.ops-detail-actions,.ops-page-header .ops-primary-btn,.ops-report-toolbar{display:none!important}.ops-main{width:100%;margin:0}.ops-content{padding:0}.ops-report{max-width:none;border-radius:0}.ops-report-cover{print-color-adjust:exact;-webkit-print-color-adjust:exact} body{background:#fff!important} }
    `}</style>
  );
}
