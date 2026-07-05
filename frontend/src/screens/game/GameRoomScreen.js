import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './GameRoomScreen.styles';
import socketService from '../../services/socketService';
import api from '../../services/api';
import { getUser } from '../../services/storage';

export default function GameRoomScreen({ navigation, route }) {
  const { room, roomCode } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [myPuzzle, setMyPuzzle] = useState(null);
  const [players, setPlayers] = useState(room?.players || []);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndPuzzle();
    setupSocketListeners();

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          Alert.alert('⏰ Time Up!', 'The vault locked! Better luck next time!');
          navigation.goBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      socketService.off('puzzle:solved');
      socketService.off('puzzle:wrong');
      socketService.off('game:vault_cracked');
      socketService.off('room:updated');
    };
  }, []);

  const loadUserAndPuzzle = async () => {
    try {
      // Get current user
      const user = await getUser();
      setCurrentUser(user);

      // Find my role in the room
      const myPlayer = room.players.find(p => p.username === user.username);
      if (!myPlayer) return;

      // Load puzzles for this vault
      const response = await api.get(`/api/puzzles/${room.vaultId}`);
      const puzzles = response.data;

      // Find puzzle matching my role
      const myPuzzle = puzzles.find(p => p.role === myPlayer.role);
      setMyPuzzle(myPuzzle);

    } catch (error) {
      console.error('Error loading puzzle:', error);
      Alert.alert('Error', 'Failed to load puzzle!');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Someone solved their puzzle
    socketService.on('puzzle:solved', ({ username, room: updatedRoom }) => {
      setPlayers(updatedRoom.players);
    });

    // Vault cracked — everyone solved!
    socketService.on('game:vault_cracked', ({ message, xpEarned }) => {
      Alert.alert(
        '🎉 VAULT CRACKED!',
        `${message}\n\n+${xpEarned} XP earned!`,
        [{
          text: 'Awesome! 🔥',
          onPress: () => navigation.navigate('Home')
        }]
      );
    });

    // Room updated
    socketService.on('room:updated', ({ room: updatedRoom }) => {
      setPlayers(updatedRoom.players);
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Select an answer!', 'Please select an option first!');
      return;
    }

    try {
      // Submit to Spring Boot for validation
      const response = await api.post(`/api/puzzles/${myPuzzle.id}/submit`, {
        answer: selectedOption
      });

      const { correct } = response.data;
      setIsCorrect(correct);
      setSubmitted(true);

      if (correct) {
        // Notify game server
        socketService.submitAnswer(myPuzzle.id, selectedOption);
      } else {
        Alert.alert(
          '❌ Wrong Answer!',
          'That\'s not right! Try again!',
          [{
            text: 'Try Again',
            onPress: () => {
              setSubmitted(false);
              setSelectedOption(null);
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit answer!');
    }
  };

  const handleHint = () => {
    Alert.alert(
      '💡 Use Hint?',
      'Using a hint costs 50 XP penalty! Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Hint (-50 XP)', onPress: () => setShowHint(true) }
      ]
    );
  };

  const getOptionStyle = (optionId) => {
    if (!submitted) {
      return selectedOption === optionId ? styles.optionSelected : styles.option;
    }
    if (optionId === myPuzzle?.correctAnswer) return [styles.option, styles.optionCorrect];
    if (optionId === selectedOption) return [styles.option, styles.optionWrong];
    return styles.option;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 16 }}>Loading puzzle... 🧩</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.vaultInfo}>
            <Text style={styles.vaultTitle}>🏦 LearnHeist</Text>
            <Text style={styles.vaultTopic}>Room: {roomCode}</Text>
          </View>
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timerText,
              timeLeft < 60 && styles.timerDanger
            ]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
        </View>

        {/* Crew Status Row */}
        <View style={styles.crewRow}>
          {players.map((member) => (
            <View key={member.userId} style={styles.crewMember}>
              <View style={[
                styles.crewAvatar,
                member.puzzleSolved && styles.crewAvatarDone,
                member.username === currentUser?.username && styles.crewAvatarActive,
              ]}>
                <Text style={styles.crewAvatarText}>{member.roleEmoji}</Text>
              </View>
              <Text style={styles.crewName}>{member.username}</Text>
              <Text style={styles.crewStatus}>
                {member.puzzleSolved ? '✅' : '⏳'}
              </Text>
            </View>
          ))}
        </View>

        {/* Puzzle Area */}
        {isCorrect ? (
          <View style={styles.solvedContainer}>
            <Text style={styles.solvedEmoji}>🔓</Text>
            <Text style={styles.solvedTitle}>Puzzle Solved!</Text>
            <Text style={styles.solvedDesc}>
              Amazing work! Waiting for your crew to finish...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.puzzleContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Role Tag */}
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>
                {players.find(p => p.username === currentUser?.username)?.roleEmoji}{' '}
                {players.find(p => p.username === currentUser?.username)?.role}
              </Text>
            </View>

            {/* Puzzle Card */}
            {myPuzzle && (
              <View style={styles.puzzleCard}>
                <Text style={styles.puzzleQuestion}>{myPuzzle.question}</Text>

                {/* Code Block */}
                {myPuzzle.codeSnippet !== '' && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{myPuzzle.codeSnippet}</Text>
                  </View>
                )}

                {/* Options */}
                <View style={styles.optionsContainer}>
                  {myPuzzle.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={getOptionStyle(option.id)}
                      onPress={() => !submitted && setSelectedOption(option.id)}
                    >
                      <View style={styles.optionLetter}>
                        <Text style={styles.optionLetterText}>{option.id}</Text>
                      </View>
                      <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hint Box */}
            {showHint && myPuzzle && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>💡 {myPuzzle.hint}</Text>
              </View>
            )}

            {/* Hint Button */}
            {!showHint && (
              <TouchableOpacity style={styles.hintButton} onPress={handleHint}>
                <Text style={styles.hintButtonText}>💡 Use Hint (-50 XP)</Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedOption && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Answer 🔐</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}