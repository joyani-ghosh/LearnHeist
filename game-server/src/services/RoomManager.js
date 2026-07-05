// 🏦 RoomManager — manages all active game rooms

class Room {
  constructor(roomCode, hostId) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.players = [];
    this.status = 'WAITING'; // WAITING, PLAYING, FINISHED
    this.vaultId = null;
    this.createdAt = Date.now();
  }

  // Add player to room
  addPlayer(player) {
    if (this.players.length >= 4) {
      return { success: false, message: 'Room is full! Max 4 players!' };
    }
    if (this.status !== 'WAITING') {
      return { success: false, message: 'Game already started!' };
    }
    if (this.players.find(p => p.userId === player.userId)) {
      return { success: false, message: 'Already in this room!' };
    }

    // Assign role based on position
    const roles = ['HACKER', 'ANALYST', 'PLANNER', 'ENGINEER'];
    const roleEmojis = ['🧠', '🔍', '🗺️', '🔧'];
    const roleIndex = this.players.length;

    this.players.push({
      ...player,
      role: roles[roleIndex],
      roleEmoji: roleEmojis[roleIndex],
      isHost: this.players.length === 0,
      puzzleSolved: false,
      joinedAt: Date.now(),
    });

    return { success: true };
  }

  // Remove player from room
  removePlayer(userId) {
    this.players = this.players.filter(p => p.userId !== userId);
  }

  // Get player by userId
  getPlayer(userId) {
    return this.players.find(p => p.userId === userId);
  }

  // Check if room has enough players
  canStart() {
    return this.players.length >= 2;
  }

  // Check if room is full
  isFull() {
    return this.players.length >= 4;
  }

  // Check if room is empty
  isEmpty() {
    return this.players.length === 0;
  }

  // Mark puzzle as solved for a player
  markPuzzleSolved(userId) {
    const player = this.getPlayer(userId);
    if (player) {
      player.puzzleSolved = true;
    }
  }

  // Check if all puzzles are solved
  allPuzzlesSolved() {
    return this.players.every(p => p.puzzleSolved);
  }

  // Start the game
  startGame(vaultId) {
    this.status = 'PLAYING';
    this.vaultId = vaultId;
    this.startedAt = Date.now();
  }

  // End the game
  endGame(result) {
    this.status = 'FINISHED';
    this.result = result;
    this.endedAt = Date.now();
  }

  // Get room summary
  getSummary() {
    return {
      roomCode: this.roomCode,
      status: this.status,
      players: this.players,
      vaultId: this.vaultId,
      canStart: this.canStart(),
      isFull: this.isFull(),
    };
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // Create a new room
  createRoom(hostId) {
    const roomCode = this.generateRoomCode();
    const room = new Room(roomCode, hostId);
    this.rooms.set(roomCode, room);
    console.log(`🏦 Room created: ${roomCode}`);
    return room;
  }

  // Get room by code
  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  // Delete room
  deleteRoom(roomCode) {
    this.rooms.delete(roomCode);
    console.log(`🗑️ Room deleted: ${roomCode}`);
  }

  // Generate unique 6 char room code
  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  // Get all active rooms count
  getActiveRoomsCount() {
    return this.rooms.size;
  }

  // Find available room for quick match
  findAvailableRoom() {
    for (const [code, room] of this.rooms) {
      if (room.status === 'WAITING' && !room.isFull()) {
        return room;
      }
    }
    return null;
  }
}

module.exports = new RoomManager();