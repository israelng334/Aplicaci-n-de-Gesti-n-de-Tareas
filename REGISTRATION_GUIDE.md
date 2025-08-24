# Guía de Registro de Usuarios - Task Flow

## Descripción

Se ha implementado un sistema completo de registro de usuarios que permite a nuevos usuarios crear cuentas en Task Flow. El sistema incluye validación de formularios, manejo de errores y integración con la base de datos existente.

## Características Implementadas

### ✅ Formulario de Registro
- **Campo Nombre**: Validación de longitud (2-50 caracteres)
- **Campo Email**: Validación de formato y unicidad
- **Campo Contraseña**: Mínimo 6 caracteres
- **Campo Confirmar Contraseña**: Validación de coincidencia
- **Validación en tiempo real**: Los errores se muestran mientras el usuario escribe

### ✅ Integración con Base de Datos
- Los nuevos usuarios se guardan en `db.json` con el mismo formato que los usuarios existentes
- **Rol por defecto**: Todos los nuevos usuarios se crean con rol `user`
- **Avatar automático**: Se genera un avatar aleatorio de Unsplash
- **ID automático**: El servidor asigna IDs únicos automáticamente

### ✅ Manejo de Errores
- **Email duplicado**: Detecta si el email ya está registrado
- **Errores de validación**: Muestra mensajes específicos para cada tipo de error
- **Errores de conexión**: Informa si hay problemas de red o servidor
- **Errores del servidor**: Captura y muestra errores específicos del backend

### ✅ Experiencia de Usuario
- **Diseño consistente**: Mantiene el mismo estilo visual que el formulario de login
- **Estados de carga**: Muestra indicadores durante el proceso de registro
- **Mensajes de éxito**: Confirma cuando la cuenta se crea exitosamente
- **Navegación fluida**: Permite cambiar entre login y registro fácilmente

## Estructura de Datos del Usuario

```json
{
  "id": 5,
  "email": "nuevo@usuario.com",
  "password": "$2a$10$...", // Hash bcrypt generado por json-server-auth
  "name": "Nuevo Usuario",
  "avatar": "https://images.unsplash.com/photo-1234567?w=150&h=150&fit=crop&crop=face",
  "role": "user"
}
```

## Flujo de Registro

1. **Usuario hace clic en "Regístrate aquí"** en el formulario de login
2. **Se muestra el formulario de registro** con campos requeridos
3. **Usuario completa el formulario** con sus datos
4. **Validación en tiempo real** verifica los datos ingresados
5. **Envío al servidor** usando el endpoint `/register`
6. **Creación en base de datos** con hash de contraseña seguro
7. **Redirección automática** al dashboard después del registro exitoso

## Endpoints Utilizados

- **POST /register**: Crea un nuevo usuario
- **POST /login**: Inicia sesión (después del registro)

## Tecnologías Utilizadas

- **Frontend**: React con hooks personalizados
- **Backend**: json-server con json-server-auth
- **Autenticación**: JWT tokens
- **Validación**: Validación del lado del cliente y servidor
- **Base de datos**: JSON file con estructura relacional

## Archivos Modificados/Creados

### Nuevos Archivos
- `src/components/RegistrationForm.js` - Formulario de registro
- `test-registration.js` - Script de prueba para el endpoint

### Archivos Modificados
- `src/pages/LoginPage.js` - Agregada lógica condicional para mostrar login/registro
- `src/components/LoginForm.js` - Mejorado el manejo de errores

### Archivos Existentes Utilizados
- `src/contexts/AuthContext.js` - Contexto de autenticación
- `src/services/api.js` - Servicio de API
- `server.js` - Servidor con endpoint de registro
- `db.json` - Base de datos de usuarios

## Cómo Probar

1. **Iniciar el servidor**:
   ```bash
   npm run server
   ```

2. **Iniciar la aplicación**:
   ```bash
   npm start
   ```

3. **Navegar a la página de login** y hacer clic en "Regístrate aquí"

4. **Completar el formulario** con datos válidos

5. **Verificar en db.json** que el usuario se haya creado correctamente

## Script de Prueba

Para probar el endpoint de registro directamente:

```bash
node test-registration.js
```

## Notas de Seguridad

- Las contraseñas se hashean usando bcrypt antes de guardarse
- Solo usuarios autenticados pueden acceder a recursos protegidos
- Los roles se asignan automáticamente (solo 'user' para nuevos registros)
- La validación se realiza tanto en el cliente como en el servidor

## Posibles Mejoras Futuras

- [ ] Verificación de email por correo electrónico
- [ ] Captcha para prevenir bots
- [ ] Requisitos de contraseña más estrictos
- [ ] Opción de registro con redes sociales
- [ ] Logs de auditoría para registros
- [ ] Límite de intentos de registro por IP
