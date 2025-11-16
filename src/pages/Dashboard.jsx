import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="page dashboard-page">
            <div className="topbar">
                <div className="brand">ICAN — Entry Validation</div>
                <div className="spacer" />
                <div className="user">Signed in: {user?.name} ({user?.role})</div>
                <button className="btn small" onClick={logout}>Sign out</button>
            </div>

            <div className="content">
                <h2>Welcome, {user?.name}</h2>
                <div className="cards">
                    {user?.role === 'ADMIN' ? (
                        <>
                            <Link to="/admin" className="card-link card">Admin Dashboard</Link>
                            <Link to="/staff" className="card-link card">Staff Tools</Link>
                        </>
                    ) : (
                        <Link to="/staff" className="card-link card">Open Staff Tools</Link>
                    )}
                </div>
            </div>
        </div>
    );
}
