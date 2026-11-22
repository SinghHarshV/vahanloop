import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getVehicles } from '../../src/api/vehicles';
import { useFilterStore } from '../../src/store/filterStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { VehicleCard } from '../../src/components/ui/VehicleCard';
import { VehicleCardSkeleton } from '../../src/components/ui/LoadingSkeleton';
import { OPERATIONAL_CITIES, VEHICLE_CATEGORIES } from '@vahanloop/shared';
import {
  MapPin,
  Search,
  ChevronDown,
  Car,
  Key,
  Shield,
  Zap,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { category, setCategory, location, setLocation } = useFilterStore();
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const { data: vehicles, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vehicles', category, location],
    queryFn: () => getVehicles({ category, location }),
  });

  const featured = (vehicles || []).slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>
            Vahan<Text style={styles.brandAccent}>Loop</Text>
          </Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setCityModalVisible(!cityModalVisible)}
          >
            <MapPin size={13} color={Colors.emerald} />
            <Text style={styles.locationText}>{location}</Text>
            <ChevronDown size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.hostPill}
          onPress={() => router.push('/(customer)/profile')}
        >
          <Key size={14} color={Colors.navy} />
          <Text style={styles.hostPillText}>Host a Car</Text>
        </TouchableOpacity>
      </View>

      {/* City Dropdown Selector */}
      {cityModalVisible && (
        <View style={styles.cityDropdown}>
          <Text style={styles.cityDropdownTitle}>SELECT OPERATIONAL CITY</Text>
          <View style={styles.cityGrid}>
            {OPERATIONAL_CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityChip,
                  location === city ? styles.cityChipActive : null,
                ]}
                onPress={() => {
                  setLocation(city);
                  setCityModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.cityChipText,
                    location === city ? styles.cityChipTextActive : null,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
        {/* Search Bar Action */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push('/(customer)/explore')}
        >
          <Search size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search self-drive cars, bikes, scooters...
          </Text>
        </TouchableOpacity>

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {VEHICLE_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catCard, isSelected ? styles.catCardSelected : null]}
                onPress={() => setCategory(cat.id as any)}
              >
                <View style={[styles.catIconCircle, isSelected ? styles.catIconCircleSelected : null]}>
                  {cat.id === 'CAR' ? (
                    <Car size={18} color={isSelected ? Colors.white : Colors.navy} />
                  ) : cat.id === 'BIKE' ? (
                    <Zap size={18} color={isSelected ? Colors.white : Colors.navy} />
                  ) : (
                    <Shield size={18} color={isSelected ? Colors.white : Colors.navy} />
                  )}
                </View>
                <Text style={[styles.catText, isSelected ? styles.catTextSelected : null]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>100% VERIFIED FLEET</Text>
            </View>
            <Text style={styles.promoTitle}>Verified Self-Drive & Chauffeur Rides</Text>
            <Text style={styles.promoDesc}>
              RC, transport permit, and commercial insurance verified before handover.
            </Text>
          </View>
        </View>

        {/* Featured Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Vehicles</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/explore')}>
            <Text style={styles.seeAllText}>View All ({vehicles?.length || 0})</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle List */}
        {isLoading ? (
          <>
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </>
        ) : featured.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Car size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No vehicles found in {location}</Text>
            <Text style={styles.emptySub}>Try switching city to Jabalpur, Bengaluru or All Cities.</Text>
          </View>
        ) : (
          featured.map((veh) => (
            <VehicleCard
              key={veh.id}
              vehicle={veh}
              onPress={() => router.push(`/(customer)/vehicle/${veh.id}`)}
            />
          ))
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
  },
  brandAccent: {
    color: Colors.emerald,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  hostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hostPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  cityDropdown: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cityDropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  cityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  cityChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cityChipTextActive: {
    color: Colors.white,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Colors.textMuted,
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  catCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  catCardSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  catIconCircleSelected: {
    backgroundColor: Colors.emerald,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  catTextSelected: {
    color: Colors.white,
  },
  promoBanner: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  promoContent: {
    gap: Spacing.xs,
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.emerald,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  promoDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.emerald,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    marginTop: 2,
    textAlign: 'center',
  },
});
