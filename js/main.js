// 定義圖標對應
const icons = {
    lifestyle: "fa-home",
    sleep: "fa-moon",
    couple: "fa-heart",
    social: "fa-users",
    food: "fa-utensils",
    leisure: "fa-gamepad",
    fitness: "fa-running",
    finance: "fa-wallet",
    values: "fa-star"
};

// 當前用戶信息
let currentUser = {
    id: generateUserId(),
    name: '',
    phone: '',
    submitTime: '',
    primaryCategory: '',
    habits: [],
    answers: [] // 添加答案數組
};

// 選擇選項
function selectOption(element, event) {
    // 阻止冒泡，避免點擊標籤時觸發選項的點擊事件
    event.stopPropagation();
    
    // 如果點擊的是標籤容器或標籤，不處理
    if (event.target.classList.contains('tags-container') || 
        event.target.classList.contains('tag') ||
        event.target.classList.contains('tag-label') ||
        event.target.classList.contains('add-tag-btn') ||
        event.target.classList.contains('new-tag-input') ||
        event.target.classList.contains('new-tag-confirm') ||
        event.target.classList.contains('new-tag-cancel') ||
        event.target.classList.contains('custom-text-input') ||
        event.target.classList.contains('custom-text-container')) {
        return;
    }
    
    // 切換當前選項的選中狀態
    element.classList.toggle('selected');
    
    // 如果這是「其他」選項且被選中，顯示自定義文字輸入框
    if ((element.querySelector('p').textContent.includes('請直接填寫其他') || 
         element.querySelector('p').textContent.includes('其他 (文字說明)')) && 
        element.classList.contains('selected')) {
        // 確保自定義文字輸入框存在
        let customTextContainer = element.querySelector('.custom-text-container');
        if (!customTextContainer) {
            customTextContainer = document.createElement('div');
            customTextContainer.className = 'custom-text-container';
            customTextContainer.innerHTML = `
                <textarea class="custom-text-input" placeholder="請輸入您的自定義習慣內容" rows="3" onclick="event.stopPropagation()"></textarea>
            `;
            // 在標籤容器前插入自定義文字輸入框
            const tagsContainer = element.querySelector('.tags-container');
            element.insertBefore(customTextContainer, tagsContainer);
            
            // 為輸入框添加事件監聽器，保存用戶輸入
            const customTextInput = customTextContainer.querySelector('.custom-text-input');
            customTextInput.addEventListener('input', function() {
                saveAnswers();
            });
            
            // 自動聚焦輸入框
            customTextInput.focus();
        } else {
            customTextContainer.style.display = 'block';
        }
    } else if ((element.querySelector('p').textContent.includes('請直接填寫其他') || 
                element.querySelector('p').textContent.includes('其他 (文字說明)')) && 
               !element.classList.contains('selected')) {
        // 如果取消選中，隱藏自定義文字輸入框
        const customTextContainer = element.querySelector('.custom-text-container');
        if (customTextContainer) {
            customTextContainer.style.display = 'none';
        }
    }
    
    // 記錄選擇的答案
    saveAnswers();
}

// 切換標籤選中狀態
function toggleTag(tag, event) {
    // 阻止冒泡，避免觸發父元素的點擊事件
    event.stopPropagation();
    
    // 切換標籤的選中狀態
    tag.classList.toggle('selected');
    
    // 記錄選擇的答案
    saveAnswers();
}

// 保存用戶的回答
function saveAnswers() {
    const answers = [];
    
    // 獲取當前顯示的問卷
    const activeQuestionSet = document.querySelector('.question-set[style="display: block"]') || 
                            document.querySelector('.question-set:not([style*="display: none"])');
    
    if (!activeQuestionSet) return;
    
    // 遍歷每個問題
    const questions = activeQuestionSet.querySelectorAll('.question');
    questions.forEach((question, questionIndex) => {
        // 獲取問題文本
        const questionText = question.querySelector('h3').textContent;
        
        // 獲取選中的選項
        const selectedOptions = question.querySelectorAll('.option.selected');
        const options = [];
        
        // 遍歷每個選中的選項
        selectedOptions.forEach(option => {
            // 獲取選項文本
            const optionText = option.querySelector('p').textContent;
            
            // 獲取自定義文字內容（如果有）
            let customText = '';
            const customTextInput = option.querySelector('.custom-text-input');
            if (customTextInput) {
                customText = customTextInput.value.trim();
            }
            
            // 獲取選中的標籤
            const selectedTags = option.querySelectorAll('.tag.selected');
            const tags = Array.from(selectedTags).map(tag => tag.textContent);
            
            // 添加到選項數組
            options.push({
                text: optionText,
                customText: customText,
                tags: tags
            });
        });
        
        // 添加到回答數組
        answers.push({
            questionIndex: questionIndex,
            questionText: questionText,
            options: options
        });
    });
    
    // 更新用戶回答
    currentUser.answers = answers;
}

// 顯示新增標籤輸入框
function showAddTagInput(button, event) {
    // 阻止事件冒泡
    event.stopPropagation();
    
    // 獲取標籤容器
    const tagsContainer = button.parentElement;
    
    // 隱藏新增標籤按鈕
    button.style.display = 'none';
    
    // 獲取或創建輸入框容器
    let inputContainer = tagsContainer.querySelector('.new-tag-input-container');
    if (!inputContainer) {
        inputContainer = document.createElement('div');
        inputContainer.className = 'new-tag-input-container';
        inputContainer.innerHTML = `
            <input type="text" class="new-tag-input" placeholder="輸入標籤文字">
            <div class="new-tag-buttons">
                <button class="new-tag-confirm" onclick="confirmAddTag(this, event)">確定</button>
                <button class="new-tag-cancel" onclick="cancelAddTag(this, event)">取消</button>
            </div>
        `;
        tagsContainer.appendChild(inputContainer);
    }
    
    // 顯示輸入框容器
    inputContainer.style.display = 'flex';
    
    // 聚焦到輸入框
    inputContainer.querySelector('.new-tag-input').focus();
}

// 確認添加新標籤
function confirmAddTag(confirmButton, event) {
    // 阻止事件冒泡
    event.stopPropagation();
    
    // 獲取輸入框容器和標籤容器
    const buttonsContainer = confirmButton.parentElement;
    const inputContainer = buttonsContainer.parentElement;
    const tagsContainer = inputContainer.parentElement;
    
    // 獲取輸入值
    const tagText = inputContainer.querySelector('.new-tag-input').value.trim();
    
    // 如果有輸入內容，創建新標籤
    if (tagText) {
        // 創建新標籤
        const newTag = document.createElement('span');
        newTag.className = 'tag selected'; // 直接添加selected類，使標籤自動被選中
        newTag.setAttribute('onclick', 'toggleTag(this, event)');
        newTag.textContent = tagText;
        
        // 添加到標籤容器（在新增標籤按鈕之前）
        const addTagBtn = tagsContainer.querySelector('.add-tag-btn');
        tagsContainer.insertBefore(newTag, addTagBtn);
    }
    
    // 隱藏輸入框容器
    inputContainer.style.display = 'none';
    
    // 清空輸入框
    inputContainer.querySelector('.new-tag-input').value = '';
    
    // 顯示新增標籤按鈕
    tagsContainer.querySelector('.add-tag-btn').style.display = 'inline-block';
    
    // 記錄選擇的答案
    saveAnswers();
}

// 取消添加新標籤
function cancelAddTag(cancelButton, event) {
    // 阻止事件冒泡
    event.stopPropagation();
    
    // 獲取輸入框容器和標籤容器
    const buttonsContainer = cancelButton.parentElement;
    const inputContainer = buttonsContainer.parentElement;
    const tagsContainer = inputContainer.parentElement;
    
    // 隱藏輸入框容器
    inputContainer.style.display = 'none';
    
    // 清空輸入框
    inputContainer.querySelector('.new-tag-input').value = '';
    
    // 顯示新增標籤按鈕
    tagsContainer.querySelector('.add-tag-btn').style.display = 'inline-block';
}

// 生成隨機用戶ID
function generateUserId() {
    return Math.floor(10000 + Math.random() * 90000);
}

function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示指定頁面
    document.getElementById(pageId).classList.add('active');
    
    // 滾動到頁面頂部
    window.scrollTo(0, 0);
}

// 顯示問卷
function showQuestionnaire(category) {
    // 當前用戶選擇的類別
    currentCategory = category;
    
    // 設置問卷標題
    const titles = {
        lifestyle: "生活習慣問卷",
        sleep: "睡眠習慣問卷",
        couple: "情侶互動問卷",
        social: "人際相處問卷",
        food: "飲食習慣問卷", 
        leisure: "休閒習慣問卷",
        fitness: "運動習慣問卷",
        finance: "理財消費問卷",
        values: "價值觀問卷"
    };
    
    // 更新問卷標題
    document.getElementById("questionnaire-title").textContent = titles[category];
    
    // 隱藏所有問卷
    document.querySelectorAll('.question-set').forEach(set => {
        set.style.display = 'none';
    });
    
    // 顯示選擇的問卷
    document.getElementById(`${category}-questions`).style.display = 'block';
    
    // 清空已選擇的選項
    selectedOptions = [];
    
    // 顯示問卷頁面
    showPage('questionnaire');
}

// 加載問卷數據
function loadQuestionnaireData() {
    // 優先從伺服器獲取問卷數據
    fetchQuestionnaireData()
        .then(data => {
            // 如果成功獲取數據，則處理數據
            console.log("成功從伺服器獲取問卷數據");
            processQuestionnaireData(data);
        })
        .catch(err => {
            console.error("從伺服器獲取問卷數據失敗:", err);
            
            // 如果從伺服器獲取失敗，嘗試從本地存儲獲取
            const questionnaires = JSON.parse(localStorage.getItem('habitLabQuestionnaires') || '{}');
            
            // 如果有本地數據，則處理數據
            if (Object.keys(questionnaires).length > 0) {
                console.log("使用本地存儲的問卷數據");
                processQuestionnaireData(questionnaires);
            } else {
                console.log("沒有可用的問卷數據");
            }
        });
}

// 為每個問卷類別添加「其他」選項
function addOtherOption(category, questionSet) {
    // 如果是價值觀跟信念類別，不添加「自由填寫」選項
    if (category === 'values') {
        return;
    }
    
    // 問題標題
    const questionCount = questionSet.querySelectorAll('.question').length + 1;
    const otherQuestionDiv = document.createElement('div');
    otherQuestionDiv.className = 'question';
    
    // 問題標題 - 飲食習慣類別特殊處理
    const otherQuestionHeader = document.createElement('h3');
    if (category === 'food') {
        otherQuestionHeader.textContent = `${questionCount}. 其他相關習慣`;
    } else {
        otherQuestionHeader.textContent = `${questionCount}. 其他${getCategoryName(category)}`;
    }
    otherQuestionDiv.appendChild(otherQuestionHeader);
    
    // 添加說明文字
    const otherInstructionDiv = document.createElement('div');
    otherInstructionDiv.className = 'options-instruction';
    otherInstructionDiv.textContent = '* 您可以選擇多個選項';
    otherQuestionDiv.appendChild(otherInstructionDiv);
    
    // 選項容器
    const otherOptionsDiv = document.createElement('div');
    otherOptionsDiv.className = 'options';
    
    // 其他選項
    const otherOptionDiv = document.createElement('div');
    otherOptionDiv.className = 'option';
    otherOptionDiv.setAttribute('onclick', 'selectOption(this, event)');
    
    const otherOptionText = document.createElement('p');
    otherOptionText.textContent = `請直接填寫其他${getCategoryName(category)}`;
    otherOptionDiv.appendChild(otherOptionText);
    
    // 標籤容器
    const otherTagsContainer = document.createElement('div');
    otherTagsContainer.className = 'tags-container';
    
    // 添加標籤標題
    const otherTagLabel = document.createElement('span');
    otherTagLabel.className = 'tag-label';
    otherTagLabel.textContent = '添加標籤：';
    otherTagsContainer.appendChild(otherTagLabel);
    
    // 添加新增標籤按鈕
    const otherAddTagBtn = document.createElement('span');
    otherAddTagBtn.className = 'add-tag-btn';
    otherAddTagBtn.setAttribute('onclick', 'showAddTagInput(this, event)');
    otherAddTagBtn.innerHTML = '<i class="fas fa-plus"></i> 新增標籤';
    otherTagsContainer.appendChild(otherAddTagBtn);
    
    otherOptionDiv.appendChild(otherTagsContainer);
    otherOptionsDiv.appendChild(otherOptionDiv);
    
    otherQuestionDiv.appendChild(otherOptionsDiv);
    questionSet.appendChild(otherQuestionDiv);
}

// 從伺服器獲取問卷數據
function fetchQuestionnaireData() {
    return new Promise((resolve, reject) => {
        fetch('/api/questionnaires')
            .then(response => {
                if (!response.ok) {
                    throw new Error('伺服器響應錯誤: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // 保存到本地存儲
                localStorage.setItem('habitLabQuestionnaires', JSON.stringify(data));
                resolve(data);
            })
            .catch(error => {
                console.error('獲取問卷數據失敗:', error);
                reject(error);
            });
    });
}

// 顯示結果頁面
function showResults() {
    // 記錄提交時間
    currentUser.submitTime = new Date().toLocaleString();
    
    // 獲取當前問卷類別
    const activeQuestionSet = document.querySelector('.question-set[style="display: block"]') || 
                               document.querySelector('.question-set:not([style*="display: none"])');
    if (activeQuestionSet) {
        currentUser.primaryCategory = activeQuestionSet.id.replace('-questions', '');
    }
    
    // 獲取當前類別的答案
    updateResultsDisplay();
    
    showPage('results');
}

// 獲取類別的中文名稱
function getCategoryName(category) {
    const categoryNames = {
        lifestyle: "生活習慣",
        sleep: "睡眠習慣",
        couple: "情侶互動習慣",
        social: "人際相處習慣",
        food: "飲食習慣",
        leisure: "休閒習慣",
        fitness: "運動習慣",
        finance: "理財與消費習慣",
        values: "價值觀跟信念"
    };
    
    return categoryNames[category] || "習慣";
} 