import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Key, Shield, User, LogOut, ChevronRight } from 'lucide-react-native';

export default function OwnerProfileScreen() {
  const router = useRouter();
  const { user, switchRole, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Sign out of VahanLoop Host Workspace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSwitchToCustomer = () => {
    switchRole('CUSTOMER');
    router.replace('/(customer)/home');
  };

  return (
    <View style={styles.container}>
      <Header title="Host Profile" subtitle="Fleet Account & Settings" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Host Identity Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Key size={24} color={Colors.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Vikramaditya Verma'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'owner@vahanloop.demo'}</Text>
            <View style={styles.badgeRow}>
              <Badge label="VERIFIED VEHICLE HOST" variant="emerald" />
            </View>
          </View>
        </View>

        {/* Business & KYC Verification */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>HOST COMPLIANCE STATUS</Text>
          <View style={styles.complianceRow}>
            <Shield size={16} color={Colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={styles.compTitle}>Host Identity & PAN Verification</Text>
              <Text style={styles.compSub}>Verified under DPDP Act 2023 & RTO guidelines</Text>
            </View>
            <Badge label="APPROVED" variant="success" />
          </View>
          <View style={[styles.complianceRow, { borderBottomWidth: 0 }]}>
            <Shield size={16} color={Colors.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={styles.compTitle}>Commercial Transport Permits</Text>
              <Text style={styles.compSub}>Active for all 4 listed fleet vehicles</Text>
            </View>
            <Badge label="ACTIVE" variant="success" />
          </View>
        </View>

        {/* Switch back to Customer mode */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>WORKSPACE SWITCHER</Text>
          <TouchableOpacity style={styles.switchOption} onPress={handleSwitchToCustomer}>
            <View style={styles.switchLeft}>
              <User size={18} color={Colors.emerald} />
              <View>
                <Text style={styles.switchTitle}>Switch to Customer View</Text>
                <Text style={styles.switchSubtext}>Rent vehicles as a passenger</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out of Host Workspace"
          variant="secondary"
          size="lg"
          loading={isLoading}
          icon={<LogOut size={16} color={Colors.danger} />}
          textStyle={{ color: Colors.danger }}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  compTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  compSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  switchSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    marginTop: Spacing.md,
    borderColor: '#FCA5A5',
  },
});
