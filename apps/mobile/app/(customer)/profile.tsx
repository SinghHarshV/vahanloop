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
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, activeRole, switchRole, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of VahanLoop?', [
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

  const handleRoleSwitch = (targetRole: 'CUSTOMER' | 'OWNER' | 'DRIVER') => {
    switchRole(targetRole);
    if (targetRole === 'OWNER') {
      router.replace('/(owner)/overview');
    } else if (targetRole === 'DRIVER') {
      router.replace('/(driver)/home');
    } else {
      router.replace('/(customer)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Account" subtitle="Customer Profile & Settings" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'guest@vahanloop.in'}</Text>
            <View style={styles.badgeRow}>
              <Badge label="VERIFIED CUSTOMER" variant="emerald" />
            </View>
          </View>
        </View>

        {/* Contact Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>CONTACT DETAILS</Text>
          <View style={styles.infoRow}>
            <Mail size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{user?.phone || '+91 9876543210'}</Text>
          </View>
        </View>

        {/* Role Switcher Section */}
        <View style={styles.card}>
          <View style={styles.roleHeaderRow}>
            <Sparkles size={16} color={Colors.emerald} />
            <Text style={styles.cardHeading}>SWITCH APPLICATION VIEW</Text>
          </View>
          <Text style={styles.roleSub}>
            VahanLoop supports multi-role accounts. Switch directly to your Host or Chauffeur workspace.
          </Text>

          <TouchableOpacity
            style={[styles.roleSelectBtn, activeRole === 'CUSTOMER' ? styles.roleSelectBtnActive : null]}
            onPress={() => handleRoleSwitch('CUSTOMER')}
          >
            <View style={styles.roleSelectLeft}>
              <User size={18} color={activeRole === 'CUSTOMER' ? Colors.emerald : Colors.navy} />
              <View>
                <Text style={styles.roleSelectTitle}>Customer View</Text>
                <Text style={styles.roleSelectDesc}>Rent verified cars, bikes & scooters</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleSelectBtn, activeRole === 'OWNER' ? styles.roleSelectBtnActive : null]}
            onPress={() => handleRoleSwitch('OWNER')}
          >
            <View style={styles.roleSelectLeft}>
              <Key size={18} color={activeRole === 'OWNER' ? '#D97706' : Colors.navy} />
              <View>
                <Text style={styles.roleSelectTitle}>Vehicle Host / Fleet View</Text>
                <Text style={styles.roleSelectDesc}>Manage listings, bookings & earnings</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleSelectBtn, activeRole === 'DRIVER' ? styles.roleSelectBtnActive : null]}
            onPress={() => handleRoleSwitch('DRIVER')}
          >
            <View style={styles.roleSelectLeft}>
              <Shield size={18} color={activeRole === 'DRIVER' ? '#7C3AED' : Colors.navy} />
              <View>
                <Text style={styles.roleSelectTitle}>Chauffeur View</Text>
                <Text style={styles.roleSelectDesc}>Assigned trips and duty schedules</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out"
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
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
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
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
  },
  infoText: {
    fontSize: 14,
    color: Colors.navy,
    fontWeight: '500',
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  roleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  roleSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.xs + 2,
    backgroundColor: Colors.gray50,
  },
  roleSelectBtnActive: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldLight,
  },
  roleSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  roleSelectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  roleSelectDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    marginTop: Spacing.md,
    borderColor: '#FCA5A5',
  },
});
