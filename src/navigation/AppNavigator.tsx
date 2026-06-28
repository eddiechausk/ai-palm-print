/**
 * AppNavigator.tsx — 路由 + 底部 Tab
 * 对标小程序 app.json tabBar 配置
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import ScanScreen    from '../screens/ScanScreen';
import ResultScreen  from '../screens/ResultScreen';
import VipScreen     from '../screens/VipScreen';
import MineScreen    from '../screens/MineScreen';
import HistoryScreen from '../screens/HistoryScreen';

import { colors, typography } from '../theme';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab 图标（纯文字 Icon，与小程序科技感设计对标）
const ICONS: Record<string, { active: string; inactive: string }> = {
  扫描: { active: '⊕', inactive: '⊙' },
  我的: { active: '◉', inactive: '◎' },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgDark,
          borderTopColor: 'rgba(0,241,254,0.12)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   colors.cyan,
        tabBarInactiveTintColor: '#909096',
        tabBarLabelStyle: {
          fontSize: typography.xs,
          letterSpacing: 2,
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color }) => {
          const icon = ICONS[route.name];
          return (
            <Text style={{ fontSize: 20, color }}>
              {focused ? icon?.active : icon?.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="扫描" component={ScanScreen} />
      <Tab.Screen name="我的" component={MineScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bgDark,
            borderBottomColor: 'rgba(0,241,254,0.12)',
          },
          headerTintColor: colors.cyan,
          headerTitleStyle: {
            fontSize: typography.base,
            letterSpacing: 2,
            fontWeight: '600',
          },
        }}
      >
        {/* Tab 主界面（无 header） */}
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        {/* 子页面 */}
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: '分析报告' }}
        />
        <Stack.Screen
          name="Vip"
          component={VipScreen}
          options={{ title: 'Pro 专业版' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '历史记录' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
