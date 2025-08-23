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
   git clone https://github.com/Bryannmmejia/Aplicaci-n-de-Gesti-n-de-Tareas.git
   cd Aplicaci-n-de-Gesti-n-de-Tareas
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
| `admin@taskflow.com` | `password123` | Administrador |
| `maria@taskflow.com` | `password123` | Usuario |
| `carlos@taskflow.com` | `password123` | Usuario |
| `ana@taskflow.com` | `password123` | Usuario |

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
App-Gestion-de-Tareas/
├── src/
│   ├── components/
│   │   ├── LoginForm.js          # Formulario de login
│   │   ├── TaskList.js           # Lista de tareas con filtros
│   │   ├── MotivationalQuote.js  # Componente de frases motivacionales
│   │   ├── PrivateRoute.js       # Protección de rutas
│   │   ├── ErrorBoundary.js      # Manejo de errores
│   │   ├── LoadingSpinner.js     # Componente de carga
│   │   └── ConnectionStatus.js   # Estado de conexión
│   ├── pages/
│   │   ├── LoginPage.js          # Página de login
│   │   └── Dashboard.js          # Dashboard principal
│   ├── contexts/
│   │   ├── AuthContext.js        # Contexto de autenticación
│   │   └── TaskContext.js        # Contexto de tareas
│   ├── services/
│   │   ├── api.js               # Servicio de API
│   │   └── quoteService.js      # Servicio de frases motivacionales
│   ├── App.js                   # Componente principal
│   ├── index.js                 # Punto de entrada
│   └── index.css                # Estilos globales
├── public/
├── db.json                      # Base de datos mock
├── package.json                 # Dependencias y scripts
├── tailwind.config.js           # Configuración de Tailwind
├── json-server.json             # Configuración del servidor mock
└── README.md                    # Documentación
```

## 🔧 Configuración

### Variables de entorno

No se requieren variables de entorno para el desarrollo local.

### Configuración del servidor

El servidor JSON está configurado en `json-server.json`:
- Puerto: 3001
- Middleware: json-server-auth
- Base de datos: db.json

## 📡 API Endpoints

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario
- `POST /logout` - Cerrar sesión
- `GET /profile` - Obtener perfil del usuario

### Usuarios
- `GET /users` - Listar usuarios
- `GET /users/:id` - Obtener usuario específico

### Tareas
- `GET /tasks` - Listar tareas (con filtros)
- `GET /tasks/:id` - Obtener tarea específica
- `POST /tasks` - Crear nueva tarea
- `PATCH /tasks/:id` - Actualizar tarea
- `DELETE /tasks/:id` - Eliminar tarea

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **React Router** - Enrutamiento
- **Tailwind CSS** - Framework de CSS
- **Lucide React** - Iconos
- **Context API** - Estado global

### Backend (Mock)
- **json-server** - Servidor REST mock
- **json-server-auth** - Autenticación JWT

### APIs Externas
- **Quotable API** - Frases motivacionales

## 📝 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Iniciar servidor JSON mock
npm run server
```

## 🐛 Solución de Problemas

Si encuentras problemas, consulta el archivo `TROUBLESHOOTING.md` que incluye:

- Errores comunes y soluciones
- Verificación de servidores
- Credenciales de prueba
- Estructura de archivos

### Problemas frecuentes

1. **Error 400 en login**: Asegúrate de que el servidor mock esté corriendo
2. **Pantalla en blanco**: Verifica que ambos servidores estén activos
3. **Errores de CORS**: El servidor mock debe estar en puerto 3001

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Bryann Mejía**
- GitHub: [@Bryannmmejia](https://github.com/Bryannmmejia)

## 🙏 Agradecimientos

- [json-server](https://github.com/typicode/json-server) por el servidor mock
- [json-server-auth](https://github.com/jeremyben/json-server-auth) por la autenticación
- [Quotable API](https://github.com/lukePeavey/quotable) por las frases motivacionales
- [Tailwind CSS](https://tailwindcss.com/) por el framework de CSS
- [Lucide](https://lucide.dev/) por los iconos

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
