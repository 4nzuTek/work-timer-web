// タイマーの状態管理
let startTime = null;
let elapsedTime = 0; // 一時停止時の経過時間を保持
let timerInterval = null;
let isRunning = false;
let recordStartTime = null; // 記録開始時刻（Date オブジェクト）
let selectedTags = []; // 選択中のタグ

// ローカルストレージのキー
const STORAGE_KEY_RECORDS = 'workingTimer_records';
const STORAGE_KEY_TAGS = 'workingTimer_tags';

// DOM要素の取得
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const endBtn = document.getElementById('endBtn');

// 時刻をMM:SS形式で表示する関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// タイマー表示を更新する関数
function updateDisplay() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = formatTime(currentTime);
}

// タイマーの色を更新する関数
function updateTimerColor() {
    if (isRunning) {
        timerDisplay.classList.remove('timer-stopped');
    } else {
        timerDisplay.classList.add('timer-stopped');
    }
}

// 日付をYYYY-MM-DD形式で取得
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 時刻をHH:MM形式で取得
function formatDateTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 分数を時間:分形式で取得
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
}

// 記録を作成して保存
function saveRecord() {
    if (recordStartTime === null || elapsedTime === 0) {
        return; // 記録すべきデータがない
    }

    const endTime = new Date(recordStartTime.getTime() + elapsedTime);
    const durationMinutes = Math.floor(elapsedTime / 60000);

    const record = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 一意のID
        date: formatDate(recordStartTime),
        startTime: formatDateTime(recordStartTime),
        endTime: formatDateTime(endTime),
        duration: durationMinutes, // 分数
        description: '', // Phase 4で実装
        tags: [...selectedTags] // 選択されたタグをコピー
    };

    // 既存の記録を読み込み
    const records = loadRecords();
    records.push(record);

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

    // 記録一覧を更新
    displayRecords();

    // 選択タグをリセット
    selectedTags = [];
    updateTagCheckboxes();
}

// ローカルストレージから記録を読み込み
function loadRecords() {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('記録の読み込みに失敗しました:', e);
            return [];
        }
    }
    return [];
}

// タグをローカルストレージから読み込み
function loadTags() {
    const stored = localStorage.getItem(STORAGE_KEY_TAGS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('タグの読み込みに失敗しました:', e);
            return [];
        }
    }
    return [];
}

// タグをローカルストレージに保存
function saveTags(tags) {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
}

// タグを追加
function addTag(tagName) {
    if (!tagName || tagName.trim() === '') {
        return false;
    }

    const trimmedTag = tagName.trim();
    const tags = loadTags();

    // 既に存在するかチェック
    if (tags.includes(trimmedTag)) {
        return false;
    }

    tags.push(trimmedTag);
    saveTags(tags);
    return true;
}

// タグを削除
function deleteTag(tagName) {
    const tags = loadTags();
    const index = tags.indexOf(tagName);
    if (index > -1) {
        tags.splice(index, 1);
        saveTags(tags);
        return true;
    }
    return false;
}

// タイマーを開始する関数
function startTimer() {
    if (!isRunning) {
        isRunning = true;

        // 経過時間が0の場合（新規開始）、記録開始時刻を設定
        if (elapsedTime === 0) {
            recordStartTime = new Date();
        }

        // 経過時間を考慮して開始時刻を設定
        startTime = Date.now() - elapsedTime;

        // 100ミリ秒ごとに表示を更新
        timerInterval = setInterval(updateDisplay, 100);

        // ボタンの状態を更新
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        // タイマーの色を更新
        updateTimerColor();
    }
}

// タイマーを一時停止する関数
function pauseTimer() {
    if (isRunning) {
        isRunning = false;

        // 経過時間を保存
        elapsedTime = Date.now() - startTime;

        // インターバルをクリア
        clearInterval(timerInterval);

        // ボタンの状態を更新
        startBtn.disabled = false;
        pauseBtn.disabled = true;

        // タイマーの色を更新
        updateTimerColor();
    }
}

// タイマーを終了する関数
function endTimer() {
    // 記録がある場合は確認ダイアログを表示
    if (recordStartTime !== null && elapsedTime > 0) {
        const durationMinutes = Math.floor(elapsedTime / 60000);
        const confirmMessage = `作業記録を保存しますか？\n（${formatDuration(durationMinutes)}の作業）`;

        if (confirm(confirmMessage)) {
            // はいを選択：記録を保存してからリセット
            saveRecord();
        }
        // いいえを選択：保存せずにリセット
    }

    // タイマーをリセット
    isRunning = false;
    startTime = null;
    elapsedTime = 0;
    recordStartTime = null;
    clearInterval(timerInterval);
    timerDisplay.textContent = formatTime(0);
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // タイマーの色を更新
    updateTimerColor();
}

// 記録一覧を表示
function displayRecords() {
    const recordsContainer = document.getElementById('recordsList');
    if (!recordsContainer) return;

    const records = loadRecords();

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p class="no-records">記録がありません</p>';
        return;
    }

    // 日付順にソート（新しい順）
    records.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.startTime.localeCompare(a.startTime);
    });

    // 最新10件のみ表示
    const recentRecords = records.slice(0, 10);

    recordsContainer.innerHTML = recentRecords.map(record => {
        const dateObj = new Date(record.date);
        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        const description = record.description || '（作業内容なし）';
        const tagsText = record.tags.length > 0 ? ` [${record.tags.join(', ')}]` : '';

        return `
            <div class="record-item">
                <div class="record-date">${displayDate}</div>
                <div class="record-time">${record.startTime} - ${record.endTime} (${formatDuration(record.duration)})</div>
                <div class="record-description">${description}${tagsText}</div>
            </div>
        `;
    }).join('');
}

// タグチェックボックスを更新
function updateTagCheckboxes() {
    const tagCheckboxesContainer = document.getElementById('tagCheckboxes');
    if (!tagCheckboxesContainer) return;

    const tags = loadTags();

    if (tags.length === 0) {
        tagCheckboxesContainer.innerHTML = '<span class="no-tags">タグがありません。下のタグ管理でタグを追加してください。</span>';
        return;
    }

    tagCheckboxesContainer.innerHTML = tags.map(tag => {
        const isChecked = selectedTags.includes(tag) ? 'checked' : '';
        return `
            <label class="tag-checkbox-label">
                <input type="checkbox" class="tag-checkbox" value="${tag}" ${isChecked} onchange="toggleTag('${tag}')">
                <span>${tag}</span>
            </label>
        `;
    }).join('');
}

// タグの選択状態を切り替え
function toggleTag(tagName) {
    const index = selectedTags.indexOf(tagName);
    if (index > -1) {
        selectedTags.splice(index, 1);
    } else {
        selectedTags.push(tagName);
    }
}

// タグ一覧を表示
function displayTags() {
    const tagListContainer = document.getElementById('tagList');
    if (!tagListContainer) return;

    const tags = loadTags();

    if (tags.length === 0) {
        tagListContainer.innerHTML = '<p class="no-tags">タグがありません</p>';
        return;
    }

    tagListContainer.innerHTML = tags.map(tag => {
        return `
            <div class="tag-item">
                <span class="tag-name">${tag}</span>
                <button class="btn-delete-tag" onclick="handleDeleteTag('${tag}')">削除</button>
            </div>
        `;
    }).join('');
}

// タグ削除処理
function handleDeleteTag(tagName) {
    if (confirm(`タグ「${tagName}」を削除しますか？\n（既存の記録のタグには影響しません）`)) {
        deleteTag(tagName);
        displayTags();
        updateTagCheckboxes();
    }
}

// グローバルスコープに公開（onchange/onclickから呼び出すため）
window.toggleTag = toggleTag;
window.handleDeleteTag = handleDeleteTag;

// タグ追加処理
function handleAddTag() {
    const tagInput = document.getElementById('tagInput');
    const tagName = tagInput.value.trim();

    if (!tagName) {
        alert('タグ名を入力してください');
        return;
    }

    if (addTag(tagName)) {
        tagInput.value = '';
        displayTags();
        updateTagCheckboxes();
    } else {
        alert('このタグは既に登録されています');
    }
}

// イベントリスナーの設定
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
endBtn.addEventListener('click', endTimer);

// タグ関連のイベントリスナー
const addTagBtn = document.getElementById('addTagBtn');
const tagInput = document.getElementById('tagInput');

if (addTagBtn) {
    addTagBtn.addEventListener('click', handleAddTag);
}

if (tagInput) {
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    });
}

// 初期表示
timerDisplay.textContent = formatTime(0);
updateTimerColor();
displayRecords();
displayTags();
updateTagCheckboxes();

