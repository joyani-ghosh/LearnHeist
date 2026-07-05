import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import styles from './MatchmakingScreen.styles';
import socketService from '../../services/socketService';

export default function MatchmakingScreen({ navigation }) {
  const [roomCode, setRoomCode] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Connect to game server when screen opens
    connectToServer();

    // Cleanup on leave
    return () => {
      socketService.off('room:created');
      socketService.off('room:joined');
      socketService.off('room:error');
    };
  }, []);

  const connectToServer = async () => {
    try {
      await socketService.connect();
      setupListeners();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const setupListeners = () => {
    // Room created successfully
    socketService.on('room:created', ({ roomCode, room }) => {
      setConnecting(false);
      navigation.navigate('WaitingRoom', {
        roomCode,
        room,
        isHost: true,
      });
    });

    // Joined room successfully
    socketService.on('room:joined', ({ roomCode, room }) => {
      setConnecting(false);
      navigation.navigate('WaitingRoom', {
        roomCode,
        room,
        isHost: false,
      });
    });

    // Error
    socketService.on('room:error', ({ message }) => {
      setConnecting(false);
      Alert.alert('Error', message);
    });
  };

  const handleCreateRoom = () => {
    setConnecting(true);
    socketService.createRoom(null);
  };

  const handleJoinRoom = () => {
    if (!roomCode || roomCode.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6 digit room code!');
      return;
    }
    setConnecting(true);
    socketService.joinRoom(roomCode.toUpperCase());
  };

  const handleQuickMatch = () => {
    setConnecting(true);
    socketService.quickMatch(null);

    // Listen for quick match result
    socketService.on('room:updated', ({ room }) => {
      setConnecting(false);
      navigation.navigate('WaitingRoom', {
        roomCode: room.roomCode,
        room,
        isHost: false,
      });
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎮 Find a Crew</Text>
        </View>

        {connecting ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 16 }}>
              Connecting...
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Online Info Cards */}
            <View style={styles.infoRow}>
              {[
                { emoji: '🟢', value: '142', label: 'Players Online' },
                { emoji: '🏦', value: '38', label: 'Active Rooms' },
                { emoji: '⏱️', value: '~30s', label: 'Avg Wait Time' },
              ].map((info) => (
                <View key={info.label} style={styles.infoCard}>
                  <Text style={styles.infoEmoji}>{info.emoji}</Text>
                  <Text style={styles.infoValue}>{info.value}</Text>
                  <Text style={styles.infoLabel}>{info.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Match */}
            <Text style={styles.sectionTitle}>⚡ Quick Match</Text>
            <Text style={styles.sectionDesc}>
              Auto-match with random players online. Need at least 2 players to start!
            </Text>
            <TouchableOpacity
              style={styles.quickMatchButton}
              onPress={handleQuickMatch}
            >
              <Text style={styles.quickMatchEmoji}>🎲</Text>
              <Text style={styles.quickMatchTitle}>Find Random Crew</Text>
              <Text style={styles.quickMatchDesc}>
                2-4 players • Auto match • Start instantly
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Private Room */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔐 Create Private Room</Text>
              <Text style={styles.cardDesc}>
                Get a room code and share it with your friends. Min 2, Max 4 players!
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateRoom}
              >
                <Text style={styles.createButtonText}>Create Room + Get Code</Text>
              </TouchableOpacity>
            </View>

            {/* Join Private Room */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔑 Join Private Room</Text>
              <Text style={styles.cardDesc}>
                Enter the 6 digit code your friend shared with you!
              </Text>
              <View style={styles.codeInputRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="HX72KP"
                  placeholderTextColor="#4B5563"
                  value={roomCode}
                  onChangeText={(text) => setRoomCode(text.toUpperCase())}
                  maxLength={6}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoinRoom}
                >
                  <Text style={styles.joinButtonText}>Join →</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}