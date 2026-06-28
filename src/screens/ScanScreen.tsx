/**
 * ScanScreen.tsx — 首页扫描
 * 对标小程序 pages/index/index
 * 注意: react-native-camera@4.2.1 不兼容 AGP 8.x，相机功能暂用模拟数据替代
 * TODO: 迁移到 react-native-vision-camera
 */

import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { analyzePalm } from '../services/palmAnalysis';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const { scanCount, incrementScanCount, setResult, addHistory } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // 扫描线动画
  const startScanAnim = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  };

  const handleScan = async () => {
    if (scanning) return;
    setScanning(true);
    startScanAnim();

    try {
      // 使用空图片 base64 调 analyzePalm，它内部有 fallback 逻辑
      const result = await analyzePalm('');
      setResult(result);
      addHistory(result);
      incrementScanCount();
      navigation.navigate('Result', { uid: result.uid });
    } catch (e) {
      console.error('扫描失败', e);
    } finally {
      setScanning(false);
    }
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* 标题 */}
      <Text style={styles.title}>掌纹智鉴</Text>
      <Text style={styles.subtitle}>PALM · AI · ANALYSIS</Text>

      {/* 取景框（模拟相机预览背景） */}
      <View style={styles.scannerBox}>
        {/* 模拟相机暗色背景 */}
        <View style={styles.mockCamera}>
          <Text style={styles.mockCameraText}>📷</Text>
          <Text style={styles.mockCameraHint}>相机预览</Text>
        </View>

        {/* 四角标记 */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <View key={pos} style={[styles.corner, styles[pos as keyof typeof styles] as any]} />
        ))}

        {/* 扫描线 */}
        {scanning && (
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 352] }) }] }]} />
        )}

        {/* 手掌提示 */}
        {!scanning && (
          <View style={styles.palmHint}>
            <Text style={styles.palmHintText}>点击下方按钮开始 AI 分析</Text>
          </View>
        )}
      </View>

      {/* 扫描按钮 */}
      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnActive]}
        onPress={handleScan}
        activeOpacity={0.8}
        disabled={scanning}
      >
        <LinearGradient
          colors={scanning
            ? ['rgba(0,241,254,0.2)', 'rgba(0,241,254,0.1)']
            : ['rgba(0,241,254,0.15)', 'rgba(0,241,254,0.05)']}
          style={styles.scanBtnGradient}
        >
          <Text style={styles.scanBtnText}>
            {scanning ? '分析中...' : 'AI 分析'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 计数器 */}
      <View style={styles.counterCard}>
        <Text style={styles.counterValue}>{scanCount.toLocaleString()}</Text>
        <Text style={styles.counterLabel}>已完成分析</Text>
      </View>
      <Text style={styles.disclaimer}>
        本内容由 AI 生成，仅供娱乐参考，不构成任何建议。
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    color: colors.cyan,
    fontSize: typography.xl,
    fontWeight: '600',
    letterSpacing: 4,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: typography.xs,
    letterSpacing: 3,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  scannerBox: {
    width: 280,
    height: 360,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#0d1214',
    borderWidth: 1,
    borderColor: colors.borderCyan,
    position: 'relative',
  },
  mockCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCameraText: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  mockCameraHint: {
    color: colors.textDim,
    fontSize: typography.xs,
    letterSpacing: 1,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.cyan,
    borderWidth: 2,
    zIndex: 2,
  },
  tl: { top: 8,   left:  8,   borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: 8,   right: 8,   borderLeftWidth:  0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: 8, left:  8,  borderRightWidth: 0, borderTopWidth:    0, borderBottomLeftRadius: 4 },
  br: { bottom: 8, right: 8,  borderLeftWidth:  0, borderTopWidth:    0, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 3,
  },
  palmHint: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 2,
  },
  palmHintText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    letterSpacing: 1,
  },
  scanBtn: {
    marginTop: spacing.xl,
    width: 160,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  scanBtnActive: { opacity: 0.7 },
  scanBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderCyan,
  },
  scanBtnText: {
    color: colors.cyan,
    fontSize: typography.lg,
    fontWeight: '600',
    letterSpacing: 3,
  },
  counterCard: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    alignItems: 'center',
  },
  counterValue: {
    color: colors.cyan,
    fontSize: typography.hero,
    fontWeight: '700',
    letterSpacing: 2,
  },
  counterLabel: {
    color: colors.textMuted,
    fontSize: typography.sm,
    letterSpacing: 2,
    marginTop: 4,
  },
  disclaimer: {
    marginTop: spacing.sm,
    color: colors.textDim,
    fontSize: 11,
    opacity: 0.55,
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xl,
  },
});
