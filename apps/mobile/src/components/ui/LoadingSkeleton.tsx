import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Spacing } from '../../theme/spacing';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
};

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <Skeleton height={180} borderRadius={BorderRadius.lg} style={styles.cardImg} />
      <View style={styles.cardPadding}>
        <Skeleton height={20} width="70%" style={styles.mb} />
        <Skeleton height={14} width="40%" style={styles.mb} />
        <Skeleton height={16} width="90%" style={styles.mb} />
        <View style={styles.row}>
          <Skeleton height={24} width="35%" />
          <Skeleton height={36} width="30%" borderRadius={BorderRadius.md} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray200,
  },
  cardSkeleton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  cardImg: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardPadding: {
    padding: Spacing.base,
  },
  mb: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
