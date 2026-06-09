import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

const TOKEN_STORAGE_KEY = 'abc_api_token';
const TOKEN_EXPIRES_AT_STORAGE_KEY = 'abc_api_token_expires_at';
const TOKEN_ABILITIES_STORAGE_KEY = 'abc_api_token_abilities';

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

function extractAccessToken(response) {
  return response?.data?.access_token || response?.access_token || response?.token || '';
}

function extractTokenExpiresAt(response) {
  return response?.data?.expires_at || response?.expires_at || '';
}

function extractTokenAbilities(response) {
  const abilities = response?.data?.abilities || response?.abilities || [];

  return Array.isArray(abilities) ? abilities : [];
}

function tokenExpired(expiresAt) {
  return Boolean(expiresAt) && Date.now() >= new Date(expiresAt).getTime();
}

function getStoredToken() {
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const storedExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_STORAGE_KEY) || '';

  if (storedToken && tokenExpired(storedExpiresAt)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_STORAGE_KEY);
    localStorage.removeItem(TOKEN_ABILITIES_STORAGE_KEY);
    return '';
  }

  return storedToken;
}

function getStoredTokenExpiresAt() {
  const storedExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_STORAGE_KEY) || '';

  return tokenExpired(storedExpiresAt) ? '' : storedExpiresAt;
}

function getStoredTokenAbilities() {
  const storedAbilities = localStorage.getItem(TOKEN_ABILITIES_STORAGE_KEY);

  if (!storedAbilities) {
    return [];
  }

  try {
    const abilities = JSON.parse(storedAbilities);

    return Array.isArray(abilities) ? abilities : [];
  } catch {
    localStorage.removeItem(TOKEN_ABILITIES_STORAGE_KEY);
    return [];
  }
}

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return '';
  }

  return new Date(expiresAt).toLocaleString();
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
  const [token, setToken] = useState(getStoredToken);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(getStoredTokenExpiresAt);
  const [tokenAbilities, setTokenAbilities] = useState(getStoredTokenAbilities);
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

  const isAuthenticated = Boolean(token) && !tokenExpired(tokenExpiresAt);
  const hasAbility = (ability) => tokenAbilities.includes('*') || tokenAbilities.includes(ability);
  const canReadProfiles = isAuthenticated && hasAbility('profiles:read');
  const canCreateProfiles = isAuthenticated && hasAbility('profiles:create');
  const canUpdateProfiles = isAuthenticated && hasAbility('profiles:update');
  const canDeleteProfiles = isAuthenticated && hasAbility('profiles:delete');
  const currentPage = meta?.current_page || page;
  const lastPage = meta?.last_page || currentPage;

  useEffect(() => {
    if (canReadProfiles) {
      loadProfiles(token, 1);
    }
  }, []);

  function clearAuthState() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_STORAGE_KEY);
    localStorage.removeItem(TOKEN_ABILITIES_STORAGE_KEY);
    setToken('');
    setTokenExpiresAt('');
    setTokenAbilities([]);
    setProfiles([]);
    setSelectedProfile(null);
    setMeta(null);
    setPage(1);
    resetForm();
  }

  function ensureTokenIsFresh(nextToken = token) {
    if (nextToken && tokenExpired(tokenExpiresAt)) {
      clearAuthState();
      setError('Sesi tamat tempoh. Login semula.');
      return false;
    }

    return true;
  }

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
      if (err.status === 401 && token) {
        clearAuthState();
        setError('401: Sesi tamat tempoh atau belum authenticated. Login semula.');
        return null;
      }

      if (err.status === 403) {
        setError(`403: ${err.message || 'Token tiada ability yang diperlukan.'}`);
        return null;
      }

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
      'Login berjaya.',
    );

    const accessToken = extractAccessToken(data);
    const expiresAt = extractTokenExpiresAt(data);
    const abilities = extractTokenAbilities(data);

    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      if (expiresAt) {
        localStorage.setItem(TOKEN_EXPIRES_AT_STORAGE_KEY, expiresAt);
      } else {
        localStorage.removeItem(TOKEN_EXPIRES_AT_STORAGE_KEY);
      }
      localStorage.setItem(TOKEN_ABILITIES_STORAGE_KEY, JSON.stringify(abilities));
      setToken(accessToken);
      setTokenExpiresAt(expiresAt);
      setTokenAbilities(abilities);
      await loadProfiles(accessToken, 1);
    }
  }

  async function logout() {
    await run(
      () => apiRequest('/auth/logout', {
        method: 'POST',
        token,
      }),
      'Logout berjaya.',
    );

    clearAuthState();
  }

  async function loadProfiles(
    nextToken = token,
    pageNumber = page,
    successMessage = 'Profiles dimuatkan.',
    preserveNotice = false,
  ) {
    if (!ensureTokenIsFresh(nextToken)) {
      return null;
    }

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
    if (!ensureTokenIsFresh()) {
      return null;
    }

    const data = await run(
      () => apiRequest(`/users/${profileId}`, { token }),
      'Detail profile dimuatkan.',
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
    if (!ensureTokenIsFresh()) {
      return;
    }

    const data = await run(
      () => apiRequest('/users', {
        method: 'POST',
        token,
        body: profilePayload(form),
      }),
      'Profile dicipta.',
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
    if (!ensureTokenIsFresh()) {
      return;
    }

    if (!selectedProfile?.id) {
      setError('Pilih profile sebelum update.');
      return;
    }

    const data = await run(
      () => apiRequest(`/users/${selectedProfile.id}`, {
        method: 'PUT',
        token,
        body: profilePayload(form),
      }),
      'Profile dikemaskini.',
    );
    const updated = extractProfile(data);

    if (updated) {
      setSelectedProfile(updated);
      setForm(profileToForm(updated));
      await loadProfiles(token, page, '', true);
    }
  }

  async function deleteProfile(profile) {
    if (!ensureTokenIsFresh()) {
      return;
    }

    const confirmed = window.confirm(`Padam ${profile.full_name}?`);

    if (!confirmed) {
      return;
    }

    const deleted = await run(
      () => apiRequest(`/users/${profile.id}`, {
        method: 'DELETE',
        token,
      }),
      'Profile dipadam.',
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
        <h2>Login untuk API secured</h2>
        <p className="small">
          Backend Laravel terkini melindungi CRUD profile dengan frontend token,
          bearer token Sanctum, token expiry, dan token abilities.
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
        {isAuthenticated && tokenExpiresAt ? (
          <p className="small">Token tamat tempoh pada {formatExpiry(tokenExpiresAt)}.</p>
        ) : null}
        {isAuthenticated ? (
          <p className="small">
            Abilities: {tokenAbilities.length ? tokenAbilities.join(', ') : 'tiada dalam response; login semula'}
          </p>
        ) : null}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>User profiles</h2>
            <p className="small">Login sebelum load atau ubah rekod. Laravel masih enforce setiap ability di backend.</p>
          </div>
          <button type="button" onClick={() => loadProfiles(token, 1)} disabled={loading || !canReadProfiles}>
            Load profiles
          </button>
        </div>

        <div className="filters">
          <input
            placeholder="Search nama, telefon, atau no. kad pengenalan"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" onClick={() => loadProfiles(token, 1)} disabled={loading || !canReadProfiles}>
            Apply
          </button>
        </div>

        {meta ? (
          <div className="pagination">
            <span className="small">
              Page {currentPage} daripada {lastPage}. Jumlah rekod: {meta.total || profiles.length}
            </span>
            <div className="button-row">
              <button
                type="button"
                className="secondary"
                onClick={() => loadProfiles(token, currentPage - 1)}
                disabled={loading || !canReadProfiles || currentPage <= 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => loadProfiles(token, currentPage + 1)}
                disabled={loading || !canReadProfiles || currentPage >= lastPage}
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
              <span>{profile.address || 'Tiada alamat'}</span>
              <span className={`badge ${isActive(profile.is_active) ? 'active' : 'inactive'}`}>
                {isActive(profile.is_active) ? 'Aktif' : 'Tidak aktif'}
              </span>
              <div className="card-actions">
                <button type="button" className="secondary" onClick={() => showProfile(profile)} disabled={loading || !canReadProfiles}>
                  Lihat
                </button>
                <button type="button" className="secondary" onClick={() => editProfile(profile)} disabled={loading || !canReadProfiles || !canUpdateProfiles}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => deleteProfile(profile)} disabled={loading || !canDeleteProfiles}>
                  Padam
                </button>
              </div>
            </article>
          )) : (
            <p className="empty-state">Belum ada profiles dimuatkan.</p>
          )}
        </div>
      </section>

      {selectedProfile ? (
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Detail profile</h2>
              <p className="small">Dimuatkan daripada GET /api/v1/users/{selectedProfile.id}</p>
            </div>
            <button type="button" className="secondary" onClick={() => setSelectedProfile(null)} disabled={loading}>
              Clear detail
            </button>
          </div>
          <dl className="detail-grid">
            <div><dt>ID</dt><dd>{selectedProfile.id}</dd></div>
            <div><dt>Nama penuh</dt><dd>{selectedProfile.full_name}</dd></div>
            <div><dt>Kad pengenalan</dt><dd>{selectedProfile.id_card_number}</dd></div>
            <div><dt>Telefon</dt><dd>{selectedProfile.phone}</dd></div>
            <div><dt>Status</dt><dd>{isActive(selectedProfile.is_active) ? 'Aktif' : 'Tidak aktif'}</dd></div>
            <div><dt>Projects loaded</dt><dd>{countProjects(selectedProfile)}</dd></div>
            <div className="wide"><dt>Alamat</dt><dd>{selectedProfile.address || 'Tiada alamat'}</dd></div>
          </dl>
          <div className="button-row">
            <button type="button" className="secondary" onClick={() => editProfile(selectedProfile)} disabled={loading || !canReadProfiles || !canUpdateProfiles}>
              Edit profile ini
            </button>
            <button type="button" className="danger" onClick={() => deleteProfile(selectedProfile)} disabled={loading || !canDeleteProfiles}>
              Padam profile ini
            </button>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>{formMode === 'edit' ? 'Update profile' : 'Create profile'}</h2>
            <p className="small">
              Create memerlukan profiles:create. Update memerlukan profiles:update. Delete memerlukan profiles:delete.
            </p>
          </div>
          {formMode === 'edit' ? (
            <button type="button" className="secondary" onClick={startCreate} disabled={loading || !canCreateProfiles}>
              Profile baru
            </button>
          ) : null}
        </div>

        <form className="grid-form" onSubmit={saveProfile}>
          <label>
            Nama penuh
            <input value={form.full_name} onChange={(event) => updateForm('full_name', event.target.value)} />
          </label>
          <label>
            No. kad pengenalan
            <input value={form.id_card_number} onChange={(event) => updateForm('id_card_number', event.target.value)} />
          </label>
          <label>
            Telefon
            <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
          </label>
          <label className="wide">
            Alamat
            <textarea value={form.address} onChange={(event) => updateForm('address', event.target.value)} />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => updateForm('is_active', event.target.checked)}
            />
            Aktif
          </label>
          <div className="form-actions">
            <button type="submit" disabled={loading || (formMode === 'edit' ? !canUpdateProfiles : !canCreateProfiles)}>
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
