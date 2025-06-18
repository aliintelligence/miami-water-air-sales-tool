// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './components/SignIn';
import SalesTool from './components/SalesTool';
import ConfigurationPanel from './components/ConfigurationPanel';
import EquipmentListPage from './components/EquipmentInfo/EquipmentListPage';
import EquipmentInfoPage from './components/EquipmentInfo/EquipmentInfoPage';
import { LanguageProvider, useTranslation } from './utils/i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import './styles/ipad-styles.css';

// Debug Component
const DebugInfo = () => {
  const { user, isAdmin } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-80 text-white p-4 text-xs max-w-md">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>User: {user.email}</div>
      <div>Username: {user.username}</div>
      <div>Is Admin: {isAdmin ? 'YES' : 'NO'}</div>
      <div>Groups: {JSON.stringify(user.groups)}</div>
      <details>
        <summary>All User Data</summary>
        <pre className="text-xs overflow-auto max-h-32">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    console.log('[ProtectedRoute] Checking access:', {
      user: user?.email,
      isAdmin,
      requireAdmin,
      isLoading
    });
  }, [user, isAdmin, requireAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('[ProtectedRoute] Admin required but user is not admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Content Component
function AppContent() {
  const { user, isAdmin, signOut, isLoading, refreshUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('[App] Current auth state:', { 
      user: user?.email, 
      isAdmin, 
      isLoading 
    });
  }, [user, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && (
          <nav className="bg-blue-600 text-white p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">{t('app.title')}</h1>
              <div className="space-x-4 flex items-center">
                <Link to="/" className="hover:underline">{t('navigation.salesCalculator')}</Link>
                <Link to="/equipment" className="hover:underline">{t('navigation.equipmentInfo')}</Link>
                {isAdmin ? (
                  <Link to="/admin" className="hover:underline bg-yellow-500 px-2 py-1 rounded">
                    {t('navigation.adminPanel')} (ADMIN)
                  </Link>
                ) : (
                  <span className="text-gray-300">(Not Admin)</span>
                )}
                <LanguageSwitcher />
                <span className="text-sm">
                  {user.email} {isAdmin && '(Admin)'}
                </span>
                <button 
                  onClick={refreshUser}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Refresh
                </button>
                <button 
                  onClick={signOut}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </nav>
        )}
        
        <main className="py-8">
          <ErrorBoundary>
            <Routes>
              <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <SalesTool />
                </ProtectedRoute>
              } />
              <Route path="/equipment" element={
                <ProtectedRoute>
                  <EquipmentListPage />
                </ProtectedRoute>
              } />
              <Route path="/equipment/:equipmentId" element={
                <ProtectedRoute>
                  <EquipmentInfoPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <ConfigurationPanel />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ErrorBoundary>
        </main>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && <DebugInfo />}
        
        <footer className="bg-gray-800 text-white p-4 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            <p>© {new Date().getFullYear()} {t('app.title')} - {t('app.subtitle')}</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;