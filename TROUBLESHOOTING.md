# Solución de Problemas - Task Flow

## Problema: Pantalla en blanco y errores

### 1. Verificar que ambos servidores estén ejecutándose

Asegúrate de tener **DOS terminales** abiertas:

**Terminal 1 - Servidor Mock (json-server):**
```bash
npm run server
```
Debería mostrar algo como:
```
  \{^_^}/ hi!

  Loading db.json
  Done

  Resources
  http://localhost:3001/users
  http://localhost:3001/tasks

  Home
  http://localhost:3001
```

**Terminal 2 - Servidor de Desarrollo (React):**
```bash
npm start
```
Debería abrir automáticamente http://localhost:3000

### 2. Verificar la consola del navegador

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si ves errores de CORS, asegúrate de que el servidor mock esté corriendo

### 3. Errores comunes y soluciones

#### Error: "Cannot connect to server"
- **Causa**: El servidor mock no está ejecutándose
- **Solución**: Ejecuta `npm run server` en una terminal separada

#### Error: "Module not found"
- **Causa**: Dependencias no instaladas
- **Solución**: Ejecuta `npm install`

#### Error: "Port 3000 is already in use"
- **Causa**: Otro proceso está usando el puerto
- **Solución**: 
  - Cierra otros procesos de React
  - O usa `npm start -- --port 3002`

#### Error: "Port 3001 is already in use"
- **Causa**: Otro proceso está usando el puerto del servidor mock
- **Solución**: 
  - Cierra otros procesos de json-server
  - O cambia el puerto en el script del package.json

### 4. Verificar archivos críticos

Asegúrate de que estos archivos existan:
- `db.json` (en la raíz del proyecto)
- `src/services/api.js`
- `src/contexts/AuthContext.js`
- `src/contexts/TaskContext.js`

### 5. Credenciales de prueba

Si la aplicación carga pero no puedes iniciar sesión, usa estas credenciales:

**Admin:**
- Email: `admin@taskflow.com`
- Password: `password123`

**Usuario:**
- Email: `maria@taskflow.com`
- Password: `password123`

### 6. Reiniciar completamente

Si nada funciona:

1. Cierra todas las terminales
2. Cierra el navegador
3. Abre una nueva terminal
4. Ejecuta `npm install`
5. Ejecuta `npm run server` en una terminal
6. Ejecuta `npm start` en otra terminal
7. Abre http://localhost:3000

### 7. Verificar estructura de carpetas

```
App-Gestion-de-Tareas/
├── src/
│   ├── components/
│   │   ├── LoginForm.js
│   │   ├── TaskList.js
│   │   ├── MotivationalQuote.js
│   │   ├── PrivateRoute.js
│   │   ├── ErrorBoundary.js
│   │   ├── LoadingSpinner.js
│   │   └── ConnectionStatus.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   └── Dashboard.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── TaskContext.js
│   ├── services/
│   │   ├── api.js
│   │   └── quoteService.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
├── db.json
├── package.json
└── tailwind.config.js
```

### 8. Contacto

Si sigues teniendo problemas:
1. Revisa la consola del navegador
2. Verifica que ambos servidores estén corriendo
3. Asegúrate de que no haya errores de sintaxis en los archivos
