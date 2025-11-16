import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const { login } = useAuth();
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        setErr('');
        try {
            const res = await login(identifier.trim(), password);
            if (res.user.role === 'ADMIN') nav('/admin');
            else nav('/staff');
        } catch (e) {
            setErr(e?.error || e?.message || JSON.stringify(e));
        }
    }

    return (
        <div className="page login-page">
            <form className="card login-card" onSubmit={submit}>
                <h2>Sign in</h2>
                <label>Staff ID or Email</label>
                <input value={identifier} onChange={e => setIdentifier(e.target.value)} />
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                {err && <div className="error">{err}</div>}
                <button className="btn">Login</button>
            </form>
        </div>
    );
}
