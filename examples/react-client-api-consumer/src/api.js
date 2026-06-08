const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_API_TOKEN = import.meta.env.VITE_FRONTEND_API_TOKEN;

export async function apiRequest(path, { method = 'GET', token, body, query } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-TOKEN': FRONTEND_API_TOKEN,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
