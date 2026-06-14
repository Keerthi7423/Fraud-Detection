const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'https://d49m8z8w0jzwy.cloudfront.net', 'http://d49m8z8w0jzwy.cloudfront.net'],
        methods: ['GET', 'POST']
      }
    });
    
    io.on('connection', (socket) => {
      console.log('Client connected to WebSocket:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
