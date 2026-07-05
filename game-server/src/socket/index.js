const jwt = require('jsonwebtoken');
const roomManager = require('../services/RoomManager');

function initSocket(io) {

  // 🔐 Auth middleware — verify JWT token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required!'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token!'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.user.username} (${socket.id})`);

    // ===========================
    // 🏦 ROOM EVENTS
    // ===========================

    // Create a new room
    socket.on('room:create', ({ vaultId }) => {
      const room = roomManager.createRoom(socket.user.sub);
      room.vaultId = vaultId;

      // Add host to room
      room.addPlayer({
        userId: socket.user.sub,
        username: socket.user.username,
        socketId: socket.id,
      });

      socket.join(room.roomCode);
      socket.currentRoom = room.roomCode;

      socket.emit('room:created', {
        roomCode: room.roomCode,
        room: room.getSummary(),
      });

      console.log(`🏦 Room ${room.roomCode} created by ${socket.user.username}`);
    });

    // Join existing room by code
    socket.on('room:join', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);

      if (!room) {
        socket.emit('room:error', { message: 'Room not found!' });
        return;
      }

      const result = room.addPlayer({
        userId: socket.user.sub,
        username: socket.user.username,
        socketId: socket.id,
      });

      if (!result.success) {
        socket.emit('room:error', { message: result.message });
        return;
      }

      socket.join(roomCode);
      socket.currentRoom = roomCode;

      // Notify everyone in room
      io.to(roomCode).emit('room:updated', {
        room: room.getSummary(),
        message: `${socket.user.username} joined the crew! 🎉`,
      });

      console.log(`👥 ${socket.user.username} joined room ${roomCode}`);
    });

    // Quick match — find or create room
    socket.on('room:quickmatch', ({ vaultId }) => {
      let room = roomManager.findAvailableRoom();

      if (!room) {
        // No available room — create new one
        room = roomManager.createRoom(socket.user.sub);
        room.vaultId = vaultId;
        console.log(`🎲 New room created for quick match: ${room.roomCode}`);
      }

      const result = room.addPlayer({
        userId: socket.user.sub,
        username: socket.user.username,
        socketId: socket.id,
      });

      if (!result.success) {
        socket.emit('room:error', { message: result.message });
        return;
      }

      socket.join(room.roomCode);
      socket.currentRoom = room.roomCode;

      io.to(room.roomCode).emit('room:updated', {
        room: room.getSummary(),
        message: `${socket.user.username} joined via quick match! 🎲`,
      });

      socket.emit('room:joined', {
        roomCode: room.roomCode,
        room: room.getSummary(),
      });
    });

    // Start game
    socket.on('game:start', () => {
      const roomCode = socket.currentRoom;
      const room = roomManager.getRoom(roomCode);

      if (!room) {
        socket.emit('room:error', { message: 'Room not found!' });
        return;
      }

      if (!room.canStart()) {
        socket.emit('room:error', { message: 'Need at least 2 players to start!' });
        return;
      }

      room.startGame(room.vaultId);

      io.to(roomCode).emit('game:started', {
        room: room.getSummary(),
        message: '🚀 Heist started! Crack the vault!',
        timeLimit: 600,
      });

      console.log(`🎮 Game started in room ${roomCode}`);
    });

    // ===========================
    // 🧩 PUZZLE EVENTS
    // ===========================

    // Submit puzzle answer
    socket.on('puzzle:submit', ({ puzzleId, answer }) => {
      const roomCode = socket.currentRoom;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      // Check answer (simple check — Spring Boot does real check)
      const correct = answer === 'B'; // Mock for now

      if (correct) {
        room.markPuzzleSolved(socket.user.sub);

        // Notify everyone
        io.to(roomCode).emit('puzzle:solved', {
          userId: socket.user.sub,
          username: socket.user.username,
          message: `${socket.user.username} cracked their puzzle! 🔓`,
          room: room.getSummary(),
        });

        // Check if all puzzles solved
        if (room.allPuzzlesSolved()) {
          room.endGame('SUCCESS');
          io.to(roomCode).emit('game:vault_cracked', {
            message: '🎉 VAULT CRACKED! Amazing teamwork!',
            xpEarned: 200,
          });
          roomManager.deleteRoom(roomCode);
        }
      } else {
        socket.emit('puzzle:wrong', {
          message: '❌ Wrong answer! Try again!',
        });
      }
    });

    // ===========================
    // 💬 CHAT EVENTS
    // ===========================

    // Send chat message
    socket.on('chat:message', ({ message }) => {
      const roomCode = socket.currentRoom;
      if (!roomCode) return;

      io.to(roomCode).emit('chat:message', {
        username: socket.user.username,
        message,
        timestamp: Date.now(),
      });
    });

    // Send reaction
    socket.on('game:reaction', ({ emoji }) => {
      const roomCode = socket.currentRoom;
      if (!roomCode) return;

      io.to(roomCode).emit('game:reaction', {
        username: socket.user.username,
        emoji,
        timestamp: Date.now(),
      });
    });

    // ===========================
    // 🚪 DISCONNECT EVENTS
    // ===========================

    socket.on('room:leave', () => {
      handleLeave(socket, io);
    });

    socket.on('disconnect', () => {
      handleLeave(socket, io);
      console.log(`❌ Player disconnected: ${socket.user?.username}`);
    });
  });
}

function handleLeave(socket, io) {
  const roomCode = socket.currentRoom;
  if (!roomCode) return;

  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  room.removePlayer(socket.user.sub);
  socket.leave(roomCode);
  socket.currentRoom = null;

  if (room.isEmpty()) {
    roomManager.deleteRoom(roomCode);
  } else {
    io.to(roomCode).emit('room:updated', {
      room: room.getSummary(),
      message: `${socket.user.username} left the room 👋`,
    });
  }
}

module.exports = { initSocket };