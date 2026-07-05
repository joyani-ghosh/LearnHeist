import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './WaitingRoomScreen.styles';
import socketService from '../../services/socketService';

export default function WaitingRoomScreen({ navigation, route }) {
  const { roomCode, isHost } = route.params;
  const [room, setRoom] = useState(route.params.room);

  useEffect(() => {
    setupListeners();
    return () => {
      socketService.off('room:updated');
      socketService.off('game:started');
    };
  }, []);

  const setupListeners = () => {
    // Room updated — player joined or left
    socketService.on('room:updated', ({ room, message }) => {
      setRoom(room);
      console.log(message);
    });

    // Game started
    socketService.on('game:started', ({ room }) => {
      navigation.navigate('GameRoom', { room, roomCode });
    });
  };

  const filledPlayers = room?.players || [];
  const emptySlots = 4 - filledPlayers.length;
  const canStart = filledPlayers.length >= 2;

  const handleCopyCode = () => {
    Alert.alert('✅ Copied!', `Room code ${roomCode} copied!`);
  };

  const handleStartGame = () => {
    if (!canStart) {
      Alert.alert('Not enough players!', 'You need at least 2 players to start!');
      return;
    }
    socketService.startGame();
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room?',
      'Are you sure you want to leave?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            socketService.leaveRoom();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⏳ Waiting Room</Text>
          <Text style={styles.headerSubtitle}>
            Share the code with your crew!
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Room Code */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <Text style={styles.codeText}>{roomCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <Text style={styles.copyButtonText}>📋 Copy Code</Text>
            </TouchableOpacity>
          </View>

          {/* Player count */}
          <Text style={styles.playerCount}>
            {filledPlayers.length}/4 players • Min 2 to start
          </Text>

          {/* Players */}
          <Text style={styles.sectionTitle}>👥 Your Crew</Text>

          {/* Filled players */}
          {filledPlayers.map((player) => (
            <View key={player.userId} style={styles.playerSlot}>
              <View style={styles.playerAvatar}>
                <Text style={styles.playerAvatarText}>{player.roleEmoji}</Text>
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.username}</Text>
                <Text style={styles.playerRole}>
                  {player.roleEmoji} {player.role}
                </Text>
              </View>
              {player.isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>HOST</Text>
                </View>
              )}
            </View>
          ))}

          {/* Empty slots */}
          {Array(emptySlots).fill(null).map((_, index) => (
            <View key={index} style={[styles.playerSlot, styles.emptySlot]}>
              <View style={[styles.playerAvatar, styles.emptyAvatar]}>
                <Text style={styles.playerAvatarText}>➕</Text>
              </View>
              <Text style={styles.emptyName}>Waiting for player...</Text>
            </View>
          ))}

          {/* Waiting message */}
          {!canStart && (
            <Text style={styles.waitingText}>
              ⏳ Waiting for at least 1 more player to join...
            </Text>
          )}

          {/* Start Button — only host can start */}
          {isHost && (
            <TouchableOpacity
              style={[styles.startButton, !canStart && styles.startButtonDisabled]}
              onPress={handleStartGame}
            >
              <Text style={styles.startButtonText}>
                {canStart ? '🚀 Start Heist!' : '⏳ Waiting for players...'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Leave Button */}
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveRoom}
          >
            <Text style={styles.leaveButtonText}>🚪 Leave Room</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}