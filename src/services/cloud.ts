/**
 * cloud.ts — AI 服务调用
 * 直接调用 DashScope API，无需后端服务
 */

import axios from 'axios';
import {
  DASHSCOPE_API_KEY,
  DASHSCOPE_BASE_URL,
  DASHSCOPE_MODEL,
} from '../config';

/**
 * 调用 AI 服务（仅支持 analyzePalm）
 * 其他函数返回模拟数据（不需要数据库）
 */
export async function callFunction<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (name === 'analyzePalm') {
    return analyzePalmDirect(data) as T;
  }

  // unlockReport / getPalmHistory / verifyPurchase 等
  // 不需要数据库，直接返回模拟数据
  return { success: true } as T;
}

// ========== AI 分析核心逻辑 ==========

/** 系统提示词 */
const SYSTEM_PROMPT = [
  '你是「掌纹智鉴」AI 分析引擎。基于掌纹图像进行数据驱动的个性特征与行为模式分析。',
  '',
  '【核心原则】',
  '1. 仅限性格特征与行为倾向分析，严禁占卜、预测吉凶、断言命运。',
  '2. 使用现代、理性、数据化的语言风格。不出现"命运/天意/注定/吉凶/化解/灵力"等词汇。',
  '3. 必须输出纯 JSON 格式，严格遵守以下键名。',
  '4. 每个字段须充实具体，避免空泛套话。',
  '',
  '【免费区：必须深入，引导解锁意愿】',
  '- intro (开篇概述): 60字以上。简介掌纹分析技术原理，点明本次分析维度，营造专业感。',
  '- mind (思维模式): 60字以上。分析其认知风格与思考习惯，指出优势与可能的盲区。',
  '- heart (性格特质): 60字以上。分析核心性格特征，情感反应模式与人际互动风格。',
  '',
  '【深度区：必须具体且有行动指导性】',
  '- action (行为模式): 分析其执行力、决策风格、可能的行动障碍。',
  '- health (健康指数): 基于掌纹纹理密度与色泽特征，给出生活方式建议（非医疗诊断）。',
  '- wealth (潜能分析): 分析其决策模式中可能影响事业发展的性格因素。',
  '- emotion_deep (关系洞察): 深度分析其在亲密关系中的互动模式与潜在成长点。',
  '- future (趋势建议): 基于当前特征数据，提供中立的个人发展方向参考。强调"数据参考，非预言"。',
  '- summary (综合报告): 正向收束。总结核心发现，给出一个可执行的建议。末尾固定落款：「——掌纹智鉴 · AI 个性分析」',
].join('\n');

/** 直接调用 DashScope API 分析掌纹 */
async function analyzePalmDirect(data: Record<string, unknown>) {
  const imageBase64 = data.imageBase64 as string;

  if (!imageBase64 || imageBase64.length < 100) {
    throw new Error('图片数据无效');
  }

  if (!DASHSCOPE_API_KEY || DASHSCOPE_API_KEY === 'your_dashscope_api_key_here') {
    throw new Error('请先在 src/config.ts 中配置 DASHSCOPE_API_KEY');
  }

  const imageUrl = 'data:image/jpeg;base64,' + imageBase64;

  console.log('正在调用 AI 分析掌纹...');

  const response = await axios.post(
    DASHSCOPE_BASE_URL,
    {
      model: DASHSCOPE_MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请依据掌纹图像，输出完整的 JSON 个性分析报告。前三项务必详实深入，后五项务必具体且有指导性。',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + DASHSCOPE_API_KEY,
      },
      timeout: 60000,
    },
  );

  console.log('AI 返回状态:', response.status);

  let aiContentStr = response.data.choices[0].message.content;

  // 提取 JSON
  const firstBrace = aiContentStr.indexOf('{');
  const lastBrace = aiContentStr.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    console.error('AI 返回内容:', aiContentStr);
    throw new Error('AI 返回数据格式异常');
  }

  aiContentStr = aiContentStr.substring(firstBrace, lastBrace + 1);
  const aiContent = JSON.parse(aiContentStr);

  return {
    success: true,
    reportId: 'local_' + Date.now(),
    ...aiContent,
    lockedSections: ['action', 'health', 'wealth', 'emotion_deep', 'future', 'summary'],
  };
}

/** 简单 KV 读写（模拟） */
export const db = {
  collection: (name: string) => ({
    add: async (data: unknown) => {
      console.log('[db.add]', name, data);
      return { _id: 'mock_' + Date.now() };
    },
    where: (query: unknown) => ({
      get: async () => {
        console.log('[db.where]', name, query);
        return { data: [] };
      },
    }),
    doc: (id: string) => ({
      get: async () => {
        console.log('[db.doc.get]', name, id);
        return { data: null };
      },
      update: async (data: unknown) => {
        console.log('[db.doc.update]', name, id, data);
        return { updated: 1 };
      },
    }),
  }),
};
