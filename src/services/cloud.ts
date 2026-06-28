/**
 * cloud.ts — 云函数调用（HTTP 网关版）
 * 使用 axios 通过 HTTP 网关调用云函数
 */

import axios from 'axios';

// CloudBase 云函数 HTTP 网关地址
const HTTP_GATEWAY_BASE = 'https://cloud1-d4gtuqrxoa3005eeb-1429070952.ap-shanghai.app.tcloudbase.com';

/** 调用云函数 */
export async function callFunction<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  try {
    // 开发模式：返回模拟数据
    if (__DEV__) {
      console.log('[DEV] 模拟云函数调用:', name, data);
      return mockCallFunction<T>(name, data);
    }

    // 生产模式：通过 HTTP 网关调用云函数
    const url = `${HTTP_GATEWAY_BASE}/${name}`;
    console.log('调用云函数:', url, data);

    const response = await axios.post(url, data, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // HTTP 网关返回格式: { statusCode, body }
    // body 是 JSON 字符串，需要解析
    if (response.data && response.data.statusCode) {
      const body = typeof response.data.body === 'string' 
        ? JSON.parse(response.data.body) 
        : response.data.body;
      return body as T;
    }

    return response.data as T;
  } catch (error: any) {
    console.error('云函数调用失败:', error);

    // 如果是网络错误，返回模拟数据（降级处理）
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
      console.warn('网络错误，使用模拟数据');
      return mockCallFunction<T>(name, data);
    }

    throw error;
  }
}

/** 模拟云函数调用（开发测试用） */
function mockCallFunction<T>(name: string, data: Record<string, unknown>): T {
  if (name === 'analyzePalm') {
    return {
      success: true,
      reportId: 'mock_' + Date.now(),
    } as T;
  }

  return { success: true } as T;
}

/** 简单 KV 读写（模拟） */
export const db = {
  collection: (name: string) => ({
    add: async (data: unknown) => {
      console.log('[DEV] db.add', name, data);
      return { _id: 'mock_' + Date.now() };
    },
    where: (query: unknown) => ({
      get: async () => {
        console.log('[DEV] db.where', name, query);
        return { data: [] };
      },
    }),
    doc: (id: string) => ({
      get: async () => {
        console.log('[DEV] db.doc.get', name, id);
        return { data: null };
      },
      update: async (data: unknown) => {
        console.log('[DEV] db.doc.update', name, id, data);
        return { updated: 1 };
      },
    }),
  }),
};
