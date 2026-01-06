import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RouletteGame from './pages/RouletteGame';
import Paywall from './pages/Paywall';
import SubscriptionExpiryModal from './components/SubscriptionExpiryModal';
import AIChatWidget from './components/AIChatWidget';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const GlobalUI = () => {
  const { showExpiryModal, setShowExpiryModal, logout, user } = useContext(AuthContext);
  return (
    <>
      <SubscriptionExpiryModal
        isOpen={showExpiryModal}
        onClose={() => setShowExpiryModal(false)}
        logout={logout}
      />
      <AIChatWidget user={user} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#d4af37',
          border: '1px solid #d4af37'
        },
      }} />
      <Router>
        <GlobalUI />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/paywall" element={
            <ProtectedRoute>
              <Paywall />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              {/* Ideally check for subscription status here, for now default to Paywall */}
              <Navigate to="/paywall" replace />
            </ProtectedRoute>
          } />
          {/* Allow direct access to game via special route or after bypass */}
          <Route path="/roulette" element={
            <ProtectedRoute>
              <RouletteGame />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
