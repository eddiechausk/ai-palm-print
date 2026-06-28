/**
 * payment.ts — 应用内购 (IAP) 服务
 * Android: Google Play Billing  |  iOS: App Store IAP
 * 使用 react-native-iap
 *
 * 产品 ID 需在各平台后台分别创建：
 *   - Google Play Console → 应用内商品
 *   - App Store Connect → App 内购买项目
 */

import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { callFunction } from './cloud';

// ===== 商品 ID — 需与平台后台一致 =====
export const PRODUCT_IDS = {
  VIP_MONTHLY:   'palmiai_vip_monthly_9_9',   // VIP 月卡  ¥9.9
  UNLOCK_REPORT: 'palmiai_unlock_report_0_1', // 解锁报告 ¥0.1
} as const;

/** 初始化 IAP */
export async function initPayment(): Promise<void> {
  await RNIap.initConnection();
}

/** 关闭 IAP 连接 */
export async function endPayment(): Promise<void> {
  await RNIap.endConnection();
}

/** 获取商品信息（含价格） */
export async function getProducts() {
  const productIds = Object.values(PRODUCT_IDS);
  return RNIap.getProducts({ skus: productIds });
}

/**
 * 发起购买
 * @param productId PRODUCT_IDS 中的某个值
 * @returns 购买结果
 */
export async function purchase(productId: string): Promise<boolean> {
  try {
    const purchase = await RNIap.requestPurchase({ sku: productId });
    const receipt =
      Platform.OS === 'ios'
        ? (purchase as RNIap.PurchaseResult).transactionReceipt
        : (purchase as RNIap.PurchaseResult).purchaseToken;

    // 通知云函数校验收据并激活权益
    const result = await callFunction<{ success: boolean }>('verifyPurchase', {
      productId,
      receipt,
      platform: Platform.OS,
    });

    if (result.success) {
      // 消耗型商品需要 finishTransaction
      await RNIap.finishTransaction({ purchase: purchase as RNIap.Purchase });
    }
    return result.success;
  } catch (err: unknown) {
    if ((err as RNIap.PurchaseError).code === 'E_USER_CANCELLED') return false;
    throw err;
  }
}
