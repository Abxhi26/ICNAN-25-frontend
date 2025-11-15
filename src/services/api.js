import axios from 'axios';

// Use Vite env variable, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    // optional timeout
    timeout: 30_000,
});

// Attach JWT token automatically (if present)
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // ignore localStorage errors in SSR or private mode
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ---- Auth APIs ----
export const login = async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    // you may store token here or in the component
    return response.data;
};

// ---- Participant APIs ----
export const searchParticipants = async (query) => {
    const response = await api.get('/participants/search', {
        params: { query }
    });
    return response.data;
};

export const getAllParticipants = async () => {
    const response = await api.get('/participants');
    return response.data;
};

export const uploadExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // DO NOT set Content-Type here - browser/axios will set the correct boundary
    const response = await api.post('/upload-excel', formData, {
        headers: { /* intentionally empty for multipart */ }
    });
    return response.data;
};

// ---- Barcode APIs ----
export const assignBarcode = async (email, barcode) => {
    const response = await api.post('/assign-barcode', { email, barcode });
    return response.data;
};

export const deassignBarcode = async (email) => {
    const response = await api.post('/deassign-barcode', { email });
    return response.data;
};

// ---- Entry APIs ----
export const markEntry = async (barcode, venue) => {
    const response = await api.post('/mark-entry', { barcode, venue });
    return response.data;
};

export const getEntries = async (barcode) => {
    const response = await api.get(`/entries/${barcode}`);
    return response.data;
};

export const getAllEntries = async (venue = '', date = '') => {
    const params = {};
    if (venue) params.venue = venue;
    if (date) params.date = date;
    const response = await api.get('/entries/all', { params });
    return response.data;
};

export const getEntryStats = async () => {
    const response = await api.get('/entries/stats');
    return response.data;
};

// ---- Papers (stage 2) ----
export const uploadPapersExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-papers', formData, {
        headers: { /* multipart */ }
    });
    return response.data;
};

export const searchPapers = async (query) => {
    const response = await api.get('/papers/search', { params: { query } });
    return response.data;
};

export const getAllPapers = async () => {
    const response = await api.get('/papers/all');
    return response.data;
};

export const getPaperById = async (paperId) => {
    const response = await api.get(`/papers/${paperId}`);
    return response.data;
};

// ---- small helpers ----
export const setToken = (token) => {
    if (token) localStorage.setItem('token', token);
};

export const clearToken = () => {
    localStorage.removeItem('token');
};

export default api;
