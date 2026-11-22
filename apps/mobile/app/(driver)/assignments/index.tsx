import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { MapPin, Navigation, Calendar, ChevronRight } from 'lucide-react-native';

const DEMO_ASSIGNMENTS = [
  {
    id: 'assign-1',
    status: 'EN_ROUTE',
    vehicleTitle: 'Mahindra Thar LX 4x4',
    vehiclePlate: 'MP-20-CB-4089',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    pickupLocation: 'Hotel Gulzar Towers, Civil Lines, Jabalpur',
    dropLocation: 'Dumna Airport Terminal, Jabalpur',
    pickupDateTime: '2026-11-22T09:00:00Z',
  },
  {
    id: 'assign-2',
    status: 'ASSIGNED',
    vehicleTitle: 'Tata Nexon.ev Fearless',
    vehiclePlate: 'MP-20-EV-1024',
    customerName: 'Pooja Verma',
    customerPhone: '+91 91234 56789',
    pickupLocation: 'Vijay Nagar Square, Jabalpur',
    dropLocation: 'Bhedaghat Dhuandhar Falls',
    pickupDateTime: '2026-11-23T10:30:00Z',
  },
];

export default function DriverAssignmentsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Trip Assignments" subtitle="Commercial chauffeur transit roster" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {DEMO_ASSIGNMENTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/(driver)/assignments/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehTitle}>{item.vehicleTitle}</Text>
                <Text style={styles.plate}>{item.vehiclePlate}</Text>
              </View>
              <Badge
                label={item.status === 'EN_ROUTE' ? 'EN ROUTE' : 'CONFIRMED'}
                variant={item.status === 'EN_ROUTE' ? 'info' : 'success'}
              />
            </View>

            <View style={styles.routeBox}>
              <View style={styles.routeItem}>
                <MapPin size={14} color={Colors.emerald} />
                <Text style={styles.routeText} numberOfLines={1}>
                  Pickup: {item.pickupLocation}
                </Text>
              </View>
              <View style={styles.routeItem}>
                <Navigation size={14} color="#2563EB" />
                <Text style={styles.routeText} numberOfLines={1}>
                  Drop: {item.dropLocation}
                </Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.passengerText}>Passenger: {item.customerName}</Text>
              <ChevronRight size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: Spacing.sm,
  },
  vehTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  plate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  routeBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 12,
    color: Colors.navy,
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  passengerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
