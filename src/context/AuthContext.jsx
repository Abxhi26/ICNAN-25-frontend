// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setTokenState] = useState(() => localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) api.setToken(token);
        else api.clearToken();
    }, [token]);

    const login = async (identifier, password) => {
        const res = await api.login(identifier, password);
        if (res && res.token) {
            api.setToken(res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            setUser(res.user);
            setTokenState(res.token);
        }
        return res;
    };

    const logout = () => {
        api.clearToken();
        localStorage.removeItem('user');
        setUser(null);
        setTokenState(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
