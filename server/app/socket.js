
const { Server } = require('socket.io');
let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' } 
  });

  // Basic role-based rooms
  io.on('connection', (socket) => {
    
    socket.on('identify', ({ role, userId }) => {
      socket.data.role = role;
      socket.data.userId = userId;
      if (role === 'admin') socket.join('admins');
      if (role === 'recruiter') socket.join(`recruiter:${userId}`);
      if (role === 'seeker') socket.join(`seeker:${userId}`);
    });

    // Seeker feedback -> notify admins
    socket.on('feedback', async ({ userId, message }) => {
      if (!message) return;
      const { createNotification } = require('./services/notificationService');
      const notif = await createNotification({
        type: 'feedback',
        message,
        fromUser: userId,
        toRole: 'admin'
      });
      io.to('admins').emit('notification', notif);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };
