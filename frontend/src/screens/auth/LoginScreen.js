import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants';
import styles from './LoginScreen.styles';
import { authAPI } from '../../services/api';
import { saveToken, saveUser } from '../../services/storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Call Spring Boot API
      const response = await authAPI.login(email, password);
      const { token, id, username, xp, level } = response.data;

      // Save token & user to phone storage
      await saveToken(token);
      await saveUser({ id, username, email, xp, level });

      // Navigate to Home
      navigation.navigate('Home');

    } catch (error) {
      const message = error.response?.data?.message || 'Login failed! Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🧩</Text>
        <Text style={styles.logoText}>LearnHeist</Text>
        <Text style={styles.tagline}>Crack the vault. Level up.</Text>
      </View>

      {/* Form Section */}
      <View style={styles.form}>

        {/* Email Input */}
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Login 🚀</Text>
          }
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Don't have an account?{' '}
            <Text style={styles.linkHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}