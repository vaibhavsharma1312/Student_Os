import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Plus, Search, Trash2, X } from 'lucide-react';
import { api, apiForm } from '../lib/api';
import { Opportunity, Profile, Resource } from '../lib/types';
import { EmptyState, Field, Notice, PageHeading, Spinner, Tag } from '../components/ui';

type Entry = Opportunity | Resource;
function LibraryPage({ kind, profile }: { kind: 'opportunity' | 'resource'; profile: Profile | null }) {
  const isOpportunity = kind === 'opportunity';
  const title = isOpportunity ? 'Opportunities' : 'Resources';
  const endpoint = isOpportunity ? '/opportunities' : '/resources';
  const [items, setItems] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Entry | null>(null);
  const [requiredSkill, setRequiredSkill] = useState('');
  const [form, setForm] = useState({ title: '', type: isOpportunity ? 'Internship' : 'Guide', description: '', link: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function refresh() {
    setBusy(true); setError('');
    try { setItems(await api<Entry[]>(endpoint)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : `Could not load ${title.toLowerCase()}.`); }
    finally { setBusy(false); }
  }
  useEffect(() => { void refresh(); }, [endpoint]);
  const visible = useMemo(() => items.filter(item => `${item.title} ${item.type} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try { await apiForm<Entry>(endpoint, form); setForm({ title: '', type: isOpportunity ? 'Internship' : 'Guide', description: '', link: '' }); setShowForm(false); setNotice(`${isOpportunity ? 'Opportunity' : 'Resource'} shared successfully.`); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Your item could not be shared.'); }
    finally { setSaving(false); }
  }
  async function remove(item: Entry) {
    if (!window.confirm(`Remove “${item.title}”?`)) return;
    try { await api(`${endpoint}/${item.id}`, { method: 'DELETE' }); setItems(current => current.filter(entry => entry.id !== item.id)); setNotice('Item removed.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'This item could not be removed.'); }
  }
  async function addRequiredSkill(event: FormEvent) {
    event.preventDefault();
    if (!isOpportunity || !selected || !requiredSkill.trim()) return;
    try {
      const updated = await api<Opportunity>(`/opportunities/${selected.id}/skills?skillName=${encodeURIComponent(requiredSkill.trim())}`, { method: 'POST' });
      setSelected(updated); setItems(current => current.map(item => item.id === updated.id ? updated : item)); setRequiredSkill('');
      setNotice('Required skill added.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The skill could not be added.'); }
  }
  return <div className="page-content">
    <PageHeading eyebrow={isOpportunity ? 'MAKE YOUR NEXT MOVE' : 'SHARED BY YOUR COMMUNITY'} title={title} description={isOpportunity ? 'Find internships and openings that fit what you bring.' : 'Useful links, learning paths, and tools from students like you.'} action={<button className="button button-primary" onClick={() => setShowForm(value => !value)}><Plus size={17}/>{isOpportunity ? 'Post opportunity' : 'Share resource'}</button>} />
    {error && <Notice message={error} onDismiss={() => setError('')}/>} {notice && <Notice message={notice} kind="success" onDismiss={() => setNotice('')}/>} 
    {showForm && <section className="panel create-panel"><div className="panel-top"><div><span className="eyebrow">CONTRIBUTE TO THE COMMUNITY</span><h2>{isOpportunity ? 'Post an opportunity' : 'Share a resource'}</h2></div><button className="icon-button" aria-label="Close form" onClick={() => setShowForm(false)}><X size={18}/></button></div><form className="create-form" onSubmit={create}><Field label="Title"><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={isOpportunity ? 'e.g. Frontend intern' : 'e.g. React learning path'}/></Field><Field label={isOpportunity ? 'Opportunity type' : 'Resource type'}><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{(isOpportunity ? ['Internship', 'Job', 'Hackathon', 'Scholarship', 'Other'] : ['Guide', 'Course', 'Tool', 'Article', 'Other']).map(type => <option key={type}>{type}</option>)}</select></Field><Field label="Description"><textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Give students enough context to decide if this is useful."/></Field><Field label="Link (optional)"><input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://"/></Field><button className="button button-primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish'}<ArrowRight size={16}/></button></form></section>}
    <div className="toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`}/></div><div className="toolbar-note">{visible.length} shared</div></div>
    {busy ? <Spinner label={`Loading ${title.toLowerCase()}…`}/> : visible.length ? <div className="library-grid">{visible.map((item, index) => {
      const owner = isOpportunity ? (item as Opportunity).postedBy : (item as Resource).postedBy;
      const owns = !!owner?.email && owner.email === profile?.user?.email;
      return <article className={`library-card library-card-${index % 3}`} key={item.id}><div className="library-card-head"><Tag tone={index % 3 === 1 ? 'lime' : index % 3 === 2 ? 'orange' : 'blue'}>{item.type}</Tag>{owns && <button className="icon-button" aria-label={`Delete ${item.title}`} title="Delete" onClick={() => void remove(item)}><Trash2 size={15}/></button>}</div><button className="library-title-button" onClick={() => setSelected(item)}>{item.title}</button><p>{item.description || 'Shared by a student in your community.'}</p><div className="library-card-foot"><span className="owner-mini"><span className="avatar avatar-tiny">{owner?.name?.charAt(0) || 'S'}</span>{owner?.name || 'Student community'}</span><div className="library-card-actions"><button className="text-link" onClick={() => setSelected(item)}>Details <ArrowRight size={13}/></button>{item.link ? <a className="circle-link" href={item.link} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}><ExternalLink size={15}/></a> : <span className="circle-link circle-link-muted"><ArrowRight size={15}/></span>}</div></div></article>;
    })}</div> : <EmptyState title={search ? 'Nothing matches that search' : `Be the first to share a ${isOpportunity ? 'lead' : 'resource'}`} detail={search ? 'Try a different keyword.' : 'A useful link today could help someone find their next step.'} action={!search && <button className="button button-primary button-small" onClick={() => setShowForm(true)}><Plus size={15}/> {isOpportunity ? 'Post opportunity' : 'Share resource'}</button>}/>}
    {selected && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="entry-title"><div className="detail-modal-head"><Tag>{selected.type}</Tag><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={18}/></button></div><h2 id="entry-title">{selected.title}</h2><div className="detail-owner">Shared by {('postedBy' in selected && selected.postedBy?.name) || 'a student in your community'}</div><p className="detail-longtext">{selected.description || 'No description was provided.'}</p>{isOpportunity && (selected as Opportunity).requiredSkills?.length ? <div className="detail-skills"><span className="eyebrow">SKILLS THEY NEED</span><div className="skill-row">{(selected as Opportunity).requiredSkills?.map(skill => <Tag key={skill.id}>{skill.name}</Tag>)}</div></div> : null}{isOpportunity && 'postedBy' in selected && selected.postedBy?.email === profile?.user?.email && <form className="detail-skill-edit" onSubmit={addRequiredSkill}><input value={requiredSkill} onChange={event => setRequiredSkill(event.target.value)} placeholder="Add a required skill" aria-label="Required skill"/><button className="button button-primary button-small"><Plus size={14}/> Add</button></form>}{selected.link && <a className="button button-outline detail-link" href={selected.link} target="_blank" rel="noreferrer">Open {isOpportunity ? 'opportunity' : 'resource'} link <ExternalLink size={15}/></a>}</section></div>}
  </div>;
}

export function OpportunitiesPage({ profile }: { profile: Profile | null }) { return <LibraryPage kind="opportunity" profile={profile}/>; }
export function ResourcesPage({ profile }: { profile: Profile | null }) { return <LibraryPage kind="resource" profile={profile}/>; }
