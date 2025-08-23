import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

const ConnectionStatus = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await apiService.request('/users');
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return null; // No mostrar nada si está conectado
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
        <WifiOff className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Sin conexión al servidor</p>
          <p className="text-xs opacity-90">Verificando conexión...</p>
        </div>
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="p-1 hover:bg-red-600 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
