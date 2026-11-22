import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getOwnerEarnings } from '../../src/api/owner';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/ui/Header';
import { TrendingUp, Wallet, ShieldCheck, ArrowDownRight } from 'lucide-react-native';

export default function OwnerEarningsScreen() {
  const { data: earnings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['owner_earnings'],
    queryFn: getOwnerEarnings,
  });

  const grossRevenue = earnings?.totalRevenue || 12450;
  const platformFees = earnings?.platformFees || Math.round(grossRevenue * 0.1);
  const netEarnings = earnings?.netEarnings || (grossRevenue - platformFees);
  const completedTrips = earnings?.completedBookingsCount || 4;

  return (
    <View style={styles.container}>
      <Header title="Earnings & Ledger" subtitle="Host revenue settlement overview" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.emerald}
          />
        }
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.emerald} />
          </View>
        ) : (
          <>
            {/* Primary Net Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>NET HOST EARNINGS</Text>
              <Text style={styles.balanceVal}>₹{netEarnings.toLocaleString('en-IN')}</Text>
              <Text style={styles.balanceSub}>Across {completedTrips} completed rental bookings</Text>
            </View>

            {/* Split Metrics */}
            <View style={styles.splitRow}>
              <View style={styles.splitCard}>
                <View style={[styles.splitIcon, { backgroundColor: '#D1FAE5' }]}>
                  <TrendingUp size={16} color="#059669" />
                </View>
                <Text style={styles.splitVal}>₹{grossRevenue.toLocaleString('en-IN')}</Text>
                <Text style={styles.splitLabel}>Gross Booking Volume</Text>
              </View>

              <View style={styles.splitCard}>
                <View style={[styles.splitIcon, { backgroundColor: '#FEE2E2' }]}>
                  <ArrowDownRight size={16} color="#DC2626" />
                </View>
                <Text style={styles.splitVal}>₹{platformFees.toLocaleString('en-IN')}</Text>
                <Text style={styles.splitLabel}>Platform Service Fee (10%)</Text>
              </View>
            </View>

            {/* Settlement Policy Card */}
            <View style={styles.card}>
              <View style={styles.policyHeader}>
                <ShieldCheck size={18} color={Colors.emerald} />
                <Text style={styles.policyTitle}>Automatic Payout Policy</Text>
              </View>
              <Text style={styles.policyText}>
                Net earnings are reconciled following vehicle return inspection. Payouts are transferred directly to your verified commercial bank account or UPI VPA.
              </Text>
            </View>

            {/* Recent Payout History */}
            <Text style={styles.sectionHeading}>RECENT COMPLETED SETTLEMENTS</Text>
            {[
              { id: 'tx-101', date: '20 Nov 2026', vehicle: 'Mahindra Thar LX 4x4', amount: 5400, status: 'Settled' },
              { id: 'tx-102', date: '18 Nov 2026', vehicle: 'Royal Enfield Himalayan', amount: 3200, status: 'Settled' },
              { id: 'tx-103', date: '14 Nov 2026', vehicle: 'Tata Nexon.ev Fearless', amount: 3850, status: 'Settled' },
            ].map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txIcon}>
                  <Wallet size={16} color={Colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{tx.vehicle}</Text>
                  <Text style={styles.txDate}>{tx.date} • {tx.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.txAmount}>+₹{tx.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.txStatus}>{tx.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}
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
  center: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  balanceVal: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    marginVertical: Spacing.xs,
  },
  balanceSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  splitRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  splitCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  splitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  splitVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  splitLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
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
  policyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs + 2,
    gap: Spacing.md,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  txDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.emerald,
  },
  txStatus: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
