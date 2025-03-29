const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const formRoutes = require('./routes/form');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 確保數據目錄存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化問卷數據文件
const questionnairesPath = path.join(dataDir, 'questionnaires.json');
if (!fs.existsSync(questionnairesPath)) {
    // 如果目錄中沒有，複製根目錄的問卷數據
    const rootQuestionnaires = path.join(__dirname, 'questionnaires.json');
    if (fs.existsSync(rootQuestionnaires)) {
        fs.copyFileSync(rootQuestionnaires, questionnairesPath);
    } else {
        fs.writeFileSync(questionnairesPath, '{}', 'utf8');
    }
}

// 中間件設置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // 提供靜態檔案存取

// API 路由 - 獲取問卷數據
app.get('/api/questionnaires', (req, res) => {
    try {
        const data = fs.readFileSync(questionnairesPath, 'utf8');
        res.json(JSON.parse(data || '{}'));
    } catch (error) {
        console.error('獲取問卷數據失敗:', error);
        res.status(500).json({ error: '獲取數據失敗' });
    }
});

// API 路由 - 更新問卷
app.post('/api/update-questionnaire', (req, res) => {
    try {
        const questionnaires = req.body;
        fs.writeFileSync(questionnairesPath, JSON.stringify(questionnaires), 'utf8');
        res.json({ success: true, message: '問卷數據已更新' });
    } catch (error) {
        console.error('更新問卷失敗:', error);
        res.status(500).json({ error: '更新失敗' });
    }
});

// 新增的表單提交路由
app.use('/api/form', formRoutes);

// 所有其他路由返回主頁
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
});