import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import PreviewPage from './pages/PreviewPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ModerationPage from './pages/ModerationPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import PostsPage from './pages/PostsPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedApp() {
  const { user, authReady } = useAuth();
  if (!authReady) return <main className="session-check">Checking your sign-in…</main>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/app" element={<ProtectedApp />}>
        <Route index element={<DashboardPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="resources" element={<PostsPage category="resource" />} />
        <Route path="lost-found" element={<PostsPage category="lost-found" />} />
        <Route path="opportunities" element={<PostsPage category="opportunity" />} />
        <Route path="notices" element={<PostsPage category="notice" />} />
        <Route path="moderation" element={<AdminRoute><ModerationPage /></AdminRoute>} />
        <Route path="search" element={<SearchPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
