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
import { User, Key, Mail, Phone, Lock, Building, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [ownerType, setOwnerType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setLocalError('Please fill in all mandatory fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    setLocalError('');
    clearError();

    const success = await register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim().replace(/[\s\-()]/g, ''),
      password,
      role,
      ownerType: role === 'OWNER' ? ownerType : undefined,
      businessName: role === 'OWNER' && ownerType === 'BUSINESS' ? businessName.trim() : undefined,
    });

    if (success) {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.navy} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.titleArea}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join VahanLoop mobility marketplace</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.roleToggleRow}>
          <TouchableOpacity
            style={[styles.roleOption, role === 'CUSTOMER' ? styles.roleOptionSelectedCust : null]}
            onPress={() => setRole('CUSTOMER')}
          >
            <User size={20} color={role === 'CUSTOMER' ? Colors.emerald : Colors.textMuted} />
            <Text style={[styles.roleTitle, role === 'CUSTOMER' ? styles.roleTitleSelectedCust : null]}>
              Rent Vehicles
            </Text>
            <Text style={styles.roleSub}>Customer Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, role === 'OWNER' ? styles.roleOptionSelectedOwner : null]}
            onPress={() => setRole('OWNER')}
          >
            <Key size={20} color={role === 'OWNER' ? '#D97706' : Colors.textMuted} />
            <Text style={[styles.roleTitle, role === 'OWNER' ? styles.roleTitleSelectedOwner : null]}>
              List Vehicles
            </Text>
            <Text style={styles.roleSub}>Vehicle Host</Text>
          </TouchableOpacity>
        </View>

        {role === 'OWNER' && (
          <View style={styles.ownerTypeCard}>
            <Text style={styles.ownerTypeLabel}>HOST TYPE</Text>
            <View style={styles.ownerTypeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, ownerType === 'INDIVIDUAL' ? styles.typeBtnSelected : null]}
                onPress={() => setOwnerType('INDIVIDUAL')}
              >
                <Text style={[styles.typeBtnText, ownerType === 'INDIVIDUAL' ? styles.typeBtnTextSelected : null]}>
                  Individual Host
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, ownerType === 'BUSINESS' ? styles.typeBtnSelected : null]}
                onPress={() => setOwnerType('BUSINESS')}
              >
                <Text style={[styles.typeBtnText, ownerType === 'BUSINESS' ? styles.typeBtnTextSelected : null]}>
                  Commercial Fleet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.formCard}>
          {error || localError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error || localError}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Email Address"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +91 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={Colors.textMuted} />}
          />

          {role === 'OWNER' && ownerType === 'BUSINESS' && (
            <Input
              label="Business / Fleet Name"
              placeholder="e.g. Verma Rentals Pvt. Ltd."
              value={businessName}
              onChangeText={setBusinessName}
              leftIcon={<Building size={18} color={Colors.textMuted} />}
            />
          )}

          <Input
            label="Password (min 6 characters)"
            placeholder="Choose secure password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={Colors.textMuted} />}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            variant="emerald"
            size="lg"
            loading={isLoading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backText: {
    fontSize: 14,
    color: Colors.navy,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  titleArea: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.navy,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  roleOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  roleOptionSelectedCust: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldLight,
  },
  roleOptionSelectedOwner: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  roleTitleSelectedCust: {
    color: Colors.emeraldDark,
  },
  roleTitleSelectedOwner: {
    color: '#92400E',
  },
  roleSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ownerTypeCard: {
    backgroundColor: Colors.white,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownerTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  ownerTypeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 3,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray100,
  },
  typeBtnSelected: {
    backgroundColor: Colors.navy,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextSelected: {
    color: Colors.white,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
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
});
