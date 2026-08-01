import { supabase } from '../lib/supabase';

const BASE = '/api/v1';

async function request(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* keep default message */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listSites: () => request('/sites'),
  getSite: (id) => request(`/sites/${id}`),
  createSite: (data) => request('/sites', { method: 'POST', body: JSON.stringify(data) }),
  updateSite: (id, data) => request(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSite: (id) => request(`/sites/${id}`, { method: 'DELETE' }),
  generatePassword: (opts = {}) =>
    request('/passwords/generate', { method: 'POST', body: JSON.stringify({ length: 16, ...opts }) }),
  generateBackupCodes: (count = 10) =>
    request('/backup-codes/generate', { method: 'POST', body: JSON.stringify({ count }) }),
};
