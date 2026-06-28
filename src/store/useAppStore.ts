/**
 * useAppStore.ts — 全局状态管理 (Zustand)
 * 对标小程序 globalData
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PalmResult } from '../services/palmAnalysis';

interface AppState {
  // 用户
  userId:   string | null;
  isVip:    boolean;
  vipExpiry: number | null;   // Unix timestamp

  // 扫描结果
  currentResult: PalmResult | null;
  history:       PalmResult[];

  // 计数器（同步小程序 displayNumber）
  scanCount: number;

  // 操作
  setUser:    (id: string) => void;
  setVip:     (expiry: number) => void;
  clearVip:   () => void;
  setResult:  (r: PalmResult) => void;
  addHistory: (r: PalmResult) => void;
  incrementScanCount: () => void;
  hydrate:    () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  userId:        null,
  isVip:         false,
  vipExpiry:     null,
  currentResult: null,
  history:       [],
  scanCount:     12487,

  setUser: (id) => {
    set({ userId: id });
    AsyncStorage.setItem('userId', id);
  },

  setVip: (expiry) => {
    set({ isVip: true, vipExpiry: expiry });
    AsyncStorage.setItem('vipExpiry', String(expiry));
  },

  clearVip: () => {
    set({ isVip: false, vipExpiry: null });
    AsyncStorage.removeItem('vipExpiry');
  },

  setResult: (r) => set({ currentResult: r }),

  addHistory: (r) => {
    const history = [r, ...get().history].slice(0, 50);
    set({ history });
    AsyncStorage.setItem('history', JSON.stringify(history));
  },

  incrementScanCount: () => {
    const next = get().scanCount + 1;
    set({ scanCount: next });
    AsyncStorage.setItem('scanCount', String(next));
  },

  /** 从本地存储还原状态 */
  hydrate: async () => {
    const [userId, vipExpiry, scanCount, historyRaw] = await Promise.all([
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('vipExpiry'),
      AsyncStorage.getItem('scanCount'),
      AsyncStorage.getItem('history'),
    ]);

    const now = Date.now();
    const expiry = vipExpiry ? Number(vipExpiry) : null;

    set({
      userId:    userId ?? null,
      isVip:     expiry ? expiry > now : false,
      vipExpiry: expiry,
      scanCount: scanCount ? Number(scanCount) : 12487,
      history:   historyRaw ? JSON.parse(historyRaw) : [],
    });
  },
}));
