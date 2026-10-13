import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Crosshair, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { OpportunityMatch, Profile, Project, ProjectMatch, SkillGap, TeamGap } from '../lib/types';
import { EmptyState, Notice, PageHeading, Spinner, Tag } from '../components/ui';

export function MatchesPage({ profile }: { profile: Profile | null }) {
  const [projects, setProjects] = useState<ProjectMatch[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityMatch[]>([]);
  const [catalog, setCatalog] = useState<Project[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [gap, setGap] = useState<SkillGap | null>(null);
  const [gapError, setGapError] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [teamGap, setTeamGap] = useState<TeamGap | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      api<ProjectMatch[]>('/match/projects'), api<OpportunityMatch[]>('/match/opportunities'), api<Project[]>('/projects'),
    ]).then(([p, o, c]) => { setProjects(p); setOpportunities(o); setCatalog(c); if (p[0]) setSelected(p[0].projectId); })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load matching insights.'))
      .finally(() => setBusy(false));
  }, []);
  useEffect(() => {
    let live = true; setGap(null); setGapError(''); setTeamGap(null);
    if (selected !== null) {
      setGapLoading(true);
      api<SkillGap>(`/match/skill-gap/${selected}`).then(data => live && setGap(data)).catch(reason => live && setGapError(reason instanceof Error ? reason.message : 'Could not load the skill-gap insight.')).finally(() => live && setGapLoading(false));
    } else setGapLoading(false);
    return () => { live = false; };
  }, [selected]);
  const selectedProject = useMemo(() => catalog.find(project => project.id === selected), [catalog, selected]);
  const canReviewTeam = selectedProject?.owner?.email === profile?.user?.email;
  async function loadTeamGap() {
    if (selected === null || !canReviewTeam) return;
    setTeamLoading(true); setError('');
    try { setTeamGap(await api<TeamGap>(`/match/team-gap/${selected}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Team insights could not be loaded.'); }
    finally { setTeamLoading(false); }
  }
  async function retryGap() {
    if (selected === null) return;
    setGapError(''); setGapLoading(true);
    try { setGap(await api<SkillGap>(`/match/skill-gap/${selected}`)); }
    catch (reason) { setGapError(reason instanceof Error ? reason.message : 'Could not load the skill-gap insight.'); }
    finally { setGapLoading(false); }
  }
  if (busy) return <Spinner label="Finding your best-fit opportunities…" />;
  const sortedProjects = [...projects].sort((a, b) => b.matchPercentage - a.matchPercentage);
  const sortedOpportunities = [...opportunities].sort((a, b) => b.matchPercentage - a.matchPercentage);
  return <div className="page-content">
    <PageHeading eyebrow="SKILLS MEET OPPORTUNITY" title="Your matches" description="A clearer view of where your skills could make a difference." />
    {error && <Notice message={error} onDismiss={() => setError('')} />}
    <div className="insights-hero"><div><span className="eyebrow eyebrow-light">YOUR MATCH SIGNAL</span><h2>Make the next<br /><em>connection count.</em></h2><p>Match scores compare the skills in your profile with what a project or opportunity needs.</p></div><div className="insights-orbit"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><span>{sortedProjects.length + sortedOpportunities.length}<small>signals</small></span></div></div>
    <div className="matches-layout"><section className="panel match-panel"><div className="panel-top"><div><span className="eyebrow">BUILD WITH A TEAM</span><h2>Project alignment</h2></div><span className="panel-count">{sortedProjects.length}</span></div>
      {sortedProjects.length ? <div className="ranked-list">{sortedProjects.map((item, index) => <button key={item.projectId} className={`ranked-item ${selected === item.projectId ? 'ranked-item-active' : ''}`} onClick={() => setSelected(item.projectId)}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className="rank-text"><strong>{item.projectTitle}</strong><span className="rank-track"><i style={{ width: `${Math.max(4, Math.min(100, item.matchPercentage))}%` }}/></span></span><span className="rank-score">{Math.round(item.matchPercentage)}<small>%</small></span></button>)}</div> : <EmptyState title="No project matches yet" detail="Add a few skills to your profile to see where you might fit." action={<Link className="button button-primary button-small" to="/profile">Add your skills<ArrowRight size={14}/></Link>} />}
    </section>
    <section className="panel match-panel"><div className="panel-top"><div><span className="eyebrow">GROW YOUR NEXT STEP</span><h2>Opportunity alignment</h2></div><span className="panel-count">{sortedOpportunities.length}</span></div>
      {sortedOpportunities.length ? <div className="ranked-list">{sortedOpportunities.map((item, index) => <div key={item.opportunityId} className="ranked-item ranked-item-static"><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className="rank-text"><strong>{item.opportunityTitle}</strong><span className="rank-subtitle">{item.type}</span><span className="rank-track"><i style={{ width: `${Math.max(4, Math.min(100, item.matchPercentage))}%` }}/></span></span><span className="rank-score">{Math.round(item.matchPercentage)}<small>%</small></span></div>)}</div> : <EmptyState title="No opportunity matches yet" detail="Opportunities appear here when the backend has skill matches for your profile." />}
    </section></div>
    {selected !== null && <section className="gap-analysis panel"><div className="gap-analysis-head"><div><span className="eyebrow">PROJECT / {String(selected).padStart(3, '0')}</span><h2>{gap?.projectTitle || selectedProject?.title || 'Skill gap analysis'}</h2></div><div className="gap-analysis-score"><strong>{gap ? `${Math.round(gap.matchPercentage)}%` : '—'}</strong><span>current fit</span></div></div><div className="gap-analysis-body"><div className="gap-explain"><Crosshair size={18}/><div><strong>Your skill gap, clearly</strong><p>These are the skills the project needs that are not currently on your profile.</p></div></div><div className="missing-skills">{gapLoading ? <span className="gap-loading-inline"><i className="spin"/>Calculating skill gap…</span> : gapError ? <div className="gap-error-text"><span>{gapError}</span><button className="text-link" onClick={() => void retryGap()}>Retry<ArrowRight size={13}/></button></div> : gap ? (gap.missingSkills?.length ? gap.missingSkills.map(skill => <Tag key={skill} tone="orange">{skill}</Tag>) : <div className="all-skills"><Check size={16}/> No missing skills found for this project.</div>) : <span className="muted-copy">Select a project match to inspect its skills.</span>}</div></div>
      {canReviewTeam && <div className="team-gap-area">{!teamGap ? <button className="button button-outline" onClick={() => void loadTeamGap()} disabled={teamLoading}><UsersRound size={15}/>{teamLoading ? 'Reviewing team skills…' : 'Review the team skill gap'}</button> : <div className="team-gap-result"><div className="team-gap-copy"><Tag tone="lime">TEAM VIEW</Tag><strong>{teamGap.coveragePercentage}% coverage</strong><span>{teamGap.teamSize} team members</span></div><div className="missing-skills">{teamGap.missingSkills?.length ? teamGap.missingSkills.map(skill => <Tag key={skill} tone="orange">Still needed · {skill}</Tag>) : <Tag tone="lime">All required skills are covered</Tag>}</div></div>}</div>}
    </section>}
  </div>;
}
