/**
 * cloud.ts — 腾讯云开发 CloudBase JS SDK 适配层
 * 作用：在 App 端调用云函数
 * AppId: wx61f09cf7f3f6e823
 * 环境ID: cloud1-d4gtuqrxoa3005eeb
 */

import cloudbase from '@cloudbase/js-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_ENV = 'cloud1-d4gtuqrxoa3005eeb';
const APP_ID    = 'wx61f09cf7f3f6e823';

// 初始化 CloudBase
const app = cloudbase.init({
  env: CLOUD_ENV,
});

// 匿名登录
let authPromise: Promise<any> | null = null;

async function ensureLogin(): Promise<any> {
  if (authPromise) return authPromise;
  
  authPromise = (async () => {
    try {
      // 检查是否已登录
      const user = app.auth().currentUser;
      if (user) {
        console.log('CloudBase 已登录:', user.uid);
        return app;
      }
      
      // 匿名登录
      console.log('CloudBase 开始匿名登录...');
      const loginResult = await app.auth().signInAnonymously();
      console.log('CloudBase 匿名登录成功:', loginResult.user?.uid);
      return app;
    } catch (error) {
      console.error('CloudBase 登录失败:', error);
      // 如果匿名登录失败，返回app实例，允许直接调用（某些云函数可能不需要登录）
      return app;
    }
  })();
  
  return authPromise;
}

/** 调用云函数 */
export async function callFunction<T = unknown>(
  name: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  try {
    const app = await ensureLogin();
    const result = await app.callFunction({
      name,
      data,
    });
    
    if (result.code !== '') {
      throw new Error(result.message || '云函数调用失败');
    }
    
    return result.result as T;
  } catch (error: any) {
    console.error('云函数调用失败:', error);
    
    // 如果是网络错误，可能是环境配置问题
    if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
      throw new Error('网络连接失败，请检查网络设置');
    }
    
    throw error;
  }
}

/** 简单 KV 读写（映射到小程序 database） */
export const db = {
  collection: (name: string) => ({
    add: async (data: unknown) => {
      const app = await ensureLogin();
      return app.database().collection(name).add(data);
    },
    where: (query: unknown) => ({
      get: async () => {
        const app = await ensureLogin();
        return app.database().collection(name).where(query).get();
      },
    }),
    doc: (id: string) => ({
      get: async () => {
        const app = await ensureLogin();
        return app.database().collection(name).doc(id).get();
      },
      update: async (data: unknown) => {
        const app = await ensureLogin();
        return app.database().collection(name).doc(id).update(data);
      },
    }),
  }),
};
