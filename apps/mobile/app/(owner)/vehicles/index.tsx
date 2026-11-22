import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getOwnerVehicles } from '../../../src/api/owner';
import { Colors } from '../../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../../src/theme/spacing';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Plus, MapPin, Gauge, Fuel, Car } from 'lucide-react-native';

export default function OwnerVehiclesScreen() {
  const router = useRouter();

  const { data: vehicles, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['owner_vehicles'],
    queryFn: getOwnerVehicles,
  });

  return (
    <View style={styles.container}>
      <Header
        title="Fleet Inventory"
        subtitle="Manage your listed rental vehicles"
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(owner)/vehicles/add')}
          >
            <Plus size={16} color={Colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
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
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.emerald} />
          </View>
        ) : !vehicles || vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Car size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No vehicles registered yet</Text>
            <Text style={styles.emptySub}>
              Start monetising your fleet by listing your first car or bike.
            </Text>
            <TouchableOpacity
              style={styles.addFirstBtn}
              onPress={() => router.push('/(owner)/vehicles/add')}
            >
              <Text style={styles.addFirstBtnText}>Register Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((veh) => {
            const img = veh.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            const isApproved = veh.approvalStatus === 'APPROVED';

            return (
              <View key={veh.id} style={styles.card}>
                <Image source={{ uri: img }} style={styles.cardImg} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {veh.title || `${veh.make} ${veh.model}`}
                    </Text>
                    <Badge
                      label={isApproved ? 'ACTIVE LISTING' : 'PENDING REVIEW'}
                      variant={isApproved ? 'success' : 'warning'}
                    />
                  </View>

                  <View style={styles.locRow}>
                    <MapPin size={13} color={Colors.textMuted} />
                    <Text style={styles.locText}>{veh.location}</Text>
                  </View>

                  <View style={styles.specsRow}>
                    <View style={styles.spec}>
                      <Gauge size={13} color={Colors.textSecondary} />
                      <Text style={styles.specText}>{veh.transmission || 'Manual'}</Text>
                    </View>
                    <View style={styles.spec}>
                      <Fuel size={13} color={Colors.textSecondary} />
                      <Text style={styles.specText}>{veh.fuelType || 'Petrol'}</Text>
                    </View>
                    <Text style={styles.categoryTag}>{veh.category}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <View>
                      <Text style={styles.priceLabel}>Daily Rental Rate</Text>
                      <Text style={styles.priceVal}>₹{veh.dailyPrice?.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {veh.selfDriveEnabled && veh.chauffeurEnabled ? 'Self-Drive & Chauffeur' : veh.chauffeurEnabled ? 'Chauffeur Only' : 'Self-Drive'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  addFirstBtn: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addFirstBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardImg: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.gray100,
  },
  cardBody: {
    padding: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    flex: 1,
    marginRight: Spacing.sm,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryTag: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  statusPill: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    color: Colors.navy,
    fontWeight: '600',
  },
});
