export function getClientOrgId() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('atlas_org') || '';
}

export async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function saveSession({ organizationId }) {
  if (typeof window === 'undefined') return;
  if (organizationId) localStorage.setItem('atlas_org', organizationId);
}

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('atlas_org');
}
