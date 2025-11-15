import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    searchParticipants,
    assignBarcode,
    markEntry,
    getEntries
} from '../services/api';
import './StaffDashboard.css';

const VENUES = [
    'Main Hall',
    'Conference Room A',
    'Conference Room B',
    'Auditorium',
    'Exhibition Area',
    'Dining Hall',
    'Accommodation Check-in'
];

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isAssigningBarcode, setIsAssigningBarcode] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');

    const [barcodeScanned, setBarcodeScanned] = useState('');
    const [selectedVenue, setSelectedVenue] = useState(VENUES[0]);
    const [entryResult, setEntryResult] = useState(null);
    const [entryHistory, setEntryHistory] = useState([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search query');
            return;
        }

        setLoading(true);
        setSelectedParticipant(null);
        setIsAssigningBarcode(false);
        setBarcodeInput('');

        try {
            const results = await searchParticipants(searchQuery);

            if (results && results.length > 0) {
                const foundParticipant = results[0];
                setSelectedParticipant(foundParticipant);
                setBarcodeInput(foundParticipant.barcode || '');
            } else {
                alert('No participant found');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignBarcode = async () => {
        if (!barcodeInput.trim() || !selectedParticipant) {
            alert('Please enter a barcode');
            return;
        }

        setLoading(true);
        try {
            const result = await assignBarcode(selectedParticipant.email, barcodeInput.trim());
            alert('✅ ' + result.message);

            setSelectedParticipant({
                ...selectedParticipant,
                barcode: barcodeInput.trim()
            });

            setIsAssigningBarcode(false);
        } catch (error) {
            alert('❌ ' + (error.response?.data?.error || 'Failed to assign barcode'));
        } finally {
            setLoading(false);
        }
    };

    const handleMarkEntry = async () => {
        if (!barcodeScanned.trim() || !selectedVenue) {
            alert('Please enter a barcode and select venue');
            return;
        }

        setLoading(true);
        setEntryResult(null);

        try {
            const result = await markEntry(barcodeScanned.trim(), selectedVenue);
            setEntryResult({
                success: true,
                message: result.message,
                participant: result.participant,
                entry: result.entry
            });

            fetchEntryHistory(barcodeScanned.trim());
            setBarcodeScanned('');
        } catch (error) {
            setEntryResult({
                success: false,
                message: error.response?.data?.error || 'Failed to mark entry'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEntryHistory = async (barcode) => {
        try {
            const data = await getEntries(barcode);
            setEntryHistory(data.entries || []);
        } catch (error) {
            console.error('Failed to fetch entry history');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="staff-dashboard">
            <nav className="staff-nav">
                <h2>ICAN Conference - Coordinator Panel</h2>
                <div className="nav-right">
                    <span className="user-info">
                        {user?.name}
                    </span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="staff-content">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        🔍 Search & Assign
                    </button>
                    <button
                        className={`tab ${activeTab === 'entry' ? 'active' : ''}`}
                        onClick={() => setActiveTab('entry')}
                    >
                        📍 Mark Entry
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'search' && (
                        <div className="search-section">
                            <div className="search-header">
                                <p className="instruction">
                                    Search participants and assign barcodes
                                </p>
                                <div className="search-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter email, mobile, or reference number..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="search-input"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading}
                                        className="search-button"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            {selectedParticipant && (
                                <div className="user-card">
                                    <div className="barcode-section">
                                        <h3>🏷️ Barcode</h3>
                                        {selectedParticipant.barcode ? (
                                            <div className="barcode-display">
                                                <span className="barcode-value">{selectedParticipant.barcode}</span>
                                            </div>
                                        ) : (
                                            <>
                                                {isAssigningBarcode ? (
                                                    <div className="barcode-input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter barcode"
                                                            value={barcodeInput}
                                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                                            className="barcode-input"
                                                            autoFocus
                                                        />
                                                        <button onClick={handleAssignBarcode} disabled={loading} className="save-btn">
                                                            {loading ? 'Saving...' : '✓ Save'}
                                                        </button>
                                                        <button onClick={() => setIsAssigningBarcode(false)} className="cancel-btn">
                                                            ✕ Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setIsAssigningBarcode(true)} className="assign-btn">
                                                        ➕ Assign Barcode
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="user-info-section">
                                        <h3>👤 Participant Details</h3>
                                        <div className="info-row">
                                            <span className="label">Reference No:</span>
                                            <span className="value">{selectedParticipant.referenceNo}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Name:</span>
                                            <span className="value">{selectedParticipant.prefix} {selectedParticipant.name}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{selectedParticipant.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Mobile:</span>
                                            <span className="value">{selectedParticipant.mobileNo || '-'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Institution:</span>
                                            <span className="value">{selectedParticipant.institution || '-'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Category:</span>
                                            <span className="value">{selectedParticipant.registeredCategory || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'entry' && (
                        <div className="entry-section">
                            <h2>Mark Entry for Venue</h2>
                            <p className="instruction">
                                Scan or enter barcode and select venue to mark entry
                            </p>

                            <div className="entry-form">
                                <div className="form-group">
                                    <label>Barcode</label>
                                    <input
                                        type="text"
                                        placeholder="Scan or enter barcode..."
                                        value={barcodeScanned}
                                        onChange={(e) => setBarcodeScanned(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleMarkEntry()}
                                        className="barcode-scan-input"
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Select Venue</label>
                                    <select
                                        value={selectedVenue}
                                        onChange={(e) => setSelectedVenue(e.target.value)}
                                        className="venue-select"
                                    >
                                        {VENUES.map(venue => (
                                            <option key={venue} value={venue}>{venue}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleMarkEntry}
                                    disabled={loading}
                                    className="mark-entry-btn"
                                >
                                    {loading ? 'Processing...' : '✓ Mark Entry'}
                                </button>
                            </div>

                            {entryResult && (
                                <div className={`entry-result ${entryResult.success ? 'success' : 'error'}`}>
                                    <div className="result-icon">
                                        {entryResult.success ? '✅' : '❌'}
                                    </div>
                                    <div className="result-content">
                                        <h3>{entryResult.success ? 'Entry Marked!' : 'Entry Failed'}</h3>
                                        <p>{entryResult.message}</p>
                                        {entryResult.participant && (
                                            <div className="participant-info">
                                                <p><strong>Name:</strong> {entryResult.participant.name}</p>
                                                <p><strong>Ref No:</strong> {entryResult.participant.referenceNo}</p>
                                                {entryResult.entry && (
                                                    <p><strong>Time:</strong> {new Date(entryResult.entry.timestamp).toLocaleString()}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {entryHistory.length > 0 && (
                                <div className="entry-history">
                                    <h3>Entry History</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Venue</th>
                                                <th>Timestamp</th>
                                                <th>Marked By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entryHistory.map((entry) => (
                                                <tr key={entry.id}>
                                                    <td>{entry.venue}</td>
                                                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                                    <td>{entry.staffId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
