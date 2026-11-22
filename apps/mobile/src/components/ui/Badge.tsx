import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Spacing, BorderRadius } from '../../theme/spacing';

export interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'emerald';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  backgroundColor,
  variant = 'neutral',
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'emerald':
        return { bg: '#DDF5E9', text: '#15966B' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'danger':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'info':
        return { bg: '#DBEAFE', text: '#2563EB' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const v = getVariantStyles();
  const bg = backgroundColor || v.bg;
  const textColor = color || v.text;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
