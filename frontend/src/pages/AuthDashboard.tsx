import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Compass, FolderKanban, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiBaseUrl, isNotFoundError, saveApiBaseUrl, saveToken } from '../lib/api';
import { Opportunity, Profile, Project, ProjectMatch } from '../lib/types';
import { Field, Notice, Spinner } from '../components/ui';
import { LiveBackground } from '../components/LiveBackground';

/** Counts up from 0 to `value` once; respects reduced-motion. */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || value <= 0) { setN(value); return; }
    const start = performance.now(), dur = 900;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{n}</>;
}

export function AuthPage({ mode, onSignedIn }: { mode: 'login' | 'register'; onSignedIn: () => void }) {
  const navigate = useNavigate();
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true); saveApiBaseUrl(apiUrl.trim() || getApiBaseUrl());
    try {
      if (mode === 'register') {
        await api<string>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
        setSuccess('Your account is ready. Sign in to set up your profile.');
        window.setTimeout(() => navigate('/login'), 900);
      } else {
        const result = await api<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        saveToken(result.token); onSignedIn(); navigate('/dashboard');
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not complete that request.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page auth-live">
    <LiveBackground />
    <div className="auth-shell">
      <section className="auth-info">
        <Link to="/login" className="brand"><span className="brand-emoji">🎓</span><span>Student<span className="brand-weight">OS</span></span></Link>
        <span className="eyebrow auth-badge">SKILL-BASED COLLABORATION PLATFORM</span>
        <h1>Find the right team.<br /><em>Build what matters.</em></h1>
        <p className="auth-lead">StudentOS connects students through their skills. Create a profile, discover projects that fit you, see exactly which skills you are missing, and send join requests to project owners, all in one workspace.</p>
        <ul className="auth-points">
          <li><span>🎯</span><div><strong>Smart skill matching</strong><small>A match percentage for every project and opportunity.</small></div></li>
          <li><span>💻</span><div><strong>Projects and teams</strong><small>Post ideas, list required skills and manage join requests.</small></div></li>
          <li><span>🧩</span><div><strong>Skill and team gap</strong><small>Know what to learn and what your team still needs.</small></div></li>
          <li><span>🚀</span><div><strong>Opportunities and resources</strong><small>Internships, hackathons and learning links in one place.</small></div></li>
        </ul>
        <div className="auth-tech"><span>React</span><span>Spring Boot</span><span>PostgreSQL</span><span>JWT secured</span></div>
      </section>
      <main className="auth-card"><div className="auth-form-wrap">
        <span className="eyebrow">{mode === 'login' ? 'Your space is waiting' : 'Start building together'}</span>
        <h2>{mode === 'login' ? 'Sign in to StudentOS' : 'Create your account'}</h2>
        <p className="auth-subtitle">{mode === 'login' ? 'Pick up where you left off.' : 'Join your campus project community.'}</p>
        {error && <Notice message={error} />}{success && <Notice message={success} kind="success" />}
        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && <Field label="Full name"><input autoComplete="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aanya Mehta" /></Field>}
          <Field label="Email address"><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" /></Field>
          <Field label="Password"><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></Field>
          <details className="auth-advanced"><summary>Connection settings</summary>
            <Field label="Backend API URL" hint="Only change this if your backend is hosted somewhere else."><input type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://your-api.example.com" /></Field>
          </details>
          <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'New to StudentOS?' : 'Already have an account?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p>
        <p className="auth-footnote">The first sign-in can take up to a minute while the free server wakes up.</p>
      </div></main>
    </div>
  </div>;
}

const workspaceCards = [
  { to: '/profile', emoji: '👤', title: 'Profile', text: 'View your personal information.' },
  { to: '/resources', emoji: '📚', title: 'Resources', text: 'Explore learning materials and resources.' },
  { to: '/projects', emoji: '💻', title: 'Projects', text: 'Browse projects and share your own ideas.' },
  { to: '/opportunities', emoji: '🚀', title: 'Opportunities', text: 'Find internships, hackathons and more.' },
  { to: '/matches', emoji: '✨', title: 'Matches', text: 'See which projects fit your skills best.' },
  { to: '/projects', emoji: '🤝', title: 'Join Requests', text: 'Review requests to join your projects.' },
];

export function DashboardPage() {
  const [busy, setBusy] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [matches, setMatches] = useState<ProjectMatch[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    Promise.allSettled([
      api<Profile>('/profile'), api<Project[]>('/projects'), api<ProjectMatch[]>('/match/projects'), api<Opportunity[]>('/opportunities'),
    ]).then(([p, pr, ma, op]) => {
      if (!live) return;
      const failures: string[] = [];
      if (p.status === 'fulfilled') setProfile(p.value);
      else if (!isNotFoundError(p.reason)) failures.push(`Profile: ${p.reason instanceof Error ? p.reason.message : 'Could not load profile.'}`);
      if (pr.status === 'fulfilled') setProjects(pr.value);
      else failures.push(`Projects: ${pr.reason instanceof Error ? pr.reason.message : 'Could not load projects.'}`);
      if (ma.status === 'fulfilled') setMatches(ma.value);
      else failures.push(`Matches: ${ma.reason instanceof Error ? ma.reason.message : 'Could not load matches.'}`);
      if (op.status === 'fulfilled') setOpportunities(op.value);
      else failures.push(`Opportunities: ${op.reason instanceof Error ? op.reason.message : 'Could not load opportunities.'}`);
      setError(failures.join(' · '));
    }).finally(() => live && setBusy(false));
    return () => { live = false; };
  }, []);
  const skillCount = profile?.user?.skills?.length || 0;
  const latest = [...projects].sort((a, b) => b.id - a.id).slice(0, 6);
  const topMatches = [...matches].sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
  if (busy) return <Spinner label="Putting your workspace together…" />;
  return <div className="page-content">
    {error && <Notice message={error} />}
    <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow eyebrow-light">YOUR STUDENT WORKSPACE</span><h1>Welcome to StudentOS! 👋</h1><p>Manage your learning, discover projects and explore opportunities in one place.</p></div><div className="welcome-art"><div className="welcome-ring ring-a" /><div className="welcome-ring ring-b" /><div className="welcome-core">🎓</div></div></section>
    <h2 className="workspace-title">Your Workspace</h2>
    <div className="workspace-grid">{workspaceCards.map((card, index) => <Link to={card.to} className="workspace-card" key={card.title}><span className={`workspace-icon wi-${index + 1}`}>{card.emoji}</span><h3>{card.title}</h3><p>{card.text}</p><span className="workspace-open">Open section →</span></Link>)}</div>
    <div className="stat-strip">
      <div className="stat-cell"><span className="stat-icon icon-cobalt"><FolderKanban size={18} /></span><div><strong><CountUp value={projects.length} /></strong><span>Open projects</span></div><Link to="/projects" aria-label="Browse projects"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-lime"><Sparkles size={18} /></span><div><strong><CountUp value={skillCount} /></strong><span>Your skills</span></div><Link to="/profile" aria-label="Edit your skills"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-peach"><BriefcaseBusiness size={18} /></span><div><strong><CountUp value={opportunities.length} /></strong><span>Opportunities</span></div><Link to="/opportunities" aria-label="Browse opportunities"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-ink"><BarChart3 size={18} /></span><div><strong><CountUp value={matches.length} /></strong><span>Project matches</span></div><Link to="/matches" aria-label="See matches"><ArrowRight size={16} /></Link></div>
    </div>
    <section className="panel latest-projects"><div className="panel-top"><div><span className="eyebrow">FRESH ON CAMPUS</span><h2>Latest projects</h2></div><Link to="/projects" className="text-link">All projects <ArrowRight size={15} /></Link></div>{latest.length ? <div className="latest-grid">{latest.map(p => <Link to="/projects" className="latest-card" key={p.id}><span className="latest-owner"><i>{(p.owner?.name || 'S').charAt(0).toUpperCase()}</i>{p.owner?.name || 'Student'}</span><strong>{p.title}</strong><p>{p.description}</p><div className="latest-skills">{(p.requiredSkills || []).slice(0, 3).map(s => <span className="tag" key={s.id}>{s.name}</span>)}</div></Link>)}</div> : <div className="inline-empty"><Compass size={20} /><span>No projects yet. Be the first to share one.</span><Link to="/projects">Add project</Link></div>}</section>
    <div className="dashboard-columns"><section className="panel panel-featured"><div className="panel-top"><div><span className="eyebrow">A GOOD FIT FOR YOU</span><h2>Project matches</h2></div><Link to="/matches" className="text-link">All matches <ArrowRight size={15} /></Link></div>{topMatches.length ? <div className="match-list">{topMatches.map((match, index) => <Link to="/matches" className="match-row" key={match.projectId}><span className={`match-rank rank-${index + 1}`}>0{index + 1}</span><div className="match-meta"><strong>{match.projectTitle}</strong><span>{match.matchPercentage}% skill alignment</span></div><div className="match-meter"><span style={{ width: `${Math.max(4, Math.min(100, match.matchPercentage))}%` }} /></div><ArrowRight size={16} className="row-arrow" /></Link>)}</div> : <div className="inline-empty"><Compass size={20} /><span>Add skills to your profile to reveal your best project matches.</span><Link to="/profile">Set up profile</Link></div>}</section>
      <section className="panel panel-side"><div className="panel-top"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Build momentum</h2></div><ArrowDownRight size={20} className="muted-icon" /></div><div className="step-stack"><Link to="/profile" className="step-row"><span className="step-number">01</span><span><strong>Shape your profile</strong><small>Add skills and interests</small></span><ArrowRight size={15} /></Link><Link to="/projects" className="step-row"><span className="step-number">02</span><span><strong>Find your people</strong><small>Explore campus projects</small></span><ArrowRight size={15} /></Link><Link to="/resources" className="step-row"><span className="step-number">03</span><span><strong>Learn something new</strong><small>Browse shared resources</small></span><ArrowRight size={15} /></Link></div></section></div>
    <section className="bottom-callout"><div className="callout-icon"><BookOpen size={19} /></div><div><span className="eyebrow">A LITTLE INSPIRATION</span><p>Small teams, clear skills, ambitious ideas. Start with what you want to make.</p></div><Link to="/projects" className="button button-outline">Share a project<ArrowRight size={15} /></Link></section>
  </div>;
}
