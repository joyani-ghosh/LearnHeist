import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './ProfileScreen.styles';
import { COLORS } from '../../constants';

const STATS = [
  { emoji: '🏦', value: '12', label: 'Heists Played' },
  { emoji: '🏆', value: '8', label: 'Heists Won' },
  { emoji: '🔥', value: '3', label: 'Day Streak' },
  { emoji: '⚡', value: '1250', label: 'Total XP' },
];

const BADGES = [
  { emoji: '🥷', name: 'First Heist' },
  { emoji: '🔓', name: 'Vault Cracker' },
  { emoji: '⚡', name: 'Speed Run' },
  { emoji: '🧠', name: 'Big Brain' },
  { emoji: '🔥', name: '3 Day Streak' },
  { emoji: '👑', name: 'Top 10' },
];

const SKILLS = [
  { name: '🧠 Coding', percent: 75, color: COLORS.primary },
  { name: '🔍 Theory', percent: 60, color: COLORS.secondary },
  { name: '🗺️ System Design', percent: 45, color: COLORS.accent },
  { name: '🔧 Debugging', percent: 80, color: COLORS.success },
];

export default function ProfileScreen({ navigation }) {

  const handleLogout = () => {
    Alert.alert(
      'Logout?',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>🧑</Text>
            </View>
            <Text style={styles.username}>Player One</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>⚔️ Level 3 — Rookie Hacker</Text>
            </View>

            {/* XP Bar */}
            <View style={styles.xpRow}>
              <Text style={styles.xpText}>XP Progress</Text>
              <Text style={styles.xpValue}>1250 / 2000 XP</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={styles.xpFill} />
            </View>
          </View>

          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Skill DNA */}
          <Text style={styles.sectionTitle}>🧬 Skill DNA</Text>
          <View style={styles.skillCard}>
            {SKILLS.map((skill) => (
              <View key={skill.name} style={styles.skillRow}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillPercent}>{skill.percent}%</Text>
                </View>
                <View style={styles.skillBar}>
                  <View style={[
                    styles.skillFill,
                    {
                      width: `${skill.percent}%`,
                      backgroundColor: skill.color,
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>

          {/* Badges */}
          <Text style={styles.sectionTitle}>🏅 Badges</Text>
          <View style={styles.badgesRow}>
            {BADGES.map((badge) => (
              <View key={badge.name} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}