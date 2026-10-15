import { useEffect, useState } from 'react';
import { ArrowUpRight, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthPage, DashboardPage } from './pages/AuthDashboard';
import { ProjectsPage } from './pages/Projects';
import { MatchesPage } from './pages/Matches';
import { OpportunitiesPage, ResourcesPage } from './pages/LibraryPages';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { api, clearToken, getToken, isNotFoundError } from './lib/api';
import { Profile } from './lib/types';
import { Notice } from './components/ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', emoji: '🏠' },
  { to: '/profile', label: 'Profile', emoji: '👤' },
  { to: '/resources', label: 'Resources', emoji: '📚' },
  { to: '/projects', label: 'Projects', emoji: '💻' },
  { to: '/opportunities', label: 'Opportunities', emoji: '🚀' },
  { to: '/matches', label: 'Matches', emoji: '✨' },
];

function AppShell({ profile, onSignOut }: { profile: Profile | null; onSignOut: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pageTitle = navItems.find(item => item.to === location.pathname)?.label || 'Settings';
  const initials = profile?.user?.name?.split(' ').map(part => part[0]).slice(0, 2).join('') || 'S';
  return <div className="app-frame">
    {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <Link to="/dashboard" className="brand"><span className="brand-emoji">🎓</span><span>Student<span className="brand-weight">OS</span></span></Link>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="main-nav">{navItems.map(({ to, label, emoji }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><span className="nav-emoji">{emoji}</span><span>{label}</span>{to === '/matches' && <span className="nav-dot"/>}</NavLink>)}</nav>
      <div className="sidebar-label sidebar-label-spaced">ACCOUNT</div>
      <nav className="main-nav"><NavLink to="/settings" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><span className="nav-emoji">⚙️</span><span>Settings</span></NavLink></nav>
      <div className="sidebar-bottom"><div className="sidebar-prompt"><span className="prompt-spark"><Sparkles size={15}/></span><strong>Ideas grow here.</strong><small>Find the people who help yours take shape.</small><Link to="/projects" onClick={() => setMenuOpen(false)}>Explore projects <ArrowUpRight size={13}/></Link></div><div className="user-chip"><span className="avatar">{initials}</span><span className="user-chip-copy"><strong>{profile?.user?.name || 'Student'}</strong><small>{profile?.user?.email || 'Campus member'}</small></span><button onClick={onSignOut} aria-label="Sign out" title="Sign out"><LogOut size={16}/></button></div><div className="sidebar-version">STUDENT OS <span>·</span> BUILD SOMETHING GOOD</div></div>
    </aside>
    <main className="main-area"><header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button><div className="breadcrumbs"><span>Student OS</span><span className="breadcrumb-slash">/</span><strong>{pageTitle}</strong></div><div className="topbar-right"><span className="system-status"><i/>Workspace active</span><span className="avatar topbar-avatar">{initials}</span></div></header><div className="content-wrap"><Outlet/></div><footer className="app-footer"><span>STUDENT OS</span><span>Find your people. Build what matters.</span><span>Made for the next generation of makers.</span></footer></main>
  </div>;
}

function ProtectedRoute({ token }: { token: string | null }) { return token ? <Outlet/> : <Navigate to="/login" replace/>; }

export default function App() {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileWarning, setProfileWarning] = useState('');
  const [profileMissing, setProfileMissing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const expire = () => { setToken(null); setProfile(null); setProfileMissing(false); setProfileWarning(''); navigate('/login'); };
    window.addEventListener('studentos:auth-expired', expire);
    return () => window.removeEventListener('studentos:auth-expired', expire);
  }, [navigate]);
  useEffect(() => {
    let live = true;
    if (!token) { setProfile(null); setProfileMissing(false); setProfileWarning(''); return; }
    setProfile(null); setProfileMissing(false); setProfileWarning('');
    api<Profile>('/profile').then(data => { if (live) { setProfile(data); setProfileMissing(false); setProfileWarning(''); } })
      .catch(reason => { if (live && isNotFoundError(reason)) { setProfileMissing(true); setProfileWarning('Your profile is not set up yet. Add your details to improve project matches.'); } else if (live) { setProfileWarning(`Could not load your profile: ${reason instanceof Error ? reason.message : 'Check the backend connection.'}`); } });
    return () => { live = false; };
  }, [token]);
  function signedIn() { setToken(getToken()); }
  function updateProfile(value: Profile) { setProfile(value); setProfileMissing(false); setProfileWarning(''); }
  function signOut() { clearToken(); setToken(null); setProfile(null); setProfileMissing(false); setProfileWarning(''); navigate('/login'); }
  return <>
    {profileWarning && token && <div className="global-toast"><Notice kind={profileMissing ? 'info' : 'error'} message={profileWarning} onDismiss={() => setProfileWarning('')}/></div>}
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace/> : <AuthPage mode="login" onSignedIn={signedIn}/>} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace/> : <AuthPage mode="register" onSignedIn={signedIn}/>} />
      <Route element={<ProtectedRoute token={token}/> }>
        <Route element={<AppShell profile={profile} onSignOut={signOut}/> }>
          <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<DashboardPage/>}/>
          <Route path="/projects" element={<ProjectsPage profile={profile}/>}/>
          <Route path="/matches" element={<MatchesPage profile={profile}/>}/>
          <Route path="/opportunities" element={<OpportunitiesPage profile={profile}/>}/>
          <Route path="/resources" element={<ResourcesPage profile={profile}/>}/>
          <Route path="/profile" element={<ProfilePage profile={profile} profileMissing={profileMissing} onProfile={updateProfile}/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Route>
      </Route>
    </Routes>
  </>;
}
