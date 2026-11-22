import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/theme/colors';
import { Spacing } from '../src/theme/spacing';

export default function IndexScreen() {
  const router = useRouter();
  const { user, isInitialized, activeRole } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (activeRole === 'OWNER') {
      router.replace('/(owner)/overview');
    } else if (activeRole === 'DRIVER') {
      router.replace('/(driver)/home');
    } else {
      router.replace('/(customer)/home');
    }
  }, [user, isInitialized, activeRole, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>VL</Text>
      </View>
      <Text style={styles.brandName}>
        Vahan<Text style={styles.brandAccent}>Loop</Text>
      </Text>
      <Text style={styles.tagline}>Mobility Marketplace</Text>
      <ActivityIndicator size="large" color={Colors.emerald} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: Colors.emerald,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: Spacing.xxl,
  },
});
