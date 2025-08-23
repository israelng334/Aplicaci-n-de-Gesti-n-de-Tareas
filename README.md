# Task Flow - Gestor de Tareas en Grupo

Una aplicación moderna y elegante para gestionar tareas en equipo, construida con React, Tailwind CSS y json-server-auth.

![Task Flow Dashboard](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)
![JSON Server](https://img.shields.io/badge/JSON_Server-0.17.3-green?style=for-the-badge)

## ✨ Características

- 🔐 **Autenticación JWT** con json-server-auth
- 📋 **CRUD completo de tareas** (crear, editar, completar, eliminar)
- 👥 **Asignación de tareas** a usuarios del equipo
- 🔍 **Filtros avanzados** por estado, prioridad y usuario
- 💬 **Frases motivacionales** integradas con API Quotable
- 🌙 **Modo oscuro/claro** con persistencia
- 📱 **Diseño responsive** para todos los dispositivos
- ⚡ **Interfaz moderna** con animaciones suaves
- 📊 **Dashboard con estadísticas** en tiempo real

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd task-flow
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   # Terminal 1: Servidor JSON (API)
   npm run server
   
   # Terminal 2: Aplicación React
   npm start
   ```

4. **Abre tu navegador**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## 🎯 Uso

### Credenciales de prueba

La aplicación incluye usuarios de demostración preconfigurados:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@taskflow.com` | `password` | Administrador |
| `maria@taskflow.com` | `password` | Usuario |
| `carlos@taskflow.com` | `password` | Usuario |
| `ana@taskflow.com` | `password` | Usuario |

### Funcionalidades principales

#### 🔐 Autenticación
- Inicia sesión con las credenciales de prueba
- El token JWT se almacena automáticamente
- Sesión persistente entre recargas

#### 📋 Gestión de Tareas
- **Crear tareas**: Usa el botón "Nueva Tarea"
- **Editar tareas**: Haz clic en el menú de cada tarea
- **Completar tareas**: Marca el checkbox de la tarea
- **Eliminar tareas**: Usa la opción de eliminar del menú

#### 🔍 Filtros y Búsqueda
- **Búsqueda por texto**: Encuentra tareas por título o descripción
- **Filtro por estado**: Pendiente, En progreso, Completada
- **Filtro por prioridad**: Alta, Media, Baja
- **Filtro por usuario**: Ver solo tus tareas o todas

#### 👥 Asignación de Tareas
- Asigna tareas a cualquier usuario del equipo
- Cambia la asignación en cualquier momento
- Visualiza quién está trabajando en qué

#### 🌙 Modo Oscuro
- Toggle automático entre modo claro y oscuro
- Preferencia guardada en localStorage
- Transiciones suaves entre modos

## 🏗️ Estructura del Proyecto

```
task-flow/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LoginForm.js          # Formulario de autenticación
│   │   ├── TaskList.js           # Lista de tareas con filtros
│   │   ├── MotivationalQuote.js  # Componente de frases motivacionales
│   │   └── PrivateRoute.js       # Protección de rutas
│   ├── contexts/
│   │   ├── AuthContext.js        # Contexto de autenticación
│   │   └── TaskContext.js        # Contexto de tareas
│   ├── pages/
│   │   ├── LoginPage.js          # Página de login
│   │   └── Dashboard.js          # Dashboard principal
│   ├── services/
│   │   ├── api.js               # Servicio de API
│   │   └── quoteService.js      # Servicio de frases motivacionales
│   ├── App.js                   # Componente principal
│   ├── App.css                  # Estilos globales
│   └── index.js                 # Punto de entrada
├── db.json                      # Base de datos JSON
├── package.json                 # Dependencias y scripts
├── tailwind.config.js          # Configuración de Tailwind
└── README.md                   # Este archivo
```

## 🔧 Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_QUOTE_API_URL=https://api.quotable.io
```

### Personalización de colores

Edita `tailwind.config.js` para personalizar el esquema de colores:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        // ... más colores
      }
    }
  }
}
```

## 📊 API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario
- `POST /logout` - Cerrar sesión
- `GET /profile` - Obtener perfil del usuario

### Tareas
- `GET /tasks` - Obtener todas las tareas
- `GET /tasks/:id` - Obtener tarea específica
- `POST /tasks` - Crear nueva tarea
- `PATCH /tasks/:id` - Actualizar tarea
- `DELETE /tasks/:id` - Eliminar tarea

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `GET /users/:id` - Obtener usuario específico

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Tailwind CSS** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **React Router** - Enrutamiento de la aplicación

### Backend (Mock)
- **json-server** - API REST simulada
- **json-server-auth** - Autenticación JWT
- **Quotable API** - Frases motivacionales

### Herramientas de Desarrollo
- **Create React App** - Configuración inicial
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start          # Inicia la aplicación React
npm run server     # Inicia el servidor JSON

# Producción
npm run build      # Construye la aplicación para producción

# Testing
npm test           # Ejecuta las pruebas
npm run eject      # Expone la configuración de CRA
```

## 🐛 Solución de Problemas

### Error de conexión a la API
```bash
# Verifica que el servidor JSON esté corriendo
npm run server

# Verifica el puerto 3001
curl http://localhost:3001/tasks
```

### Error de autenticación
```bash
# Limpia el localStorage
localStorage.clear()

# Usa las credenciales de prueba
admin@taskflow.com / password
```

### Problemas de dependencias
```bash
# Limpia la caché de npm
npm cache clean --force

# Reinstala las dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [Quotable API](https://github.com/lukePeavey/quotable) por las frases motivacionales
- [Lucide](https://lucide.dev/) por los iconos hermosos
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [json-server](https://github.com/typicode/json-server) por la API mock

## 📞 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Busca en los [Issues](https://github.com/tu-usuario/task-flow/issues)
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta gestionando tus tareas con Task Flow! 🎉**
