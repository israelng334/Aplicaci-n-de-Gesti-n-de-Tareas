const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors, etc.)
server.use(middlewares);

// Add authentication middleware
server.db = router.db;
server.use(auth);

// Use default router
server.use(router);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 JSON Server is running on port ${PORT}`);
    console.log(`📊 Resources:`);
    console.log(`   http://localhost:${PORT}/users`);
    console.log(`   http://localhost:${PORT}/tasks`);
    console.log(`🔐 Authentication endpoints:`);
    console.log(`   POST http://localhost:${PORT}/login`);
    console.log(`   POST http://localhost:${PORT}/register`);
});