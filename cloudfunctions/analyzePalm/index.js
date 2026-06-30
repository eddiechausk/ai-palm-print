const cloud = require("wx-server-sdk");
const axios = require("axios");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function fetchWithRetry(config, retries, backoff) {
  retries = retries || 3; backoff = backoff || 1500;
  for (let i = 0; i < retries; i++) {
    try { const response = await axios(config); return response; }
    catch (error) {
      if (error.response && error.response.status !== 429 || i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
}

// 解析请求数据（兼容小程序调用和 HTTP 调用）
function parseEvent(event) {
  // 判断是否为 HTTP 请求（通过 HTTP 网关调用）
  if (event.httpMethod) {
    console.log("来源: HTTP 网关, method:", event.httpMethod);
    
    // 处理 OPTIONS 预检请求
    if (event.httpMethod === 'OPTIONS') {
      return { isOptions: true };
    }
    
    // GET 请求：从 queryStringParameters 获取
    if (event.httpMethod === 'GET') {
      return event.queryStringParameters || {};
    }
    
    // POST 请求：从 body 获取
    if (event.body) {
      let bodyStr = event.body;
      
      // 如果 body 是 base64 编码的
      if (event.isBase64Encoded) {
        bodyStr = Buffer.from(bodyStr, 'base64').toString('utf8');
      }
      
      // 解析 JSON
      if (typeof bodyStr === 'string') {
        try {
          return JSON.parse(bodyStr);
        } catch (e) {
          return { imageBase64: bodyStr };
        }
      }
      
      return bodyStr;
    }
    
    return {};
  }
  
  // 小程序调用：直接使用 event
  return event;
}

// 格式化响应（兼容小程序调用和 HTTP 调用）
function formatResponse(event, data) {
  // 处理 OPTIONS 预检请求
  if (event.isOptions) {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      },
      isBase64Encoded: false
    };
  }
  
  // 如果是 HTTP 请求，返回 HTTP 响应格式
  if (event.httpMethod) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(data),
      isBase64Encoded: false
    };
  }
  
  // 小程序调用：直接返回数据
  return data;
}

exports.main = async (event, context) => {
  // 解析请求数据
  const parsedEvent = parseEvent(event);
  
  // 处理 OPTIONS 预检请求
  if (parsedEvent.isOptions) {
    return formatResponse({ isOptions: true }, null);
  }
  
  const { fileID, imageBase64, source } = parsedEvent;
  
  const API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!API_KEY) {
    const error = { success: false, error: "DASHSCOPE_API_KEY 环境变量未配置，请在云函数环境变量中设置。" };
    return formatResponse(event, error);
  }
  
  const BASE_URL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

  try {
    // ===== 兼容两种输入方式 =====
    let base64Image;

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.length > 100) {
      // App端：直接使用传入的 base64
      base64Image = imageBase64;
      console.log("来源: App (base64直传), 长度:", base64Image.length);
    } else if (fileID) {
      // 小程序端：从云存储下载文件再转 base64
      const res = await cloud.downloadFile({ fileID: fileID });
      base64Image = res.fileContent.toString("base64");
      console.log("来源: 小程序 (fileID下载), fileID:", fileID);
    } else {
      const error = { success: false, error: "缺少图片数据：请传 fileID 或 imageBase64" };
      return formatResponse(event, error);
    }

    const imageUrl = "data:image/jpeg;base64," + base64Image;

    const systemPrompt = [
      "你是「掌纹智鉴」AI 分析引擎。基于掌纹图像进行数据驱动的个性特征与行为模式分析。",
      "",
      "【核心原则】",
      "1. 仅限性格特征与行为倾向分析，严禁占卜、预测吉凶、断言命运。",
      "2. 使用现代、理性、数据化的语言风格。不出现"命运/天意/注定/吉凶/化解/灵力"等词汇。",
      "3. 必须输出纯 JSON 格式，严格遵守以下键名。",
      "4. 每个字段须充实具体，避免空泛套话。",
      "",
      "【免费区：必须深入，引导解锁意愿】",
      "- intro (开篇概述): 60字以上。简介掌纹分析技术原理，点明本次分析维度，营造专业感。",
      "- mind (思维模式): 60字以上。分析其认知风格与思考习惯，指出优势与可能的盲区。",
      "- heart (性格特质): 60字以上。分析核心性格特征，情感反应模式与人际互动风格。",
      "",
      "【深度区：必须具体且有行动指导性】",
      "- action (行为模式): 分析其执行力、决策风格、可能的行动障碍。",
      "- health (健康指数): 基于掌纹纹理密度与色泽特征，给出生活方式建议（非医疗诊断）。",
      "- wealth (潜能分析): 分析其决策模式中可能影响事业发展的性格因素。",
      "- emotion_deep (关系洞察): 深度分析其在亲密关系中的互动模式与潜在成长点。",
      "- future (趋势建议): 基于当前特征数据，提供中立的个人发展方向参考。强调"数据参考，非预言"。",
      "- summary (综合报告): 正向收束。总结核心发现，给出一个可执行的建议。末尾固定落款：「——掌纹智鉴 · AI 个性分析」"
    ].join("\n");

    const axiosConfig = {
      method: "post",
      url: BASE_URL,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + API_KEY },
      timeout: 60000,
      data: {
        model: "qwen-vl-plus",
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "请依据掌纹图像，输出完整的 JSON 个性分析报告。前三项务必详实深入，后五项务必具体且有指导性。" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ]
      }
    };

    const response = await fetchWithRetry(axiosConfig);
    let aiContentStr = response.data.choices[0].message.content;
    console.log("大模型原始返回:", aiContentStr);

    const firstBrace = aiContentStr.indexOf("{");
    const lastBrace = aiContentStr.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) throw new Error("AI 返回数据格式异常");

    aiContentStr = aiContentStr.substring(firstBrace, lastBrace + 1);
    const aiContent = JSON.parse(aiContentStr);

    const addRes = await db.collection("reports").add({
      data: { create_time: db.serverDate(), is_unlocked: false, unlock_type: "none", ai_content: aiContent }
    });

    // 返回完整的分析结果（同时包含 reportId 供后续使用）
    const result = {
      success: true,
      reportId: addRes._id,
      // 展开 ai_content 的所有字段
      ...aiContent,
      // 添加锁定字段列表（免费用户只能看前3项）
      lockedSections: ['action', 'health', 'wealth', 'emotion_deep', 'future', 'summary']
    };

    try {
      await cloud.callFunction({
        name: "marketMonitor",
        data: { type: "REPORT_GEN", data: { tags: [aiContent.mind ? aiContent.mind.substring(0, 10) : "-", aiContent.heart ? aiContent.heart.substring(0, 10) : "-"] } }
      });
    } catch (e) { console.error("飞书通知失败:", e); }

    return formatResponse(event, result);
  } catch (err) {
    console.error("云函数执行失败:", err);
    return formatResponse(event, { success: false, error: "服务繁忙，请稍后重试" });
  }
};
