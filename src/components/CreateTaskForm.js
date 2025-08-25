import React, { useState, useEffect } from 'react';
import { X, Plus, User, FileText, AlertTriangle, Calendar, Users } from 'lucide-react';
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
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignedToUsers: [],
    assignedToTeams: [],
    dueDate: '',
    tags: []
  });
  const [assignMode, setAssignMode] = useState('users'); // 'users' | 'team'
  const [assignedDropdownOpen, setAssignedDropdownOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const getAssignedLabel = () => {
    const ids = formData.assignedToUsers || [];
    if (!ids || ids.length === 0) return 'Selecciona usuarios';
    if (ids.length === 1) {
      const u = users.find(us => String(us.id) === String(ids[0]));
      return u ? u.name : '1 seleccionado';
    }
    return `${ids.length} seleccionados`;
  };
  const [success, setSuccess] = useState(false);

  // Cargar usuarios y equipos disponibles
  useEffect(() => {
    const loadUsersAndTeams = async () => {
      try {
        const usersData = await apiService.getUsers();
        // Filtrar solo usuarios que no sean admin
        const nonAdminUsers = usersData.filter(u => u.role !== 'admin');
        setUsers(nonAdminUsers);
        const teamsData = await apiService.getTeams();
        setTeams(teamsData || []);
      } catch (error) {
        console.error('Error al cargar usuarios/equipos:', error);
      }
    };

    if (isOpen) {
      loadUsersAndTeams();
    }
  }, [isOpen]);

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'media',
        assignedToUsers: [],
        assignedToTeams: [],
        dueDate: '',
        tags: []
      });
      setAssignMode('users');
      setError('');
      setSuccess(false);
      setTagInput('');
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
    
    const hasUsers = Array.isArray(formData.assignedToUsers) && formData.assignedToUsers.length > 0;
    const hasTeams = Array.isArray(formData.assignedToTeams) && formData.assignedToTeams.length > 0;
    if (!formData.title.trim() || !formData.description.trim() || (!hasUsers && !hasTeams)) {
      setError('Por favor selecciona uno o más usuarios o un equipo');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // assignedTo puede ser equipo o múltiples usuarios
      let assignedTo;
      if (assignMode === 'team' && formData.assignedToTeams.length > 0) {
        assignedTo = { teamIds: formData.assignedToTeams.map(v => parseInt(v)) };
      } else if (assignMode === 'users' && formData.assignedToUsers.length > 0) {
        assignedTo = formData.assignedToUsers.map(v => parseInt(v));
      }

      const newTask = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        assignedTo,
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

            {/* Asignación: múltiples usuarios o equipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asignar a *
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="assignMode"
                      value="users"
                      checked={assignMode === 'users'}
                      onChange={() => setAssignMode('users')}
                    />
                    Usuarios
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="assignMode"
                      value="team"
                      checked={assignMode === 'team'}
                      onChange={() => setAssignMode('team')}
                    />
                    Equipo
                  </label>
                </div>

                {assignMode === 'users' ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAssignedDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <span className="text-sm">{getAssignedLabel()}</span>
                      <svg className={`w-4 h-4 transform transition-transform ${assignedDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                    </button>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    {assignedDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                        {users.map(u => (
                          <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={formData.assignedToUsers.includes(String(u.id))}
                              onChange={() => {
                                setFormData(prev => {
                                  const selected = new Set((prev.assignedToUsers || []).map(String));
                                  const id = String(u.id);
                                  if (selected.has(id)) selected.delete(id); else selected.add(id);
                                  return { ...prev, assignedToUsers: Array.from(selected) };
                                });
                              }}
                            />
                            {u.name}
                          </label>
                        ))}
                        <div className="flex items-center justify-end mt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAssignedDropdownOpen(false)}
                            className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
                          >
                            Listo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAssignedDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <span className="text-sm">{formData.assignedToTeams.length === 0 ? 'Selecciona equipos' : `${formData.assignedToTeams.length} equipos seleccionados`}</span>
                      <svg className={`w-4 h-4 transform transition-transform ${assignedDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                    </button>
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    {assignedDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                        {teams.map(team => (
                          <label key={team.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={formData.assignedToTeams.includes(String(team.id))}
                              onChange={() => {
                                setFormData(prev => {
                                  const selected = new Set((prev.assignedToTeams || []).map(String));
                                  const id = String(team.id);
                                  if (selected.has(id)) selected.delete(id); else selected.add(id);
                                  return { ...prev, assignedToTeams: Array.from(selected) };
                                });
                              }}
                            />
                            {team.name}
                          </label>
                        ))}
                        <div className="flex items-center justify-end mt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAssignedDropdownOpen(false)}
                            className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
                          >
                            Listo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

            {/* Tags (crear con Enter) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const next = (tagInput || '').trim();
                      if (!next) return;
                      if (formData.tags.includes(next)) { setTagInput(''); return; }
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, next] }));
                      setTagInput('');
                    }
                  }}
                  placeholder="Escribe y presiona Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((t, idx) => (
                    <span key={`${t}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {t}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }))}
                        className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={`Eliminar ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
