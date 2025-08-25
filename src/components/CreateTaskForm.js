import React, { useState, useEffect } from 'react';
import { X, Plus, User, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import apiService from '../services/api';

/**
 * Componente de formulario flotante para crear nuevas tareas
 */
const CreateTaskForm = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const { createTask } = useTasks();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignedTo: '',
    dueDate: '',
    tags: []
  });
  const [success, setSuccess] = useState(false);

  // Cargar usuarios disponibles
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await apiService.getUsers();
        // Filtrar solo usuarios que no sean admin
        const nonAdminUsers = usersData.filter(u => u.role !== 'admin');
        setUsers(nonAdminUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'media',
        assignedTo: '',
        dueDate: '',
        tags: []
      });
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  // Verificar que solo los admin puedan crear tareas
  if (!user || user.role !== 'admin') {
    return null;
  }

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.assignedTo) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const newTask = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        assignedTo: parseInt(formData.assignedTo),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        tags: formData.tags.length > 0 ? formData.tags : ['general'],
        status: 'pendiente',
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      await createTask(newTask);
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Esperar un momento antes de cerrar
      setTimeout(() => {
        onClose();
        if (onTaskCreated) {
          onTaskCreated();
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra el formulario
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay de fondo */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
        onClick={handleClose}
      >
        {/* Formulario */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del formulario */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nueva Tarea
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido del formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✅ Tarea creada exitosamente
                </p>
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título de la Tarea *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Implementar nueva funcionalidad"
                  required
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Describe detalladamente la tarea a realizar..."
                required
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            {/* Usuario asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asignar a *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                  required
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTaskForm;
