import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Trash2,
  CheckSquare,
  Check,
  X,
  Edit,
  Square
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para listar tareas con filtros y acciones
 */
const TaskList = ({ showMyTasksOnly = false, className = '', isAdmin }) => {
  const { tasks, loading, error, updateFilters, clearFilters, completeTask, deleteTask, completeMultipleTasks, deleteMultipleTasks, updateTask } = useTasks();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  // Estado para confirmación de completado (primer click -> reloj, segundo click -> completa)
  const [confirmingTasks, setConfirmingTasks] = useState(new Set());
  
  // Estados para selección múltiple
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Estados para edición de tareas
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    dueDate: '',
    assignedTo: '',
    assignedToUsers: [],
    assignedToTeam: '',
    assignedToTeams: []
  });
  const [editOriginalTags, setEditOriginalTags] = useState([]);
  const [editAssignMode, setEditAssignMode] = useState('users'); // 'users' | 'team'
  const [editAssignedDropdownOpen, setEditAssignedDropdownOpen] = useState(false);
  const [editAssignedTeamsDropdownOpen, setEditAssignedTeamsDropdownOpen] = useState(false);
  const [editTagInput, setEditTagInput] = useState('');
  const getEditAssignedLabel = () => {
    const ids = editForm.assignedToUsers || [];
    if (!ids || ids.length === 0) return 'Selecciona usuarios';
    if (ids.length === 1) {
      const u = users.find(us => String(us.id) === String(ids[0]));
      return u ? u.name : '1 seleccionado';
    }
    return `${ids.length} seleccionados`;
  };
  const getEditAssignedTeamsLabel = () => {
    const ids = editForm.assignedToTeams || [];
    if (!ids || ids.length === 0) return 'Selecciona equipos';
    if (ids.length === 1) {
      const t = teams.find(tt => String(tt.id) === String(ids[0]));
      return t ? t.name : '1 seleccionado';
    }
    return `${ids.length} seleccionados`;
  };

  // Estado para el menú desplegable de acciones
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Estados para filtros locales
  const [localFilters, setLocalFilters] = useState({
    status: '',
    priority: '',
    assignedTo: [],
  });

  // Estados para usuarios y asignaciones
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [hoveredUserList, setHoveredUserList] = useState(null);
  const [clickedUserList, setClickedUserList] = useState(null);
  const [assignedFilterOpen, setAssignedFilterOpen] = useState(false);
  const getAssignedFilterLabel = () => {
    if (!localFilters.assignedTo || localFilters.assignedTo.length === 0) return 'Todos los usuarios';
    if (localFilters.assignedTo.length === 1) {
      const id = parseInt(localFilters.assignedTo[0]);
      if (id === user?.id) return 'Mis tareas';
      const u = users.find(us => us.id === id);
      return u ? u.name : '1 seleccionado';
    }
    return `${localFilters.assignedTo.length} seleccionados`;
  };

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

    // Aplicar filtros de usuario asignado (múltiple)
    if (localFilters.assignedTo && localFilters.assignedTo.length > 0) {
      const selected = new Set(localFilters.assignedTo.map(id => parseInt(id)));
      filtered = filtered.filter(task => {
        const assigned = task.assignedTo;
        if (!assigned) return false;
        if (typeof assigned === 'number') return selected.has(assigned);
        if (Array.isArray(assigned)) return assigned.some(id => selected.has(id));
        if (assigned && typeof assigned === 'object' && 'teamId' in assigned) {
          const team = teams.find(t => t.id === assigned.teamId);
          if (!team || !Array.isArray(team.memberIds)) return false;
          return team.memberIds.some(id => selected.has(id));
        }
        if (assigned && typeof assigned === 'object' && 'teamIds' in assigned) {
          // Cualquier equipo intersecta con usuarios seleccionados
          const ids = assigned.teamIds || [];
          const members = ids.flatMap(tid => {
            const t = teams.find(tt => tt.id === tid);
            return t?.memberIds || [];
          });
          return members.some(id => selected.has(id));
        }
        return false;
      });
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
      assignedTo: [],
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
   * Determina si el usuario puede completar la tarea
   */
  const canUserCompleteTask = (task) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const assigned = task.assignedTo;
    if (!assigned) return false;
    if (assigned && typeof assigned === 'object' && 'teamId' in assigned) {
      const team = teams.find(t => t.id === assigned.teamId);
      if (!team) return false;
      return Array.isArray(team.memberIds) && team.memberIds.includes(user.id);
    }
    if (Array.isArray(assigned)) return assigned.includes(user.id);
    return assigned === user.id;
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
        return 'text-warning-600 bg-warning-50 dark:text-warning-400 dark:bg-danger-900/20';
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
   * Maneja la selección de una tarea
   */
  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  };

  /**
   * Selecciona todas las tareas visibles
   */
  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  /**
   * Sale del modo de selección
   */
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTasks(new Set());
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
   * Maneja el flujo de doble click para completar: vacío -> reloj naranja -> check verde (completa)
   */
  const handleCompleteClick = async (task) => {
    if (task.status === 'completada') return;
    const isConfirming = confirmingTasks.has(task.id);
    if (!isConfirming) {
      try {
        await updateTask(task.id, { status: 'en_progreso' });
        setConfirmingTasks(prev => new Set(prev).add(task.id));
      } catch (e) {
        console.error('No se pudo poner en progreso la tarea:', e);
      }
      return;
    }
    try {
      await handleCompleteTask(task.id);
    } finally {
      setConfirmingTasks(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
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

  /**
   * Abre el formulario de edición para una tarea
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    let assignedToValue = '';
    let assignedToUsers = [];
    let assignedToTeam = '';
    let assignedToTeams = [];
    let mode = 'users';
    if (Array.isArray(task.assignedTo)) {
      assignedToUsers = task.assignedTo.map(id => String(id));
      mode = 'users';
    } else if (typeof task.assignedTo === 'number') {
      assignedToUsers = [String(task.assignedTo)];
      assignedToValue = `user:${task.assignedTo}`;
      mode = 'users';
    } else if (task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo.teamId) {
      assignedToTeam = String(task.assignedTo.teamId);
      assignedToValue = `team:${task.assignedTo.teamId}`;
      mode = 'team';
    } else if (task.assignedTo && typeof task.assignedTo === 'object' && Array.isArray(task.assignedTo.teamIds)) {
      assignedToTeams = task.assignedTo.teamIds.map(id => String(id));
      mode = 'team';
    }
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: assignedToValue,
      assignedToUsers,
      assignedToTeam,
      assignedToTeams,
      tags: Array.isArray(task.tags) ? task.tags : []
    });
    setEditAssignMode(mode);
    setEditTagInput('');
    setEditOriginalTags(Array.isArray(task.tags) ? task.tags : []);
  };

  /**
   * Guarda los cambios de la tarea editada
   */
  const handleSaveEdit = async () => {
    try {
      // Construir payload base sin tags; se agregarán solo si cambiaron
      const updatedTaskData = {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        status: editForm.status,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
      };

      // Determinar asignación según el modo (usuarios múltiples o equipo)
      const hasUsers = Array.isArray(editForm.assignedToUsers) && editForm.assignedToUsers.length > 0;
      const hasTeam = !!editForm.assignedToTeam || (Array.isArray(editForm.assignedToTeams) && editForm.assignedToTeams.length > 0);
      if (!hasUsers && !hasTeam) {
        // Sin cambios, mantener asignación actual
        updatedTaskData.assignedTo = editingTask.assignedTo;
      } else if (editAssignMode === 'team' && hasTeam) {
        if (Array.isArray(editForm.assignedToTeams) && editForm.assignedToTeams.length > 0) {
          updatedTaskData.assignedTo = { teamIds: editForm.assignedToTeams.map(v => parseInt(v)) };
        } else {
          updatedTaskData.assignedTo = { teamId: parseInt(editForm.assignedToTeam) };
        }
      } else if (editAssignMode === 'users' && hasUsers) {
        const ids = editForm.assignedToUsers.map(v => parseInt(v));
        updatedTaskData.assignedTo = ids.length === 1 ? ids[0] : ids;
      }

      // Incluir tags solo si el usuario los modificó
      const normalize = (arr) => (Array.isArray(arr) ? arr.map(String) : []);
      const currentTags = normalize(editForm.tags);
      const originalTags = normalize(editOriginalTags);
      const tagsChanged =
        currentTags.length !== originalTags.length ||
        currentTags.some((t) => !originalTags.includes(t)) ||
        originalTags.some((t) => !currentTags.includes(t));

      if (tagsChanged) {
        updatedTaskData.tags = currentTags;
      }

      await updateTask(editingTask.id, updatedTaskData);
      setEditingTask(null);
      setEditForm({
        title: '',
        description: '',
        priority: '',
        status: '',
        dueDate: '',
        assignedTo: '',
        assignedToUsers: [],
        assignedToTeam: '',
        assignedToTeams: []
      });
      setEditOriginalTags([]);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  /**
   * Cancela la edición de la tarea
   */
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({
      title: '',
      description: '',
      priority: '',
      status: '',
      dueDate: '',
      assignedTo: ''
    });
  };

  /**
   * Abre o cierra el menú de acciones para una tarea específica
   */
  const toggleActionMenu = (taskId) => {
    setOpenActionMenu(openActionMenu === taskId ? null : taskId);
  };

  /**
   * Cierra el menú de acciones
   */
  const closeActionMenu = () => {
    setOpenActionMenu(null);
  };

  /**
   * Carga la lista de usuarios
   */
  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  /**
   * Carga la lista de equipos
   */
  const loadTeams = async () => {
    try {
      const teamsData = await apiService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  /**
   * Obtiene los usuarios asignados a una tarea
   */
  const getAssignedUsers = (task) => {
    if (!task.assignedTo) return [];
    // Equipo
    if (typeof task.assignedTo === 'object' && task.assignedTo.teamId) {
      const team = teams.find(t => t.id === task.assignedTo.teamId);
      if (!team || !Array.isArray(team.memberIds)) return [];
      return users.filter(u => team.memberIds.includes(u.id));
    }
    // Múltiples equipos
    if (typeof task.assignedTo === 'object' && task.assignedTo.teamIds) {
      const ids = task.assignedTo.teamIds || [];
      const members = new Set(ids.flatMap(tid => {
        const t = teams.find(tt => tt.id === tid);
        return t?.memberIds || [];
      }));
      return users.filter(u => members.has(u.id));
    }
    // Array de usuarios
    if (Array.isArray(task.assignedTo)) {
      return users.filter(user => task.assignedTo.includes(user.id));
    }
    // Usuario único
    if (typeof task.assignedTo === 'number') {
      const user = users.find(u => u.id === task.assignedTo);
      return user ? [user] : [];
    }
    return [];
  };

  /**
   * Maneja el hover sobre la lista de usuarios
   */
  const handleUserListHover = (taskId) => {
    setHoveredUserList(taskId);
  };

  /**
   * Maneja el click en la lista de usuarios
   */
  const handleUserListClick = (taskId) => {
    setClickedUserList(clickedUserList === taskId ? null : taskId);
  };

  /**
   * Maneja la salida del hover de la lista de usuarios
   */
  const handleUserListLeave = () => {
    if (!clickedUserList) {
      setHoveredUserList(null);
    }
  };

  /**
   * Maneja la completación masiva de tareas
   */
  const handleBulkComplete = async () => {
    const allowed = Array.from(selectedTasks)
      .map(id => filteredTasks.find(t => t.id === id))
      .filter(task => task && canUserCompleteTask(task) && task.status !== 'completada')
      .map(task => task.id);

    if (allowed.length === 0) {
      alert('No tienes permisos para completar las tareas seleccionadas.');
      return;
    }

    if (window.confirm(`¿Marcar ${allowed.length} tarea${allowed.length !== 1 ? 's' : ''} como completada${allowed.length !== 1 ? 's' : ''}?`)) {
      try {
        await completeMultipleTasks(allowed);
        setSelectedTasks(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Error al completar tareas:', error);
      }
    }
  };

  /**
   * Maneja el cambio masivo de estado a "en_progreso"
   */
  const handleBulkInProgress = async () => {
    const allowedTasks = Array.from(selectedTasks)
      .map(id => filteredTasks.find(t => t.id === id))
      .filter(task => task && canUserCompleteTask(task) && task.status !== 'completada' && task.status !== 'en_progreso');

    if (allowedTasks.length === 0) {
      alert('No tienes permisos o ya están en progreso/completadas las tareas seleccionadas.');
      return;
    }

    if (window.confirm(`¿Marcar ${allowedTasks.length} tarea${allowedTasks.length !== 1 ? 's' : ''} como en progreso?`)) {
      try {
        await Promise.all(allowedTasks.map(task => updateTask(task.id, { status: 'en_progreso' })));
        // Mostrar el estado de confirmación (reloj) en los botones individuales
        setConfirmingTasks(prev => {
          const next = new Set(prev);
          allowedTasks.forEach(task => next.add(task.id));
          return next;
        });
        setSelectedTasks(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Error al cambiar tareas a en progreso:', error);
      }
    }
  };

  /**
   * Maneja la eliminación masiva de tareas
   */
  const handleBulkDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedTasks.size} tarea${selectedTasks.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteMultipleTasks(Array.from(selectedTasks));
        setSelectedTasks(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Error al eliminar tareas:', error);
      }
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
    loadTeams();
  }, []);

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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              {/* Botón de selección múltiple */}
              {filteredTasks.length > 0 && (
                <button
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isSelectionMode
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Seleccionar</span>
                </button>
              )}
            </div>

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

              {/* Filtro por usuario asignado (dropdown con checkboxes) */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asignado a
                </label>
                <button
                  type="button"
                  onClick={() => setAssignedFilterOpen(prev => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <span className="text-sm">{getAssignedFilterLabel()}</span>
                  <svg className={`w-4 h-4 transform transition-transform ${assignedFilterOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </button>
                {assignedFilterOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={localFilters.assignedTo.includes(String(user?.id))}
                        onChange={() => {
                          const id = String(user?.id);
                          setLocalFilters(prev => {
                            const selected = new Set(prev.assignedTo.map(String));
                            if (selected.has(id)) selected.delete(id); else selected.add(id);
                            return { ...prev, assignedTo: Array.from(selected) };
                          });
                        }}
                      />
                      Mis tareas
                    </label>
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={localFilters.assignedTo.includes(String(u.id))}
                          onChange={() => {
                            setLocalFilters(prev => {
                              const selected = new Set(prev.assignedTo.map(String));
                              const id = String(u.id);
                              if (selected.has(id)) selected.delete(id); else selected.add(id);
                              return { ...prev, assignedTo: Array.from(selected) };
                            });
                          }}
                        />
                        {u.name}
                      </label>
                    ))}
                    <div className="flex items-center justify-end mt-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAssignedFilterOpen(false)}
                        className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de acciones masivas */}
      {isSelectionMode && selectedTasks.size > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {selectedTasks.size} tarea{selectedTasks.size !== 1 ? 's' : ''} seleccionada{selectedTasks.size !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Selector de equipo para asignación masiva */}
              {isAdmin && teams.length > 0 && (
                <div className="flex items-center space-x-2 mr-2">
                  <select
                    onChange={async (e) => {
                      const teamId = parseInt(e.target.value);
                      if (!teamId) return;
                      const allowed = Array.from(selectedTasks)
                        .map(id => filteredTasks.find(t => t.id === id))
                        .filter(task => task && canUserCompleteTask(task));
                      if (allowed.length === 0) {
                        alert('No tienes permisos para asignar las tareas seleccionadas.');
                        return;
                      }
                      if (window.confirm(`¿Asignar ${allowed.length} tarea${allowed.length !== 1 ? 's' : ''} al equipo seleccionado?`)) {
                        try {
                          await Promise.all(allowed.map(task => updateTask(task.id, { assignedTo: { teamId } })));
                          setSelectedTasks(new Set());
                          setIsSelectionMode(false);
                        } catch (err) {
                          console.error('Error al asignar tareas al equipo:', err);
                        }
                      }
                      e.target.selectedIndex = 0;
                    }}
                    className="px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue=""
                  >
                    <option value="" disabled>Asignar a equipo…</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleBulkInProgress}
                className="inline-flex items-center px-3 py-2 bg-warning-500 hover:bg-warning-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4 mr-2" />
                Marcar en progreso
              </button>
              <button
                onClick={handleBulkComplete}
                className="inline-flex items-center px-3 py-2 bg-success-500 hover:bg-success-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar como completadas
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
              
              <button
                onClick={exitSelectionMode}
                className="inline-flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
          <>
            {/* Header de selección */}
            {isSelectionMode && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTasks.size === filteredTasks.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Seleccionar todas ({selectedTasks.size}/{filteredTasks.length})
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tareas */}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border transition-all ${
                  isSelectionMode && selectedTasks.has(task.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox de selección múltiple */}
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task.id)}
                      onChange={() => handleTaskSelection(task.id)}
                      className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  )}

                  {/* Checkbox para completar con confirmación en dos pasos */}
                  {!isSelectionMode && (
                    canUserCompleteTask(task) ? (
                      <button
                        onClick={() => handleCompleteClick(task)}
                        disabled={task.status === 'completada'}
                        className={`mt-1 p-1 rounded transition-colors ${
                          task.status === 'completada'
                            ? 'text-success-500 bg-success-50 dark:bg-success-900/20'
                            : confirmingTasks.has(task.id)
                              ? 'text-warning-600 bg-warning-50 hover:bg-warning-100 dark:text-warning-400 dark:bg-warning-900/20'
                              : 'text-gray-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20'
                        }`}
                        title={
                          task.status === 'completada'
                            ? 'Tarea ya completada'
                            : confirmingTasks.has(task.id)
                              ? 'Confirmar para completar'
                              : 'Click para preparar completado'
                        }
                      >
                        {task.status === 'completada' ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : confirmingTasks.has(task.id) ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <div
                        className={`mt-1 p-1 rounded cursor-not-allowed ${
                          task.status === 'completada'
                            ? 'text-success-500 bg-success-50 dark:bg-success-900/20'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        title="Solo el asignado o un admin pueden completar"
                      >
                        {task.status === 'completada' ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </div>
                    )
                  )}

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
                      {!isSelectionMode && (
                        <div className="relative ml-2">
                          <button 
                            onClick={() => toggleActionMenu(task.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                            title="Más acciones"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Menú desplegable de acciones */}
                          {openActionMenu === task.id && (
                            <>
                              {/* Overlay para cerrar el menú al hacer clic fuera */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={closeActionMenu}
                              />
                              
                              {/* Menú desplegable */}
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                                {isAdmin && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleEditTask(task);
                                        closeActionMenu();
                                      }}
                                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                                    >
                                      <Edit className="w-4 h-4 text-blue-500" />
                                      <span>Editar tarea</span>
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        handleDeleteTask(task.id);
                                        closeActionMenu();
                                      }}
                                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Eliminar tarea</span>
                                    </button>
                                  </>
                                )}
                                
                                {!isAdmin && (
                                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    Solo administradores pueden editar tareas
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
                        <div className="relative">
                          <button
                            onClick={() => handleUserListClick(task.id)}
                            onMouseEnter={() => handleUserListHover(task.id)}
                            onMouseLeave={handleUserListLeave}
                            className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                          >
                            <User className="w-3 h-3 mr-1" />
                            {getAssignedUsers(task).length} usuario{getAssignedUsers(task).length !== 1 ? 's' : ''}
                          </button>
                          
                          {/* Lista de usuarios asignados */}
                          {(hoveredUserList === task.id || clickedUserList === task.id) && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-500 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                              <div className="p-2">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">
                                  Usuarios asignados:
                                </h4>
                                <div className="space-y-1">
                                  {getAssignedUsers(task).map((assignedUser) => (
                                    <div
                                      key={assignedUser.id}
                                      className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >

                                      <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {assignedUser.name}
                                      </span>
                                      {assignedUser.role === 'admin' && (
                                        <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/20 px-1 rounded">
                                          Admin
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
            ))}
          </>
        )}
      </div>

      {/* Contador de tareas */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredTasks.length} de {tasks.length} tareas
      </div>

      {/* Modal de edición de tarea */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Editar Tarea
            </h3>
            
            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tags (crear con Enter) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const next = (editTagInput || '').trim();
                        if (!next) return;
                        const currentTags = Array.isArray(editForm.tags) ? editForm.tags : [];
                        if (currentTags.includes(next)) { setEditTagInput(''); return; }
                        setEditForm(prev => ({ ...prev, tags: [...currentTags, next] }));
                        setEditTagInput('');
                      }
                    }}
                    placeholder="Escribe y presiona Enter"
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {Array.isArray(editForm.tags) && editForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editForm.tags.map((t, idx) => (
                      <span key={`${t}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        {t}
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, tags: (prev.tags || []).filter(tag => tag !== t) }))}
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

              {/* Asignado a (múltiples usuarios o equipo, como en Nueva Tarea) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asignado a
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="editAssignMode"
                      value="users"
                      checked={editAssignMode === 'users'}
                      onChange={() => setEditAssignMode('users')}
                    />
                    Usuarios
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="editAssignMode"
                      value="team"
                      checked={editAssignMode === 'team'}
                      onChange={() => setEditAssignMode('team')}
                    />
                    Equipo
                  </label>
                </div>
                {editAssignMode === 'users' ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEditAssignedDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <span className="text-sm">{getEditAssignedLabel()}</span>
                      <svg className={`w-4 h-4 transform transition-transform ${editAssignedDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                    </button>
                    {editAssignedDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                        {users.map(u => (
                          <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={editForm.assignedToUsers.includes(String(u.id))}
                              onChange={() => {
                                setEditForm(prev => {
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
                            onClick={() => setEditAssignedDropdownOpen(false)}
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
                      onClick={() => setEditAssignedTeamsDropdownOpen(prev => !prev)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <span className="text-sm">{getEditAssignedTeamsLabel()}</span>
                      <svg className={`w-4 h-4 transform transition-transform ${editAssignedTeamsDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                    </button>
                    {editAssignedTeamsDropdownOpen && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                        {teams.map(team => (
                          <label key={team.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={editForm.assignedToTeams.includes(String(team.id))}
                              onChange={() => {
                                setEditForm(prev => {
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
                            onClick={() => setEditAssignedTeamsDropdownOpen(false)}
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

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;