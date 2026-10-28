/**
 * ==============================================================================
 * CosDNA AI Reverse Formulation Assistant - Backend Service (server.js)
 * 
 * 資安與配方學推論原則：
 * 1. API Key 絕不外洩：所有 LLM 金鑰僅於伺服器端讀取與調用。
 * 2. 嚴格誠信原則：未串接金鑰時明確回覆 503 未啟用，絕不傳回隨機虛構之假分析資料。
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 檢查後端金鑰狀態
function getAiConfigStatus() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');
  return {
    isConfigured: hasGemini || hasOpenAI,
    provider: hasGemini ? 'Google Gemini' : (hasOpenAI ? 'OpenAI' : 'None')
  };
}

/**
 * 系統健康探針端點
 */
app.get('/health', (req, res) => {
  const status = getAiConfigStatus();
  res.json({
    status: 'ok',
    isOnline: true,
    aiReady: status.isConfigured,
    provider: status.provider,
    message: status.isConfigured
      ? `AI 反向推論引擎已就緒 (${status.provider})`
      : '後端服務運作中，但尚未於 .env 配置 GEMINI_API_KEY (保持未啟用狀態)'
  });
});

/**
 * AI 反向配方推論端點 (Phase 2/3 串接)
 */
app.post('/api/reverse-formulation', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: '請提供有效的成分陣列 (ingredients)' });
  }

  const status = getAiConfigStatus();
  if (!status.isConfigured) {
    return res.status(503).json({
      error: 'AI 反向推論服務尚未啟用：請於 backend/.env 中配置 GEMINI_API_KEY 後重啟伺服器。'
    });
  }

  // 待第二階段串接 LLM Prompt 結構化輸出
  res.status(501).json({
    error: 'AI 服務已就緒，等待第二階段提示詞與 API 串接啟用。'
  });
});

app.listen(PORT, () => {
  const status = getAiConfigStatus();
  console.log(`=================================================================`);
  console.log(`🧪 CosDNA AI Reverse Formulation Backend 啟動於 port ${PORT}`);
  console.log(`📡 健康探針: http://localhost:${PORT}/health`);
  console.log(`🔑 AI 配置: ${status.isConfigured ? '已就緒 (' + status.provider + ')' : '未啟用 (等待配置 .env)'}`);
  console.log(`=================================================================`);
});
