import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingDetails, cancelBooking } from '../../../src/api/bookings';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { BOOKING_STATUS_CONFIG } from '@vahanloop/shared';
import { MapPin, Calendar, Clock, CreditCard, Shield } from 'lucide-react-native';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingDetails(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id!, 'Customer requested cancellation'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['customer_bookings'] });
      Alert.alert('Booking Cancelled', 'Your reservation has been cancelled.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not cancel booking.');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Booking reservation not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const statusCfg = BOOKING_STATUS_CONFIG[booking.status] || {
    label: booking.status,
    color: Colors.navy,
    bg: Colors.gray100,
  };

  const isPayable = booking.status === 'ACCEPTED' || booking.status === 'AWAITING_PAYMENT';
  const isCancellable = ['PENDING', 'ACCEPTED', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(booking.status);

  return (
    <View style={styles.container}>
      <Header title="Reservation Details" subtitle={`#${booking.id}`} showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusHeading}>BOOKING STATUS</Text>
            <Badge label={statusCfg.label} color={statusCfg.color} backgroundColor={statusCfg.bg} />
          </View>
          <Text style={styles.vehicleName}>{booking.vehicle?.title || `Vehicle Reservation`}</Text>
          <Text style={styles.rentalModeTag}>{booking.rentalType === 'CHAUFFEUR' ? 'Chauffeur Driven Rental' : 'Self-Drive Rental'}</Text>
        </View>

        {/* Schedule & Handover Locations */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>TRIP ITINERARY</Text>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.emerald} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Pickup Date & Time</Text>
              <Text style={styles.infoVal}>
                {new Date(booking.pickupDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.emerald} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Return Date & Time</Text>
              <Text style={styles.infoVal}>
                {new Date(booking.returnDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.emerald} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Handover & Return Location</Text>
              <Text style={styles.infoVal}>{booking.pickupLocation}</Text>
            </View>
          </View>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PAYMENT LEDGER</Text>
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>Base Rental Rate</Text>
            <Text style={styles.ledgerVal}>₹{booking.baseAmount?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          {booking.driverCharge > 0 && (
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Chauffeur Allowance</Text>
              <Text style={styles.ledgerVal}>₹{booking.driverCharge?.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>Platform Service Fee (10%)</Text>
            <Text style={styles.ledgerVal}>₹{booking.serviceFee?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          <View style={styles.ledgerRow}>
            <Text style={styles.ledgerLabel}>Refundable Security Deposit</Text>
            <Text style={styles.ledgerVal}>₹{booking.depositAmount?.toLocaleString('en-IN') || '0'}</Text>
          </View>
          <View style={[styles.ledgerRow, styles.ledgerTotal]}>
            <Text style={styles.ledgerTotalLabel}>Total Reservation Amount</Text>
            <Text style={styles.ledgerTotalVal}>₹{booking.totalAmount?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionArea}>
          {isPayable && (
            <Button
              title={`Pay ₹${booking.totalAmount?.toLocaleString('en-IN')} to Confirm`}
              variant="emerald"
              size="lg"
              onPress={() => router.push(`/(customer)/checkout/${booking.id}`)}
              style={styles.actionBtn}
            />
          )}

          {isCancellable && (
            <Button
              title="Cancel Booking"
              variant="secondary"
              size="md"
              loading={cancelMutation.isPending}
              onPress={() => {
                Alert.alert(
                  'Confirm Cancellation',
                  'Are you sure you want to cancel this reservation? The vehicle hold will be released.',
                  [
                    { text: 'Keep Booking', style: 'cancel' },
                    { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
                  ]
                );
              }}
              style={styles.actionBtn}
            />
          )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '600',
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  rentalModeTag: {
    fontSize: 13,
    color: Colors.emerald,
    fontWeight: '600',
    marginTop: 2,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 2,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  ledgerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ledgerVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  ledgerTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  ledgerTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  ledgerTotalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.emerald,
  },
  actionArea: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
