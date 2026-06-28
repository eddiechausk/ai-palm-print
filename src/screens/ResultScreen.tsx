/**
 * ResultScreen.tsx — 分析报告
 * 对标小程序 pages/result/result
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated,
} from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { unlockReport } from '../services/palmAnalysis';
import { purchase, PRODUCT_IDS } from '../services/payment';

const DIMS = ['生命力', '智慧', '命运', '心灵'] as const;
type Dim = typeof DIMS[number];

export default function ResultScreen() {
  const route     = useNavigation<any>();
  const navigation = useNavigation<any>();
  const { currentResult, isVip } = useAppStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  if (!currentResult) return null;

  const dims: Record<Dim, number> = {
    生命力: currentResult.vitality,
    智慧:   currentResult.wisdom,
    命运:   currentResult.fate,
    心灵:   currentResult.heart,
  };

  /** 雷达图多边形顶点 */
  const radarPoints = (values: number[], cx = 75, cy = 75, r = 60) => {
    return DIMS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / DIMS.length - Math.PI / 2;
      const v = (values[i] ?? 0) / 100;
      return { x: cx + r * v * Math.cos(angle), y: cy + r * v * Math.sin(angle) };
    });
  };

  const pts = radarPoints(DIMS.map((d) => dims[d]));
  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(' ');

  const handleUnlock = async () => {
    const ok = await purchase(PRODUCT_IDS.UNLOCK_REPORT);
    if (ok) {
      await unlockReport(currentResult.uid);
    }
  };

  const handleUpgradeVip = async () => {
    await purchase(PRODUCT_IDS.VIP_MONTHLY);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 标题 */}
      <Text style={styles.title}>分析报告</Text>
      <Text style={styles.uid}>ID: {currentResult.uid}</Text>

      {/* 雷达图 */}
      <View style={styles.radarCard}>
        <Text style={styles.sectionTitle}>特征图谱</Text>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          {/* 底层网格 */}
          {[0.25, 0.5, 0.75, 1].map((scale) => {
            const gp = radarPoints(DIMS.map(() => scale * 100));
            return (
              <Polygon
                key={scale}
                points={gp.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(0,241,254,0.1)"
                strokeWidth="1"
              />
            );
          })}
          {/* 轴线 */}
          {DIMS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / DIMS.length - Math.PI / 2;
            return (
              <Line
                key={i}
                x1={75} y1={75}
                x2={75 + 60 * Math.cos(angle)}
                y2={75 + 60 * Math.sin(angle)}
                stroke="rgba(0,241,254,0.08)"
                strokeWidth="1"
              />
            );
          })}
          {/* 数据面 */}
          <Polygon
            points={polyPoints}
            fill="rgba(0,241,254,0.12)"
            stroke={colors.cyan}
            strokeWidth="1.5"
          />
          {/* 节点 */}
          {pts.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.cyan} />
          ))}
          <Circle cx={75} cy={75} r={4} fill={colors.purple} />
        </Svg>

        {/* 四维数值 */}
        <View style={styles.dimGrid}>
          {DIMS.map((d) => (
            <View key={d} style={styles.dimCard}>
              <Text style={styles.dimLabel}>{d}</Text>
              <Text style={styles.dimValue}>{dims[d]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 概述 */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>AI 概述</Text>
        <Text style={styles.summaryText}>{currentResult.summary}</Text>
      </View>

      {/* 锁定详情 */}
      {!currentResult.detail ? (
        <View style={styles.lockCard}>
          <Text style={styles.lockTitle}>完整报告已锁定</Text>
          <Text style={styles.lockSub}>解锁后查看深度分析 · 8000+ 字解读</Text>

          {isVip ? (
            <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
              <Text style={styles.unlockBtnText}>解锁报告 ¥0.1</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                <Text style={styles.unlockBtnText}>解锁报告 ¥0.1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.vipBtn} onPress={handleUpgradeVip}>
                <Text style={styles.vipBtnText}>升级 Pro · ¥9.9/月 · 无限次解锁</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>完整报告</Text>
          <Text style={styles.summaryText}>{currentResult.detail}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { padding: spacing.lg, paddingBottom: 60 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.xl,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  uid: {
    color: colors.textDim,
    fontSize: typography.xs,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.cyan,
    fontSize: typography.sm,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  radarCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dimGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dimCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.sm,
    minWidth: 72,
    alignItems: 'center',
  },
  dimLabel: { color: colors.textMuted, fontSize: typography.xs, letterSpacing: 1 },
  dimValue: { color: colors.cyan, fontSize: typography.lg, fontWeight: '700', marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryText: {
    color: colors.textPrimary,
    fontSize: typography.base,
    lineHeight: 24,
    opacity: 0.85,
  },
  lockCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lockTitle: {
    color: colors.purple,
    fontSize: typography.md,
    fontWeight: '600',
    letterSpacing: 2,
  },
  lockSub: {
    color: colors.textMuted,
    fontSize: typography.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
  unlockBtnText: { color: colors.cyan, fontSize: typography.base, fontWeight: '600' },
  vipBtn: {
    backgroundColor: 'rgba(208,188,255,0.08)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(208,188,255,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  vipBtnText: { color: colors.purple, fontSize: typography.sm },
});
