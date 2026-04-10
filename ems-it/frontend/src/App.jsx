import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/facelogin';
import HomePage from './pages/homepage';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import AdminAttendance from './pages/Attendance';        // ✅ Admin: list view
import FaceAttendance from './pages/faceAttendance';     // ✅ Employee: face scan
import Performance from './pages/Performance';
import Projects from './pages/Projects';
import Assets from './pages/Assets';
import Training from './pages/Training';
import Documents from './pages/Documents';
import Announcements from './pages/Announcements';
import Tickets from './pages/Tickets';
import Reports from './pages/Reports';
import Roles from './pages/Roles';
import Profile from './pages/profile';
import Feedback from './pages/feedback';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// ✅ Role based attendance — admin/hr → list view, employee/manager → face scan
const AttendancePage = () => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'hr') {
    return <AdminAttendance />;
  }
  return <FaceAttendance />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard & all pages */}
          <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="roles" element={<Roles />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="leave" element={<Leave />} />
            <Route path="attendance" element={<AttendancePage />} />  {/* ✅ Role based */}
            <Route path="performance" element={<Performance />} />
            <Route path="projects" element={<Projects />} />
            <Route path="assets" element={<Assets />} />
            <Route path="training" element={<Training />} />
            <Route path="documents" element={<Documents />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}