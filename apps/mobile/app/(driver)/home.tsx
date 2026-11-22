import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { ShieldCheck, MapPin, Calendar, Clock, Navigation, CheckCircle } from 'lucide-react-native';

export default function DriverHomeScreen() {
  const router = useRouter();
  const [isOnDuty, setIsOnDuty] = useState(true);

  return (
    <View style={styles.container}>
      <Header title="Chauffeur Portal" subtitle="Commercial Trip Dispatch" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Duty Toggle Card */}
        <View style={styles.dutyCard}>
          <View style={styles.dutyTop}>
            <View>
              <Text style={styles.dutyTitle}>DUTY STATUS</Text>
              <Text style={styles.dutyState}>
                {isOnDuty ? 'Available for Dispatch' : 'Off Duty / Rest Period'}
              </Text>
            </View>
            <Switch
              value={isOnDuty}
              onValueChange={setIsOnDuty}
              trackColor={{ false: Colors.gray300, true: '#7C3AED' }}
            />
          </View>
          <View style={styles.dutyBadgeRow}>
            <Badge label="LMV-TR COMMERCIAL BADGE" variant="success" />
            <Badge label="POLICE VERIFIED" variant="emerald" />
          </View>
        </View>

        {/* Current Active Assignment */}
        <Text style={styles.sectionHeading}>CURRENT DISPATCHED TRIP</Text>
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripTitle}>Civil Lines to Airport Terminal</Text>
              <Text style={styles.tripSub}>Mahindra Thar LX 4x4 (MP-20-CB-4089)</Text>
            </View>
            <Badge label="EN ROUTE" variant="info" />
          </View>

          <View style={styles.routeBox}>
            <View style={styles.routeItem}>
              <MapPin size={16} color={Colors.emerald} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Pickup Location</Text>
                <Text style={styles.routeVal}>Hotel Gulzar Towers, Civil Lines, Jabalpur</Text>
              </View>
            </View>
            <View style={styles.routeItem}>
              <Navigation size={16} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>Passenger Contact</Text>
                <Text style={styles.routeVal}>Rahul Sharma (+91 98765 43210)</Text>
              </View>
            </View>
          </View>

          <Button
            title="Open Trip Navigation & Progress"
            variant="primary"
            size="md"
            onPress={() => router.push('/(driver)/assignments/assign-1')}
            style={styles.openTripBtn}
          />
        </View>

        {/* Safety & Compliance Card */}
        <View style={styles.card}>
          <View style={styles.policyHeader}>
            <ShieldCheck size={18} color="#7C3AED" />
            <Text style={styles.policyTitle}>Safe Transit Standard</Text>
          </View>
          <Text style={styles.policyDesc}>
            All dispatched chauffeur trips are monitored with digital pickup handover, vehicle condition logs, and 24x7 emergency incident reporting.
          </Text>
        </View>
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
  dutyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  dutyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dutyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  dutyState: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
    marginTop: 2,
  },
  dutyBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  tripCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    marginBottom: Spacing.base,
    ...Shadows.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  tripSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  routeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  routeVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 1,
  },
  openTripBtn: {
    backgroundColor: '#7C3AED',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  policyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
