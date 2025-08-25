import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Bell,
  Plus,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import MotivationalQuote from '../components/MotivationalQuote';
import CreateTaskForm from '../components/CreateTaskForm';
import { useState as useReactState } from 'react';
import TeamManager from '../components/TeamManager';

/**
 * Componente principal del dashboard
 */
const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const { getTaskStats, loadTasks, tasks } = useTasks();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('all'); // 'all', 'my-tasks'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
  });
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  useEffect(() => {
    setSettingsForm({ name: user?.name || '', email: user?.email || '', password: '' });
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  // Estado de notificaciones
  const [showNotifications, setShowNotifications] = useState(false);
  const [latestAssignedTask, setLatestAssignedTask] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Manejar el tema oscuro
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Actualizar estadísticas cuando cambien las tareas
  useEffect(() => {
    const taskStats = getTaskStats();
    setStats(taskStats);
  }, [getTaskStats]);

  // Calcular la última tarea asignada al usuario y si hay notificación nueva
  useEffect(() => {
    if (!user) return;
    const assignedToUser = tasks
      .filter(t => t.assignedTo === user.id)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const latest = assignedToUser[0] || null;
    setLatestAssignedTask(latest || null);

    // Control del punto rojo (badge) por usuario
    const storageKey = `lastSeenNotification_user_${user.id}`;
    const lastSeenId = localStorage.getItem(storageKey);
    if (latest && String(latest.id) !== String(lastSeenId)) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [tasks, user]);

  /**
   * Cambia entre modo claro y oscuro
   */
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Obtiene el saludo según la hora del día
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  /**
   * Verifica si el usuario actual es admin
   */
  const isAdmin = user?.role === 'admin';

  /**
   * Maneja la apertura del formulario de nueva tarea
   */
  const handleOpenCreateTaskForm = () => {
    setShowCreateTaskForm(true);
  };

  /**
   * Maneja el cierre del formulario de nueva tarea
   */
  const handleCloseCreateTaskForm = () => {
    setShowCreateTaskForm(false);
  };

  /**
   * Maneja la creación exitosa de una tarea
   */
  const handleTaskCreated = async () => {
    try {
      // Recargar tareas y estadísticas
      await loadTasks();
      const taskStats = getTaskStats();
      setStats(taskStats);
    } catch (error) {
      console.error('Error al recargar tareas:', error);
    }
  };

  /**
   * Maneja el click del botón de notificaciones
   */
  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications && latestAssignedTask && user) {
      // Al abrir, marcar como vista la última notificación
      const storageKey = `lastSeenNotification_user_${user.id}`;
      localStorage.setItem(storageKey, String(latestAssignedTask.id));
      setHasNewNotification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar móvil overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:mr-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Task Flow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación del sidebar */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveView('all')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'all'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Todas las Tareas</span>
          </button>

          <button
            onClick={() => setActiveView('my-tasks')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'my-tasks'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span>Mis Tareas</span>
          </button>

          <button
            onClick={() => setActiveView('teams')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'teams'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Equipo</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </button>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
              alt={user?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        {/* Header principal */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Título y saludo */}
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeView === 'all' ? 'Gestionando todas las tareas' : 'Gestionando tus tareas'}
              </p>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-4">
              {/* Toggle de tema oscuro */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notificaciones */}
              <div className="relative">
                <button 
                  onClick={handleToggleNotifications}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors relative"
                  title="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                  {hasNewNotification && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Dropdown de notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Última tarea asignada</h4>
                      {!latestAssignedTask ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No tienes tareas asignadas recientemente.</p>
                      ) : (
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mt-1">
                            <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{latestAssignedTask.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{latestAssignedTask.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {latestAssignedTask.dueDate ? new Date(latestAssignedTask.dueDate).toLocaleDateString() : 'Sin fecha'}
                              </span>
                              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                                {latestAssignedTask.priority || 'media'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de nueva tarea - Solo visible para admin */}
              {isAdmin ? (
                <button 
                  onClick={handleOpenCreateTaskForm}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </button>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
                  Solo administradores pueden crear tareas
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido del dashboard */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tareas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de tareas o gestión de equipos */}
            {activeView === 'teams' ? (
              <div className="lg:col-span-2">
                {isAdmin ? (
                  <TeamManager />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestión de Equipos</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Solo los administradores pueden gestionar equipos.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="lg:col-span-2">
<TaskList showMyTasksOnly={activeView === 'my-tasks'} isAdmin={isAdmin} />
              </div>
            )}

            {/* Barra lateral derecha */}
            <div className="space-y-6">
              {/* Frase motivacional */}
              <MotivationalQuote />
              
              {/* Progreso general */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progreso General
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Completado</span>
                      <span className="text-gray-900 dark:text-white font-medium">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.pending}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-2xl font-bold text-success-600 dark:text-success-400">{stats.completed}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completadas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad reciente */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actividad Reciente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tarea completada: "Diseñar interfaz"
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nueva tarea asignada a María
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tarea vencida: "Configurar BD"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Formulario flotante para crear tareas */}
      <CreateTaskForm
        isOpen={showCreateTaskForm}
        onClose={handleCloseCreateTaskForm}
        onTaskCreated={handleTaskCreated}
      />

      {/* Modal de Configuración */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de la Cuenta</h3>
            <div className="space-y-4">
              {/* Avatar Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar</label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarPreview || user?.avatar}
                    alt={user?.name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const img = new Image();
                          img.onload = () => {
                            // Resize to square 128x128 to fit preview nicely
                            const canvas = document.createElement('canvas');
                            const size = 128;
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;
                            // cover: center-crop
                            const aspect = img.width / img.height;
                            let sx = 0, sy = 0, sw = img.width, sh = img.height;
                            if (aspect > 1) {
                              // wider than tall
                              sh = img.height;
                              sw = sh;
                              sx = (img.width - sw) / 2;
                            } else if (aspect < 1) {
                              // taller than wide
                              sw = img.width;
                              sh = sw;
                              sy = (img.height - sh) / 2;
                            }
                            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
                            const dataUrl = canvas.toDataURL('image/png');
                            setAvatarPreview(dataUrl);
                          };
                          if (typeof reader.result === 'string') {
                            img.src = reader.result;
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="block text-sm text-gray-700 dark:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sube una imagen cuadrada. Se ajustará automáticamente.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Dejar en blanco para no cambiar"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    const payload = { name: settingsForm.name, email: settingsForm.email };
                    if (settingsForm.password && settingsForm.password.trim().length > 0) {
                      payload.password = settingsForm.password;
                    }
                    if (avatarPreview) {
                      payload.avatar = avatarPreview;
                    }
                    await updateProfile(payload);
                    setShowSettings(false);
                  } catch (e) {
                    console.error('Error al actualizar perfil:', e);
                  }
                }}
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

export default Dashboard;
