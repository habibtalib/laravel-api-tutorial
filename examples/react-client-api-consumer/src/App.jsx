import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

const emptyProfileForm = {
  full_name: '',
  id_card_number: '',
  phone: '',
  address: '',
  is_active: true,
};

function isActive(value) {
  return value === true || value === 1 || value === '1';
}

function profileToForm(profile) {
  return {
    full_name: profile?.full_name || '',
    id_card_number: profile?.id_card_number || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    is_active: isActive(profile?.is_active ?? true),
  };
}

function profilePayload(form) {
  return {
    full_name: form.full_name,
    id_card_number: form.id_card_number,
    phone: form.phone,
    address: form.address,
    is_active: form.is_active,
  };
}

function extractProfile(response) {
  return response?.data || null;
}

function normalizeListResponse(response) {
  const payload = response?.data;
  const records = Array.isArray(payload) ? payload : payload?.data || [];
  const pagination = response?.meta || (Array.isArray(payload) ? null : {
    total: payload?.total,
    current_page: payload?.current_page,
    last_page: payload?.last_page,
    per_page: payload?.per_page,
  });

  return { records, pagination };
}

function countProjects(profile) {
  const projects = profile?.projects;

  if (Array.isArray(projects)) {
    return projects.length;
  }

  if (Array.isArray(projects?.data)) {
    return projects.data.length;
  }

  return 0;
}

export default function App() {
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState(() => localStorage.getItem('abc_api_token') || '');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyProfileForm);
  const [formMode, setFormMode] = useState('create');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isAuthenticated = Boolean(token);
  const currentPage = meta?.current_page || page;
  const lastPage = meta?.last_page || currentPage;

  useEffect(() => {
    loadProfiles();
  }, []);

  async function run(action, successMessage, { preserveNotice = false } = {}) {
    setLoading(true);
    setError('');

    if (!preserveNotice) {
      setNotice('');
    }

    try {
      const result = await action();

      if (successMessage) {
        setNotice(successMessage);
      }

      return result ?? true;
    } catch (err) {
      const validation = err.data?.errors
        ? Object.values(err.data.errors).flat().join(' ')
        : '';
      setError(`${err.status || 'Error'}: ${validation || err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();

    const data = await run(
      () => apiRequest('/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password },
      }),
      'Login successful.',
    );

    if (data?.token) {
      localStorage.setItem('abc_api_token', data.token);
      setToken(data.token);
      await loadProfiles(data.token, 1);
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
    setSelectedProfile(null);
    setMeta(null);
    setPage(1);
    resetForm();
  }

  async function loadProfiles(
    nextToken = token,
    pageNumber = page,
    successMessage = 'Profiles loaded.',
    preserveNotice = false,
  ) {
    const data = await run(
      () => apiRequest('/users', {
        token: nextToken,
        query: { page: pageNumber, search },
      }),
      successMessage,
      { preserveNotice },
    );

    if (data) {
      const { records, pagination } = normalizeListResponse(data);
      setProfiles(records);
      setMeta(pagination);
      setPage(pagination?.current_page || pageNumber);
    }
  }

  async function loadProfile(profileId) {
    const data = await run(
      () => apiRequest(`/users/${profileId}`, { token }),
      'Profile detail loaded.',
    );
    const profile = extractProfile(data);

    if (profile) {
      setSelectedProfile(profile);
    }

    return profile;
  }

  async function showProfile(profile) {
    await loadProfile(profile.id);
  }

  async function editProfile(profile) {
    const detail = await loadProfile(profile.id);

    if (detail) {
      setForm(profileToForm(detail));
      setFormMode('edit');
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (formMode === 'edit') {
      await updateProfile();
      return;
    }

    await createProfile();
  }

  async function createProfile() {
    const data = await run(
      () => apiRequest('/users', {
        method: 'POST',
        token,
        body: profilePayload(form),
      }),
      'Profile created.',
    );
    const created = extractProfile(data);

    if (created) {
      setSelectedProfile(created);
      setForm(profileToForm(created));
      setFormMode('edit');
      await loadProfiles(token, 1, '', true);
    }
  }

  async function updateProfile() {
    if (!selectedProfile?.id) {
      setError('Select a profile before updating.');
      return;
    }

    const data = await run(
      () => apiRequest(`/users/${selectedProfile.id}`, {
        method: 'PUT',
        token,
        body: profilePayload(form),
      }),
      'Profile updated.',
    );
    const updated = extractProfile(data);

    if (updated) {
      setSelectedProfile(updated);
      setForm(profileToForm(updated));
      await loadProfiles(token, page, '', true);
    }
  }

  async function deleteProfile(profile) {
    const confirmed = window.confirm(`Delete ${profile.full_name}?`);

    if (!confirmed) {
      return;
    }

    const deleted = await run(
      () => apiRequest(`/users/${profile.id}`, {
        method: 'DELETE',
        token,
      }),
      'Profile deleted.',
    );

    if (deleted) {
      if (selectedProfile?.id === profile.id) {
        setSelectedProfile(null);
        resetForm();
      }

      await loadProfiles(token, page, '', true);
    }
  }

  function resetForm() {
    setForm(emptyProfileForm);
    setFormMode('create');
  }

  function startCreate() {
    setSelectedProfile(null);
    resetForm();
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
          <button type="button" onClick={logout} disabled={loading}>Logout</button>
        ) : null}
      </header>

      <section className="panel">
        <h2>Login for Day 3+</h2>
        <p className="small">
          Day 1 can load profiles and Day 2 can run full CRUD before login. After Day 3
          security is added, log in first if the API returns 401.
        </p>
        <form className="grid-form" onSubmit={login}>
          <label>
            Email
            <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={loading}>Login</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>User profiles</h2>
            <p className="small">List works from Day 1. View, create, update, and delete start from Day 2 and do not need login until Day 3 security is added.</p>
          </div>
          <button type="button" onClick={() => loadProfiles(token, 1)} disabled={loading}>
            Load profiles
          </button>
        </div>

        <div className="filters">
          <input
            placeholder="Search name, phone, or ID card"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" onClick={() => loadProfiles(token, 1)} disabled={loading}>
            Apply
          </button>
        </div>

        {meta ? (
          <div className="pagination">
            <span className="small">
              Page {currentPage} of {lastPage}. Total records: {meta.total || profiles.length}
            </span>
            <div className="button-row">
              <button
                type="button"
                className="secondary"
                onClick={() => loadProfiles(token, currentPage - 1)}
                disabled={loading || currentPage <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => loadProfiles(token, currentPage + 1)}
                disabled={loading || currentPage >= lastPage}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        <div className="profile-list">
          {profiles.length ? profiles.map((profile) => (
            <article
              className={`profile-card ${selectedProfile?.id === profile.id ? 'selected' : ''}`}
              key={profile.id}
            >
              <div>
                <strong>{profile.full_name}</strong>
                <span className="small">{profile.id_card_number}</span>
              </div>
              <span>{profile.phone}</span>
              <span>{profile.address || 'No address'}</span>
              <span className={`badge ${isActive(profile.is_active) ? 'active' : 'inactive'}`}>
                {isActive(profile.is_active) ? 'Active' : 'Inactive'}
              </span>
              <div className="card-actions">
                <button type="button" className="secondary" onClick={() => showProfile(profile)} disabled={loading}>
                  View
                </button>
                <button type="button" className="secondary" onClick={() => editProfile(profile)} disabled={loading}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => deleteProfile(profile)} disabled={loading}>
                  Delete
                </button>
              </div>
            </article>
          )) : (
            <p className="empty-state">No profiles loaded yet.</p>
          )}
        </div>
      </section>

      {selectedProfile ? (
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Profile detail</h2>
              <p className="small">Loaded from GET /api/v1/users/{selectedProfile.id}</p>
            </div>
            <button type="button" className="secondary" onClick={() => setSelectedProfile(null)} disabled={loading}>
              Clear detail
            </button>
          </div>
          <dl className="detail-grid">
            <div><dt>ID</dt><dd>{selectedProfile.id}</dd></div>
            <div><dt>Full name</dt><dd>{selectedProfile.full_name}</dd></div>
            <div><dt>ID card</dt><dd>{selectedProfile.id_card_number}</dd></div>
            <div><dt>Phone</dt><dd>{selectedProfile.phone}</dd></div>
            <div><dt>Status</dt><dd>{isActive(selectedProfile.is_active) ? 'Active' : 'Inactive'}</dd></div>
            <div><dt>Projects loaded</dt><dd>{countProjects(selectedProfile)}</dd></div>
            <div className="wide"><dt>Address</dt><dd>{selectedProfile.address || 'No address'}</dd></div>
          </dl>
          <div className="button-row">
            <button type="button" className="secondary" onClick={() => editProfile(selectedProfile)} disabled={loading}>
              Edit this profile
            </button>
            <button type="button" className="danger" onClick={() => deleteProfile(selectedProfile)} disabled={loading}>
              Delete this profile
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>{formMode === 'edit' ? 'Update profile' : 'Create profile'}</h2>
            <p className="small">
              Create uses POST /users. Update uses PUT /users/{'{id}'}. Delete uses DELETE /users/{'{id}'}.
            </p>
          </div>
          {formMode === 'edit' ? (
            <button type="button" className="secondary" onClick={startCreate} disabled={loading}>
              New profile
            </button>
          ) : null}
        </div>

        <form className="grid-form" onSubmit={saveProfile}>
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
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {formMode === 'edit' ? 'Update' : 'Create'}
            </button>
            <button type="button" className="secondary" onClick={resetForm} disabled={loading}>
              Reset
            </button>
          </div>
        </form>
      </section>

      {loading ? <p className="status">Loading...</p> : null}
      {notice ? <p className="status success">{notice}</p> : null}
      {error ? <p className="status error">{error}</p> : null}
    </main>
  );
}
