/**
 * ==============================================================================
 * CosDNA AI Reverse Formulation Assistant - Frontend Logic (app.js)
 * ==============================================================================
 */

// 測試用範例配方資料庫
const SAMPLE_FORMULAS = {
  sunscreen: `Eau, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Homosalate, Diisopropyl sebacate, Bis-ethylhexyloxyphenol methoxyphenyl triazine, Dibutyl adipate, Propanediol, Ethylhexyl salicylate, Ethylhexyl Triazone, Glycerin, Silica, Potassium cetyl phosphate, Glyceryl Stearate, PEG-100 Stearate, Propylene Glycol, Polyacrylate Crosspolymer-6, Stearyl Glycyrrhetinate, Tocopheryl Acetate, Titanium Dioxide, Capryloyl glycine, Sodium Citrate, Xanthan Gum, Glycine Soja Germ Extract, Ectoin, Mannitol, Xylitol, Citric Acid, Ginkgo Biloba Leaf Extract, Sodium Hydroxide, CI 77492, Rhamnose, CI 77491, CI 77499, Hydrogenated lecithin, Lauroyl lysine, FRUCTOOLIGOSACCHARIDES, Caprylic/Capric Triglyceride, Laminaria Ochroleuca Extract`,
  
  repairEmulsion: `Aqua 水, Bifidus Ferment Filtrate 比菲德氏菌, Propanediol 1, 3-丙二醇, PEG-75 聚乙二醇-75, Maltodextrin 麥芽糖糊精, Algae Extract 藻萃取, Caprylyl Glycol 辛乙二醇, PPG-5-CETETH-20 PPG-5-鯨蠟醇聚醚-20, Prunus Lannesiana Flower Extract 日本晚櫻花萃取, Dipotassium Glycyrrhizate 甘草酸鉀, Lactobacillus ferment 乳酸桿菌發酵產物, Tromethamine 氨丁三醇, Pentylene Glycol 戊二醇, Laminaria Saccharine 糖海帶萃取, Anthemis Nobilis Flower Extract 白花春黃菊花萃取, Oryza Sativa Lees Extract 稻糟萃取, Acetyl Hexapeptide-8 六胜肽`
};

document.addEventListener('DOMContentLoaded', () => {
  const inciInput = document.getElementById('inci-input');
  const statCount = document.getElementById('stat-count');
  const chipsContainer = document.getElementById('ingredient-chips');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sample1Btn = document.getElementById('load-sample-1');
  const sample2Btn = document.getElementById('load-sample-2');
  const checkBackendBtn = document.getElementById('check-backend-btn');
  const backendStatusText = document.getElementById('backend-status-text');
  const toast = document.getElementById('toast');
  const formatRadios = document.querySelectorAll('input[name="format-type"]');

  let currentParsedList = [];

  /**
   * 顯示藍色風格 Toast 提示
   */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /**
   * 解析並渲染成分清單
   */
  function processInput() {
    const rawText = inciInput.value.trim();

    if (!rawText) {
      currentParsedList = [];
      statCount.textContent = '0 項';
      chipsContainer.innerHTML = `<div class="empty-hint">尚未輸入成分資料，請於上方貼上 INCI 或點選測試範例。</div>`;
      return;
    }

    // 調用 inci-extractor.js 中的解析函數
    const result = parseInciText(rawText);

    if (!result.success || result.ingredients.length === 0) {
      currentParsedList = [];
      statCount.textContent = '0 項';
      chipsContainer.innerHTML = `<div class="empty-hint" style="color:#ef4444;">⚠️ ${result.error || '無法辨識成分'}</div>`;
      return;
    }

    currentParsedList = result.ingredients;
    statCount.textContent = `${currentParsedList.length} 項`;

    // 渲染帶階層序號之成分標籤
    chipsContainer.innerHTML = '';
    currentParsedList.forEach(item => {
      const chip = document.createElement('div');
      chip.className = `inci-chip ${item.rank <= 5 ? 'tier-primary' : ''}`;
      chip.innerHTML = `
        <span class="rank-badge">#${item.rank}</span>
        <span class="inci-name">${escapeHtml(item.name)}</span>
      `;
      chipsContainer.appendChild(chip);
    });
  }

  /**
   * HTML 跳脫防護
   */
  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  /**
   * 取得目前格式化設定之字串
   */
  function getFormattedOutput() {
    const selectedFormat = document.querySelector('input[name="format-type"]:checked')?.value || 'comma';
    return formatInciList(currentParsedList, selectedFormat, false);
  }

  // 事件綁定
  inciInput.addEventListener('input', processInput);

  sample1Btn.addEventListener('click', () => {
    inciInput.value = SAMPLE_FORMULAS.sunscreen;
    processInput();
    showToast('✓ 已載入範例 1：高效清爽防曬乳配方');
  });

  sample2Btn.addEventListener('click', () => {
    inciInput.value = SAMPLE_FORMULAS.repairEmulsion;
    processInput();
    showToast('✓ 已載入範例 2：二裂酵母修護精華乳 (含中文別名過濾測試)');
  });

  clearBtn.addEventListener('click', () => {
    inciInput.value = '';
    processInput();
    showToast('✓ 已清空輸入內容');
  });

  // 複製按鈕
  copyBtn.addEventListener('click', async () => {
    if (!currentParsedList || currentParsedList.length === 0) {
      showToast('⚠️ 目前無可複製之成分，請先貼上 INCI。');
      return;
    }

    const textToCopy = getFormattedOutput();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(`✅ 已成功複製 ${currentParsedList.length} 項純英文 INCI (原始順序保存)！`);
    } catch (err) {
      showToast('❌ 複製失敗，請手動全選複製。');
    }
  });

  // 下載 TXT
  downloadBtn.addEventListener('click', () => {
    if (!currentParsedList || currentParsedList.length === 0) {
      showToast('⚠️ 目前無可匯出之成分。');
      return;
    }

    const selectedFormat = document.querySelector('input[name="format-type"]:checked')?.value || 'comma';
    let fileContent = `# CosDNA AI Reverse Formulation Assistant - INCI Export\n`;
    fileContent += `# Export Time: ${new Date().toISOString()}\n`;
    fileContent += `# Total Ingredients: ${currentParsedList.length}\n`;
    fileContent += `# Order Guaranteed: True (Preserved Original Label Order)\n\n`;
    fileContent += getFormattedOutput();

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INCI_Formulation_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 已成功下載 INCI 文字報告！');
  });

  // 檢查後端中繼狀態
  async function checkBackend() {
    backendStatusText.textContent = '檢查連線中...';
    try {
      const res = await fetch('http://localhost:3000/health', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const dot = document.querySelector('.backend-dot');
        dot.className = 'backend-dot dot-on';
        backendStatusText.textContent = `安全後端已就緒: ${data.message}`;
        showToast('✓ 安全後端連線正常！');
      } else {
        throw new Error();
      }
    } catch (e) {
      const dot = document.querySelector('.backend-dot');
      dot.className = 'backend-dot dot-off';
      backendStatusText.textContent = '安全中繼後端：未連線 (http://localhost:3000)';
      showToast('ℹ️ 目前未啟動本機後端伺服器 (保持未啟用真實狀態)');
    }
  }

  checkBackendBtn.addEventListener('click', checkBackend);

  // 初始載入範例 1，提供直覺展示
  inciInput.value = SAMPLE_FORMULAS.sunscreen;
  processInput();
});
