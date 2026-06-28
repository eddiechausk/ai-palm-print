/**
 * MineScreen.tsx — 我的页
 * 对标小程序 pages/mine/mine
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';

const MENU_ITEMS = [
  { icon: '◈', label: '扫描历史', route: 'History' },
  { icon: '◇', label: '设置',     route: 'Settings' },
  { icon: '◆', label: 'AI 顾问',  route: null, isContact: true },
];

export default function MineScreen() {
  const navigation = useNavigation<any>();
  const { isVip, vipExpiry, userId } = useAppStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 用户头部 */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {isVip ? '✦' : '○'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {isVip ? '专业会员' : '访客模式'}
          </Text>
          <Text style={styles.userSub}>
            {isVip
              ? `已激活 · ${vipExpiry ? new Date(vipExpiry).toLocaleDateString() : ''} 到期`
              : 'UID: ' + (userId ?? '未登录')}
          </Text>
        </View>
        {isVip && (
          <View style={styles.vipTag}>
            <Text style={styles.vipTagText}>PRO</Text>
          </View>
        )}
      </View>

      {/* VIP 入口 */}
      {!isVip && (
        <TouchableOpacity
          style={styles.vipBanner}
          onPress={() => navigation.navigate('Vip')}
          activeOpacity={0.85}
        >
          <Text style={styles.vipBannerText}>解锁专业版 · 无限扫描</Text>
          <Text style={styles.vipBannerPrice}>¥9.9 / 月 →</Text>
        </TouchableOpacity>
      )}

      {/* 菜单 */}
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuBorder]}
            onPress={() => item.route && navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 声明 */}
      <Text style={styles.disclaimer}>
        本内容由 AI 生成，仅供娱乐参考，不构成任何建议。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: spacing.lg, paddingBottom: 60 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,241,254,0.08)',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.cyan, fontSize: typography.xl },
  userInfo:  { flex: 1 },
  userName:  { color: colors.textPrimary, fontSize: typography.md, fontWeight: '600' },
  userSub:   { color: colors.textMuted, fontSize: typography.xs, marginTop: 4, letterSpacing: 1 },
  vipTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(208,188,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.3)',
  },
  vipTagText: { color: colors.purple, fontSize: typography.xs, fontWeight: '700', letterSpacing: 1 },
  vipBanner: {
    backgroundColor: 'rgba(208,188,255,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vipBannerText:  { color: colors.textPrimary, fontSize: typography.base, fontWeight: '500' },
  vipBannerPrice: { color: colors.purple, fontSize: typography.base, fontWeight: '700' },
  menuCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuIcon:  { color: colors.cyan, fontSize: typography.lg, marginRight: spacing.md, width: 28 },
  menuLabel: { flex: 1, color: colors.textPrimary, fontSize: typography.base },
  menuArrow: { color: colors.textDim, fontSize: typography.xl },
  disclaimer: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
});
