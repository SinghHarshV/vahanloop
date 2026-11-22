import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getVehicleDetails } from '../../../src/api/vehicles';
import { getPricingQuote, createBooking } from '../../../src/api/bookings';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { Modal } from '../../../src/components/ui/Modal';
import {
  ArrowLeft,
  MapPin,
  Star,
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react-native';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [rentalType, setRentalType] = useState<'SELF_DRIVE' | 'CHAUFFEUR'>('SELF_DRIVE');
  const [durationDays, setDurationDays] = useState(3);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleDetails(id!),
    enabled: !!id,
  });

  const pickupDate = new Date(Date.now() + 86400000);
  const returnDate = new Date(Date.now() + 86400000 * (durationDays + 1));

  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['quote', id, rentalType, durationDays],
    queryFn: () =>
      getPricingQuote({
        vehicleId: id!,
        rentalType,
        pickupDateTime: pickupDate.toISOString(),
        returnDateTime: returnDate.toISOString(),
      }),
    enabled: !!vehicle && !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      createBooking({
        vehicleId: id!,
        rentalType,
        pickupDateTime: pickupDate.toISOString(),
        returnDateTime: returnDate.toISOString(),
        pickupLocation: vehicle?.location || 'Depot',
        dropLocation: vehicle?.location || 'Depot',
      }),
    onSuccess: (booking) => {
      setShowBookingModal(false);
      router.push(`/(customer)/bookings/${booking.id}`);
    },
    onError: (err: any) => {
      Alert.alert('Booking Error', err?.message || 'Could not place booking request.');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Vehicle listing not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  const imageUrl = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Image with Back Button */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <TouchableOpacity style={styles.backFloatBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Header Info */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <Badge label={vehicle.category} variant="emerald" />
            <Badge label={`Year ${vehicle.year || 2024}`} variant="neutral" />
            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{vehicle.rating ? vehicle.rating.toFixed(1) : '4.9'}</Text>
            </View>
          </View>

          <Text style={styles.vehicleTitle}>{vehicle.title || `${vehicle.make} ${vehicle.model}`}</Text>

          <View style={styles.locationRow}>
            <MapPin size={15} color={Colors.emerald} />
            <Text style={styles.locationText}>{vehicle.location}</Text>
          </View>
        </View>

        {/* Specifications Grid */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionHeading}>SPECIFICATIONS</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Gauge size={18} color={Colors.emerald} />
              <Text style={styles.specBoxTitle}>Transmission</Text>
              <Text style={styles.specBoxVal}>{vehicle.transmission || 'Manual'}</Text>
            </View>
            <View style={styles.specBox}>
              <Fuel size={18} color={Colors.emerald} />
              <Text style={styles.specBoxTitle}>Fuel Type</Text>
              <Text style={styles.specBoxVal}>{vehicle.fuelType || 'Petrol'}</Text>
            </View>
            <View style={styles.specBox}>
              <Users size={18} color={Colors.emerald} />
              <Text style={styles.specBoxTitle}>Capacity</Text>
              <Text style={styles.specBoxVal}>{vehicle.seatingCapacity || 5} Seats</Text>
            </View>
          </View>
        </View>

        {/* Compliance & Verification Badges */}
        <View style={styles.complianceCard}>
          <View style={styles.complianceHeader}>
            <ShieldCheck size={20} color={Colors.emerald} />
            <Text style={styles.complianceTitle}>VahanLoop Verified Fleet</Text>
          </View>
          <View style={styles.verifyItem}>
            <CheckCircle2 size={16} color={Colors.emerald} />
            <Text style={styles.verifyText}>Vehicle Registration (RC) verified & valid</Text>
          </View>
          <View style={styles.verifyItem}>
            <CheckCircle2 size={16} color={Colors.emerald} />
            <Text style={styles.verifyText}>Commercial self-drive / transport insurance active</Text>
          </View>
          <View style={styles.verifyItem}>
            <CheckCircle2 size={16} color={Colors.emerald} />
            <Text style={styles.verifyText}>Pre-handover multi-point checklist completed</Text>
          </View>
        </View>

        {/* Rental Mode Selection */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionHeading}>SELECT RENTAL MODE</Text>
          <View style={styles.modeRow}>
            {vehicle.selfDriveEnabled && (
              <TouchableOpacity
                style={[styles.modeCard, rentalType === 'SELF_DRIVE' ? styles.modeCardSelected : null]}
                onPress={() => setRentalType('SELF_DRIVE')}
              >
                <Text style={[styles.modeCardTitle, rentalType === 'SELF_DRIVE' ? styles.modeCardTitleSelected : null]}>
                  Self-Drive
                </Text>
                <Text style={styles.modeCardSub}>You drive the vehicle</Text>
              </TouchableOpacity>
            )}

            {vehicle.chauffeurEnabled && (
              <TouchableOpacity
                style={[styles.modeCard, rentalType === 'CHAUFFEUR' ? styles.modeCardSelected : null]}
                onPress={() => setRentalType('CHAUFFEUR')}
              >
                <Text style={[styles.modeCardTitle, rentalType === 'CHAUFFEUR' ? styles.modeCardTitleSelected : null]}>
                  Chauffeur
                </Text>
                <Text style={styles.modeCardSub}>Verified commercial driver</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Duration Selector */}
        <View style={styles.durationSection}>
          <Text style={styles.sectionHeading}>TRIP DURATION</Text>
          <View style={styles.durationRow}>
            {[1, 2, 3, 5, 7].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.dayChip, durationDays === days ? styles.dayChipActive : null]}
                onPress={() => setDurationDays(days)}
              >
                <Text style={[styles.dayChipText, durationDays === days ? styles.dayChipTextActive : null]}>
                  {days} Day{days > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transparent Price Breakdown */}
        <View style={styles.pricingCard}>
          <Text style={styles.sectionHeading}>TRANSPARENT PRICE BREAKDOWN</Text>
          {isQuoteLoading ? (
            <ActivityIndicator size="small" color={Colors.emerald} style={{ padding: Spacing.md }} />
          ) : (
            <View style={styles.quoteDetails}>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Base Rental ({durationDays} days @ ₹{quote?.dailyRate || vehicle.dailyPrice}/day)</Text>
                <Text style={styles.quoteVal}>₹{(quote?.baseAmount || (vehicle.dailyPrice * durationDays)).toLocaleString('en-IN')}</Text>
              </View>
              {rentalType === 'CHAUFFEUR' && (
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Chauffeur Allowance</Text>
                  <Text style={styles.quoteVal}>₹{(quote?.totalDriverCharge || 0).toLocaleString('en-IN')}</Text>
                </View>
              )}
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Platform Fee (10%)</Text>
                <Text style={styles.quoteVal}>₹{(quote?.serviceFee || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Refundable Security Deposit</Text>
                <Text style={styles.quoteVal}>₹{(quote?.depositAmount || 2000).toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.quoteRow, styles.quoteTotalRow]}>
                <Text style={styles.quoteTotalLabel}>Total Payable Amount</Text>
                <Text style={styles.quoteTotalVal}>₹{(quote?.totalAmount || 0).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarPeriod}>Total ({durationDays} days)</Text>
          <Text style={styles.bottomBarTotal}>₹{(quote?.totalAmount || vehicle.dailyPrice * durationDays).toLocaleString('en-IN')}</Text>
        </View>
        <Button
          title="Reserve Vehicle"
          variant="emerald"
          size="lg"
          onPress={() => setShowBookingModal(true)}
          style={styles.reserveBtn}
        />
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Reservation Request"
      >
        <View style={styles.modalBody}>
          <Text style={styles.modalText}>
            You are requesting <Text style={{ fontWeight: '700' }}>{vehicle.title}</Text> in{' '}
            <Text style={{ fontWeight: '700' }}>{vehicle.location}</Text> for {durationDays} days.
          </Text>
          <View style={styles.modalQuoteBox}>
            <Text style={styles.modalQuoteTitle}>Total Quoted Amount:</Text>
            <Text style={styles.modalQuoteVal}>₹{(quote?.totalAmount || 0).toLocaleString('en-IN')}</Text>
            <Text style={styles.modalQuoteSub}>Includes refundable security deposit and verified insurance.</Text>
          </View>
          <Button
            title="Confirm & Request"
            variant="emerald"
            size="lg"
            loading={bookingMutation.isPending}
            onPress={() => bookingMutation.mutate()}
            style={{ marginTop: Spacing.base }}
          />
        </View>
      </Modal>
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
    paddingBottom: 100,
  },
  imageWrapper: {
    width: '100%',
    height: 260,
    backgroundColor: Colors.gray200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backFloatBtn: {
    position: 'absolute',
    top: Spacing.huge,
    left: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  cardHeader: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  specsSection: {
    padding: Spacing.base,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  specBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  specBoxTitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  specBoxVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  complianceCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.emeraldLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: Spacing.base,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.emeraldDark,
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  verifyText: {
    fontSize: 12,
    color: Colors.navy,
  },
  modeSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  modeCardSelected: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldLight,
  },
  modeCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  modeCardTitleSelected: {
    color: Colors.emeraldDark,
  },
  modeCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  durationSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dayChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.navy,
  },
  dayChipTextActive: {
    color: Colors.white,
  },
  pricingCard: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  quoteDetails: {
    gap: Spacing.sm,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quoteLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  quoteVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  quoteTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quoteTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
  quoteTotalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.emerald,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.md,
  },
  bottomBarPeriod: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  bottomBarTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
  },
  reserveBtn: {
    paddingHorizontal: Spacing.xl,
  },
  modalBody: {
    paddingTop: Spacing.xs,
  },
  modalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalQuoteBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalQuoteTitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  modalQuoteVal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.emerald,
    marginTop: 2,
  },
  modalQuoteSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
