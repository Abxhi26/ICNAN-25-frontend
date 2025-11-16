// frontend/src/services/api.js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let _token = localStorage.getItem('token') || null;
export function setToken(token) { _token = token; localStorage.setItem('token', token); }
export function clearToken() { _token = null; localStorage.removeItem('token'); }

function authHeaders() {
    return _token ? { Authorization: `Bearer ${_token}` } : {};
}

async function request(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };

    // let browser set Content-Type for FormData
    if (!(opts.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    headers['Accept'] = headers['Accept'] || 'application/json';

    // attach auth header if present
    Object.assign(headers, authHeaders());

    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }

    if (!res.ok) {
        // keep consistent shape
        throw body || { error: res.statusText || 'Request failed' };
    }
    return body;
}

// Auth
export const login = (identifier, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
});

// Participants
export const searchParticipants = (query) => request(`/participants/search?query=${encodeURIComponent(query)}`);
export const uploadExcel = (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/participants/upload-excel', { method: 'POST', body: fd }); // headers handled in request()
};
export const assignBarcode = (email, barcode) => request('/participants/assign-barcode', {
    method: 'POST', body: JSON.stringify({ email, barcode })
});
export const deassignBarcode = (email) => request('/participants/deassign-barcode', {
    method: 'POST', body: JSON.stringify({ email })
});

// Entries
export const markEntry = (barcode, venue) => request('/entries/mark', {
    method: 'POST', body: JSON.stringify({ barcode, venue })
});
export const entryHistory = (barcode) => request(`/entries/history/${encodeURIComponent(barcode)}`);
export const stats = () => request('/entries/stats');

export default {
    setToken, clearToken, login, searchParticipants, uploadExcel, assignBarcode, deassignBarcode, markEntry, entryHistory, stats
};
