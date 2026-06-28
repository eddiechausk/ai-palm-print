/**
 * IAP 商品 ID 配置
 * 掌纹智析 PalmAI — 双端 App
 *
 * 使用方式：
 *   import { IAP_PRODUCTS, getProductById } from './iapProducts';
 */

export type Platform = 'ios' | 'android';

export interface IAPProduct {
  /** 商品 ID（Google Play / App Store 后台一致） */
  id: string;
  /** 本地展示名称 */
  label: string;
  /** 展示价格（仅用于 UI 默认值，实际价格以平台返回为准） */
  displayPrice: string;
  /** 商品类型 */
  type: 'subscription' | 'one_time';
  /** 对应功能 */
  feature: 'vip_monthly' | 'unlock_report';
  /** VIP 有效天数（0 = 非 VIP 商品） */
  days: number;
}

/**
 * 所有 IAP 商品列表
 * ⚠️ id 必须与 Google Play Console 和 App Store Connect 后台配置完全一致
 */
export const IAP_PRODUCTS: IAPProduct[] = [
  {
    id: 'palmiai_vip_monthly_9_9',
    label: 'VIP 月卡',
    displayPrice: '¥9.9',
    type: 'subscription',
    feature: 'vip_monthly',
    days: 30
  },
  {
    id: 'palmiai_unlock_report_0_1',
    label: '解锁完整报告',
    displayPrice: '¥0.1',
    type: 'one_time',
    feature: 'unlock_report',
    days: 0
  }
];

/** 所有商品 ID 数组（传给 react-native-iap 的 getProducts） */
export const IAP_PRODUCT_IDS = IAP_PRODUCTS.map(p => p.id);

/** 通过 ID 获取商品配置 */
export function getProductById(id: string): IAPProduct | undefined {
  return IAP_PRODUCTS.find(p => p.id === id);
}

/**
 * ============================================================
 *  平台后台配置指引
 * ============================================================
 *
 * ── Google Play Console ─────────────────────────────────────
 *  入口：https://play.google.com/console → 你的应用 → 商品
 *
 *  1. 订阅商品（VIP 月卡）
 *     路径：商品 → 订阅 → 创建订阅
 *     字段：
 *       商品 ID:       palmiai_vip_monthly_9_9
 *       名称:          VIP 月卡
 *       计费周期:      每月
 *       价格:          ¥9.00（Google Play 最低 0.01 USD，约合 ¥9.9 需选 ¥10 档再调整）
 *       免费试用:      可选，建议不设
 *       状态:          激活
 *
 *  2. 应用内商品（解锁报告）
 *     路径：商品 → 应用内商品 → 创建商品
 *     字段：
 *       商品 ID:       palmiai_unlock_report_0_1
 *       名称:          解锁完整报告
 *       商品类型:      受管理的商品（Managed product）
 *       价格:          ¥1.00（Google Play 最低 ¥1，如需 ¥0.1 需申请特殊定价权限）
 *       状态:          激活
 *
 *  注意：Google Play 商品价格以当地货币为准，
 *        中国区 Android 用户使用微信支付/支付宝在 Google Play 结算。
 *
 * ── App Store Connect ────────────────────────────────────────
 *  入口：https://appstoreconnect.apple.com → 你的 App → 功能 → App 内购买项目
 *
 *  1. 订阅商品（VIP 月卡）
 *     类型:            自动续期订阅
 *     参考名称:        VIP 月卡
 *     产品 ID:         palmiai_vip_monthly_9_9
 *     订阅组:          新建"掌纹智析 VIP"组
 *     级别:            1（最高档）
 *     价格:            选"¥6（Tier 1）"或"¥12（Tier 2）"档
 *                      ⚠️ Apple 没有 ¥9.9 档，建议选 ¥8（约 USD 1.08）
 *     显示名称:        VIP 月卡
 *     描述:            解锁 AI 掌纹全功能，30天有效
 *
 *  2. 非消耗型商品（解锁报告）
 *     类型:            非消耗型
 *     参考名称:        解锁完整报告
 *     产品 ID:         palmiai_unlock_report_0_1
 *     价格:            选"¥1（Tier 1）"（Apple 最低档）
 *     显示名称:        解锁完整报告
 *     描述:            一次解锁，永久查看完整掌纹分析报告
 *
 *  注意：
 *    - 商品需通过 App Store 审核后才能上线
 *    - 测试阶段使用 Sandbox 账号，无需真实付款
 *    - APPLE_SHARED_SECRET 在 App Store Connect → App 内购买 → 共享密钥 处获取
 *      填入云函数环境变量：APPLE_SHARED_SECRET
 *
 * ── 云函数环境变量配置 ────────────────────────────────────────
 *  在微信云开发控制台 → 云函数 → verifyPurchase → 函数配置 → 环境变量：
 *
 *    APPLE_SHARED_SECRET    <App Store Connect 共享密钥>
 *    GOOGLE_SA_JSON         <Google Play 服务账号 JSON（Base64 编码）>
 *
 * ============================================================
 */
