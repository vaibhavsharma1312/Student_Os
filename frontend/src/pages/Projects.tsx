import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Filter, Plus, Search, Send, Sparkles, Trash2, UsersRound, X } from 'lucide-react';
import { api, apiForm } from '../lib/api';
import { JoinRequest, Profile, Project, ProjectMatch, SkillGap } from '../lib/types';
import { EmptyState, Field, Notice, PageHeading, Spinner, Tag } from '../components/ui';

export function ProjectsPage({ profile }: { profile: Profile | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [matches, setMatches] = useState<ProjectMatch[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [matchError, setMatchError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [gap, setGap] = useState<SkillGap | null>(null);
  const [gapError, setGapError] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    setBusy(true); setError('');
    try {
      const [listResult, matchResult] = await Promise.allSettled([api<Project[]>('/projects'), api<ProjectMatch[]>('/match/projects')]);
      if (listResult.status === 'rejected') throw listResult.reason;
      setProjects(listResult.value);
      if (matchResult.status === 'fulfilled') { setMatches(matchResult.value); setMatchError(''); }
      else { setMatches([]); setMatchError(matchResult.reason instanceof Error ? matchResult.reason.message : 'Project match scores could not be loaded.'); }
      if (selected) setSelected(listResult.value.find(item => item.id === selected.id) || null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load projects.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    let live = true;
    if (!selected) { setGap(null); setGapError(''); setGapLoading(false); setRequests([]); setRequestError(''); return; }
    setGap(null); setGapError(''); setGapLoading(true);
    api<SkillGap>(`/match/skill-gap/${selected.id}`).then(value => live && setGap(value)).catch(reason => live && setGapError(reason instanceof Error ? reason.message : 'Could not load the skill-gap insight.')).finally(() => live && setGapLoading(false));
    const ownerEmail = selected.owner?.email;
    if (ownerEmail && ownerEmail === profile?.user?.email) {
      setRequestError('');
      api<JoinRequest[]>(`/join-requests/project/${selected.id}`).then(value => live && setRequests(value)).catch(reason => { if (live) { setRequests([]); setRequestError(reason instanceof Error ? reason.message : 'Join requests could not be loaded.'); } });
    } else { setRequests([]); setRequestError(''); }
    return () => { live = false; };
  }, [selected?.id, profile?.user?.email]);

  async function retryGap() {
    if (!selected) return;
    setGapError(''); setGapLoading(true);
    try { setGap(await api<SkillGap>(`/match/skill-gap/${selected.id}`)); }
    catch (reason) { setGapError(reason instanceof Error ? reason.message : 'Could not load the skill-gap insight.'); }
    finally { setGapLoading(false); }
  }

  const scoreById = useMemo(() => new Map(matches.map(item => [item.projectId, item.matchPercentage])), [matches]);
  const filtered = useMemo(() => projects.filter(item => `${item.title} ${item.description} ${(item.requiredSkills || []).map(x => x.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const isOwner = !!selected && selected.owner?.email === profile?.user?.email;
  async function createProject(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try { await apiForm<Project>('/projects', { title, description }); setShowCreate(false); setTitle(''); setDescription(''); setMessage('Project created. Your idea is on the board.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Project could not be created.'); }
    finally { setSaving(false); }
  }
  async function sendJoinRequest(projectId: number) {
    setError(''); setMessage('');
    try { await api(`/join-requests/${projectId}`, { method: 'POST' }); setMessage('Join request sent. The project owner can now review it.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Request could not be sent.'); }
  }
  async function addRequiredSkill(event: FormEvent) {
    event.preventDefault(); if (!selected || !skill.trim()) return;
    try { const updated = await api<Project>(`/projects/${selected.id}/skills?skillName=${encodeURIComponent(skill.trim())}`, { method: 'POST' }); setSelected(updated); setSkill(''); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Skill could not be added.'); }
  }
  async function updateStatus(requestId: number, status: 'ACCEPTED' | 'REJECTED') {
    try { const updated = await api<JoinRequest>(`/join-requests/${requestId}?status=${status}`, { method: 'PUT' }); setRequests(current => current.map(item => item.id === requestId ? updated : item)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Status could not be updated.'); }
  }
  async function deleteProject() {
    if (!selected || !window.confirm('Delete this project? This action cannot be undone.')) return;
    try { await api(`/projects/${selected.id}`, { method: 'DELETE' }); setSelected(null); setMessage('Project deleted.'); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Project could not be deleted.'); }
  }

  return <div className="page-content">
    <PageHeading eyebrow="MAKE SOMETHING REAL" title="Projects" description="Find a team, bring an idea to life, or share what you’re building." action={<button className="button button-primary" onClick={() => setShowCreate(value => !value)}><Plus size={17} /> New project</button>} />
    {error && <Notice message={error} onDismiss={() => setError('')} />}{matchError && <Notice kind="error" message={`Project match scores are unavailable: ${matchError}`} onDismiss={() => setMatchError('')} />}{message && <Notice message={message} kind="success" onDismiss={() => setMessage('')} />}
    {showCreate && <section className="panel create-panel"><div className="panel-top"><div><span className="eyebrow">SHARE AN IDEA</span><h2>Start a project</h2></div><button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close form"><X size={18} /></button></div><form className="create-form" onSubmit={createProject}><Field label="Project title"><input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you want to build?" /></Field><Field label="Description"><textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the idea and the kind of collaborators you need." /></Field><button className="button button-primary" disabled={saving}>{saving ? 'Creating…' : 'Publish project'}<ArrowRight size={16} /></button></form></section>}
    <div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, skills, ideas…" /></div><div className="toolbar-note"><Filter size={15} /> {filtered.length} projects</div></div>
    {busy ? <Spinner label="Finding campus projects…" /> : <div className={`project-layout ${selected ? 'has-inspector' : ''}`}>
      <div className="project-list">{filtered.length ? filtered.map((project, index) => <button className={`project-card ${selected?.id === project.id ? 'project-card-active' : ''}`} key={project.id} onClick={() => setSelected(project)}>
        <div className="project-card-top"><span className={`project-index index-${index % 4}`}>{String(index + 1).padStart(2, '0')}</span><span className="match-pill">{Math.round(scoreById.get(project.id) || 0)}% match</span></div>
        <h2>{project.title}</h2><p>{project.description || 'A new idea looking for curious minds.'}</p>
        <div className="skill-row">{project.requiredSkills?.length ? project.requiredSkills.slice(0, 3).map(item => <Tag key={item.id}>{item.name}</Tag>) : <Tag tone="muted">Open to all skills</Tag>}{(project.requiredSkills?.length || 0) > 3 && <span className="more-skills">+{project.requiredSkills!.length - 3}</span>}</div>
        <div className="project-card-bottom"><span><UsersRound size={14} /> {project.owner?.name || 'Student team'}</span><span className="card-arrow"><ArrowRight size={16} /></span></div>
      </button>) : <EmptyState title="No projects found" detail={query ? 'Try another search term.' : 'Start something worth building, and invite others in.'} action={!query && <button className="button button-primary button-small" onClick={() => setShowCreate(true)}><Plus size={15} /> Share a project</button>} />}</div>
      {selected && <aside className="project-inspector"><div className="inspector-head"><span className="eyebrow">PROJECT / {String(selected.id).padStart(3, '0')}</span><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={17} /></button></div><h2>{selected.title}</h2><p className="inspector-description">{selected.description}</p><div className="owner-line"><span className="avatar avatar-small">{selected.owner?.name?.charAt(0) || 'S'}</span><span><small>PROJECT OWNER</small><strong>{selected.owner?.name || 'Student team'}</strong></span></div>
        <div className="inspector-section"><div className="section-label"><span>SKILLS NEEDED</span><span>{selected.requiredSkills?.length || 0}</span></div><div className="skill-row">{selected.requiredSkills?.length ? selected.requiredSkills.map(item => <Tag key={item.id}>{item.name}</Tag>) : <span className="muted-copy">No skills have been added yet.</span>}</div></div>
        {gapLoading && <div className="gap-card"><div className="section-label"><span>YOUR FIT</span></div><div className="gap-loading-inline"><i className="spin"/>Calculating your skill gap…</div></div>}
        {gapError && <div className="gap-card gap-card-error"><div className="section-label"><span>SKILL-GAP INSIGHT UNAVAILABLE</span><button className="text-link" onClick={() => void retryGap()}>Retry<ArrowRight size={13}/></button></div><p>{gapError}</p></div>}
        {gap && <div className="gap-card"><div className="section-label"><span>YOUR FIT</span><Sparkles size={14} /></div><div className="gap-score">{Math.round(gap.matchPercentage)}<small>%</small></div><div className="progress-track"><span style={{ width: `${Math.max(2, Math.min(100, gap.matchPercentage))}%` }} /></div>{gap.missingSkills?.length ? <p>Grow next: {gap.missingSkills.join(', ')}</p> : <p>Your current skills line up with this build.</p>}</div>}
        {isOwner ? <>
          <form className="inline-add" onSubmit={addRequiredSkill}><input aria-label="Skill name" value={skill} onChange={e => setSkill(e.target.value)} placeholder="Add a skill you need" /><button className="icon-button icon-button-blue" aria-label="Add skill"><Plus size={17} /></button></form>
          <div className="inspector-section"><div className="section-label"><span>JOIN REQUESTS</span><span>{requests.length}</span></div>{requestError ? <Notice kind="error" message={requestError} onDismiss={() => setRequestError('')} /> : requests.length ? requests.map(req => <div className="request-row" key={req.id}><span className="avatar avatar-small">{req.user?.name?.charAt(0) || 'S'}</span><div className="request-person"><strong>{req.user?.name || req.user?.email || 'Student'}</strong><Tag tone={req.status === 'ACCEPTED' ? 'lime' : req.status === 'REJECTED' ? 'orange' : 'muted'}>{req.status.toLowerCase()}</Tag></div>{req.status === 'PENDING' && <div className="request-actions"><button className="tiny-action accept-action" title="Accept" onClick={() => void updateStatus(req.id, 'ACCEPTED')}><Check size={14} /></button><button className="tiny-action reject-action" title="Decline" onClick={() => void updateStatus(req.id, 'REJECTED')}><X size={14} /></button></div>}</div>) : <p className="muted-copy">No join requests yet.</p>}</div>
          <button className="button button-danger button-wide" onClick={() => void deleteProject()}><Trash2 size={15} /> Delete project</button>
        </> : <button className="button button-primary button-wide" onClick={() => void sendJoinRequest(selected.id)}><Send size={15} /> Request to join</button>}
      </aside>}
    </div>}
  </div>;
}
