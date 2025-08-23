import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote } from 'lucide-react';
import quoteService from '../services/quoteService';

/**
 * Componente que muestra frases motivacionales de la API Quotable
 */
const MotivationalQuote = ({ className = '' }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga una nueva frase motivacional
   */
  const loadQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newQuote = await quoteService.getRandomQuote();
      setQuote(newQuote);
    } catch (error) {
      setError('Error al cargar la frase motivacional');
      console.error('Error loading quote:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga una frase al montar el componente
   */
  useEffect(() => {
    loadQuote();
  }, []);

  /**
   * Formatea la fecha para mostrar cuándo se cargó la frase
   */
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading && !quote) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 shadow-soft animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-200 dark:bg-purple-700 rounded-full"></div>
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-24"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-full"></div>
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-3/4"></div>
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-soft ${className}`}>
        <div className="text-center">
          <Quote className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={loadQuote}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 shadow-soft border border-purple-100 dark:border-purple-800 ${className}`}>
      {/* Header con icono y botón de refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Quote className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Frase del día
          </span>
        </div>
        
        <button
          onClick={loadQuote}
          disabled={loading}
          className="p-2 text-purple-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-all duration-200 disabled:opacity-50"
          title="Nueva frase"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Contenido de la frase */}
      {quote && (
        <div className="space-y-3">
          <blockquote className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed italic">
            "{quote.text}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <cite className="text-xs text-purple-600 dark:text-purple-400 font-medium not-italic">
              — {quote.author}
            </cite>
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(new Date())}
            </span>
          </div>

          {/* Tags de la frase */}
          {quote.tags && quote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {quote.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Indicador de carga */}
      {loading && quote && (
        <div className="mt-3 flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-purple-500 animate-spin" />
          <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
            Cargando nueva frase...
          </span>
        </div>
      )}
    </div>
  );
};

export default MotivationalQuote;
