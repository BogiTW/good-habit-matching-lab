const googleSheet = require('../utils/googleSheet');
const fs = require('fs');
const path = require('path');

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
    // 從 Google Sheets 獲取數據
    const data = await googleSheet.getRows();
    res.status(200).json(data);
  } catch (error) {
    console.error('獲取表單數據失敗:', error);
    
    // 如果無法從 Google Sheets 獲取，嘗試從本地存儲獲取
    try {
      const localData = getFromLocalStorage();
      res.status(200).json(localData);
    } catch (localError) {
      res.status(500).json({ message: '獲取數據失敗', error: error.message });
    }
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