const axios = require('axios');
require('dotenv').config();

const sheetId = process.env.GOOGLE_SHEET_ID;
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

/**
 * 初始化 Google Sheet，確保有標題列
 */
const initializeSheet = async () => {
  if (!apiKey || !sheetId) {
    console.log('未設定 Google API 金鑰或 Sheet ID，跳過初始化');
    return;
  }

  try {
    // 檢查工作表內容
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A1:G1?key=${apiKey}`
    );
    
    const rows = response.data.values || [];
    
    // 如果沒有標題列，添加標題列
    if (rows.length === 0) {
      console.log('初始化 Google Sheet，添加標題列');
      await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A1:G1?valueInputOption=USER_ENTERED&key=${apiKey}`,
        {
          values: [['ID', '姓名', '電話', '提交時間', '主要類別', '習慣', '回答']]
        }
      );
    }
  } catch (error) {
    console.error('初始化 Google Sheet 失敗:', error.response?.data || error.message);
  }
};

/**
 * 將資料列加入 Google Sheet
 * @param {Object} rowData - 要加入的資料列
 * @returns {Promise} - API 回應
 */
exports.appendRow = async (rowData) => {
  // 先確保 Sheet 已初始化
  await initializeSheet();

  // 將資料轉換為陣列格式
  const values = [
    rowData.id,
    rowData.name,
    rowData.phone,
    rowData.submitTime || new Date().toLocaleString(),
    rowData.primaryCategory || '',
    JSON.stringify(rowData.habits || []),
    JSON.stringify(rowData.answers || [])
  ];

  console.log('添加資料到 Google Sheet:', values);
  console.log('使用的 Sheet ID:', sheetId);
  console.log('使用的工作表名稱: 用戶資料');

  // 如果未設定 API 金鑰或 Sheet ID，則只記錄不進行實際操作
  if (!apiKey || !sheetId) {
    console.log('未設定 Google API 金鑰或 Sheet ID，僅記錄資料');
    return { success: true, message: '模擬添加資料成功' };
  }

  try {
    // 呼叫 Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A:G:append?valueInputOption=USER_ENTERED&key=${apiKey}`;
    console.log('API請求URL:', url);
    
    const response = await axios.post(
      url,
      { values: [values] }
    );
    console.log('Google Sheets API 響應:', response.data);
    return response.data;
  } catch (error) {
    console.error('Google Sheets API 錯誤:');
    if (error.response) {
      // 伺服器回應錯誤
      console.error('狀態碼:', error.response.status);
      console.error('響應數據:', error.response.data);
    } else if (error.request) {
      // 請求已發出但沒有收到回應
      console.error('沒有收到回應，請求詳情:', error.request);
    } else {
      // 設置請求時發生錯誤
      console.error('錯誤訊息:', error.message);
    }
    throw error;
  }
};

/**
 * 從 Google Sheet 獲取所有資料列
 * @returns {Promise<Array>} - 所有資料列
 */
exports.getRows = async () => {
  // 先確保 Sheet 已初始化
  await initializeSheet();

  // 如果未設定 API 金鑰或 Sheet ID，則返回空陣列
  if (!apiKey || !sheetId) {
    console.log('未設定 Google API 金鑰或 Sheet ID，返回空陣列');
    return [];
  }

  try {
    // 呼叫 Google Sheets API
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A:G?key=${apiKey}`
    );
    
    const rows = response.data.values || [];
    
    // 如果只有標題列，返回空陣列
    if (rows.length <= 1) {
      return [];
    }
    
    // 將資料轉換為物件格式
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        // 嘗試解析 JSON 字串
        if (header === '習慣' || header === '回答') {
          try {
            obj[header] = JSON.parse(row[index] || '[]');
          } catch (e) {
            obj[header] = [];
          }
        } else {
          obj[header] = row[index] || '';
        }
      });
      return obj;
    });
  } catch (error) {
    console.error('獲取 Google Sheets 資料錯誤:', error.response?.data || error.message);
    throw error;
  }
};

// 測試API連接
exports.testConnection = async () => {
  console.log('測試Google Sheets API連接...');
  
  const testResult = {
    success: false,
    apiKeyValid: false,
    sheetIdValid: false,
    sheetAccessible: false,
    worksheetAccessible: false,
    message: '',
    error: null
  };
  
  if (!apiKey) {
    testResult.message = '未設定API密鑰';
    return testResult;
  }
  
  if (!sheetId) {
    testResult.message = '未設定Sheet ID';
    return testResult;
  }
  
  try {
    // 測試1: 檢查API密鑰是否有效
    console.log('步驟1: 測試API密鑰有效性...');
    try {
      // 使用一個簡單的API調用來測試密鑰
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets?key=${apiKey}`
      );
      testResult.apiKeyValid = true;
      console.log('API密鑰有效');
    } catch (error) {
      testResult.apiKeyValid = false;
      testResult.message = 'API密鑰無效或無足夠權限';
      console.error('API密鑰測試失敗:', error.response?.data || error.message);
      return testResult;
    }
    
    // 測試2: 檢查Sheet ID是否有效
    console.log('步驟2: 測試Sheet ID有效性...');
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
      );
      testResult.sheetIdValid = true;
      console.log('Sheet ID有效');
    } catch (error) {
      testResult.sheetIdValid = false;
      testResult.message = 'Sheet ID無效或無權訪問';
      console.error('Sheet ID測試失敗:', error.response?.data || error.message);
      return testResult;
    }
    
    // 測試3: 檢查工作表是否存在並可訪問
    console.log('步驟3: 測試工作表訪問權限...');
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A1:A1?key=${apiKey}`
      );
      testResult.worksheetAccessible = true;
      testResult.sheetAccessible = true;
      console.log('工作表可訪問');
    } catch (error) {
      testResult.worksheetAccessible = false;
      testResult.message = '無法訪問"用戶資料"工作表';
      console.error('工作表訪問測試失敗:', error.response?.data || error.message);
      
      // 嘗試獲取所有工作表
      try {
        const sheetsResponse = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
        );
        testResult.sheetAccessible = true;
        const sheets = sheetsResponse.data.sheets || [];
        const sheetNames = sheets.map(s => s.properties.title).join(', ');
        testResult.message += `。可用的工作表: ${sheetNames}`;
      } catch (sheetsError) {
        testResult.sheetAccessible = false;
      }
      
      return testResult;
    }
    
    // 所有測試通過
    testResult.success = true;
    testResult.message = '所有連接測試通過';
    return testResult;
  } catch (error) {
    console.error('連接測試過程中發生錯誤:', error);
    testResult.error = error.message;
    testResult.message = '連接測試過程中發生錯誤';
    return testResult;
  }
}; 