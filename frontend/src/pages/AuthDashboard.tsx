import { FormEvent, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Compass, FolderKanban, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiBaseUrl, isNotFoundError, saveApiBaseUrl, saveToken } from '../lib/api';
import { Opportunity, Profile, Project, ProjectMatch } from '../lib/types';
import { Field, Notice, Spinner } from '../components/ui';

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
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true); saveApiBaseUrl(apiUrl);
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

  return <div className="auth-page">
    <aside className="auth-visual">
      <Link to="/login" className="brand brand-light"><span className="brand-symbol"><i /><i /><i /></span><span>student<span className="brand-weight">os</span></span></Link>
      <div className="auth-copy"><span className="eyebrow eyebrow-light">A workspace for what’s next</span><h1>Good ideas<br />grow <em>together.</em></h1><p>Find collaborators, build meaningful projects, and make your next move with the right people around you.</p><div className="auth-orbit"><span className="orbit-center">S</span><span className="orbit-node node-one">01</span><span className="orbit-node node-two">02</span><span className="orbit-node node-three">03</span></div></div>
      <div className="auth-quote"><span>“</span><div>Find the missing skill.<br />Meet the teammate.</div><small>STUDENT OS / 01</small></div>
    </aside>
    <main className="auth-main"><div className="auth-form-wrap">
      <span className="eyebrow">{mode === 'login' ? 'Your space is waiting' : 'Start building together'}</span>
      <h2>{mode === 'login' ? 'Sign in to Student OS' : 'Create your account'}</h2>
      <p className="auth-subtitle">{mode === 'login' ? 'Pick up where you left off.' : 'Join your campus project community.'}</p>
      {error && <Notice message={error} />}{success && <Notice message={success} kind="success" />}
      <form onSubmit={submit} className="form-stack">
        {mode === 'register' && <Field label="Full name"><input autoComplete="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aanya Mehta" /></Field>}
        <Field label="Email address"><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" /></Field>
        <Field label="Password"><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></Field>
        <Field label="Backend API URL" hint="Use your hosted Spring Boot API URL when the backend is deployed."><input type="url" required value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://your-api.example.com" /></Field>
        <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">{mode === 'login' ? 'New to Student OS?' : 'Already have an account?'} <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p>
      <p className="auth-footnote">Your API URL is saved only in this browser. Your session ends when this tab closes.</p>
    </div></main>
  </div>;
}

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
  const name = profile?.user?.name?.split(' ')[0] || 'there';
  const skillCount = profile?.user?.skills?.length || 0;
  const topMatches = [...matches].sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
  if (busy) return <Spinner label="Putting your workspace together…" />;
  return <div className="page-content">
    {error && <Notice message={error} />}
    <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow eyebrow-light">YOUR CAMPUS, IN MOTION</span><h1>Good morning,<br /><em>{name}.</em></h1><p>Your next project starts with one good connection.</p><Link to="/projects" className="button button-light">Explore projects<ArrowRight size={16} /></Link></div><div className="welcome-art"><div className="welcome-ring ring-a" /><div className="welcome-ring ring-b" /><div className="welcome-core"><Sparkles size={25} /></div><span className="float-note note-a">build</span><span className="float-note note-b">together</span><span className="welcome-index">STUDENT OS · 2026</span></div></section>
    <div className="stat-strip">
      <div className="stat-cell"><span className="stat-icon icon-cobalt"><FolderKanban size={18} /></span><div><strong>{projects.length}</strong><span>Open projects</span></div><Link to="/projects" aria-label="Browse projects"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-lime"><Sparkles size={18} /></span><div><strong>{skillCount}</strong><span>Your skills</span></div><Link to="/profile" aria-label="Edit your skills"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-peach"><BriefcaseBusiness size={18} /></span><div><strong>{opportunities.length}</strong><span>Opportunities</span></div><Link to="/opportunities" aria-label="Browse opportunities"><ArrowRight size={16} /></Link></div>
      <div className="stat-cell"><span className="stat-icon icon-ink"><BarChart3 size={18} /></span><div><strong>{matches.length}</strong><span>Project matches</span></div><Link to="/matches" aria-label="See matches"><ArrowRight size={16} /></Link></div>
    </div>
    <div className="dashboard-columns"><section className="panel panel-featured"><div className="panel-top"><div><span className="eyebrow">A GOOD FIT FOR YOU</span><h2>Project matches</h2></div><Link to="/matches" className="text-link">All matches <ArrowRight size={15} /></Link></div>{topMatches.length ? <div className="match-list">{topMatches.map((match, index) => <Link to="/matches" className="match-row" key={match.projectId}><span className={`match-rank rank-${index + 1}`}>0{index + 1}</span><div className="match-meta"><strong>{match.projectTitle}</strong><span>{match.matchPercentage}% skill alignment</span></div><div className="match-meter"><span style={{ width: `${Math.max(4, Math.min(100, match.matchPercentage))}%` }} /></div><ArrowRight size={16} className="row-arrow" /></Link>)}</div> : <div className="inline-empty"><Compass size={20} /><span>Add skills to your profile to reveal your best project matches.</span><Link to="/profile">Set up profile</Link></div>}</section>
      <section className="panel panel-side"><div className="panel-top"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Build momentum</h2></div><ArrowDownRight size={20} className="muted-icon" /></div><div className="step-stack"><Link to="/profile" className="step-row"><span className="step-number">01</span><span><strong>Shape your profile</strong><small>Add skills and interests</small></span><ArrowRight size={15} /></Link><Link to="/projects" className="step-row"><span className="step-number">02</span><span><strong>Find your people</strong><small>Explore campus projects</small></span><ArrowRight size={15} /></Link><Link to="/resources" className="step-row"><span className="step-number">03</span><span><strong>Learn something new</strong><small>Browse shared resources</small></span><ArrowRight size={15} /></Link></div></section></div>
    <section className="bottom-callout"><div className="callout-icon"><BookOpen size={19} /></div><div><span className="eyebrow">A LITTLE INSPIRATION</span><p>Small teams, clear skills, ambitious ideas. Start with what you want to make.</p></div><Link to="/projects" className="button button-outline">Share a project<ArrowRight size={15} /></Link></section>
  </div>;
}
