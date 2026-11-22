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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnerBookings, acceptBooking, rejectBooking } from '../../../src/api/owner';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Modal } from '../../../src/components/ui/Modal';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { BOOKING_STATUS_CONFIG } from '@vahanloop/shared';
import { CalendarCheck, MapPin, Check, X } from 'lucide-react-native';

export default function OwnerBookingsScreen() {
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: bookings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['owner_bookings'],
    queryFn: () => getOwnerBookings(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner_bookings'] });
      Alert.alert('Booking Accepted', 'The reservation is accepted. The customer can now complete payment.');
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
      queryClient.invalidateQueries({ queryKey: ['owner_bookings'] });
      Alert.alert('Booking Declined', 'The reservation has been declined.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not decline booking.');
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Booking Requests" subtitle="Accept or decline customer reservations" />

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
        ) : !bookings || bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <CalendarCheck size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No booking requests yet</Text>
            <Text style={styles.emptySub}>
              Customer requests for your fleet vehicles will appear here.
            </Text>
          </View>
        ) : (
          bookings.map((b) => {
            const statusCfg = BOOKING_STATUS_CONFIG[b.status] || {
              label: b.status,
              color: Colors.navy,
              bg: Colors.gray100,
            };

            const pickupDate = b.pickupDateTime ? new Date(b.pickupDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible';
            const returnDate = b.returnDateTime ? new Date(b.returnDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible';

            return (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title} numberOfLines={1}>
                      {b.vehicle?.title || `Booking #${b.id.slice(-6)}`}
                    </Text>
                    <Text style={styles.customerName}>
                      Customer: {b.customerName || 'Rahul Sharma'} • {b.rentalType === 'CHAUFFEUR' ? 'Chauffeur' : 'Self-Drive'}
                    </Text>
                  </View>
                  <Badge label={statusCfg.label} color={statusCfg.color} backgroundColor={statusCfg.bg} />
                </View>

                <View style={styles.locRow}>
                  <MapPin size={13} color={Colors.textMuted} />
                  <Text style={styles.locText}>{b.pickupLocation}</Text>
                </View>

                <View style={styles.datesBox}>
                  <Text style={styles.datesText}>{pickupDate} - {returnDate}</Text>
                  <Text style={styles.payoutText}>Earnings: ₹{b.totalAmount}</Text>
                </View>

                {b.status === 'PENDING' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => {
                        setSelectedBookingId(b.id);
                        setRejectModalVisible(true);
                      }}
                    >
                      <X size={16} color={Colors.danger} />
                      <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => acceptMutation.mutate(b.id)}
                      disabled={acceptMutation.isPending}
                    >
                      <Check size={16} color={Colors.white} />
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Decline Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        title="Decline Booking Request"
      >
        <Text style={styles.modalPrompt}>
          Please specify the reason for declining so the customer can be notified immediately.
        </Text>
        <Input
          placeholder="e.g. Vehicle booked offline or under maintenance"
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  customerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  datesBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  datesText: {
    fontSize: 12,
    color: Colors.navy,
    fontWeight: '600',
  },
  payoutText: {
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: '800',
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
  declineText: {
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
  acceptText: {
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
