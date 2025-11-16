import React, { useState } from 'react';
import * as api from '../services/api';
import './StaffDashboard.css';

export default function StaffDashboard() {
    const [barcode, setBarcode] = useState('');
    const [venue, setVenue] = useState('Main Hall');
    const [result, setResult] = useState(null);
    const [historyBarcode, setHistoryBarcode] = useState('');
    const [history, setHistory] = useState(null);

    async function mark(e) {
        e?.preventDefault();
        setResult(null);
        try { const r = await api.markEntry(barcode.trim(), venue); setResult(r); } catch (err) { setResult(err); }
    }

    async function loadHistory() {
        if (!historyBarcode.trim()) return;
        try {
            const h = await api.entryHistory(historyBarcode.trim());
            setHistory(h);
        } catch (e) {
            setHistory(null);
            alert(e?.error || JSON.stringify(e));
        }
    }

    return (
        <div className="page staff-page">
            <div className="topbar">
                <h3>Staff Tools</h3>
            </div>

            <section className="card">
                <h4>Mark entry</h4>
                <form onSubmit={mark}>
                    <input placeholder="Barcode" value={barcode} onChange={e => setBarcode(e.target.value)} />
                    <input placeholder="Venue" value={venue} onChange={e => setVenue(e.target.value)} />
                    <button className="btn">Mark</button>
                </form>
                {result && <pre className="output">{JSON.stringify(result, null, 2)}</pre>}
            </section>

            <section className="card">
                <h4>Entry history</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="Barcode" value={historyBarcode} onChange={e => setHistoryBarcode(e.target.value)} />
                    <button className="btn" onClick={loadHistory}>Load</button>
                </div>
                {history && (
                    <div>
                        <h5>{history.participant.name} — {history.participant.email}</h5>
                        {history.entries.map(en => (
                            <div key={en.id} className="entry-row">{new Date(en.timestamp).toLocaleString()} — {en.venue}</div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
