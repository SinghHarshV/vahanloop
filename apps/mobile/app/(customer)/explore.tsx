import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
import { CategoryPill } from '../../src/components/ui/CategoryPill';
import { OPERATIONAL_CITIES, VEHICLE_CATEGORIES } from '@vahanloop/shared';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';

export default function ExploreScreen() {
  const router = useRouter();
  const {
    category,
    setCategory,
    location,
    setLocation,
    rentalType,
    setRentalType,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useFilterStore();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const { data: vehicles, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vehicles_explore', category, location, rentalType, searchQuery, sortBy],
    queryFn: () =>
      getVehicles({
        category,
        location,
        rentalType,
        search: searchQuery,
        sort: sortBy,
      }),
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.topSearch}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search make, model, city..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilterModal(!showFilterModal)}
        >
          <SlidersHorizontal size={18} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      {/* Filter Options Expandable */}
      {showFilterModal && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterSectionTitle}>RENTAL MODE</Text>
          <View style={styles.pillRow}>
            {(['ALL', 'SELF_DRIVE', 'CHAUFFEUR'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterModeChip,
                  rentalType === mode ? styles.filterModeChipActive : null,
                ]}
                onPress={() => setRentalType(mode)}
              >
                <Text
                  style={[
                    styles.filterModeText,
                    rentalType === mode ? styles.filterModeTextActive : null,
                  ]}
                >
                  {mode === 'ALL' ? 'All Modes' : mode === 'SELF_DRIVE' ? 'Self-Drive' : 'Chauffeur'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>LOCATION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {OPERATIONAL_CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cityChip, location === c ? styles.cityChipActive : null]}
                onPress={() => setLocation(c)}
              >
                <Text style={[styles.cityText, location === c ? styles.cityTextActive : null]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSectionTitle}>SORT ORDER</Text>
          <View style={styles.pillRow}>
            {[
              { id: 'recommended', label: 'Recommended' },
              { id: 'price_low', label: 'Price: Low to High' },
              { id: 'rating', label: 'Top Rated' },
            ].map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sortChip, sortBy === s.id ? styles.sortChipActive : null]}
                onPress={() => setSortBy(s.id as any)}
              >
                <Text style={[styles.sortText, sortBy === s.id ? styles.sortTextActive : null]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Horizontal Category Chips */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {VEHICLE_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.label}
              isSelected={category === cat.id}
              onPress={() => setCategory(cat.id as any)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Vehicles List */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.emerald}
          />
        }
      >
        <View style={styles.resultsCountRow}>
          <Text style={styles.resultsCount}>
            {vehicles ? `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'} available` : 'Searching...'}
          </Text>
          {location !== 'All Cities' && (
            <Text style={styles.locationTag}>in {location}</Text>
          )}
        </View>

        {isLoading ? (
          <>
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </>
        ) : !vehicles || vehicles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matching vehicles</Text>
            <Text style={styles.emptyMessage}>
              Try adjusting your category, rental type, or selected city.
            </Text>
          </View>
        ) : (
          vehicles.map((veh) => (
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
  topSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: 14,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPanel: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterModeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  filterModeChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterModeTextActive: {
    color: Colors.white,
  },
  cityScroll: {
    flexDirection: 'row',
  },
  cityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
    marginRight: Spacing.xs,
  },
  cityChipActive: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cityTextActive: {
    color: Colors.white,
  },
  sortChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  sortChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortTextActive: {
    color: Colors.white,
  },
  categoryBar: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  locationTag: {
    fontSize: 13,
    color: Colors.emerald,
    fontWeight: '600',
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
  },
  emptyMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
