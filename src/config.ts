/**
 * config.ts — App 配置
 * 修改此文件以配置 API Key 等信息
 */

// ==============================================================
// 🔑 阿里云 DashScope API Key
// 获取地址: https://dashscope.aliyun.com/
// 此 Key 用于 AI 掌纹分析，不会被用户看到
// ==============================================================
export const DASHSCOPE_API_KEY = 'your_dashscope_api_key_here';

// DashScope API 地址（默认无需修改）
export const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 使用的 AI 模型
export const DASHSCOPE_MODEL = 'qwen-vl-plus';
