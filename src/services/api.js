// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001';

/**
 * Clase para manejar todas las operaciones de la API
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Actualiza el token de autenticación
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  /**
   * Elimina el token de autenticación
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  /**
   * Realiza una petición HTTP con headers de autenticación
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en petición API:', error);
      
      // Manejar errores de red específicamente
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor. Asegúrate de que el servidor esté ejecutándose en http://localhost:3001');
      }
      
      throw error;
    }
  }

  // ===== AUTENTICACIÓN =====

  /**
   * Inicia sesión del usuario
   */
  async login(email, password) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
    }

    return response;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData) {
    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
    }

    return response;
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Error al cerrar sesión:', error);
    } finally {
      this.clearToken();
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile() {
    return await this.request('/profile');
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  async updateProfile(profileData) {
    return await this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Actualiza un usuario por ID
   */
  async updateUser(id, data) {
    return await this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ===== USUARIOS =====

  /**
   * Obtiene todos los usuarios
   */
  async getUsers() {
    return await this.request('/users');
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUser(id) {
    return await this.request(`/users/${id}`);
  }

  // ===== TAREAS =====

  /**
   * Obtiene todas las tareas
   */
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    if (filters.priority) queryParams.append('priority', filters.priority);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    
    return await this.request(endpoint);
  }

  /**
   * Obtiene una tarea por ID
   */
  async getTask(id) {
    return await this.request(`/tasks/${id}`);
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(taskData) {
    return await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(id, taskData) {
    return await this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    });
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(id) {
    return await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Marca una tarea como completada
   */
  async completeTask(id) {
    return await this.updateTask(id, {
      status: 'completada',
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Asigna una tarea a un usuario
   */
  async assignTask(id, userId) {
    return await this.updateTask(id, {
      assignedTo: userId,
    });
  }

  // ===== EQUIPOS =====

  /**
   * Obtiene todos los equipos
   */
  async getTeams() {
    return await this.request('/teams');
  }

  /**
   * Crea un nuevo equipo
   */
  async createTeam(teamData) {
    return await this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  /**
   * Actualiza un equipo existente
   */
  async updateTeam(id, teamData) {
    return await this.request(`/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(teamData),
    });
  }

  /**
   * Elimina un equipo
   */
  async deleteTeam(id) {
    return await this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }
}

// Exportamos una instancia única del servicio
export const apiService = new ApiService();
export default apiService;
