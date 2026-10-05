import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Browse from './pages/Browse';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import WorkerProfile from './pages/WorkerProfile';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Driver from './pages/Driver';
import Labour from './pages/Labour';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import WorkerSetup from './pages/WorkerSetup';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  const { toasts, showToast } = useToast();

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Toast toasts={toasts} />
        <Routes>
          <Route path="/" element={<Home showToast={showToast} />} />
          <Route path="/browse" element={<Browse showToast={showToast} />} />
          <Route path="/worker/:id" element={<WorkerProfile showToast={showToast} />} />
          <Route path="/job/:id" element={<JobDetail showToast={showToast} />} />
          <Route path="/driver" element={<Driver showToast={showToast} />} />
          <Route path="/labour" element={<Labour showToast={showToast} />} />
          <Route path="/login" element={<Login showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard showToast={showToast} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat showToast={showToast} /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute><PostJob showToast={showToast} /></ProtectedRoute>} />
          <Route path="/post" element={<Navigate to="/post-job" replace />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/worker/setup" element={<ProtectedRoute><WorkerSetup /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/workers" element={<AdminRoute><AdminWorkers /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
