import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api.js';

const emptyForm = {
  full_name: '',
  id_card_number: '',
  phone: '',
  email: '',
  address: '',
  is_active: true,
};

export default function App() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState(() => localStorage.getItem('abc_api_token') || '');
  const [profiles, setProfiles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (token) {
      loadProfiles();
    }
  }, []);

  async function run(action, successMessage) {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const result = await action();
      setNotice(successMessage);
      return result;
    } catch (err) {
      const validation = err.data?.errors
        ? Object.values(err.data.errors).flat().join(' ')
        : '';
      setError(`${err.status || 'Error'}: ${validation || err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();

    const data = await run(
      () => apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
      'Login successful.',
    );

    if (data?.token) {
      localStorage.setItem('abc_api_token', data.token);
      setToken(data.token);
      await loadProfiles(data.token);
    }
  }

  async function logout() {
    await run(
      () => apiRequest('/auth/logout', {
        method: 'POST',
        token,
      }),
      'Logout successful.',
    );

    localStorage.removeItem('abc_api_token');
    setToken('');
    setProfiles([]);
    setMeta(null);
  }

  async function loadProfiles(nextToken = token, page = 1) {
    const data = await run(
      () => apiRequest('/users', {
        token: nextToken,
        query: { page, search, active },
      }),
      'Profiles loaded.',
    );

    if (data) {
      const payload = data.data;
      const records = Array.isArray(payload) ? payload : payload?.data || [];
      const pagination = data.meta || (Array.isArray(payload) ? null : {
        total: payload?.total,
        current_page: payload?.current_page,
        last_page: payload?.last_page,
      });

      setProfiles(records);
      setMeta(pagination);
    }
  }

  async function createProfile(event) {
    event.preventDefault();

    const created = await run(
      () => apiRequest('/users', {
        method: 'POST',
        token,
        body: form,
      }),
      'Profile created.',
    );

    if (created) {
      setForm(emptyForm);
      await loadProfiles();
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">React REST Client</p>
          <h1>ABC Company Profile API</h1>
        </div>
        {isAuthenticated ? (
          <button onClick={logout} disabled={loading}>Logout</button>
        ) : null}
      </header>

      <section className="panel">
        <h2>Login</h2>
        <form className="grid-form" onSubmit={login}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button disabled={loading}>Login</button>
        </form>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>User profiles</h2>
          <button onClick={() => loadProfiles()} disabled={!isAuthenticated || loading}>
            Load profiles
          </button>
        </div>

        <div className="filters">
          <input
            placeholder="Search name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={active} onChange={(event) => setActive(event.target.value)}>
            <option value="">All statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
          <button onClick={() => loadProfiles()} disabled={!isAuthenticated || loading}>
            Apply
          </button>
        </div>

        {meta ? <p className="small">Total records: {meta.total}</p> : null}

        <div className="profile-list">
          {profiles.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <strong>{profile.full_name}</strong>
              <span>{profile.phone}</span>
              <span>{profile.email || 'No email'}</span>
              <span>{profile.is_active ? 'Active' : 'Inactive'}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Create profile</h2>
        <form className="grid-form" onSubmit={createProfile}>
          <label>
            Full name
            <input value={form.full_name} onChange={(event) => updateForm('full_name', event.target.value)} />
          </label>
          <label>
            ID card number
            <input value={form.id_card_number} onChange={(event) => updateForm('id_card_number', event.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => updateForm('email', event.target.value)} />
          </label>
          <label className="wide">
            Address
            <textarea value={form.address} onChange={(event) => updateForm('address', event.target.value)} />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => updateForm('is_active', event.target.checked)}
            />
            Active
          </label>
          <button disabled={!isAuthenticated || loading}>Create</button>
        </form>
      </section>

      {loading ? <p className="status">Loading...</p> : null}
      {notice ? <p className="status success">{notice}</p> : null}
      {error ? <p className="status error">{error}</p> : null}
    </main>
  );
}
