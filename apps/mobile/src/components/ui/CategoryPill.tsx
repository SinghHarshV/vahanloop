import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';

export interface CategoryPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  label,
  isSelected,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.pill, isSelected ? styles.pillSelected : null]}
    >
      {icon ? icon : null}
      <Text style={[styles.text, isSelected ? styles.textSelected : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  pillSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  textSelected: {
    color: Colors.white,
  },
});
