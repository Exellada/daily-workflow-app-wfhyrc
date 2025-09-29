
import React from 'react';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import i18n from '@/localization';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.grey + '30',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('checklist'),
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="checklist" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: i18n.t('completedTasks'),
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="checkmark.circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('settings'),
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="gearshape" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
