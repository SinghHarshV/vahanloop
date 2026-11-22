import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../../src/api/notifications';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius } from '../../src/theme/spacing';
import { Header } from '../../src/components/ui/Header';
import { Bell, CheckCheck, ShieldAlert, Calendar, CreditCard } from 'lucide-react-native';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markAllMutation = useMutation({
    mutationFn: () => markNotificationRead(undefined, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return <Calendar size={18} color={Colors.emerald} />;
      case 'PAYMENT':
        return <CreditCard size={18} color="#2563EB" />;
      case 'SECURITY':
      case 'COMPLIANCE':
        return <ShieldAlert size={18} color="#D97706" />;
      default:
        return <Bell size={18} color={Colors.navy} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle="Booking and security alerts"
        rightAction={
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck size={16} color={Colors.emerald} />
            <Text style={styles.markAllText}>Mark read</Text>
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
        ) : !notifications || notifications.length === 0 ? (
          <View style={styles.empty}>
            <Bell size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>You have no unread notifications.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View
              key={item.id}
              style={[styles.notificationCard, !item.isRead ? styles.unreadCard : null]}
            >
              <View style={styles.iconCircle}>{getIcon(item.type)}</View>
              <View style={styles.contentCol}>
                <View style={styles.topRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
              </View>
            </View>
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
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  center: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.emerald,
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.navy,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  unreadCard: {
    borderColor: Colors.emerald,
    backgroundColor: '#F0FDF4',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    flex: 1,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  itemMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
