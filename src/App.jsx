import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<StaffDashboard />} />
      {/* Default */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
export default App;
