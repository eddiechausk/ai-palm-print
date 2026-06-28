/**
 * palmAnalysis.ts — 掌纹分析 API 服务
 * 对接后端 AI 分析云函数
 * 支持 base64 图片直接分析（App端）或 fileID（小程序端）
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

/** 上传手掌图片并分析 - App端使用 base64 */
export async function analyzePalm(imageBase64: string): Promise<PalmResult> {
  try {
    const result = await callFunction<PalmResult>('analyzePalm', {
      imageBase64: imageBase64,  // App端传 base64
      source: 'app',
    });
    return result;
  } catch (error: any) {
    console.error('分析失败:', error);
    // 如果云函数调用失败，返回模拟数据用于测试
    if (__DEV__) {
      console.log('开发模式：返回模拟数据');
      return generateMockResult();
    }
    throw error;
  }
}

/** 模拟数据（开发测试用） */
function generateMockResult(): PalmResult {
  const uid = 'mock_' + Date.now();
  return {
    uid,
    vitality: 78,
    wisdom: 85,
    fate: 72,
    heart: 80,
    summary: '基于您的掌纹特征分析，您的生命力较为旺盛，显示出良好的体质基础。思维模式倾向于理性分析，善于逻辑推理。性格温和稳重，人际关系和谐。建议保持规律作息，适当运动。',
    lockedSections: ['action', 'health', 'wealth', 'emotion_deep', 'future', 'summary'],
    timestamp: Date.now(),
  };
}

/** 解锁完整报告 */
export async function unlockReport(uid: string): Promise<PalmResult> {
  return callFunction<PalmResult>('unlockReport', { uid });
}

/** 获取历史记录 */
export async function getHistory(): Promise<PalmResult[]> {
  return callFunction<PalmResult[]>('getPalmHistory', {});
}
