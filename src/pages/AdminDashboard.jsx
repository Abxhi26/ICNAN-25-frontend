// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, {
    uploadExcel as uploadExcelHelper,
    searchParticipants,
    getAllParticipants,
    assignBarcode,
    deassignBarcode,
    markEntry,
    getEntries,
    getAllEntries,
    getEntryStats,
    uploadPapersExcel,
    searchPapers,
    getAllPapers
} from '../services/api';
import './AdminDashboard.css';

const VENUES = [
    'Main Hall',
    'Conference Room A',
    'Conference Room B',
    'Auditorium',
    'Exhibition Area',
    'Dining Hall',
    'Accommodation Check-in'
];

const AdminDashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('search');
    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    // Upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Barcode assignment states
    const [isAssigningBarcode, setIsAssigningBarcode] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showDeassignConfirm, setShowDeassignConfirm] = useState(false);

    // Entry marking states
    const [barcodeScanned, setBarcodeScanned] = useState('');
    const [selectedVenue, setSelectedVenue] = useState(VENUES[0]);
    const [entryResult, setEntryResult] = useState(null);
    const [entryHistory, setEntryHistory] = useState([]);

    // Entry logs states
    const [allEntries, setAllEntries] = useState([]);
    const [entryStats, setEntryStats] = useState(null);
    const [filterVenue, setFilterVenue] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    // Papers states (Stage 2)
    const [papers, setPapers] = useState([]);
    const [paperSearchQuery, setPaperSearchQuery] = useState('');
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [paperFile, setPaperFile] = useState(null);
    const [paperUploadStatus, setPaperUploadStatus] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        if (activeTab === 'participants') {
            loadAllParticipants();
        } else if (activeTab === 'entries') {
            loadAllEntries();
            loadEntryStats();
        } else if (activeTab === 'papers') {
            loadAllPapers();
        }
    }, [activeTab]);

    const loadAllParticipants = async () => {
        setLoading(true);
        try {
            const data = await getAllParticipants();
            console.log('Loaded participants:', data.length);
            setParticipants(data);
        } catch (error) {
            console.error('Error loading participants:', error);
            alert('Failed to load participants');
        }
        setLoading(false);
    };

    const loadAllEntries = async () => {
        setLoading(true);
        try {
            const data = await getAllEntries(filterVenue, filterDate);
            setAllEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
            alert('Failed to load entries');
        }
        setLoading(false);
    };

    const loadEntryStats = async () => {
        try {
            const stats = await getEntryStats();
            setEntryStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    // Papers
    const loadAllPapers = async () => {
        setLoading(true);
        try {
            const data = await getAllPapers();
            setPapers(data);
        } catch (error) {
            console.error('Error loading papers:', error);
            alert('Failed to load papers');
        }
        setLoading(false);
    };

    // ---------- Upload handlers (REPLACED) ----------
    const handleFileSelect = (e) => {
        // Grab the first File object
        const f = e?.target?.files && e.target.files[0];
        console.log('handleFileSelect -> file object:', f);
        setSelectedFile(f || null);
        setUploadStatus('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('Please select a file');
            return;
        }

        setLoading(true);
        setUploadStatus('Uploading...');

        try {
            // Debug: show file info
            console.log('handleUpload -> selectedFile:', selectedFile);
            console.log('type:', selectedFile.type, 'size:', selectedFile.size, 'name:', selectedFile.name);

            // Build FormData and append file
            const fd = new FormData();
            fd.append('file', selectedFile);

            // Debug: confirm FormData contains file
            console.log('formData.get("file") =>', fd.get('file'));

            // Post using axios instance so Authorization header is included by interceptor
            const response = await api.post('/upload-excel', fd);

            console.log('upload response:', response.data);
            setUploadStatus(`✅ ${response.data.message || 'Uploaded'}`);

            // Clear file input and state
            setSelectedFile(null);
            const inputEl = document.getElementById('excel-upload');
            if (inputEl) inputEl.value = '';

            if (activeTab === 'participants') {
                loadAllParticipants();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const serverMsg = error?.response?.data?.error || error?.message || 'Upload failed';
            setUploadStatus(`❌ ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    // ---------- Paper upload (similar approach) ----------
    const handlePaperFileSelect = (e) => {
        const f = e?.target?.files && e.target.files[0];
        console.log('handlePaperFileSelect -> file:', f);
        setPaperFile(f || null);
        setPaperUploadStatus('');
    };

    const handlePaperUpload = async () => {
        if (!paperFile) {
            setPaperUploadStatus('Please select a file');
            return;
        }

        setLoading(true);
        setPaperUploadStatus('Uploading...');

        try {
            const fd = new FormData();
            fd.append('file', paperFile);
            console.log('paper formData.get("file") =>', fd.get('file'));

            const response = await api.post('/upload-papers', fd);
            console.log('paper upload response:', response.data);
            setPaperUploadStatus(`✅ ${response.data.message || 'Uploaded'}`);

            setPaperFile(null);
            const inputEl = document.getElementById('paper-upload');
            if (inputEl) inputEl.value = '';

            if (activeTab === 'papers') {
                loadAllPapers();
            }
        } catch (error) {
            console.error('Paper upload failed:', error);
            const serverMsg = error?.response?.data?.error || error?.message || 'Upload failed';
            setPaperUploadStatus(`❌ ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    // ---------- Search / barcode / entry handlers (unchanged) ----------
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSelectedParticipant(null);
            alert('Please enter a search query');
            return;
        }

        setLoading(true);
        setSelectedParticipant(null);
        setIsAssigningBarcode(false);
        setBarcodeInput('');
        setShowDeassignConfirm(false);

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
            alert('Search failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAssignBarcode = async () => {
        if (!barcodeInput.trim()) {
            alert('Please enter a barcode');
            return;
        }

        if (!selectedParticipant) {
            alert('No participant selected');
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
            const errorMsg = error.response?.data?.error || 'Failed to assign barcode';
            alert('❌ ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeassignBarcode = async () => {
        if (!selectedParticipant) {
            alert('No participant selected');
            return;
        }

        setLoading(true);
        try {
            const result = await deassignBarcode(selectedParticipant.email);
            alert('✅ ' + result.message);

            setSelectedParticipant({
                ...selectedParticipant,
                barcode: null
            });

            setBarcodeInput('');
            setShowDeassignConfirm(false);
            setIsAssigningBarcode(false);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to remove barcode';
            alert('❌ ' + errorMsg);
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

    const handleFilterChange = () => {
        loadAllEntries();
    };

    const exportToCSV = () => {
        const headers = ['Reference No', 'Name', 'Email', 'Mobile', 'Institution', 'Category', 'Venue', 'Timestamp', 'Marked By'];
        const rows = allEntries.map(entry => [
            entry.participant.referenceNo,
            entry.participant.name,
            entry.participant.email,
            entry.participant.mobileNo || '-',
            entry.participant.institution || '-',
            entry.participant.registeredCategory || '-',
            entry.venue,
            new Date(entry.timestamp).toLocaleString(),
            entry.staffId
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entry-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="admin-dashboard">
            <nav className="admin-nav">
                <h2>ICNAN Conference - Admin Dashboard</h2>
                <div className="nav-right">
                    <span className="user-info">
                        {user?.name} (Admin)
                    </span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="admin-content">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 Search Participant</button>
                    <button className={`tab ${activeTab === 'markentry' ? 'active' : ''}`} onClick={() => setActiveTab('markentry')}>📍 Mark Entry</button>
                    <button className={`tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>📤 Upload Report</button>
                    <button className={`tab ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>👥 All Participants</button>
                    <button className={`tab ${activeTab === 'entries' ? 'active' : ''}`} onClick={() => setActiveTab('entries')}>📊 Entry Logs</button>
                    <button className={`tab ${activeTab === 'papers' ? 'active' : ''}`} onClick={() => setActiveTab('papers')}>📄 Papers</button>
                </div>

                <div className="tab-content">
                    {/* SEARCH, MARK ENTRY, etc... kept same as original */}
                    {activeTab === 'search' && (
                        <div className="search-user-section">
                            <div className="search-header">
                                <p className="search-instruction">Search participants by email, mobile number, or reference number</p>
                                <div className="search-input-group">
                                    <input type="text" placeholder="Enter email, mobile, or reference number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="search-input" />
                                    <button onClick={handleSearch} disabled={loading} className="search-button">{loading ? 'Searching...' : 'Search Participant'}</button>
                                </div>
                            </div>

                            {selectedParticipant && (
                                <div className="user-details-card">
                                    {/* barcode / details / payment sections (unchanged) */}
                                    <div className="barcode-section">
                                        <h3>🏷️ Barcode Assignment</h3>
                                        <div className="barcode-status">
                                            {selectedParticipant.barcode ? (
                                                <div className="barcode-assigned-status">
                                                    <span className="barcode-label">Current Barcode:</span>
                                                    <span className="barcode-value">{selectedParticipant.barcode}</span>
                                                </div>
                                            ) : (
                                                <span className="no-barcode">No barcode assigned</span>
                                            )}
                                        </div>

                                        {selectedParticipant.barcode ? (
                                            <>
                                                {isAssigningBarcode ? (
                                                    <div className="barcode-input-group">
                                                        <input type="text" placeholder="Enter new barcode number" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} className="barcode-input" autoFocus />
                                                        <button onClick={handleAssignBarcode} disabled={loading} className="barcode-save-btn">{loading ? 'Saving...' : '✓ Update'}</button>
                                                        <button onClick={() => { setIsAssigningBarcode(false); setBarcodeInput(selectedParticipant.barcode || ''); }} className="barcode-cancel-btn">✕ Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div className="barcode-actions-group">
                                                        <button onClick={() => setIsAssigningBarcode(true)} className="barcode-update-btn">📝 Update Barcode</button>
                                                        {showDeassignConfirm ? (
                                                            <div className="deassign-confirm">
                                                                <span className="confirm-text">Remove barcode?</span>
                                                                <button onClick={handleDeassignBarcode} disabled={loading} className="barcode-deassign-confirm-btn">{loading ? 'Removing...' : '✓ Yes, Remove'}</button>
                                                                <button onClick={() => setShowDeassignConfirm(false)} className="barcode-deassign-cancel-btn">✕ Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setShowDeassignConfirm(true)} className="barcode-deassign-btn">🗑️ De-assign Barcode</button>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {isAssigningBarcode ? (
                                                    <div className="barcode-input-group">
                                                        <input type="text" placeholder="Enter barcode number" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} className="barcode-input" autoFocus />
                                                        <button onClick={handleAssignBarcode} disabled={loading} className="barcode-save-btn">{loading ? 'Saving...' : '✓ Save'}</button>
                                                        <button onClick={() => { setIsAssigningBarcode(false); setBarcodeInput(''); }} className="barcode-cancel-btn">✕ Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setIsAssigningBarcode(true)} className="barcode-assign-trigger-btn">➕ Assign Barcode</button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="details-section">
                                        <h3>Participant Details</h3>
                                        <div className="detail-row"><span className="detail-label">Reference No.</span><span className="detail-value">{selectedParticipant.referenceNo}</span></div>
                                        <div className="detail-row"><span className="detail-label">Name</span><span className="detail-value">{selectedParticipant.prefix} {selectedParticipant.name}</span></div>
                                        <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selectedParticipant.email}</span></div>
                                        <div className="detail-row"><span className="detail-label">Mobile Number</span><span className="detail-value">{selectedParticipant.mobileNo || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Gender</span><span className="detail-value">{selectedParticipant.gender || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Designation</span><span className="detail-value">{selectedParticipant.designation || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Institution</span><span className="detail-value">{selectedParticipant.institution || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">State</span><span className="detail-value">{selectedParticipant.state || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Country</span><span className="detail-value">{selectedParticipant.country || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Registered Category</span><span className="detail-value">{selectedParticipant.registeredCategory || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Paper ID</span><span className="detail-value">{selectedParticipant.paperId || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Registration Date</span><span className="detail-value">{selectedParticipant.registrationDate || '-'}</span></div>
                                    </div>

                                    <div className="payment-section">
                                        <h3>Payment Details</h3>
                                        <div className="detail-row"><span className="detail-label">Transaction ID</span><span className="detail-value">{selectedParticipant.transactionId || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Invoice No.</span><span className="detail-value">{selectedParticipant.invoiceNo || '-'}</span></div>
                                        <div className="detail-row"><span className="detail-label">Amount Paid</span><span className="detail-value amount-highlight">₹{selectedParticipant.amountPaid || 0}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'markentry' && (
                        <div className="entry-section">
                            <h2>Mark Entry for Venue</h2>
                            <p className="instruction">Scan or enter barcode and select venue to mark entry</p>

                            <div className="entry-form">
                                <div className="form-group">
                                    <label>Barcode</label>
                                    <input type="text" placeholder="Scan or enter barcode..." value={barcodeScanned} onChange={(e) => setBarcodeScanned(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleMarkEntry()} className="barcode-scan-input" autoFocus />
                                </div>

                                <div className="form-group">
                                    <label>Select Venue</label>
                                    <select value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} className="venue-select">
                                        {VENUES.map(venue => <option key={venue} value={venue}>{venue}</option>)}
                                    </select>
                                </div>

                                <button onClick={handleMarkEntry} disabled={loading} className="mark-entry-btn">{loading ? 'Processing...' : '✓ Mark Entry'}</button>
                            </div>

                            {entryResult && (
                                <div className={`entry-result ${entryResult.success ? 'success' : 'error'}`}>
                                    <div className="result-icon">{entryResult.success ? '✅' : '❌'}</div>
                                    <div className="result-content">
                                        <h3>{entryResult.success ? 'Entry Marked!' : 'Entry Failed'}</h3>
                                        <p>{entryResult.message}</p>
                                        {entryResult.participant && (
                                            <div className="participant-info">
                                                <p><strong>Name:</strong> {entryResult.participant.name}</p>
                                                <p><strong>Ref No:</strong> {entryResult.participant.referenceNo}</p>
                                                {entryResult.entry && <p><strong>Time:</strong> {new Date(entryResult.entry.timestamp).toLocaleString()}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {entryHistory.length > 0 && (
                                <div className="entry-history">
                                    <h3>Entry History</h3>
                                    <table>
                                        <thead><tr><th>Venue</th><th>Timestamp</th><th>Marked By</th></tr></thead>
                                        <tbody>{entryHistory.map(entry => <tr key={entry.id}><td>{entry.venue}</td><td>{new Date(entry.timestamp).toLocaleString()}</td><td>{entry.staffId}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="upload-section">
                            <h2>Upload Registration Report</h2>
                            <p className="instruction">Upload the daily registration report Excel file (.xlsx format)</p>


                            <div className="upload-form">
                                <input type="file" id="excel-upload" accept=".xlsx,.xls" onChange={handleFileSelect} disabled={loading} />
                                <button onClick={handleUpload} disabled={!selectedFile || loading} className="upload-button">{loading ? 'Uploading...' : 'Upload Excel'}</button>
                            </div>

                            {uploadStatus && <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : 'error'}`}>{uploadStatus}</div>}
                        </div>
                    )}

                    {activeTab === 'participants' && (
                        <div className="all-users-section">
                            <div className="section-header">
                                <h2>All Registered Participants</h2>
                                <button onClick={loadAllParticipants} className="refresh-button" disabled={loading}>{loading ? '⏳ Loading...' : '🔄 Refresh'}</button>
                            </div>

                            {loading && <div className="loading">Loading participants...</div>}

                            {!loading && participants.length > 0 && (
                                <div className="users-table">
                                    <table>
                                        <thead><tr><th>Reference No.</th><th>Name</th><th>Email</th><th>Mobile</th><th>Institution</th><th>Category</th><th>Amount Paid</th><th>Barcode</th></tr></thead>
                                        <tbody>{participants.map(p => <tr key={p.id}><td>{p.referenceNo}</td><td>{p.name}</td><td>{p.email}</td><td>{p.mobileNo || '-'}</td><td>{p.institution || '-'}</td><td>{p.registeredCategory || '-'}</td><td className="amount-cell">₹{p.amountPaid || 0}</td><td>{p.barcode ? <span className="barcode-tag">{p.barcode}</span> : <span className="no-barcode-tag">Not assigned</span>}</td></tr>)}</tbody>
                                    </table>
                                    <div className="user-count">Total Participants: {participants.length}</div>
                                </div>
                            )}

                            {!loading && participants.length === 0 && <div className="no-data"><p>No participants found. Upload an Excel file to add participants.</p></div>}
                        </div>
                    )}

                    {activeTab === 'entries' && (
                        <div className="entry-logs-section">
                            <div className="section-header">
                                <h2>Entry Logs</h2>
                                <button onClick={exportToCSV} className="export-button" disabled={allEntries.length === 0}>📥 Export CSV</button>
                            </div>

                            {entryStats && (
                                <div className="stats-cards">
                                    <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-content"><div className="stat-value">{entryStats.totalEntries}</div><div className="stat-label">Total Entries</div></div></div>
                                    <div className="stat-card"><div className="stat-icon">👤</div><div className="stat-content"><div className="stat-value">{entryStats.uniqueParticipants}</div><div className="stat-label">Unique Participants</div></div></div>
                                    {entryStats.entriesByVenue.map(v => <div className="stat-card" key={v.venue}><div className="stat-icon">📍</div><div className="stat-content"><div className="stat-value">{v.count}</div><div className="stat-label">{v.venue}</div></div></div>)}
                                </div>
                            )}

                            <div className="filters">
                                <div className="filter-group"><label>Filter by Venue:</label><select value={filterVenue} onChange={(e) => setFilterVenue(e.target.value)} className="filter-select"><option value="all">All Venues</option>{VENUES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                                <div className="filter-group"><label>Filter by Date:</label><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="filter-date" /></div>
                                <button onClick={handleFilterChange} className="filter-button" disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</button>
                                {(filterVenue !== 'all' || filterDate) && <button onClick={() => { setFilterVenue('all'); setFilterDate(''); setTimeout(() => loadAllEntries(), 100); }} className="clear-filter-button">Clear Filters</button>}
                            </div>

                            {loading && <div className="loading">Loading entry logs...</div>}

                            {!loading && allEntries.length > 0 && (
                                <div className="entry-logs-table">
                                    <table>
                                        <thead><tr><th>Ref No</th><th>Name</th><th>Email</th><th>Institution</th><th>Category</th><th>Venue</th><th>Timestamp</th><th>Marked By</th></tr></thead>
                                        <tbody>{allEntries.map(entry => <tr key={entry.id}><td>{entry.participant.referenceNo}</td><td>{entry.participant.name}</td><td>{entry.participant.email}</td><td>{entry.participant.institution || '-'}</td><td>{entry.participant.registeredCategory || '-'}</td><td><span className="venue-badge">{entry.venue}</span></td><td>{new Date(entry.timestamp).toLocaleString()}</td><td className="staff-id">{entry.staffId}</td></tr>)}</tbody>
                                    </table>
                                    <div className="entry-count">Total Entries: {allEntries.length}</div>
                                </div>
                            )}

                            {!loading && allEntries.length === 0 && <div className="no-data"><p>No entry logs found. Start marking entries to see data here.</p></div>}
                        </div>
                    )}

                    {activeTab === 'papers' && (
                        <div className="papers-section">
                            <h2>Papers</h2>

                            <div className="paper-upload">
                                <input type="file" id="paper-upload" accept=".xlsx,.xls" onChange={handlePaperFileSelect} disabled={loading} />
                                <button onClick={handlePaperUpload} disabled={!paperFile || loading} className="upload-button">{loading ? 'Uploading...' : 'Upload Papers'}</button>
                                {paperUploadStatus && <div className={`upload-status ${paperUploadStatus.includes('✅') ? 'success' : 'error'}`}>{paperUploadStatus}</div>}
                            </div>

                            <div className="paper-search">
                                <input type="text" placeholder="Search papers..." value={paperSearchQuery} onChange={(e) => setPaperSearchQuery(e.target.value)} />
                                <button onClick={async () => { setLoading(true); try { const res = await searchPapers(paperSearchQuery); setSelectedPaper(res?.[0] || null); } catch (err) { console.error(err); } setLoading(false); }}>Search</button>
                            </div>

                            {!loading && papers.length > 0 && (
                                <div className="papers-list">
                                    <table>
                                        <thead><tr><th>ID</th><th>Title</th><th>Authors</th><th>Actions</th></tr></thead>
                                        <tbody>{papers.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{p.authors}</td><td>{/* actions */}</td></tr>)}</tbody>
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

export default AdminDashboard;
