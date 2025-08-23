import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para listar tareas con filtros y acciones
 */
const TaskList = ({ showMyTasksOnly = false, className = '' }) => {
  const { tasks, loading, error, filters, updateFilters, clearFilters, completeTask, deleteTask } = useTasks();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Estados para filtros locales
  const [localFilters, setLocalFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
  });

  /**
   * Filtra las tareas según los criterios aplicados
   */
  useEffect(() => {
    let filtered = tasks;

    // Filtrar por tareas propias si es necesario
    if (showMyTasksOnly) {
      filtered = filtered.filter(task => task.assignedTo === user?.id);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros de estado
    if (localFilters.status) {
      filtered = filtered.filter(task => task.status === localFilters.status);
    }

    // Aplicar filtros de prioridad
    if (localFilters.priority) {
      filtered = filtered.filter(task => task.priority === localFilters.priority);
    }

    // Aplicar filtros de usuario asignado
    if (localFilters.assignedTo) {
      filtered = filtered.filter(task => task.assignedTo === parseInt(localFilters.assignedTo));
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, localFilters, showMyTasksOnly, user]);

  /**
   * Aplica los filtros a la API
   */
  const applyFilters = () => {
    updateFilters(localFilters);
  };

  /**
   * Limpia todos los filtros
   */
  const handleClearFilters = () => {
    setLocalFilters({
      status: '',
      priority: '',
      assignedTo: '',
    });
    setSearchTerm('');
    clearFilters();
  };

  /**
   * Obtiene el color del estado de la tarea
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'text-warning-600 bg-warning-50 dark:text-warning-400 dark:bg-warning-900/20';
      case 'en_progreso':
        return 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20';
      case 'completada':
        return 'text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  /**
   * Obtiene el icono del estado de la tarea
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'en_progreso':
        return <AlertCircle className="w-4 h-4" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  /**
   * Obtiene el color de la prioridad
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'text-danger-600 bg-danger-50 dark:text-danger-400 dark:bg-danger-900/20';
      case 'media':
        return 'text-warning-600 bg-warning-50 dark:text-warning-400 dark:bg-warning-900/20';
      case 'baja':
        return 'text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Vencida hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${diffDays} días`;
    }
  };

  /**
   * Maneja la completación de una tarea
   */
  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Error al completar tarea:', error);
    }
  };

  /**
   * Maneja la eliminación de una tarea
   */
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error al cargar las tareas: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft">
        <div className="flex flex-col space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Botón de filtros */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              {/* Filtro por prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <select
                  value={localFilters.priority}
                  onChange={(e) => setLocalFilters({ ...localFilters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              {/* Filtro por usuario asignado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asignado a
                </label>
                <select
                  value={localFilters.assignedTo}
                  onChange={(e) => setLocalFilters({ ...localFilters, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos los usuarios</option>
                  <option value={user?.id}>Mis tareas</option>
                  {/* Aquí se podrían agregar más usuarios dinámicamente */}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay tareas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || Object.values(localFilters).some(f => f) 
                ? 'No se encontraron tareas con los filtros aplicados'
                : 'No hay tareas disponibles'
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox para completar */}
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={task.status === 'completada'}
                  className={`mt-1 p-1 rounded transition-colors ${
                    task.status === 'completada'
                      ? 'text-success-500 bg-success-50 dark:bg-success-900/20'
                      : 'text-gray-400 hover:text-success-500 hover:bg-success-50 dark:hover:bg-success-900/20'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                {/* Contenido de la tarea */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${
                        task.status === 'completada' 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        task.status === 'completada' 
                          ? 'text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {task.description}
                      </p>
                    </div>

                    {/* Menú de acciones */}
                    <div className="relative ml-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadatos de la tarea */}
                  <div className="flex items-center space-x-3 mt-3">
                    {/* Estado */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </span>

                    {/* Prioridad */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      <span className="capitalize">{task.priority}</span>
                    </span>

                    {/* Fecha de vencimiento */}
                    {task.dueDate && (
                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}

                    {/* Usuario asignado */}
                    {task.assignedTo && (
                      <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3 mr-1" />
                        Usuario {task.assignedTo}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contador de tareas */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredTasks.length} de {tasks.length} tareas
      </div>
    </div>
  );
};

export default TaskList;
