// タイマーの状態管理
let startTime = null;
let elapsedTime = 0; // 一時停止時の経過時間を保持
let timerInterval = null;
let isRunning = false;
let recordStartTime = null; // 記録開始時刻（Date オブジェクト）
let selectedTags = []; // 選択中のタグ
let currentDescription = ''; // 現在の作業内容

// カレンダーの状態管理
let currentCalendarDate = new Date(); // カレンダーで表示している年月
let selectedDate = null; // 選択中の日付（YYYY-MM-DD形式）

// ローカルストレージのキー
const STORAGE_KEY_RECORDS = 'workingTimer_records';
const STORAGE_KEY_TAGS = 'workingTimer_tags';

// DOM要素の取得
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const endBtn = document.getElementById('endBtn');
const descriptionInput = document.getElementById('descriptionInput');
const calendarContainer = document.getElementById('calendarContainer');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const recordsSectionTitle = document.getElementById('recordsSectionTitle');

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

// 時刻をHH:MM:SS形式で取得
function formatDateTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 時刻をHH:MM形式で取得（表示用）
function formatDateTimeForDisplay(timeString) {
    // HH:MM:SS形式からHH:MM形式に変換
    if (timeString && timeString.length === 8 && timeString.includes(':')) {
        return timeString.substring(0, 5); // 最初の5文字（HH:MM）を返す
    }
    return timeString; // 既存のHH:MM形式の場合はそのまま返す
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
        description: currentDescription.trim(), // 作業内容
        tags: [...selectedTags] // 選択されたタグをコピー
    };

    // 既存の記録を読み込み
    const records = loadRecords();
    records.push(record);

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

    // 記録一覧を更新
    if (selectedDate) {
        // 選択中の日付がある場合はその日の記録を表示
        displayRecords(selectedDate);
    } else {
        displayRecords();
    }

    // カレンダーを更新（記録がある日のマーカーを更新するため）
    renderCalendar();

    // 選択タグと作業内容をリセット
    selectedTags = [];
    currentDescription = '';
    updateTagCheckboxes();
    updateDescriptionInput();
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

        // 経過時間が0の場合（新規開始）、記録開始時刻と作業内容を設定
        if (elapsedTime === 0) {
            recordStartTime = new Date();
            // 作業内容を保存
            if (descriptionInput) {
                currentDescription = descriptionInput.value.trim();
            }
        }

        // 経過時間を考慮して開始時刻を設定
        startTime = Date.now() - elapsedTime;

        // 100ミリ秒ごとに表示を更新
        timerInterval = setInterval(updateDisplay, 100);

        // ボタンの状態を更新
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        // 入力欄を無効化
        updateDescriptionInput();

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

        // 入力欄の状態を更新（一時停止中は編集不可のまま）
        updateDescriptionInput();

        // タイマーの色を更新
        updateTimerColor();
    }
}

// タイマーを終了する関数
function endTimer() {
    // タイマーが実行中の場合は、経過時間を計算
    if (isRunning && startTime !== null) {
        elapsedTime = Date.now() - startTime;
    }

    // 記録がある場合は確認ダイアログを表示
    if (recordStartTime !== null && elapsedTime > 0) {
        const durationMinutes = Math.floor(elapsedTime / 60000);
        const descriptionText = currentDescription ? `\n作業内容: ${currentDescription}` : '';
        const confirmMessage = `作業記録を保存しますか？\n（${formatDuration(durationMinutes)}の作業）${descriptionText}`;

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
    currentDescription = '';
    clearInterval(timerInterval);
    timerDisplay.textContent = formatTime(0);
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // 入力欄を有効化してリセット
    updateDescriptionInput();

    // タイマーの色を更新
    updateTimerColor();
}

// 記録一覧を表示
function displayRecords(targetDate = null) {
    const recordsContainer = document.getElementById('recordsList');
    if (!recordsContainer) return;

    const records = loadRecords();
    let filteredRecords = records;

    // 特定の日付が指定されている場合はその日の記録のみを表示
    if (targetDate) {
        filteredRecords = records.filter(record => record.date === targetDate);
        const dateObj = new Date(targetDate);
        const displayDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        if (recordsSectionTitle) {
            recordsSectionTitle.textContent = `${displayDate}の記録`;
        }
    } else {
        // 日付順にソート（新しい順）
        filteredRecords.sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.startTime.localeCompare(a.startTime);
        });
        // 最新10件のみ表示
        filteredRecords = filteredRecords.slice(0, 10);
        if (recordsSectionTitle) {
            recordsSectionTitle.textContent = '記録一覧';
        }
    }

    if (filteredRecords.length === 0) {
        recordsContainer.innerHTML = '<p class="no-records">記録がありません</p>';
        return;
    }

    recordsContainer.innerHTML = filteredRecords.map(record => {
        const dateObj = new Date(record.date);
        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        const description = record.description || '（作業内容なし）';
        const tagsText = record.tags.length > 0 ? ` [${record.tags.join(', ')}]` : '';
        // 表示時は時:分のみ（秒は非表示）
        const displayStartTime = formatDateTimeForDisplay(record.startTime);
        const displayEndTime = formatDateTimeForDisplay(record.endTime);

        return `
            <div class="record-item">
                <div class="record-date">${displayDate}</div>
                <div class="record-time">${displayStartTime} - ${displayEndTime} (${formatDuration(record.duration)})</div>
                <div class="record-description">${description}${tagsText}</div>
            </div>
        `;
    }).join('');
}

// カレンダーを生成・表示
function renderCalendar() {
    if (!calendarContainer || !calendarMonthYear) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // 年月表示を更新
    calendarMonthYear.textContent = `${year}年${month + 1}月`;

    // 記録を読み込んで、記録がある日付のセットを作成
    const records = loadRecords();
    const datesWithRecords = new Set();
    records.forEach(record => {
        datesWithRecords.add(record.date);
    });

    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0=日曜日, 6=土曜日
    const daysInMonth = lastDay.getDate();

    // カレンダーのHTMLを生成
    let calendarHTML = '<div class="calendar-weekdays">';
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach(day => {
        calendarHTML += `<div class="calendar-weekday">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';

    // 前月の最後の数日を表示（月の最初の日が日曜日でない場合）
    if (firstDayOfWeek > 0) {
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            calendarHTML += `<div class="calendar-day calendar-day-other">${day}</div>`;
        }
    }

    // 今月の日付を表示
    const today = new Date();
    const todayStr = formatDate(today);
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(new Date(year, month, day));
        const isToday = dateStr === todayStr;
        const hasRecords = datesWithRecords.has(dateStr);
        const isSelected = selectedDate === dateStr;

        let classes = 'calendar-day';
        if (isToday) classes += ' calendar-day-today';
        if (hasRecords) classes += ' calendar-day-has-records';
        if (isSelected) classes += ' calendar-day-selected';

        calendarHTML += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }

    // 次月の最初の数日を表示（カレンダーを埋めるため）
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6週分（42日）を表示
    if (remainingCells > 0) {
        for (let day = 1; day <= remainingCells && day <= 7; day++) {
            calendarHTML += `<div class="calendar-day calendar-day-other">${day}</div>`;
        }
    }

    calendarHTML += '</div>';
    calendarContainer.innerHTML = calendarHTML;

    // 各日付にクリックイベントを追加
    const dayElements = calendarContainer.querySelectorAll('.calendar-day[data-date]');
    dayElements.forEach(element => {
        element.addEventListener('click', () => {
            const date = element.getAttribute('data-date');
            selectDate(date);
        });
    });
}

// 日付を選択
function selectDate(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    displayRecords(dateStr);
}

// 前月に移動
function goToPrevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    selectedDate = null; // 日付選択をリセット
    renderCalendar();
    displayRecords(); // 記録一覧をリセット
}

// 次月に移動
function goToNextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    selectedDate = null; // 日付選択をリセット
    renderCalendar();
    displayRecords(); // 記録一覧をリセット
}

// 作業内容入力欄の状態を更新
function updateDescriptionInput() {
    if (!descriptionInput) return;

    if (isRunning || elapsedTime > 0) {
        // タイマーが実行中または一時停止中は無効化
        descriptionInput.disabled = true;
        descriptionInput.readOnly = true;
    } else {
        // タイマーが停止中は有効化
        descriptionInput.disabled = false;
        descriptionInput.readOnly = false;
        // リセット時にクリア
        if (currentDescription === '') {
            descriptionInput.value = '';
        }
    }
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

// カレンダーのイベントリスナー
if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', goToPrevMonth);
}
if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', goToNextMonth);
}

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
updateDescriptionInput();
renderCalendar();
displayRecords();
displayTags();
updateTagCheckboxes();

