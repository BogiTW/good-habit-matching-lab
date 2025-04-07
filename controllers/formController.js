const googleSheet = require('../utils/googleSheet');
const fs = require('fs');
const path = require('path');

// 同步本地數據到Google Sheets
async function syncLocalDataToSheets() {
  try {
    console.log('開始同步本地數據到Google Sheets...');
    const result = {
      success: false,
      message: '',
      details: {},
      error: null
    };
    
    // 從本地獲取數據
    const localData = getFromLocalStorage();
    result.details.localDataCount = localData.length;
    
    if (localData.length === 0) {
      console.log('本地無數據，跳過同步');
      result.success = true;
      result.message = '本地無數據，跳過同步';
      return result;
    }
    
    // 獲取Google Sheets數據
    try {
      const sheetsData = await googleSheet.getRows();
      result.details.sheetsDataCount = sheetsData.length;
      const sheetsIds = new Set(sheetsData.map(row => row.ID || row.id));
      
      // 過濾出未同步的數據
      const newData = localData.filter(item => !sheetsIds.has(item.id));
      result.details.newDataCount = newData.length;
      
      if (newData.length === 0) {
        console.log('所有本地數據已同步，無需操作');
        result.success = true;
        result.message = '所有本地數據已同步，無需操作';
        return result;
      }
      
      console.log(`發現${newData.length}筆未同步的數據，開始同步...`);
      result.details.syncAttempts = [];
      
      // 逐個同步數據
      for (const item of newData) {
        try {
          const appendResult = await googleSheet.appendRow(item);
          console.log(`成功同步用戶數據: ID=${item.id}, 姓名=${item.name}`);
          result.details.syncAttempts.push({
            id: item.id,
            name: item.name,
            success: true,
            response: appendResult
          });
        } catch (itemError) {
          console.error(`同步用戶數據失敗: ID=${item.id}`, itemError);
          result.details.syncAttempts.push({
            id: item.id,
            name: item.name,
            success: false,
            error: itemError.message
          });
        }
      }
      
      const successCount = result.details.syncAttempts.filter(a => a.success).length;
      result.success = successCount > 0;
      result.message = `嘗試同步${newData.length}筆數據，成功${successCount}筆`;
      console.log('數據同步完成', result.message);
      return result;
    } catch (sheetsError) {
      console.error('獲取Google Sheets數據失敗:', sheetsError);
      result.success = false;
      result.message = '獲取Google Sheets數據失敗';
      result.error = sheetsError.message;
      return result;
    }
  } catch (error) {
    console.error('同步數據到Google Sheets失敗:', error);
    return {
      success: false,
      message: '同步過程中發生錯誤',
      error: error.message,
      details: {}
    };
  }
}

// 提交表單資料到 Google Sheets
exports.submitForm = async (req, res) => {
  try {
    const formData = req.body;
    
    // 基本資料驗證
    if (!formData.name || !formData.phone) {
      return res.status(400).json({ message: '請填寫姓名和聯繫電話' });
    }
    
    // 保存到 Google Sheets
    await googleSheet.appendRow(formData);
    
    // 同時保存到本地存儲
    saveToLocalStorage(formData);
    
    res.status(200).json({ message: '表單提交成功', success: true });
  } catch (error) {
    console.error('提交表單失敗:', error);
    res.status(500).json({ message: '表單提交失敗', error: error.message });
  }
};

// 獲取表單數據
exports.getFormData = async (req, res) => {
  try {
    // 先嘗試同步本地數據到Google Sheets
    await syncLocalDataToSheets();
    
    // 從 Google Sheets 獲取數據
    console.log('嘗試從 Google Sheets 獲取數據...');
    const data = await googleSheet.getRows();
    console.log(`成功從 Google Sheets 獲取數據，共 ${data.length} 筆記錄`);
    res.status(200).json(data);
  } catch (error) {
    console.error('獲取表單數據失敗:', error);
    
    // 如果無法從 Google Sheets 獲取，嘗試從本地存儲獲取
    try {
      console.log('嘗試從本地存儲獲取數據...');
      const localData = getFromLocalStorage();
      console.log(`成功從本地存儲獲取數據，共 ${localData.length} 筆記錄`);
      res.status(200).json(localData);
    } catch (localError) {
      console.error('從本地存儲獲取數據失敗:', localError);
      res.status(500).json({ message: '獲取數據失敗', error: error.message });
    }
  }
};

// 手動同步數據到Google Sheets
exports.syncToSheets = async (req, res) => {
  try {
    console.log('手動觸發數據同步...');
    const result = await syncLocalDataToSheets();
    res.status(200).json(result);
  } catch (error) {
    console.error('手動同步失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '手動同步過程中發生錯誤', 
      error: error.message 
    });
  }
};

// 保存到本地存儲
function saveToLocalStorage(formData) {
  // 確保數據目錄存在
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // 獲取現有數據
  const dataPath = path.join(dataDir, 'users.json');
  let users = [];
  
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf8');
    users = JSON.parse(data || '[]');
  }
  
  // 添加新用戶到數組
  users.push({
    ...formData,
    submitTime: new Date().toLocaleString()
  });
  
  // 保存更新後的數據
  fs.writeFileSync(dataPath, JSON.stringify(users), 'utf8');
}

// 從本地存儲獲取數據
function getFromLocalStorage() {
  const dataPath = path.join(__dirname, '..', 'data', 'users.json');
  
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data || '[]');
  }
  
  return [];
} 