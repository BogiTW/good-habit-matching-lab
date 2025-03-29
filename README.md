# 好習慣配對實驗室

[![部署狀態](https://img.shields.io/badge/deployed%20on-zeabur-009345)](https://zeabur.com)
[![CI/CD](https://github.com/USERNAME/good-habit-matching-lab/actions/workflows/main.yml/badge.svg)](https://github.com/USERNAME/good-habit-matching-lab/actions)

此專案為一個基於問卷表單的交友配對 MVP，利用 Google Sheets 作為初期資料庫，未來可擴充為更完整的配對系統。

## 架構說明

- **後端**：Node.js + Express，處理 API 請求與 Google Sheets 整合。
- **前端**：HTML/CSS/JavaScript，實作問卷表單與互動效果。
- **部署**：使用 Docker 部署到 Zeabur 平台。

## 專案結構

```
.
├── package.json
├── .env
├── Dockerfile
├── zeabur.json
├── README.md
├── server.js
├── routes
│   └── form.js
├── controllers
│   └── formController.js
├── utils
│   └── googleSheet.js
├── data
│   └── questionnaires.json
└── public
    ├── index.html
    ├── admin.html
    └── questionnaires.json
```

## 功能說明

- **問卷填寫**：使用者可以選擇習慣類別，填寫問卷並獲得匹配結果。
- **問卷管理**：管理員可以通過後台管理系統編輯問卷內容和查看用戶數據。
- **數據存儲**：用戶回答將存儲在 Google Sheets 中，方便後續分析。

## 本地部署步驟

1. 設定 .env 檔案中的環境變數。
2. 使用 npm install 安裝相依套件。
3. 使用 npm start 啟動應用程式。

## Zeabur 部署步驟

1. 將專案推送至 GitHub 倉庫
2. 在 Zeabur 平台註冊並登入
3. 創建新專案並選擇「從 GitHub 導入」
4. 選擇對應的 GitHub 倉庫
5. 配置環境變數：
   - GOOGLE_SHEETS_API_KEY
   - GOOGLE_SHEET_ID
   - PORT=3000
6. 完成部署
7. 配置自定義域名（選填）

## 持續部署

Zeabur 會自動監聽 GitHub 倉庫的變更。每次推送到主分支時，Zeabur 會自動重新部署應用。