/**
 * ScanScreen.tsx — 首页扫描
 * 对标小程序 pages/index/index
 * 功能：选择图片 → AI分析 → 跳转结果页
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Platform,
  Alert, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { analyzePalm } from '../services/palmAnalysis';

// 图片选择器
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const { scanCount, incrementScanCount, setResult, addHistory } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(scanCount);

  // 计数器动画
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // 扫描线动画
  const startScanAnim = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  };

  // 选择图片
  const handleChoosePhoto = () => {
    Alert.alert(
      '选择掌纹图片',
      '请从相册选择清晰的掌纹照片',
      [
        { text: '取消', style: 'cancel' },
        { text: '相册', onPress: () => pickImage() },
        { text: '拍照', onPress: () => takePhoto() },
      ]
    );
  };

  // 从相册选择
  const pickImage = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('错误', response.errorMessage || '选择图片失败');
        return;
      }
      if (response.assets && response.assets[0]) {
        handleAnalyze(response.assets[0]);
      }
    });
  };

  // 拍照
  const takePhoto = () => {
    launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('错误', response.errorMessage || '拍照失败');
        return;
      }
      if (response.assets && response.assets[0]) {
        handleAnalyze(response.assets[0]);
      }
    });
  };

  // 分析图片
  const handleAnalyze = async (asset: Asset) => {
    if (scanning) return;
    setScanning(true);
    startScanAnim();

    try {
      // 获取 base64
      let base64 = asset.base64;
      if (!base64 && asset.uri) {
        // 如果没有 base64，需要从 uri 读取
        Alert.alert('提示', '正在处理图片...');
        // 这里需要实现从 uri 读取文件并转为 base64
        // 暂时用模拟数据
        base64 = '';
      }

      console.log('开始分析，图片大小:', asset.fileSize, 'base64长度:', base64?.length || 0);

      // 调用分析服务
      const result = await analyzePalm(base64 || '');
      setResult(result);
      addHistory(result);
      incrementScanCount();
      navigation.navigate('Result', { uid: result.uid });
    } catch (e: any) {
      console.error('分析失败', e);
      Alert.alert('分析失败', e.message || '服务繁忙，请重试');
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

      {/* 取景框 */}
      <View style={styles.scannerBox}>
        {/* 手掌图标 */}
        <View style={styles.palmIconContainer}>
          <Text style={styles.palmIcon}>🖐️</Text>
        </View>

        {/* 四角标记 */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <View key={pos} style={[styles.corner, styles[pos as keyof typeof styles] as any]} />
        ))}

        {/* 扫描线 */}
        {scanning && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 320]
                  })
                }]
              }
            ]}
          />
        )}

        {/* 提示文字 */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {scanning ? 'AI 正在分析...' : '点击按钮选择掌纹图片'}
          </Text>
        </View>
      </View>

      {/* 选择图片按钮 */}
      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnDisabled]}
        onPress={handleChoosePhoto}
        activeOpacity={0.8}
        disabled={scanning}
      >
        <LinearGradient
          colors={scanning
            ? ['rgba(0,241,254,0.2)', 'rgba(0,241,254,0.1)']
            : ['rgba(0,241,254,0.3)', 'rgba(0,241,254,0.1)']}
          style={styles.scanBtnGradient}
        >
          {scanning ? (
            <ActivityIndicator color={colors.cyan} size="small" />
          ) : (
            <Text style={styles.scanBtnText}>开始扫描</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* 计数器 */}
      <View style={styles.counterCard}>
        <Text style={styles.counterValue}>{displayCount.toLocaleString()}</Text>
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
  palmIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  palmIcon: {
    fontSize: 80,
    opacity: 0.6,
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
  hintContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    letterSpacing: 1,
    textAlign: 'center',
  },
  scanBtn: {
    marginTop: spacing.xl,
    width: 160,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  scanBtnDisabled: {
    opacity: 0.7,
  },
  scanBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    minHeight: 48,
    justifyContent: 'center',
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
