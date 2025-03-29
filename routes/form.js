const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// POST /api/form/submit - 提交問卷回答
router.post('/submit', formController.submitForm);

// GET /api/form/data - 獲取已提交的數據
router.get('/data', formController.getFormData);

module.exports = router; 