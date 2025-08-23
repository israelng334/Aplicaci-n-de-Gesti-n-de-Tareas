import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <TaskProvider>
            <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <ConnectionStatus />
              <Routes>
                {/* Ruta pública para login */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Rutas privadas */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Redirección por defecto */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </TaskProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
