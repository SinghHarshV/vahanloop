import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnerDashboard, acceptBooking, rejectBooking } from '../../src/api/owner';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Modal } from '../../src/components/ui/Modal';
import { Input } from '../../src/components/ui/Input';
import {
  Car,
  TrendingUp,
  Clock,
  Plus,
  Check,
  X,
  AlertCircle,
} from 'lucide-react-native';

export default function OwnerOverviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: dashboard, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['owner_dashboard'],
    queryFn: getOwnerDashboard,
  });

  const acceptMutation = useMutation({
    mutationFn: (bookingId: string) => acceptBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner_dashboard'] });
      Alert.alert('Booking Accepted', 'The reservation is now accepted and awaiting customer payment.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not accept booking.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectBooking(selectedBookingId!, rejectReason || 'Vehicle unavailable for requested dates'),
    onSuccess: () => {
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedBookingId(null);
      queryClient.invalidateQueries({ queryKey: ['owner_dashboard'] });
      Alert.alert('Booking Declined', 'The reservation request has been rejected.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not decline booking.');
    },
  });

  const metrics = dashboard?.metrics || {
    totalVehicles: 4,
    activeListings: 4,
    pendingBookings: 1,
    totalEarnings: 8210,
    completedTrips: 3,
  };

  const requests = dashboard?.recentRequests || [];

  return (
    <View style={styles.container}>
      <Header
        title="Host Operations"
        subtitle="Fleet & Booking Command Center"
        rightAction={
          <TouchableOpacity
            style={styles.addVehBtn}
            onPress={() => router.push('/(owner)/vehicles/add')}
          >
            <Plus size={16} color={Colors.white} />
            <Text style={styles.addVehText}>Add Vehicle</Text>
          </TouchableOpacity>
        }
      />

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
        {/* KPI Cards Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
              <Car size={18} color="#D97706" />
            </View>
            <Text style={styles.kpiVal}>{metrics.totalVehicles}</Text>
            <Text style={styles.kpiLabel}>Fleet Vehicles</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#DBEAFE' }]}>
              <Clock size={18} color="#2563EB" />
            </View>
            <Text style={styles.kpiVal}>{metrics.pendingBookings}</Text>
            <Text style={styles.kpiLabel}>Pending Requests</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#D1FAE5' }]}>
              <TrendingUp size={18} color="#059669" />
            </View>
            <Text style={styles.kpiVal}>₹{metrics.totalEarnings?.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiLabel}>Gross Earnings</Text>
          </View>
        </View>

        {/* Section: Incoming Booking Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Booking Requests</Text>
          <Text style={styles.sectionCount}>({requests.length})</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.emerald} style={{ padding: Spacing.xl }} />
        ) : requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <AlertCircle size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No pending booking requests</Text>
            <Text style={styles.emptySub}>New customer reservations will appear here for your review.</Text>
          </View>
        ) : (
          requests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestVehTitle}>{req.vehicle?.title || `Reservation #${req.id.slice(-6)}`}</Text>
                  <Text style={styles.requestCustomer}>
                    Customer: {req.customerName || 'Rahul Sharma'} • {req.rentalType === 'CHAUFFEUR' ? 'Chauffeur' : 'Self-Drive'}
                  </Text>
                </View>
                <Badge label={req.status} variant="warning" />
              </View>

              <View style={styles.requestDatesBox}>
                <Text style={styles.dateText}>
                  {new Date(req.pickupDateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} to{' '}
                  {new Date(req.returnDateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.payoutAmount}>Payout: ₹{req.totalAmount}</Text>
              </View>

              {req.status === 'PENDING' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => {
                      setSelectedBookingId(req.id);
                      setRejectModalVisible(true);
                    }}
                  >
                    <X size={16} color={Colors.danger} />
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => acceptMutation.mutate(req.id)}
                    disabled={acceptMutation.isPending}
                  >
                    <Check size={16} color={Colors.white} />
                    <Text style={styles.acceptBtnText}>Accept Request</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Decline Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        title="Decline Booking Request"
      >
        <Text style={styles.modalPrompt}>
          Please specify the reason for declining this reservation so the customer can be notified.
        </Text>
        <Input
          placeholder="e.g. Scheduled for routine service maintenance"
          value={rejectReason}
          onChangeText={setRejectReason}
          containerStyle={{ marginTop: Spacing.md }}
        />
        <Button
          title="Confirm Decline"
          variant="danger"
          size="md"
          loading={rejectMutation.isPending}
          onPress={() => rejectMutation.mutate()}
          style={{ marginTop: Spacing.sm }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addVehBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
  },
  addVehText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.sm,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  kpiVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestVehTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  requestCustomer: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestDatesBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateText: {
    fontSize: 12,
    color: Colors.navy,
    fontWeight: '500',
  },
  payoutAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.emerald,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  modalPrompt: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
