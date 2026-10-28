/**
 * ==============================================================================
 * CosDNA AI Reverse Formulation Assistant
 * 核心引擎：INCI 萃取、純化與資料解析 (inci-extractor.js)
 * 
 * 核心保證：
 * 1. 嚴格維持順序不變性 (Strict Order Preservation)
 * 2. 嚴格過濾中文別名，輸出純標準英文 INCI
 * 3. 失敗時回報明確錯誤，絕不憑空捏造非預期成分
 * ==============================================================================
 */

/**
 * 清理單一成分名稱
 * @param {string} rawText 
 * @returns {string} 純英文標準 INCI
 */
function cleanInci(rawText) {
  if (!rawText) return '';
  // 取首行
  let line = rawText.split(/\r?\n/)[0].trim();
  // 移除所有中文字元及其後的中文補充說明
  line = line.replace(/[\u4e00-\u9fa5].*$/, '').trim();
  // 移除結尾的非字母標點符號 (如星號、逗號、多餘減號)
  line = line.replace(/[\s,\-*]+$/, '').trim();
  // 正規化多餘空白
  line = line.replace(/\s+/g, ' ');
  return line;
}

/**
 * 解析使用者貼上的 INCI 文字字串 (支援逗號分隔、換行清單、分號等)
 * @param {string} text 使用者輸入的 INCI 原始文字
 * @returns {{ success: boolean, ingredients: Array<{ rank: number, name: string }>, rawCount: number, error?: string }}
 */
function parseInciText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      success: false,
      ingredients: [],
      rawCount: 0,
      error: '請貼上有效的 INCI 成分清單文字。'
    };
  }

  // 自動辨識主要分隔符 (換行優先，若無換行則依逗號或分號分割)
  let rawItems = [];
  if (text.includes('\n') && !text.includes(',')) {
    rawItems = text.split(/\r?\n/);
  } else {
    // 依逗號或分號切分
    rawItems = text.split(/[,;]+/);
  }

  const ingredients = [];
  let currentRank = 1;

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i];
    const cleaned = cleanInci(raw);

    // 過濾過短字串、無效標籤
    if (cleaned && cleaned.length > 1 && !['成分', '成份', 'Ingredients', '概略特性'].includes(cleaned)) {
      ingredients.push({
        rank: currentRank++,
        name: cleaned
      });
    }
  }

  if (ingredients.length === 0) {
    return {
      success: false,
      ingredients: [],
      rawCount: 0,
      error: '未能自輸入文字中辨識出任何有效的英文 INCI 成分。'
    };
  }

  return {
    success: true,
    ingredients,
    rawCount: ingredients.length
  };
}

/**
 * 將結構化成分陣列格式化輸出
 * @param {Array<{ rank: number, name: string }>} ingredients 
 * @param {'comma' | 'newline' | 'numbered'} formatType 
 * @param {boolean} addPeriod 結尾是否加句號
 * @returns {string}
 */
function formatInciList(ingredients, formatType = 'comma', addPeriod = false) {
  if (!ingredients || ingredients.length === 0) return '';

  let output = '';
  if (formatType === 'comma') {
    output = ingredients.map(item => item.name).join(', ');
    if (addPeriod && !output.endsWith('.')) output += '.';
  } else if (formatType === 'newline') {
    output = ingredients.map(item => item.name).join('\n');
  } else if (formatType === 'numbered') {
    output = ingredients.map(item => `${item.rank}. ${item.name}`).join('\n');
  }

  return output;
}

// 支援 Node.js 與瀏覽器環境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cleanInci,
    parseInciText,
    formatInciList
  };
}
