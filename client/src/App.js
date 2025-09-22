import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create();
api.defaults.baseURL = '/api';

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(url, isLogin ? { email, password } : { name, email, password });
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.user);
    } catch (err) {
      setErr(err?.response?.data?.error || 'Auth failed');
    }
  }

  return (
    <div className="container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        {!isLogin && <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />}
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn" type="submit">{isLogin ? 'Login' : 'Register'}</button>
          <button type="button" className="btn secondary" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>
        <div style={{ color: 'red', marginTop: 8 }}>{err}</div>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout, onOpenProject, onToggleTheme }) {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const token = localStorage.getItem('token');
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/projects', { headers: { Authorization: `Bearer ${token}` } });
        setProjects(res.data);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function createProject(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await api.post('/projects', { name, description: desc }, { headers: { Authorization: `Bearer ${token}` } });
    setProjects([res.data, ...projects]);
    setName(''); setDesc('');
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Hi {user?.name || user?.email} — Projects</div>
          <div className="small">Create projects and prompts, then chat with the agent</div>
        </div>

        <div className="controls">
          <button className="theme-toggle" onClick={onToggleTheme}>Toggle Theme</button>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <form onSubmit={createProject} style={{ marginTop: 16 }}>
        <input className="input" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <button className="btn" type="submit">Create Project</button>
      </form>

      <div className="list">
        {projects.map(p => (
          <div key={p._id} className="card">
            <strong>{p.name}</strong>
            <div style={{ marginTop: 6 }}>{p.description}</div>
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => onOpenProject(p)}>Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectPage({ project, onBack }) {
  const [prompts, setPrompts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/projects/${project._id}/prompts`, { headers: { Authorization: `Bearer ${token}` } });
        setPrompts(res.data);
      } catch (e) { }
    })();
  }, [project._id]);

  async function addPrompt(e) {
    e.preventDefault();
    const res = await api.post(`/projects/${project._id}/prompts`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
    setPrompts([res.data, ...prompts]);
    setTitle(''); setContent('');
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!message) return;
    setChat(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');
    try {
      const res = await api.post(`/chat/${project._id}`, { message }, { headers: { Authorization: `Bearer ${token}` } });
      setChat(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      // auto scroll
      setTimeout(() => {
        const el = document.getElementById('chatbox');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: 'Error: failed to get reply' }]);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h3>Project: {project.name}</h3>
        <div>
          <button className="btn" onClick={onBack}>Back</button>
        </div>
      </div>

      <h4>Prompts / Context</h4>
      <form onSubmit={addPrompt}>
        <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="input" placeholder="Prompt content" value={content} onChange={e => setContent(e.target.value)} />
        <button className="btn" type="submit">Add Prompt</button>
      </form>

      <div className="list">
        {prompts.map(pp => (
          <div key={pp._id} className="card">
            <div className="prompt-row">
              <div className="prompt-title">{pp.title}</div>
              <div className="prompt-content">{pp.content}</div>
            </div>
          </div>
        ))}
      </div>



      <h4>Chat</h4>
      <div className="chatBox" id="chatbox">
        {chat.map((m, i) => (
          <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
            <div>
              <div className="label">
                {m.role.charAt(0).toUpperCase() + m.role.slice(1)}:
              </div>
              <div className="bubble">{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 8 }}>
        <input className="input" placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} />
        <button className="btn" type="submit">Send</button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('auth'); // 'auth' | 'dashboard' | 'project'
  const [currentProject, setCurrentProject] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setPage('dashboard');
    }
    // load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  function applyTheme(t) {
    if (typeof document === 'undefined') return;
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }

  function handleAuth(userObj) {
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setPage('dashboard');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('auth');
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  if (!user && page === 'auth') {
    return <Auth onAuth={handleAuth} />;
  }
  if (page === 'dashboard') {
    return <Dashboard user={user} onLogout={logout} onOpenProject={(p) => { setCurrentProject(p); setPage('project'); }} onToggleTheme={toggleTheme} />;
  }
  if (page === 'project') {
    return <ProjectPage project={currentProject} onBack={() => setPage('dashboard')} />;
  }
  return null;
}
