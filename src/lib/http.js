const API_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

export const apiRequest = async (path, options = {}) => {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`,
    );

    error.status = response.status;

    throw error;
  }

  return data;
};
