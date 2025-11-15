import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>ICNAN'2025</h2>
                <div className="nav-right">
                    <span className="user-info">
                        {user?.name} ({user?.role})
                    </span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <h1>Welcome, {user?.name}!</h1>
                <p>Role: {user?.role}</p>

                {isAdmin ? (
                    <div className="features">
                        <h3>Admin Features (Coming Soon)</h3>
                        <ul>
                            <li>Upload CSV of participants</li>
                            <li>Search and assign barcodes</li>
                            <li>View all registered users</li>
                        </ul>
                    </div>
                ) : (
                    <div className="features">
                        <h3>Staff Features (Coming Soon)</h3>
                        <ul>
                            <li>Scan barcode to validate entry</li>
                            <li>View participant details</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
