import { FormEvent, useState } from 'react';
import { ExternalLink, Link2, Save, Server, ShieldCheck } from 'lucide-react';
import { api, getApiBaseUrl, saveApiBaseUrl } from '../lib/api';
import { Project } from '../lib/types';
import { Field, Notice, PageHeading, Tag } from '../components/ui';

export function SettingsPage() {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const normalized = url.trim().replace(/\/+$/, '');
      saveApiBaseUrl(normalized);
      const projects = await api<Project[]>('/projects');
      setMessage(`Connected successfully. The API returned ${projects.length} project${projects.length === 1 ? '' : 's'}.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The API connection could not be verified.'); }
    finally { setBusy(false); }
  }
  return <div className="page-content">
    <PageHeading eyebrow="YOUR CONNECTION" title="Settings" description="Point Student OS to the backend API that powers this workspace." />
    {error && <Notice message={error} onDismiss={() => setError('')}/>} {message && <Notice message={message} kind="success" onDismiss={() => setMessage('')}/>} 
    <div className="settings-layout"><section className="panel settings-main"><div className="panel-top"><div><span className="eyebrow">API CONNECTION</span><h2>Backend URL</h2></div><span className="settings-icon"><Server size={18}/></span></div><p className="settings-intro">The frontend and Spring Boot API are hosted separately. Set this to the public base URL of your deployed backend.</p><form className="form-stack" onSubmit={save}><Field label="Spring Boot API base URL" hint="Example: https://student-os-api.onrender.com — do not add a trailing slash or endpoint path."><input type="url" required value={url} onChange={event => setUrl(event.target.value)} placeholder="https://your-api.example.com" /></Field><button className="button button-primary" disabled={busy}>{busy ? 'Checking connection…' : 'Save and test connection'}<Save size={15}/></button></form><div className="settings-divider"/><div className="connection-note"><span className="connection-note-icon"><ShieldCheck size={17}/></span><div><strong>Connection test uses your signed-in session</strong><p>We check a protected projects endpoint, so a successful response confirms that the URL and bearer token can reach your backend.</p></div></div></section>
      <aside className="settings-side"><div className="panel"><span className="eyebrow">DEPLOYMENT SHAPE</span><h3>Frontend here.<br/><em>API elsewhere.</em></h3><p>Vercel can serve this static React app. Your Spring Boot API and PostgreSQL database need their own Java/container host.</p><div className="deployment-flow"><span>Vercel frontend</span><Link2 size={16}/><span>Java API + database</span></div></div><div className="panel settings-hint"><Tag tone="lime">READY WHEN YOU ARE</Tag><p>Once the API is public and CORS allows your frontend domain, update the backend URL here and sign in.</p><a href="https://vercel.com/docs" target="_blank" rel="noreferrer" className="text-link">Vercel deployment guide<ExternalLink size={14}/></a></div></aside></div>
  </div>;
}
