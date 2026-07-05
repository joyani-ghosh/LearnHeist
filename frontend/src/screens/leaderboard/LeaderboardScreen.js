import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import styles from './LeaderboardScreen.styles';

const PLAYERS = [
  { id: 1, name: 'CryptoNinja', xp: 4200, heists: 42, wins: 38, avatar: '🥷' },
  { id: 2, name: 'ByteWizard', xp: 3800, heists: 35, wins: 30, avatar: '🧙' },
  { id: 3, name: 'CodeStorm', xp: 3500, heists: 30, wins: 25, avatar: '⚡' },
  { id: 4, name: 'HackQueen', xp: 3100, heists: 28, wins: 22, avatar: '👑' },
  { id: 5, name: 'NullPointer', xp: 2800, heists: 25, wins: 20, avatar: '🤖' },
  { id: 6, name: 'DevHunter', xp: 2500, heists: 22, wins: 18, avatar: '🎯' },
  { id: 7, name: 'StackOverflow', xp: 2200, heists: 20, wins: 15, avatar: '🔥' },
];

const TABS = ['Daily', 'Weekly', 'All Time'];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState('Daily');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top vault crackers worldwide</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Top 3 */}
          <View style={styles.topThreeRow}>
            {/* 2nd Place */}
            <View style={[styles.topCard, styles.secondCard]}>
              <Text style={styles.rankEmoji}>🥈</Text>
              <Text style={styles.topAvatar}>{PLAYERS[1].avatar}</Text>
              <Text style={styles.topName}>{PLAYERS[1].name}</Text>
              <Text style={styles.topXp}>⚡ {PLAYERS[1].xp} XP</Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.topCard, styles.firstCard]}>
              <Text style={styles.rankEmoji}>🥇</Text>
              <Text style={styles.topAvatar}>{PLAYERS[0].avatar}</Text>
              <Text style={styles.topName}>{PLAYERS[0].name}</Text>
              <Text style={styles.topXp}>⚡ {PLAYERS[0].xp} XP</Text>
            </View>

            {/* 3rd Place */}
            <View style={[styles.topCard, styles.thirdCard]}>
              <Text style={styles.rankEmoji}>🥉</Text>
              <Text style={styles.topAvatar}>{PLAYERS[2].avatar}</Text>
              <Text style={styles.topName}>{PLAYERS[2].name}</Text>
              <Text style={styles.topXp}>⚡ {PLAYERS[2].xp} XP</Text>
            </View>
          </View>

          {/* Rest of players */}
          {PLAYERS.slice(3).map((player, index) => (
            <View key={player.id} style={styles.listItem}>
              <Text style={styles.rank}>#{index + 4}</Text>
              <Text style={styles.avatar}>{player.avatar}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerStats}>
                  {player.heists} heists • {player.wins} wins
                </Text>
              </View>
              <Text style={styles.xpText}>⚡ {player.xp}</Text>
            </View>
          ))}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}