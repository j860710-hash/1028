/**
 * ==============================================================================
 * CosDNA AI Reverse Formulation Assistant
 * 模組：解碼與結構修復版 Bookmarklet (decoded-bookmarklet.js)
 * 
 * 【化妝品配方研發原則說明】
 * 1. 順序絕對保證 (Order Integrity)：
 *    根據國際化妝品標示規範 (FDA 21 CFR 701.3 及歐盟 Regulation (EC) No 1223/2009)，
 *    INCI 係依添加量由高至低依序遞減標示（1% 以下成分可任意排列）。
 *    本程式碼「嚴禁使用任何字母排序 (Alphabetical Sorting)」，嚴格依據 DOM 順序推送至陣列。
 * 
 * 2. 語法與編碼修復 (URL-Decode & Syntax Fix)：
 *    - 將所有 %27 URL 編碼還原為標準單引號 '。
 *    - 修復原始碼在 showToast 中 cssText 開頭為 %27、結尾為 '; 之引號混用中斷問題。
 * 
 * 3. 純淨 INCI 英文成分萃取：
 *    - 自動過濾 CosDNA 頁面中附帶的中文別名（如玻尿酸鈉、1,3-丙二醇等），僅保留標準 INCI 英文。
 * ==============================================================================
 */

(function () {
  try {
    /**
     * 清理並提取純英文 INCI 名稱
     * @param {string} raw 原始儲存格或連結文字
     * @returns {string} 乾淨純英文 INCI
     */
    function cleanInci(raw) {
      if (!raw) return '';

      // 1. 取換行前的第 1 行（CosDNA 固定將標準英文名置於首行）
      var line = raw.split(/\r?\n/)[0].trim();

      // 2. 移除中文字元（\u4e00-\u9fa5）及其後續的中文俗稱/別名內容
      line = line.replace(/[\u4e00-\u9fa5].*$/, '').trim();

      // 3. 移除末尾殘留的空格、逗號、破折號或星號 (如 "Algae Extract *")
      line = line.replace(/[\s,\-*]+$/, '').trim();

      // 4. 正規化多餘連續空格
      line = line.replace(/\s+/g, ' ');

      return line;
    }

    // 順序保存陣列：維持 CosDNA 原廠登錄之成分先後順序
    var list = [];

    // 策略 1 (最精準)：鎖定 CosDNA 核心成分單元格 class .iStuffETitle
    var cells = document.querySelectorAll('.iStuffETitle, td.iStuffETitle, [class*="iStuffETitle"]');
    if (cells.length > 0) {
      cells.forEach(function (c) {
        var a = c.querySelector('a');
        var raw = a ? a.innerText : '';
        if (!raw) {
          var clone = c.cloneNode(true);
          // 移除中文註解與字體標籤
          clone.querySelectorAll('.IngNote, div, span, small, font').forEach(function (el) {
            el.remove();
          });
          raw = clone.innerText;
        }
        var name = cleanInci(raw);
        if (name && name.length > 1 && !['成分', '成份', 'Ingredients', '概略特性'].includes(name)) {
          list.push(name); // 依 DOM 出現順序依序存入，不排序
        }
      });
    }

    // 策略 2 (高容錯)：若無特定 class，以成分列數最多之主表格為準
    if (!list.length) {
      var tables = Array.from(document.querySelectorAll('table'));
      if (tables.length > 0) {
        tables.sort(function (a, b) {
          return b.querySelectorAll('tr').length - a.querySelectorAll('tr').length;
        });
        var tbl = tables[0];
        tbl.querySelectorAll('tr').forEach(function (row) {
          var tds = row.querySelectorAll('td');
          if (!tds.length) return;

          var nameCell = row.querySelector('.iStuffETitle') || tds[0];
          // 排除純數字序號欄位
          if (/^\d+$/.test(nameCell.innerText.trim()) && tds.length > 1) {
            nameCell = tds[1];
          }

          var a = nameCell.querySelector('a');
          var raw = a ? a.innerText : '';
          if (!raw) {
            var clone = nameCell.cloneNode(true);
            clone.querySelectorAll('.IngNote, div, span, small, font').forEach(function (el) {
              el.remove();
            });
            raw = clone.innerText;
          }

          var name = cleanInci(raw);
          if (name && name.length > 1 && !['成分', '成份', 'Ingredients', '概略特性'].includes(name)) {
            list.push(name); // 保持原始順序
          }
        });
      }
    }

    // 策略 3 (後備連結解析)：識別 10 位 16 進制 hash 之成分超連結 (排除 cosmetic_ 產品連結)
    if (!list.length) {
      document.querySelectorAll('a[href*=".html"]').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        if (!href.includes('cosmetic_') && /[0-9a-f]{10}\.html|stuff/i.test(href)) {
          var name = cleanInci(a.innerText);
          if (name && name.length > 1 && !['成分', '成份', 'Ingredients'].includes(name) && !list.includes(name)) {
            list.push(name);
          }
        }
      });
    }

    // 若無法辨識任何成分，拋出明確提示，不臆測或產生不存在的虛假成分
    if (!list.length) {
      alert('⚠️ 未能偵測到成分列表，請確認是否在 CosDNA 產品詳細頁面。');
      return;
    }

    // 格式化為標準逗號分隔字串
    var result = list.join(', ');

    // 研發專用湛藍漸層 Toast 提示視窗
    function showToast(msg) {
      var d = document.createElement('div');
      d.innerText = msg;
      d.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:12px 28px;border-radius:30px;font-size:14.5px;font-weight:600;z-index:9999999;box-shadow:0 8px 24px rgba(37,99,235,0.4);border:1px solid #60a5fa;letter-spacing:0.5px;transition:all 0.3s;';
      document.body.appendChild(d);
      setTimeout(function () {
        d.style.opacity = '0';
        setTimeout(function () {
          d.remove();
        }, 300);
      }, 2500);
    }

    // 複製到剪貼簿 (雙重容錯)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(result).then(function () {
        showToast('✅ 已成功複製 ' + list.length + ' 項純英文 INCI 全成分 (原始順序保存)！');
      }).catch(function () {
        fallbackCopy(result);
      });
    } else {
      fallbackCopy(result);
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ 已成功複製 ' + list.length + ' 項純英文 INCI 全成分 (原始順序保存)！');
    }
  } catch (e) {
    alert('執行出錯: ' + e.message);
  }
})();
