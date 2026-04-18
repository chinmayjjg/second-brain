import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SharedBrain from './components/SharedBrain';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a spinner or nothing while checking authentication
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthRedirectRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const RootRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <AuthRedirectRoute>
                  <Login />
                </AuthRedirectRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRedirectRoute>
                  <Register />
                </AuthRedirectRoute>
              }
            />
            <Route path="/shared/:token" element={<SharedBrain />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<RootRoute />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
