import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { ArrowRight, Github, Linkedin, Plus, Save, Sparkles, X } from 'lucide-react';
import { api, apiForm, isNotFoundError } from '../lib/api';
import { Profile } from '../lib/types';
import { Field, Notice, PageHeading, Spinner } from '../components/ui';

export function ProfilePage({ profile, profileMissing, onProfile }: { profile: Profile | null; profileMissing: boolean; onProfile: (profile: Profile) => void }) {
  const [form, setForm] = useState({ bio: '', college: '', branch: '', githubUrl: '', linkedinUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileMissingLocal, setProfileMissingLocal] = useState(profileMissing);
  useEffect(() => {
    if (profile) {
      setForm({ bio: profile.bio || '', college: profile.college || '', branch: profile.branch || '', githubUrl: profile.githubUrl || '', linkedinUrl: profile.linkedinUrl || '' });
      setProfileMissingLocal(false); setError(''); setLoading(false); return;
    }
    if (profileMissing) { setProfileMissingLocal(true); setError(''); setLoading(false); return; }
    let live = true;
    api<Profile>('/profile').then(result => { if (live) { onProfile(result); setForm({ bio: result.bio || '', college: result.college || '', branch: result.branch || '', githubUrl: result.githubUrl || '', linkedinUrl: result.linkedinUrl || '' }); } })
      .catch(reason => { if (!live) return; if (isNotFoundError(reason)) setProfileMissingLocal(true); else setError(reason instanceof Error ? reason.message : 'Could not load your profile. Check the backend connection and retry.'); })
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [profile?.id, profileMissing]);
  async function retryProfileLoad() {
    setLoading(true); setError('');
    try {
      const result = await api<Profile>('/profile');
      setProfileMissingLocal(false);
      setForm({ bio: result.bio || '', college: result.college || '', branch: result.branch || '', githubUrl: result.githubUrl || '', linkedinUrl: result.linkedinUrl || '' });
      onProfile(result);
    } catch (reason) {
      if (isNotFoundError(reason)) setProfileMissingLocal(true);
      else setError(reason instanceof Error ? reason.message : 'Could not load your profile. Check the backend connection and retry.');
    } finally { setLoading(false); }
  }
  const skills = profile?.user?.skills || [];
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      if (!profile && !profileMissingLocal) throw new Error('Your profile could not be confirmed. Reload before saving so an existing profile is not duplicated.');
      if (!profile) await api<Profile>('/profile', { method: 'POST' });
      const updated = await apiForm<Profile>('/profile', form, 'PUT');
      onProfile(updated); setNotice('Your profile is up to date.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your profile could not be saved.'); }
    finally { setSaving(false); }
  }
  async function addSkill(event?: FormEvent | KeyboardEvent) {
    event?.preventDefault(); const name = skillName.trim(); if (!name) return;
    setError('');
    try { await apiForm('/skills', { name }); const updated = await api<Profile>('/profile'); onProfile(updated); setSkillName(''); setNotice(`${name} added to your skills.`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'That skill could not be added.'); }
  }
  async function removeSkill(name: string) {
    try { await apiForm('/skills', { name }, 'DELETE'); const updated = await api<Profile>('/profile'); onProfile(updated); setNotice(`${name} removed from your skills.`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'That skill could not be removed.'); }
  }
  if (loading) return <Spinner label="Loading your profile…" />;
  if (!profile && !profileMissingLocal && error) return <div className="page-content"><PageHeading eyebrow="MAKE IT YOURS" title="Your profile" description="Help the right teammates and opportunities find you."/><Notice message={`Your profile could not be loaded: ${error}`} /><button className="button button-primary" onClick={() => void retryProfileLoad()}>Retry profile connection<ArrowRight size={15}/></button></div>;
  if (!profile && !profileMissingLocal && error) return <div className="page-content"><PageHeading eyebrow="MAKE IT YOURS" title="Your profile" description="Help the right teammates and opportunities find you."/><Notice message={`Your profile could not be loaded: ${error}`} /><button className="button button-primary" onClick={() => void retryProfileLoad()}>Retry profile connection<ArrowRight size={15}/></button></div>;
  const first = profile?.user?.name?.charAt(0) || 'S';
  return <div className="page-content">
    <PageHeading eyebrow="MAKE IT YOURS" title="Your profile" description="Help the right teammates and opportunities find you." />
    {error && <Notice message={error} onDismiss={() => setError('')}/>} {notice && <Notice message={notice} kind="success" onDismiss={() => setNotice('')}/>} 
    <div className="profile-layout"><aside className="profile-summary panel"><div className="profile-avatar">{first}</div><span className="eyebrow">STUDENT PROFILE</span><h2>{profile?.user?.name || 'Your name'}</h2><p>{profile?.user?.email || 'Add details to start building your profile.'}</p><div className="profile-summary-divider"/><div className="profile-fact"><span>COLLEGE</span><strong>{profile?.college || 'Not added yet'}</strong></div><div className="profile-fact"><span>FIELD OF STUDY</span><strong>{profile?.branch || 'Not added yet'}</strong></div><div className="profile-fact"><span>SKILLS</span><strong>{skills.length} added</strong></div><div className="profile-social">{profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer"><Github size={16}/> GitHub <ArrowRight size={13}/></a>}{profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={16}/> LinkedIn <ArrowRight size={13}/></a>}</div></aside>
      <section className="profile-main"><form className="panel profile-form" onSubmit={save}><div className="panel-top"><div><span className="eyebrow">THE BASICS</span><h2>Tell your story</h2></div><span className="profile-form-mark"><Sparkles size={17}/></span></div><Field label="Short bio"><textarea rows={4} required value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="What are you curious about? What do you want to make?"/></Field><div className="form-row"><Field label="College"><input required value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="Your college or university"/></Field><Field label="Field of study"><input required value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Computer science"/></Field></div><div className="form-row"><Field label="GitHub profile"><input type="url" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/you"/></Field><Field label="LinkedIn profile"><input type="url" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/you"/></Field></div><div className="form-footer"><span>Profile details make project matching more useful.</span><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}<Save size={15}/></button></div></form>
      <section className="panel skills-panel"><div className="panel-top"><div><span className="eyebrow">WHAT YOU BRING</span><h2>Your skills</h2></div><span className="panel-count">{skills.length}</span></div><p className="skills-intro">Add skills that you enjoy using. The API uses them to calculate project and opportunity matches.</p><form className="skill-entry" onSubmit={addSkill}><input value={skillName} onChange={e => setSkillName(e.target.value)} placeholder="Add a skill, e.g. UI design" aria-label="Add a skill"/><button className="button button-primary button-small" type="submit"><Plus size={15}/> Add skill</button></form><div className="profile-skill-list">{skills.length ? skills.map((skill, index) => <span className={`profile-skill skill-tone-${index % 4}`} key={skill.id}><span>{skill.name}</span><button onClick={() => void removeSkill(skill.name)} aria-label={`Remove ${skill.name}`}><X size={14}/></button></span>) : <div className="skills-empty">Your skills will show up here. Start with one you’re proud of.</div>}</div></section></section></div>
  </div>;
}
