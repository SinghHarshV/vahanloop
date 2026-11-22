import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Vehicle } from '@vahanloop/shared';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { Star, MapPin, Fuel, Gauge, Users } from 'lucide-react-native';
import { Badge } from './Badge';

export interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const imageUrl = vehicle.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.topBadgeRow}>
          <Badge
            label={vehicle.category}
            variant="emerald"
            style={styles.categoryBadge}
          />
          {vehicle.selfDriveEnabled && (
            <Badge label="Self-Drive" variant="info" style={styles.modeBadge} />
          )}
          {vehicle.chauffeurEnabled && (
            <Badge label="Chauffeur" variant="warning" style={styles.modeBadge} />
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {vehicle.title || `${vehicle.make} ${vehicle.model}`}
          </Text>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.rating ? vehicle.rating.toFixed(1) : '4.8'}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={13} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {vehicle.location}
          </Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Gauge size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.transmission || 'Manual'}</Text>
          </View>
          <View style={styles.specItem}>
            <Fuel size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.fuelType || 'Petrol'}</Text>
          </View>
          <View style={styles.specItem}>
            <Users size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.seatingCapacity || 5} Seats</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.pricePeriod}>Starting from</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>₹{vehicle.dailyPrice?.toLocaleString('en-IN') || '1,800'}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Book Now</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  content: {
    padding: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  specText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricePeriod: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  viewButton: {
    backgroundColor: Colors.emerald,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
