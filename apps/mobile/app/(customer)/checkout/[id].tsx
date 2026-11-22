import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookingDetails, createPaymentOrder, simulatePayment } from '../../../src/api/bookings';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Button } from '../../../src/components/ui/Button';
import { ShieldCheck, QrCode, CreditCard, Building2, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { data: booking, isLoading: isBookingLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingDetails(id!),
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      // 1. Create order on backend (test mode order)
      const order = await createPaymentOrder(id!);

      // 2. Perform test-mode payment simulation through backend
      const result = await simulatePayment(id!, paymentMode);
      return { order, result };
    },
    onSuccess: (data) => {
      setTransactionId(data.order.orderId);
      setPaymentSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['customer_bookings'] });
    },
    onError: (err: any) => {
      Alert.alert('Payment Failed', err?.message || 'Could not process test transaction.');
    },
  });

  if (isBookingLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.emerald} />
      </View>
    );
  }

  if (paymentSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successWrapper}>
          <View style={styles.successIcon}>
            <CheckCircle size={54} color={Colors.emerald} />
          </View>
          <Text style={styles.successTitle}>Payment Verified & Confirmed</Text>
          <Text style={styles.successSub}>
            Your reservation for <Text style={{ fontWeight: '700' }}>{booking?.vehicle?.title}</Text> has been confirmed.
          </Text>

          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction Reference</Text>
              <Text style={styles.receiptVal}>{transactionId || `order_${id?.slice(-8)}`}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount Paid (Test Mode)</Text>
              <Text style={styles.receiptVal}>₹{booking?.totalAmount?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Handover Location</Text>
              <Text style={styles.receiptVal}>{booking?.pickupLocation}</Text>
            </View>
          </View>

          <Button
            title="View Booking Itinerary"
            variant="emerald"
            size="lg"
            onPress={() => router.replace(`/(customer)/bookings/${id}`)}
            style={{ width: '100%', marginTop: Spacing.xl }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Complete Payment" subtitle="Razorpay Test Gateway" showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Payment Summary */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>QUOTED PAYABLE AMOUNT</Text>
          <Text style={styles.quoteAmount}>₹{booking?.totalAmount?.toLocaleString('en-IN') || '0'}</Text>
          <Text style={styles.quoteNote}>
            Includes ₹{booking?.depositAmount || 2000} refundable security deposit and verified insurance.
          </Text>
        </View>

        {/* Test Mode Notice */}
        <View style={styles.testModeBanner}>
          <AlertCircle size={18} color="#D97706" />
          <View style={{ flex: 1 }}>
            <Text style={styles.testModeTitle}>TEST MODE ONLY</Text>
            <Text style={styles.testModeText}>
              No actual funds will be deducted from your account. Signatures are verified server-side.
            </Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <Text style={styles.sectionHeading}>SELECT TEST PAYMENT MODE</Text>
        <View style={styles.modeGrid}>
          <TouchableOpacity
            style={[styles.modeCard, paymentMode === 'UPI' ? styles.modeCardSelected : null]}
            onPress={() => setPaymentMode('UPI')}
          >
            <QrCode size={24} color={paymentMode === 'UPI' ? Colors.emerald : Colors.navy} />
            <Text style={[styles.modeTitle, paymentMode === 'UPI' ? styles.modeTitleSelected : null]}>
              UPI / QR
            </Text>
            <Text style={styles.modeSub}>GPay, PhonePe, Paytm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, paymentMode === 'CARD' ? styles.modeCardSelected : null]}
            onPress={() => setPaymentMode('CARD')}
          >
            <CreditCard size={24} color={paymentMode === 'CARD' ? Colors.emerald : Colors.navy} />
            <Text style={[styles.modeTitle, paymentMode === 'CARD' ? styles.modeTitleSelected : null]}>
              Credit / Debit Card
            </Text>
            <Text style={styles.modeSub}>Visa, Mastercard, RuPay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, paymentMode === 'NETBANKING' ? styles.modeCardSelected : null]}
            onPress={() => setPaymentMode('NETBANKING')}
          >
            <Building2 size={24} color={paymentMode === 'NETBANKING' ? Colors.emerald : Colors.navy} />
            <Text style={[styles.modeTitle, paymentMode === 'NETBANKING' ? styles.modeTitleSelected : null]}>
              NetBanking
            </Text>
            <Text style={styles.modeSub}>All Major Banks</Text>
          </TouchableOpacity>
        </View>

        {/* Security Assurance */}
        <View style={styles.securityRow}>
          <ShieldCheck size={18} color={Colors.emerald} />
          <Text style={styles.securityText}>256-Bit SSL Encrypted & Idempotent Verification</Text>
        </View>

        <Button
          title={`Pay ₹${booking?.totalAmount?.toLocaleString('en-IN')} (Test Mode)`}
          variant="emerald"
          size="lg"
          loading={payMutation.isPending}
          onPress={() => payMutation.mutate()}
          style={styles.payBtn}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  quoteCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  quoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  quoteAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.navy,
    marginVertical: Spacing.xs,
  },
  quoteNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  testModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  testModeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  testModeText: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  modeGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  modeCardSelected: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldLight,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.xs,
  },
  modeTitleSelected: {
    color: Colors.emeraldDark,
  },
  modeSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  payBtn: {
    width: '100%',
  },
  successWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
});
