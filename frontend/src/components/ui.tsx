import { AlertCircle, ArrowRight, Check, LoaderCircle, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function Notice({ message, kind = 'error', onDismiss }: { message: string; kind?: 'error' | 'success' | 'info'; onDismiss?: () => void }) {
  return <div className={`notice notice-${kind}`} role="status"><span className="notice-icon">{kind === 'success' ? <Check size={16} /> : kind === 'info' ? <Sparkles size={16} /> : <AlertCircle size={16} />}</span><span>{message}</span>{onDismiss && <button className="notice-dismiss" onClick={onDismiss} aria-label="Dismiss">×</button>}</div>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-mark"><Sparkles size={18} /></div><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

export function Tag({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'lime' | 'orange' | 'muted' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>;
}

export function SectionLabel({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return <div className="section-label"><span>{children}</span>{aside}</div>;
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return <a className="text-link" href={to}>{children}<ArrowRight size={15} /></a>;
}
