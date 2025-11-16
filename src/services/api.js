// frontend/src/services/api.js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let _token = null;
export function setToken(token) { _token = token; }
export function clearToken() { _token = null; }

async function request(path, opts = {}) {
    const headers = opts.headers || {};
    headers['Accept'] = 'application/json';
    if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (_token) headers['Authorization'] = `Bearer ${_token}`;

    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }

    if (!res.ok) {
        const err = body || { error: res.statusText || 'Request failed' };
        throw err;
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
    const headers = {}; // let fetch set the content-type for multipart
    return request('/participants/upload-excel', { method: 'POST', body: fd, headers });
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
