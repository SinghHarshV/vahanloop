import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { LayoutDashboard, Car, CalendarCheck, TrendingUp, User } from 'lucide-react-native';

export default function OwnerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicles/index"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color, size }) => <Car size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicles/add"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
