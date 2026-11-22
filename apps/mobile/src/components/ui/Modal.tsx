import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../theme/spacing';
import { X } from 'lucide-react-native';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  contentStyle,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, contentStyle]}>
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {title || ''}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.body}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 36, 58, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    flex: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    width: '100%',
  },
});
