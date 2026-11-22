import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Shield, Navigation, Calendar, User } from 'lucide-react-native';

export default function DriverTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
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
        name="home"
        options={{
          title: 'Duty',
          tabBarIcon: ({ color, size }) => <Shield size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments/index"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, size }) => <Navigation size={size || 22} color={color} />,
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
        name="assignments/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
