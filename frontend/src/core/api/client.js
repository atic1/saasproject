const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken = null;
let activeBusinessId = null;
let on401Callback = null;

export const setAuthToken = (token) => { authToken = token; };
export const setActiveBusinessId = (id) => { activeBusinessId = id; };
export const setOn401Handler = (fn) => { on401Callback = fn; };

export const clearAuthState = () => {
  authToken = null;
  activeBusinessId = null;
};

const buildHeaders = (custom = {}) => ({
  'Content-Type': 'application/json',
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
  ...(activeBusinessId && { 'X-Business-Id': activeBusinessId }),
  ...custom,
});

const handleResponse = async (res) => {
  if (res.status === 401) {
    if (on401Callback) on401Callback();
    throw new Error('SESSION_EXPIRED');
  }
  if (res.status === 403) {
    throw new Error('ACCESS_DENIED');
  }
  if (res.status === 404) {
    throw new Error('NOT_FOUND');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const client = {
  get: (endpoint, headers = {}) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: buildHeaders(headers),
    }).then(handleResponse),

  post: (endpoint, body, headers = {}) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (endpoint, body, headers = {}) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (endpoint, body, headers = {}) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (endpoint, headers = {}) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(headers),
    }).then(handleResponse),
};