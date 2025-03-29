const axios = require('axios');
require('dotenv').config();

const sheetId = process.env.GOOGLE_SHEET_ID;
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

/**
 * 將資料列加入 Google Sheet
 * @param {Object} rowData - 要加入的資料列
 * @returns {Promise} - API 回應
 */
exports.appendRow = async (rowData) => {
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

  // 如果未設定 API 金鑰或 Sheet ID，則只記錄不進行實際操作
  if (!apiKey || !sheetId) {
    console.log('未設定 Google API 金鑰或 Sheet ID，僅記錄資料');
    return { success: true, message: '模擬添加資料成功' };
  }

  try {
    // 呼叫 Google Sheets API
    const response = await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/用戶資料!A:G:append?valueInputOption=USER_ENTERED&key=${apiKey}`,
      { values: [values] }
    );
    return response.data;
  } catch (error) {
    console.error('Google Sheets API 錯誤:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 從 Google Sheet 獲取所有資料列
 * @returns {Promise<Array>} - 所有資料列
 */
exports.getRows = async () => {
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