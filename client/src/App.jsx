import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <div className="fixed top-0 left-0 bg-red-600 text-white text-xs z-50 p-1 font-bold pointer-events-none">V2.0 HASH ACTIVE</div>
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
            // <ProtectedRoute>
            //   <Navigate to="/paywall" replace />
            // </ProtectedRoute>
            <div className="min-h-screen bg-black text-[#d4af37] flex flex-col items-center justify-center p-4">
              <h1 className="text-4xl font-bold mb-4">WIN365 DEBUG MODE</h1>
              <p className="mb-8">If you see this, the new version is live.</p>
              <div className="flex gap-4">
                <a href="#/login" className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded">Go to Login</a>
                <a href="#/admin-login" className="px-6 py-3 border border-[#d4af37] text-[#d4af37] font-bold rounded">Go to Admin</a>
              </div>
            </div>
          } />
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
