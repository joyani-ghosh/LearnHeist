import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import styles from './HomeScreen.styles';
import api from '../../services/api';
import { getUser } from '../../services/storage';

export default function HomeScreen({ navigation }) {
  const [vaults, setVaults] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user from storage
      const savedUser = await getUser();
      setUser(savedUser);

      // Load vaults from API
      const response = await api.get('/api/vaults');
      setVaults(response.data);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiffColor = (difficulty) => {
    switch (difficulty) {
      case 'ROOKIE': return '#10B981';
      case 'PRO': return '#F59E0B';
      case 'LEGEND': return '#EF4444';
      default: return '#10B981';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ color: '#9CA3AF', marginTop: 16 }}>Loading vaults...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {user?.username || 'Player'} 👋</Text>
            <Text style={styles.subGreeting}>Ready to crack a vault?</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.xpBadge}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.xpText}>⚡ {user?.xp || 0} XP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.xpBadge}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.xpText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Heist Banner */}
        <TouchableOpacity style={styles.dailyBanner}>
          <Text style={styles.dailyLabel}>🔥 DAILY HEIST</Text>
          <Text style={styles.dailyTitle}>
            {vaults.find(v => v.dailyVault)?.title || 'System Design Vault'}
          </Text>
          <Text style={styles.dailyDesc}>New vault resets in 08:42:11</Text>
          <View style={styles.dailyButton}>
            <Text style={styles.dailyButtonText}>Join Now →</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Heists', value: user?.heistsPlayed || '0', emoji: '🏦' },
            { label: 'Wins', value: user?.heistsWon || '0', emoji: '🏆' },
            { label: 'Streak', value: '0🔥', emoji: '📅' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Browse Vaults */}
        <Text style={styles.sectionTitle}>🏦 Browse Vaults</Text>
        {vaults.map((vault) => (
          <TouchableOpacity
            key={vault.id}
            style={styles.vaultCard}
            onPress={() => navigation.navigate('Matchmaking')}
          >
            <View style={styles.vaultLeft}>
              <Text style={styles.vaultEmoji}>{vault.emoji}</Text>
              <View>
                <Text style={styles.vaultTitle}>{vault.title}</Text>
                <Text style={styles.vaultTopic}>{vault.topic}</Text>
              </View>
            </View>
            <View style={styles.vaultRight}>
              <View style={[
                styles.diffBadge,
                { backgroundColor: getDiffColor(vault.difficulty) + '33' }
              ]}>
                <Text style={[
                  styles.diffText,
                  { color: getDiffColor(vault.difficulty) }
                ]}>
                  {vault.difficulty}
                </Text>
              </View>
              <Text style={styles.playersText}>⚡ {vault.xpReward} XP</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Find Crew Button */}
        <TouchableOpacity
          style={styles.crewButton}
          onPress={() => navigation.navigate('Matchmaking')}
        >
          <Text style={styles.crewButtonText}>🎮 Find a Crew & Play Now</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}