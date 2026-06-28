/**
 * ResultScreen.tsx — 分析报告
 * 对标小程序 pages/result/result
 * 显示 AI 掌纹分析结果
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { unlockReport, getHistory } from '../services/palmAnalysis';
import { purchase, PRODUCT_IDS } from '../services/payment';

export default function ResultScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { currentResult, isVip, setCurrentResult } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // 如果没有传入结果，尝试从 store 获取
  const result = route.params?.result || currentResult;

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>暂无分析结果</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.backBtnText}>返回扫描</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 判断哪些部分已解锁
  const isSectionUnlocked = (section: string) => {
    return !result.lockedSections?.includes(section) || isVip;
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const ok = await purchase(PRODUCT_IDS.UNLOCK_REPORT);
      if (ok) {
        const unlocked = await unlockReport(result.reportId);
        setCurrentResult(unlocked);
      }
    } catch (error) {
      console.error('解锁失败:', error);
    } finally {
      setUnlocking(false);
    }
  };

  const handleUpgradeVip = async () => {
    await purchase(PRODUCT_IDS.VIP_MONTHLY);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 标题 */}
      <Text style={styles.title}>掌纹分析报告</Text>
      <Text style={styles.subtitle}>基于 AI 视觉识别与个性分析</Text>

      {/* 免费区：开篇概述 */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>◉</Text>
          <Text style={styles.sectionTitle}>开篇概述</Text>
        </View>
        <Text style={styles.sectionText}>{result.intro}</Text>
      </View>

      {/* 免费区：思维模式 */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>◎</Text>
          <Text style={styles.sectionTitle}>思维模式</Text>
        </View>
        <Text style={styles.sectionText}>{result.mind}</Text>
      </View>

      {/* 免费区：性格特质 */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>◆</Text>
          <Text style={styles.sectionTitle}>性格特质</Text>
        </View>
        <Text style={styles.sectionText}>{result.heart}</Text>
      </View>

      {/* 锁定提示 */}
      {result.lockedSections && result.lockedSections.length > 0 && (
        <View style={styles.lockCard}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>深度分析已锁定</Text>
          <Text style={styles.lockDesc}>
            解锁后查看完整报告，包括行为模式、健康指数、潜能分析、关系洞察等深度内容
          </Text>

          {unlocking ? (
            <ActivityIndicator size="small" color={colors.cyan} />
          ) : (
            <View style={styles.unlockBtns}>
              <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                <Text style={styles.unlockBtnText}>解锁完整报告 ¥0.1</Text>
              </TouchableOpacity>
              
              {!isVip && (
                <TouchableOpacity style={styles.vipBtn} onPress={handleUpgradeVip}>
                  <Text style={styles.vipBtnText}>升级 Pro · ¥9.9/月 · 无限次解锁</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* 深度区：行为模式（需要解锁） */}
      {isSectionUnlocked('action') && result.action && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>▸</Text>
            <Text style={styles.sectionTitle}>行为模式</Text>
          </View>
          <Text style={styles.sectionText}>{result.action}</Text>
        </View>
      )}

      {/* 深度区：健康指数（需要解锁） */}
      {isSectionUnlocked('health') && result.health && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✚</Text>
            <Text style={styles.sectionTitle}>健康指数</Text>
          </View>
          <Text style={styles.sectionText}>{result.health}</Text>
        </View>
      )}

      {/* 深度区：潜能分析（需要解锁） */}
      {isSectionUnlocked('wealth') && result.wealth && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>☆</Text>
            <Text style={styles.sectionTitle}>潜能分析</Text>
          </View>
          <Text style={styles.sectionText}>{result.wealth}</Text>
        </View>
      )}

      {/* 深度区：关系洞察（需要解锁） */}
      {isSectionUnlocked('emotion_deep') && result.emotion_deep && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❤</Text>
            <Text style={styles.sectionTitle}>关系洞察</Text>
          </View>
          <Text style={styles.sectionText}>{result.emotion_deep}</Text>
        </View>
      )}

      {/* 深度区：趋势建议（需要解锁） */}
      {isSectionUnlocked('future') && result.future && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>◈</Text>
            <Text style={styles.sectionTitle}>趋势建议</Text>
          </View>
          <Text style={styles.sectionText}>{result.future}</Text>
        </View>
      )}

      {/* 深度区：综合报告（需要解锁） */}
      {isSectionUnlocked('summary') && result.summary && (
        <View style={[styles.sectionCard, styles.summaryCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>◐</Text>
            <Text style={styles.sectionTitle}>综合报告</Text>
          </View>
          <Text style={styles.sectionText}>{result.summary}</Text>
        </View>
      )}

      {/* 底部间距 */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.base,
    textAlign: 'center',
    marginTop: 100,
  },
  backBtn: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  backBtnText: {
    color: colors.cyan,
    fontSize: typography.base,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.xl,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    color: colors.cyan,
    fontSize: typography.lg,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: typography.md,
    fontWeight: '600',
    letterSpacing: 2,
  },
  sectionText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    lineHeight: 24,
    opacity: 0.9,
  },
  lockCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.3)',
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  lockTitle: {
    color: colors.purple,
    fontSize: typography.md,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  lockDesc: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  unlockBtns: {
    width: '100%',
  },
  unlockBtn: {
    backgroundColor: 'rgba(0,241,254,0.08)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  unlockBtnText: {
    color: colors.cyan,
    fontSize: typography.base,
    fontWeight: '600',
  },
  vipBtn: {
    backgroundColor: 'rgba(208,188,255,0.08)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  vipBtnText: {
    color: colors.purple,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  summaryCard: {
    borderColor: 'rgba(0,241,254,0.3)',
    backgroundColor: 'rgba(0,241,254,0.03)',
  },
});
