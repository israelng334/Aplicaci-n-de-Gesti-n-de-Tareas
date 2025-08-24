const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

/**
 * Script de prueba para verificar el endpoint de registro
 */
async function testRegistration() {
  console.log('🧪 Probando endpoint de registro...\n');
  
  try {
    // Datos de prueba para el registro
    const testUserData = {
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };
    
    console.log('📝 Datos de prueba:', { ...testUserData, password: '[HIDDEN]' });
    
    // Intentar registrar el usuario
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });
    
    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registro exitoso:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error en el registro:', error);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose:');
    console.log('   npm run server');
  }
}

// Ejecutar la prueba
testRegistration();
