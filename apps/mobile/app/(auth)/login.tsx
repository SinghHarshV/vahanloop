import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Mail, Lock, Car, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginDemo, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setLocalError('');
    clearError();

    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/');
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'owner' | 'driver') => {
    setLocalError('');
    clearError();
    const success = await loginDemo(role);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Car size={26} color={Colors.emerald} />
          </View>
          <Text style={styles.brandTitle}>
            Vahan<Text style={styles.brandAccent}>Loop</Text>
          </Text>
          <Text style={styles.subtitle}>Native Mobility Marketplace</Text>
        </View>

        {/* Quick Demo Sign In */}
        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <ShieldCheck size={16} color={Colors.emerald} />
            <Text style={styles.demoTitle}>QUICK DEMO ACCESS</Text>
          </View>
          <View style={styles.demoBtnRow}>
            <TouchableOpacity
              style={[styles.demoChip, styles.demoCustomer]}
              onPress={() => handleDemoLogin('customer')}
              disabled={isLoading}
            >
              <Text style={styles.demoCustomerText}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoChip, styles.demoOwner]}
              onPress={() => handleDemoLogin('owner')}
              disabled={isLoading}
            >
              <Text style={styles.demoOwnerText}>Vehicle Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoChip, styles.demoDriver]}
              onPress={() => handleDemoLogin('driver')}
              disabled={isLoading}
            >
              <Text style={styles.demoDriverText}>Chauffeur</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.demoSubtext}>Password: Demo@123456</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {error || localError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error || localError}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="emerald"
            size="lg"
            loading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New to VahanLoop? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    padding: Spacing.base,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.navy,
  },
  brandAccent: {
    color: Colors.emerald,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  demoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  demoChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoCustomer: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  demoCustomerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  demoOwner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  demoOwnerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  demoDriver: {
    backgroundColor: '#EDE9FE',
    borderColor: '#DDD6FE',
  },
  demoDriverText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
  },
  demoSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: Spacing.base,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  registerPrompt: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.emerald,
  },
});
