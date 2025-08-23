// Script de prueba para verificar el login
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@taskflow.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso:', data);
    } else {
      console.log('❌ Error en login:', data);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
};

// Ejecutar la prueba
testLogin();
