/**
 * HistoryScreen.tsx — 历史记录
 * 对标小程序 pages/history/history
 */

import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import type { PalmResult } from '../services/palmAnalysis';

function HistoryItem({ item, onPress }: { item: PalmResult; onPress: () => void }) {
  const date = new Date(item.timestamp).toLocaleDateString('zh-CN');
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.dot} />
        <View>
          <Text style={styles.cardId}>ID: {item.uid.slice(0, 8)}...</Text>
          <Text style={styles.cardDate}>{date}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.score}>{item.vitality}</Text>
        <Text style={styles.scoreLabel}>生命力</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const { history, setResult } = useAppStore();

  const handlePress = (item: PalmResult) => {
    setResult(item);
    navigation.navigate('Result', { uid: item.uid });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>历史记录</Text>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◎</Text>
          <Text style={styles.emptyText}>暂无扫描记录</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <HistoryItem item={item} onPress={() => handlePress(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: {
    color: colors.cyan,
    fontSize: typography.xl,
    fontWeight: '600',
    letterSpacing: 3,
    textAlign: 'center',
    paddingTop: 60,
    marginBottom: spacing.lg,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 60 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderCyan,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
    shadowColor: colors.cyan,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  cardId:    { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '500' },
  cardDate:  { color: colors.textMuted,   fontSize: typography.xs, marginTop: 2 },
  cardRight: { alignItems: 'center' },
  score:     { color: colors.cyan, fontSize: typography.xl, fontWeight: '700' },
  scoreLabel:{ color: colors.textMuted, fontSize: typography.xs, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, color: colors.textDim, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: typography.base, letterSpacing: 2 },
});
