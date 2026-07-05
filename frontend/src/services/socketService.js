import { io } from 'socket.io-client';
import { getToken } from './storage';

const GAME_SERVER_URL = 'http://192.168.1.8:3000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Connect to game server
  async connect() {
    const token = await getToken();

    this.socket = io(GAME_SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to game server!');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    return this.socket;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 🏦 Room actions
  createRoom(vaultId) {
    this.socket?.emit('room:create', { vaultId });
  }

  joinRoom(roomCode) {
    this.socket?.emit('room:join', { roomCode });
  }

  quickMatch(vaultId) {
    this.socket?.emit('room:quickmatch', { vaultId });
  }

  leaveRoom() {
    this.socket?.emit('room:leave');
  }

  startGame() {
    this.socket?.emit('game:start');
  }

  // 🧩 Puzzle actions
  submitAnswer(puzzleId, answer) {
    this.socket?.emit('puzzle:submit', { puzzleId, answer });
  }

  // 💬 Chat actions
  sendMessage(message) {
    this.socket?.emit('chat:message', { message });
  }

  sendReaction(emoji) {
    this.socket?.emit('game:reaction', { emoji });
  }

  // 📡 Listen to events
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();