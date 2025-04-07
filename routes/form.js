const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const googleSheet = require('../utils/googleSheet');

// POST /api/form/submit - 提交問卷回答
router.post('/submit', formController.submitForm);

// GET /api/form/data - 獲取已提交的數據
router.get('/data', formController.getFormData);

// POST /api/form/sync - 手動同步數據到Google Sheets
router.post('/sync', formController.syncToSheets);

// GET /api/form/test-connection - 測試Google Sheets連接
router.get('/test-connection', async (req, res) => {
  try {
    const result = await googleSheet.testConnection();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '測試連接失敗', 
      error: error.message 
    });
  }
});

module.exports = router; 