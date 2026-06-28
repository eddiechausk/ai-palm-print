/**
 * palmAnalysis.ts — 掌纹分析 API 服务
 * 对接后端 AI 分析云函数
 * 支持 base64 图片直接分析（App端）或 fileID（小程序端）
 */

import { callFunction } from './cloud';

/**
 * 掌纹分析结果接口
 * 匹配云函数返回的 AI 分析数据结构
 */
export interface PalmResult {
  reportId: string;
  // 免费区（默认显示）
  intro: string;      // 开篇概述
  mind: string;       // 思维模式
  heart: string;      // 性格特质
  // 深度区（需要解锁）
  action: string;     // 行为模式
  health: string;     // 健康指数
  wealth: string;     // 潜能分析
  emotion_deep: string; // 关系洞察
  future: string;     // 趋势建议
  summary: string;    // 综合报告
  // 锁定字段列表
  lockedSections: string[];
}

/** 上传手掌图片并分析 - App端使用 base64 */
export async function analyzePalm(imageBase64: string): Promise<PalmResult> {
  try {
    const result = await callFunction<any>('analyzePalm', {
      imageBase64: imageBase64,  // App端传 base64
      source: 'app',
    });
    
    // 检查返回结果
    if (!result || !result.success) {
      throw new Error(result?.error || '分析失败');
    }
    
    // 返回完整的分析结果
    return result as PalmResult;
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
  const reportId = 'mock_' + Date.now();
  return {
    reportId,
    intro: '基于您的掌纹特征分析，您的生命力较为旺盛，显示出良好的体质基础。掌纹中的主要纹路清晰，表明您具有较强的适应能力和自我调节能力。',
    mind: '您的思维模式倾向于理性分析，善于逻辑推理。在面对问题时，您会先收集信息，然后进行分析和判断。这种思维方式使您在决策时更加稳健，但有时可能会过于谨慎，错过一些机会。建议在某些情况下尝试更加直观的决策方式。',
    heart: '您的性格温和稳重，人际关系和谐。您善于倾听他人的意见，能够站在他人的角度思考问题。这种特质使您在团队中很受欢迎，但有时可能会过于在意他人的感受，忽略自己的需求。建议适当关注自己的感受，保持自我边界。',
    action: '您的执行力较强，能够按计划完成任务。在决策时，您会权衡利弊，选择最优方案。但有时可能会因为过于追求完美而导致决策缓慢。建议设定时间限制，避免过度分析。',
    health: '基于掌纹纹理密度与色泽特征，您的健康状况总体良好。建议保持规律作息，适当运动，注意饮食均衡。特别关注消化系统的健康，避免过度劳累。',
    wealth: '您的决策模式中，理性分析的能力有助于事业发展。但有时可能会过于保守，错过一些机会。建议在风险评估的基础上，适当尝试新的机会，拓展自己的舒适区。',
    emotion_deep: '在亲密关系中，您倾向于稳定和谐的关系。您善于理解和支持伴侣，但有时可能会避免冲突，导致问题积累。建议在关系中保持开放和诚实的沟通，及时解决问题。',
    future: '基于当前特征数据，您的发展方向总体积极。建议在保持现有优势的基础上，适当拓展自己的舒适区，尝试新的机会和挑战。记住，这只是一个数据参考，非预言。',
    summary: '综合来看，您是一个理性、稳重、善于分析的人。您的思维模式和性格特质使您在工作和人际关系中表现出色。建议在保持现有优势的基础上，适当拓展自己的舒适区，尝试更加直观和灵活的决策方式。\n\n——掌纹智鉴 · AI 个性分析',
    lockedSections: ['action', 'health', 'wealth', 'emotion_deep', 'future', 'summary'],
  };
}

/** 解锁完整报告 */
export async function unlockReport(reportId: string): Promise<PalmResult> {
  return callFunction<PalmResult>('unlockReport', { reportId });
}

/** 获取历史记录 */
export async function getHistory(): Promise<PalmResult[]> {
  return callFunction<PalmResult[]>('getPalmHistory', {});
}
