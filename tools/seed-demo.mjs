#!/usr/bin/env node
// StudentOS demo data seeder. Creates demo students, 7 projects, opportunities,
// resources and sample join requests through the real API.
//
// Usage:
//   node tools/seed-demo.mjs https://YOUR-BACKEND-URL
//   node tools/seed-demo.mjs https://YOUR-BACKEND-URL you@email.com YourPassword
// (the 2nd form also creates a project for YOUR account with pending join requests to accept live)

const [, , apiArg, presenterEmail, presenterPassword] = process.argv;
if (!apiArg) { console.log('Usage: node tools/seed-demo.mjs <BACKEND_URL> [your_email] [your_password]'); process.exit(1); }
const BASE = apiArg.replace(/\/+$/, '');
const PASS = 'Demo@1234';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const q = o => '?' + new URLSearchParams(o);

async function call(path, { method = 'GET', token, json } = {}) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const headers = { Accept: 'application/json' };
      if (json) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = 'Bearer ' + token;
      const res = await fetch(BASE + path, { method, headers, body: json ? JSON.stringify(json) : undefined, signal: AbortSignal.timeout(90000) });
      const text = await res.text(); let data = text;
      try { data = text ? JSON.parse(text) : undefined; } catch { /* plain text */ }
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      if (attempt === 4) throw e;
      console.log('   server is slow or waking up, retrying...'); await sleep(5000);
    }
  }
}
const msg = r => (r.data && (r.data.message || r.data.error)) || (typeof r.data === 'string' ? r.data : '') || String(r.status);

const USERS = [
  { key: 'aarav', name: 'Aarav Sharma', email: 'aarav@studentos.demo', branch: 'Computer Science', bio: 'Frontend developer who loves clean interfaces.', skills: ['React', 'JavaScript', 'UI Design', 'HTML/CSS'] },
  { key: 'ananya', name: 'Ananya Verma', email: 'ananya@studentos.demo', branch: 'Data Science', bio: 'Machine learning enthusiast building useful tools.', skills: ['Python', 'Machine Learning', 'Data Analysis'] },
  { key: 'rohan', name: 'Rohan Mehta', email: 'rohan@studentos.demo', branch: 'Information Technology', bio: 'Backend developer focused on Java and databases.', skills: ['Java', 'Spring Boot', 'SQL', 'PostgreSQL'] },
  { key: 'priya', name: 'Priya Singh', email: 'priya@studentos.demo', branch: 'Computer Science', bio: 'Mobile app developer and design lover.', skills: ['Flutter', 'Firebase', 'UI Design'] },
  { key: 'kabir', name: 'Kabir Khan', email: 'kabir@studentos.demo', branch: 'Computer Science', bio: 'Full-stack JavaScript developer.', skills: ['Node.js', 'MongoDB', 'JavaScript'] },
  { key: 'sneha', name: 'Sneha Gupta', email: 'sneha@studentos.demo', branch: 'Data Science', bio: 'Turns raw data into clear dashboards.', skills: ['Python', 'SQL', 'Power BI', 'Data Analysis'] },
  { key: 'dev', name: 'Dev Patel', email: 'dev@studentos.demo', branch: 'Electronics', bio: 'Embedded systems and IoT tinkerer.', skills: ['C++', 'IoT', 'Python'] },
];
const PROJECTS = [
  { owner: 'aarav', title: 'Campus Events App', description: 'One app to discover, RSVP and get reminders for every event happening on campus.', skills: ['React', 'JavaScript', 'Node.js', 'UI Design'] },
  { owner: 'ananya', title: 'AI Study Planner', description: 'Builds a personal study schedule from your syllabus, exam dates and weak topics.', skills: ['Python', 'Machine Learning', 'Data Analysis', 'React'] },
  { owner: 'rohan', title: 'Hackathon Team Finder', description: 'Helps students form balanced hackathon teams based on complementary skills.', skills: ['Java', 'Spring Boot', 'SQL', 'React'] },
  { owner: 'priya', title: 'Campus Food Order App', description: 'Skip the canteen queue: pre-order meals and pick them up when they are ready.', skills: ['Flutter', 'Firebase', 'UI Design'] },
  { owner: 'kabir', title: 'Alumni Connect Portal', description: 'A mentoring portal that links current students with alumni in their field.', skills: ['Node.js', 'MongoDB', 'React', 'SQL'] },
  { owner: 'sneha', title: 'Placement Tracker Dashboard', description: 'Tracks applications, interview rounds and offers with live analytics.', skills: ['Python', 'SQL', 'Data Analysis', 'Power BI'] },
  { owner: 'dev', title: 'Smart Attendance System', description: 'Automatic classroom attendance using sensors and a simple web dashboard.', skills: ['Python', 'IoT', 'C++', 'SQL'] },
];
const OPPORTUNITIES = [
  { by: 'aarav', title: 'Summer Internship: Web Developer', type: 'Internship', description: 'Eight-week remote internship building React interfaces for a startup.', link: 'https://example.com/internship', skills: ['React', 'JavaScript'] },
  { by: 'rohan', title: 'Smart Campus Hackathon', type: 'Hackathon', description: '36-hour inter-college hackathon with prizes and mentoring.', link: 'https://example.com/hackathon', skills: ['Java', 'Spring Boot'] },
  { by: 'ananya', title: 'Open Source Data Science Program', type: 'Program', description: 'Contribute to open source ML projects with guidance from maintainers.', link: 'https://example.com/open-source', skills: ['Python', 'Machine Learning'] },
];
const RESOURCES = [
  { by: 'rohan', title: 'Spring Boot Reference Guide', type: 'Documentation', description: 'Official Spring Boot documentation.', link: 'https://docs.spring.io/spring-boot/' },
  { by: 'aarav', title: 'React Documentation', type: 'Documentation', description: 'Learn React with the official guide.', link: 'https://react.dev' },
  { by: 'sneha', title: 'PostgreSQL Documentation', type: 'Documentation', description: 'Complete PostgreSQL manual.', link: 'https://www.postgresql.org/docs/' },
  { by: 'kabir', title: 'MDN Web Docs', type: 'Documentation', description: 'Reference for HTML, CSS and JavaScript.', link: 'https://developer.mozilla.org' },
];
const REQUESTS = [
  ['rohan', 'Campus Events App', 'ACCEPTED'], ['kabir', 'Campus Events App', 'ACCEPTED'], ['ananya', 'Campus Events App', null],
  ['priya', 'Hackathon Team Finder', null], ['dev', 'AI Study Planner', 'ACCEPTED'], ['sneha', 'AI Study Planner', null], ['aarav', 'Alumni Connect Portal', 'ACCEPTED'],
];

async function login(email, password) {
  const r = await call('/auth/login', { method: 'POST', json: { email, password } });
  return r.ok ? r.data.token : null;
}

(async () => {
  console.log('Connecting to', BASE, '(a sleeping free server can take up to a minute)...');
  await call('/'); console.log('Server is awake.\n');
  const tokens = {};

  for (const u of USERS) {
    const reg = await call('/auth/register', { method: 'POST', json: { name: u.name, email: u.email, password: PASS } });
    if (!reg.ok && !/already/i.test(msg(reg))) throw new Error(`Register ${u.email}: ${msg(reg)}`);
    const token = await login(u.email, PASS);
    if (!token) throw new Error(`Login failed for ${u.email}. If it already exists with another password, delete it or change the email.`);
    tokens[u.key] = token;
    await call('/profile', { method: 'POST', token });
    await call('/profile' + q({ bio: u.bio, college: 'Demo Institute of Technology', branch: u.branch }), { method: 'PUT', token });
    for (const s of u.skills) await call('/skills' + q({ name: s }), { method: 'POST', token });
    console.log('User ready:', u.name);
  }

  const listed = await call('/projects', { token: tokens.aarav });
  const projectIds = {};
  for (const p of listed.ok ? listed.data : []) projectIds[p.title] = p.id;
  for (const p of PROJECTS) {
    if (projectIds[p.title]) { console.log('Project exists:', p.title); continue; }
    const r = await call('/projects' + q({ title: p.title, description: p.description }), { method: 'POST', token: tokens[p.owner] });
    if (!r.ok) { console.log('  could not create', p.title, '-', msg(r)); continue; }
    projectIds[p.title] = r.data.id;
    for (const s of p.skills) await call(`/projects/${r.data.id}/skills` + q({ skillName: s }), { method: 'POST', token: tokens[p.owner] });
    console.log('Project created:', p.title);
  }

  const opps = await call('/opportunities', { token: tokens.aarav }); const haveOpp = new Set((opps.ok ? opps.data : []).map(o => o.title));
  for (const o of OPPORTUNITIES) {
    if (haveOpp.has(o.title)) continue;
    const r = await call('/opportunities' + q({ title: o.title, type: o.type, description: o.description, link: o.link }), { method: 'POST', token: tokens[o.by] });
    if (r.ok) for (const s of o.skills) await call(`/opportunities/${r.data.id}/skills` + q({ skillName: s }), { method: 'POST', token: tokens[o.by] });
    console.log(r.ok ? 'Opportunity created:' : '  opportunity failed:', o.title);
  }
  const res = await call('/resources', { token: tokens.aarav }); const haveRes = new Set((res.ok ? res.data : []).map(o => o.title));
  for (const o of RESOURCES) {
    if (haveRes.has(o.title)) continue;
    const r = await call('/resources' + q({ title: o.title, type: o.type, description: o.description, link: o.link }), { method: 'POST', token: tokens[o.by] });
    console.log(r.ok ? 'Resource created:' : '  resource failed:', o.title);
  }

  for (const [who, title, status] of REQUESTS) {
    const pid = projectIds[title]; if (!pid) continue;
    const r = await call(`/join-requests/${pid}`, { method: 'POST', token: tokens[who] });
    if (!r.ok) { console.log(`  request ${who} -> ${title}: ${msg(r)}`); continue; }
    const owner = PROJECTS.find(p => p.title === title).owner;
    if (status) await call(`/join-requests/${r.data.id}` + q({ status }), { method: 'PUT', token: tokens[owner] });
    console.log(`Join request: ${who} -> ${title} (${status || 'PENDING'})`);
  }

  if (presenterEmail) {
    console.log('\nSetting up your own account:', presenterEmail);
    const token = await login(presenterEmail, presenterPassword || '');
    if (!token) console.log('  could not log in with those details, skipping your account.');
    else {
      const title = 'StudentOS Platform';
      let id = projectIds[title];
      if (!id) {
        const r = await call('/projects' + q({ title, description: 'Skill-based platform that matches students with projects, teammates and opportunities.' }), { method: 'POST', token });
        if (r.ok) { id = r.data.id; for (const s of ['React', 'Spring Boot', 'PostgreSQL', 'UI Design']) await call(`/projects/${id}/skills` + q({ skillName: s }), { method: 'POST', token }); }
      }
      if (id) for (const who of ['aarav', 'rohan', 'ananya', 'priya']) {
        const r = await call(`/join-requests/${id}`, { method: 'POST', token: tokens[who] });
        console.log(r.ok ? `Pending request from ${who} to "${title}"` : `  ${who}: ${msg(r)}`);
      }
    }
  }

  console.log('\nDone. Demo logins (password for all: ' + PASS + '):');
  for (const u of USERS) console.log('  ', u.email.padEnd(26), u.name);
})().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });
