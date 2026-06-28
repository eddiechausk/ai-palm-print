/**
 * cloud.ts — 腾讯云开发 REST API 适配层
 * 作用：在 App 端模拟小程序 wx.cloud.callFunction / database 行为
 * AppId: wx61f09cf7f3f6e823
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_ENV = 'cloud1-d4gtuqrxoa3005eeb';
const APP_ID    = 'wx61f09cf7f3f6e823';

// 腾讯云云开发 HTTP API 基地址
const BASE_URL = `https://${CLOUD_ENV}.tcb.qcloud.la`;

/** 获取访客 token（匿名登录） */
async function getAccessToken(): Promise<string> {
  const cached = await AsyncStorage.getItem('cloud_access_token');
  if (cached) return cached;

  // 实际项目需配合后端颁发 JWT，这里是示意流程
  const res = await axios.post(`${BASE_URL}/login/anonymous`, {
    appid: APP_ID,
  });
  const token: string = res.data?.access_token ?? '';
  await AsyncStorage.setItem('cloud_access_token', token);
  return token;
}

/** 调用云函数 */
export async function callFunction<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  const token = await getAccessToken();
  const res = await axios.post(
    `${BASE_URL}/functions/invoke`,
    { name, data },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data?.result as T;
}

/** 简单 KV 读写（映射到小程序 database） */
export const db = {
  collection: (name: string) => ({
    add: async (data: unknown) =>
      callFunction('dbProxy', { action: 'add', collection: name, data }),
    where: (query: unknown) => ({
      get: async () =>
        callFunction('dbProxy', { action: 'get', collection: name, query }),
    }),
    doc: (id: string) => ({
      get: async () =>
        callFunction('dbProxy', { action: 'docGet', collection: name, id }),
      update: async (data: unknown) =>
        callFunction('dbProxy', { action: 'update', collection: name, id, data }),
    }),
  }),
};
