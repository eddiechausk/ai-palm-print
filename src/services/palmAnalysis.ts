/**
 * palmAnalysis.ts — 掌纹分析 API 服务
 * 对接后端 AI 分析云函数
 */

import { callFunction } from './cloud';

export interface PalmResult {
  uid: string;
  vitality: number;   // 生命力 0-100
  wisdom:   number;   // 智慧
  fate:     number;   // 命运
  heart:    number;   // 心灵
  summary:  string;   // AI 概述（免费部分）
  detail?:  string;   // 完整报告（解锁后）
  lockedSections: string[];
  timestamp: number;
}

/** 上传手掌图片并分析 */
export async function analyzePalm(imageBase64: string): Promise<PalmResult> {
  const result = await callFunction<PalmResult>('analyzePalm', {
    image: imageBase64,
    source: 'app',
  });
  return result;
}

/** 解锁完整报告 */
export async function unlockReport(uid: string): Promise<PalmResult> {
  return callFunction<PalmResult>('unlockReport', { uid });
}

/** 获取历史记录 */
export async function getHistory(): Promise<PalmResult[]> {
  return callFunction<PalmResult[]>('getPalmHistory', {});
}
