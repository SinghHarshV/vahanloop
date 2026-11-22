import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCustomerBookings } from '../../../src/api/bookings';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Badge } from '../../../src/components/ui/Badge';
import { BOOKING_STATUS_CONFIG } from '@vahanloop/shared';
import { Calendar, MapPin, ChevronRight, Car } from 'lucide-react-native';

export default function BookingsListScreen() {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const { data: bookings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['customer_bookings'],
    queryFn: () => getCustomerBookings(),
  });

  const filteredBookings = (bookings || []).filter((b) => {
    if (filterTab === 'UPCOMING') {
      return ['PENDING', 'ACCEPTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'ACTIVE'].includes(b.status);
    }
    if (filterTab === 'COMPLETED') {
      return ['COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(b.status);
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reservations</Text>
        <Text style={styles.headerSub}>Manage your trips and booking ledger</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, filterTab === tab ? styles.tabBtnActive : null]}
            onPress={() => setFilterTab(tab)}
          >
            <Text style={[styles.tabText, filterTab === tab ? styles.tabTextActive : null]}>
              {tab === 'ALL' ? 'All Trips' : tab === 'UPCOMING' ? 'Upcoming' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Calendar size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No reservations found</Text>
            <Text style={styles.emptyMessage}>
              You don't have any bookings in this section yet.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(customer)/explore')}
            >
              <Text style={styles.browseBtnText}>Explore Vehicles</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBookings.map((b) => {
            const statusCfg = BOOKING_STATUS_CONFIG[b.status] || {
              label: b.status,
              color: Colors.navy,
              bg: Colors.gray100,
            };

            const pickupDate = b.pickupDateTime ? new Date(b.pickupDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible';
            const returnDate = b.returnDateTime ? new Date(b.returnDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible';

            return (
              <TouchableOpacity
                key={b.id}
                style={styles.bookingCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/(customer)/bookings/${b.id}`)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.bookingTitle} numberOfLines={1}>
                      {b.vehicle?.title || `Reservation #${b.id.slice(-6)}`}
                    </Text>
                    <View style={styles.pickupLocRow}>
                      <MapPin size={13} color={Colors.textMuted} />
                      <Text style={styles.pickupLocText} numberOfLines={1}>
                        {b.pickupLocation}
                      </Text>
                    </View>
                  </View>
                  <Badge label={statusCfg.label} color={statusCfg.color} backgroundColor={statusCfg.bg} />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.dateLabel}>Rental Interval</Text>
                    <Text style={styles.dateVal}>{pickupDate} - {returnDate}</Text>
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.dateLabel}>Total Amount</Text>
                    <Text style={styles.amountVal}>₹{b.totalAmount?.toLocaleString('en-IN') || '0'}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </View>

                {b.status === 'ACCEPTED' || b.status === 'AWAITING_PAYMENT' ? (
                  <TouchableOpacity
                    style={styles.payNowBanner}
                    onPress={() => router.push(`/(customer)/checkout/${b.id}`)}
                  >
                    <Text style={styles.payNowText}>Host Accepted • Pay ₹{b.totalAmount} to Confirm</Text>
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            );
          })
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
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  tabBtn: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  tabBtnActive: {
    backgroundColor: Colors.navy,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  center: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  browseBtn: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  browseBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardTop: {
    padding: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  pickupLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pickupLocText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  cardBottom: {
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dateVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  amountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
    marginTop: 2,
  },
  payNowBanner: {
    backgroundColor: Colors.emerald,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  payNowText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
