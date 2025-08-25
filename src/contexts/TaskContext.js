import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Crear el contexto de tareas
const TaskContext = createContext();

/**
 * Hook personalizado para usar el contexto de tareas
 */
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks debe ser usado dentro de un TaskProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de tareas
 */
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    priority: '',
  });

  /**
   * Carga las tareas desde la API
   */
  const loadTasks = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const tasksData = await apiService.getTasks(customFilters);
      setTasks(tasksData);
      
      return tasksData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea una nueva tarea
   */
  const createTask = async (taskData) => {
    try {
      setError(null);
      
      const newTask = await apiService.createTask({
        ...taskData,
        createdAt: new Date().toISOString(),
        status: taskData.status || 'pendiente',
      });
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      return newTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Actualiza una tarea existente
   */
  const updateTask = async (id, taskData) => {
    try {
      setError(null);
      
      const updatedTask = await apiService.updateTask(id, taskData);
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? updatedTask : task
        )
      );
      
      return updatedTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Elimina una tarea
   */
  const deleteTask = async (id) => {
    try {
      setError(null);
      
      await apiService.deleteTask(id);
      
      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== id)
      );
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Marca una tarea como completada
   */
  const completeTask = async (id) => {
    try {
      setError(null);
      
      const completedTask = await apiService.completeTask(id);
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? completedTask : task
        )
      );
      
      return completedTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Marca múltiples tareas como completadas
   */
  const completeMultipleTasks = async (taskIds) => {
    try {
      setError(null);
      
      const promises = taskIds.map(id => apiService.completeTask(id));
      const completedTasks = await Promise.all(promises);
      
      setTasks(prevTasks =>
        prevTasks.map(task => {
          const completedTask = completedTasks.find(ct => ct.id === task.id);
          return completedTask || task;
        })
      );
      
      return completedTasks;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Elimina múltiples tareas
   */
  const deleteMultipleTasks = async (taskIds) => {
    try {
      setError(null);
      
      const promises = taskIds.map(id => apiService.deleteTask(id));
      await Promise.all(promises);
      
      setTasks(prevTasks =>
        prevTasks.filter(task => !taskIds.includes(task.id))
      );
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Asigna una tarea a un usuario
   */
  const assignTask = async (id, userId) => {
    try {
      setError(null);
      
      const assignedTask = await apiService.assignTask(id, userId);
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? assignedTask : task
        )
      );
      
      return assignedTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Asigna una tarea a un equipo (por convención, assignedTo almacenará un objeto { teamId })
   */
  const assignTaskToTeam = async (id, teamId) => {
    try {
      setError(null);

      const assignedTask = await apiService.updateTask(id, { assignedTo: { teamId } });

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? assignedTask : task
        )
      );

      return assignedTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Actualiza los filtros y recarga las tareas
   */
  const updateFilters = async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await loadTasks(updatedFilters);
  };

  /**
   * Limpia los filtros
   */
  const clearFilters = async () => {
    const clearedFilters = {
      status: '',
      assignedTo: '',
      priority: '',
    };
    setFilters(clearedFilters);
    await loadTasks(clearedFilters);
  };

  /**
   * Obtiene estadísticas de las tareas
   */
  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'pendiente').length;
    const inProgress = tasks.filter(task => task.status === 'en_progreso').length;
    const completed = tasks.filter(task => task.status === 'completada').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  /**
   * Obtiene tareas por estado
   */
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  /**
   * Obtiene tareas asignadas a un usuario específico
   */
  const getTasksByUser = (userId) => {
    return tasks.filter(task => task.assignedTo === userId);
  };

  /**
   * Limpia los errores
   */
  const clearError = () => {
    setError(null);
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, []);

  // Valor del contexto
  const value = {
    tasks,
    loading,
    error,
    filters,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    completeMultipleTasks,
    deleteMultipleTasks,
    assignTask,
    assignTaskToTeam,
    updateFilters,
    clearFilters,
    getTaskStats,
    getTasksByStatus,
    getTasksByUser,
    clearError,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
