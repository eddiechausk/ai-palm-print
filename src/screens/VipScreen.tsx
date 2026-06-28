/**
 * VipScreen.tsx — Pro 会员页
 * 对标小程序 pages/vip/vip
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { purchase, PRODUCT_IDS } from '../services/payment';

const BENEFITS = [
  { icon: '◇', title: '无限次扫描', desc: '每日不限量掌纹分析' },
  { icon: '◈', title: '优先解锁',   desc: '优先生成完整报告' },
  { icon: '◆', title: 'AI 顾问',    desc: '专属 AI 掌纹分析顾问' },
  { icon: '◉', title: '深度洞察',   desc: '8000+ 字深度解读' },
];

export default function VipScreen() {
  const { isVip, vipExpiry } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const ok = await purchase(PRODUCT_IDS.VIP_MONTHLY);
      if (ok) {
        Alert.alert('开通成功', 'Pro 权益已激活，感谢支持！');
      }
    } catch {
      Alert.alert('支付失败', '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 头部 */}
      <LinearGradient
        colors={['rgba(208,188,255,0.12)', 'rgba(0,241,254,0.06)', 'transparent']}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>掌纹智鉴</Text>
        <Text style={styles.heroTitle}>专业版</Text>
        <Text style={styles.heroSub}>解锁你的潜能</Text>

        {isVip ? (
          <View style={styles.vipBadge}>
            <Text style={styles.vipBadgeText}>
              ✦ 已激活 · {vipExpiry ? new Date(vipExpiry).toLocaleDateString() : ''} 到期
            </Text>
          </View>
        ) : (
          <Text style={styles.heroPrice}>¥9.9 / 月</Text>
        )}
      </LinearGradient>

      {/* 权益列表 */}
      <Text style={styles.sectionTitle}>专属权益</Text>
      <View style={styles.benefitGrid}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>{b.icon}</Text>
            <Text style={styles.benefitTitle}>{b.title}</Text>
            <Text style={styles.benefitDesc}>{b.desc}</Text>
          </View>
        ))}
      </View>

      {/* 购买按钮 */}
      {!isVip && (
        <TouchableOpacity
          style={[styles.buyBtn, loading && { opacity: 0.6 }]}
          onPress={handleBuy}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(208,188,255,0.2)', 'rgba(0,241,254,0.1)']}
            style={styles.buyBtnGrad}
          >
            <Text style={styles.buyBtnText}>
              {loading ? '处理中...' : '激活 · ¥9.9'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* 联系客服 */}
      <View style={styles.contactBar}>
        <Text style={styles.contactText}>有疑问？联系 AI 顾问</Text>
        <Text style={styles.contactArrow}>→</Text>
      </View>
      <Text style={styles.note}>
        * 价格含税，有效期一个月，到期后不自动续费。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { paddingBottom: 60 },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
  },
  heroLabel: {
    color: colors.textMuted,
    fontSize: typography.xs,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.purple,
    fontSize: typography.xxl,
    fontWeight: '700',
    letterSpacing: 4,
  },
  heroSub: {
    color: colors.textMuted,
    fontSize: typography.sm,
    letterSpacing: 2,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  heroPrice: {
    color: colors.cyan,
    fontSize: typography.hero,
    fontWeight: '700',
    letterSpacing: 2,
  },
  vipBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(208,188,255,0.12)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.3)',
  },
  vipBadgeText: {
    color: colors.purple,
    fontSize: typography.sm,
    letterSpacing: 2,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.xs,
    letterSpacing: 4,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  benefitCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderPurple,
    padding: spacing.md,
    width: '47%',
  },
  benefitIcon:  { fontSize: 20, marginBottom: spacing.xs, color: colors.purple },
  benefitTitle: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  benefitDesc:  { color: colors.textMuted, fontSize: typography.xs, marginTop: 4 },
  buyBtn: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  buyBtnGrad: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.3)',
  },
  buyBtnText: {
    color: colors.purple,
    fontSize: typography.lg,
    fontWeight: '700',
    letterSpacing: 2,
  },
  contactBar: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0,241,254,0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactText:  { color: colors.cyan, fontSize: typography.sm, letterSpacing: 1 },
  contactArrow: { color: colors.cyan, fontSize: typography.base, opacity: 0.6 },
  note: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    opacity: 0.5,
  },
});
