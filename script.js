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
        document.body.classList.add('timer-running');
    } else {
        timerDisplay.classList.add('timer-stopped');
        document.body.classList.remove('timer-running');
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
    if (!timeString) return '';

    // HH:MM:SS形式（8文字）からHH:MM形式に変換
    if (timeString.length === 8 && timeString.split(':').length === 3) {
        return timeString.substring(0, 5); // 最初の5文字（HH:MM）を返す
    }
    // HH:MM形式（5文字）の場合はそのまま返す
    if (timeString.length === 5 && timeString.split(':').length === 2) {
        return timeString;
    }
    // その他の形式（壊れている可能性）の場合は、最初の5文字を返すか、空文字を返す
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
    }
    return timeString;
}

// 時刻をHH:MM:SS形式で取得（表示用、秒を含む）
function formatDateTimeForDisplayWithSeconds(timeString) {
    if (!timeString) return '';

    // HH:MM:SS形式（8文字）の場合はそのまま返す
    if (timeString.length === 8 && timeString.split(':').length === 3) {
        return timeString;
    }
    // HH:MM形式（5文字）の場合は:00を追加
    if (timeString.length === 5 && timeString.split(':').length === 2) {
        return timeString + ':00';
    }
    // その他の形式の場合は正規化
    const parts = timeString.split(':');
    if (parts.length === 3) {
        // 既に3つの部分がある場合は正規化
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    } else if (parts.length === 2) {
        // 2つの部分の場合は:00を追加
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }
    return timeString;
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

    // 経過時間（ミリ秒）を正確に計算
    const endTime = new Date(recordStartTime.getTime() + elapsedTime);
    const durationMinutes = Math.floor(elapsedTime / 60000);
    const durationSeconds = Math.floor((elapsedTime % 60000) / 1000); // 秒も計算

    // 開始時刻と終了時刻を秒まで含めて保存（HH:MM:SS形式）
    const startTimeStr = formatDateTime(recordStartTime); // HH:MM:SS形式
    const endTimeStr = formatDateTime(endTime); // HH:MM:SS形式

    // 秒が含まれていることを確認
    if (startTimeStr.length !== 8 || startTimeStr.split(':').length !== 3) {
        console.error('開始時刻の形式が正しくありません:', startTimeStr);
    }
    if (endTimeStr.length !== 8 || endTimeStr.split(':').length !== 3) {
        console.error('終了時刻の形式が正しくありません:', endTimeStr);
    }

    const record = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 一意のID
        date: formatDate(recordStartTime),
        startTime: startTimeStr, // HH:MM:SS形式（秒まで含む）
        endTime: endTimeStr, // HH:MM:SS形式（秒まで含む）
        duration: durationMinutes, // 分数
        durationSeconds: durationSeconds, // 秒（追加情報として保存）
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
        // 表示時は時:分:秒形式で表示
        const displayStartTime = formatDateTimeForDisplayWithSeconds(record.startTime);
        const displayEndTime = formatDateTimeForDisplayWithSeconds(record.endTime);

        return `
            <div class="record-item" data-record-id="${record.id}">
                <div class="record-content">
                    <div class="record-date">${displayDate}</div>
                    <div class="record-time">${displayStartTime} - ${displayEndTime} (${formatDuration(record.duration)})</div>
                    <div class="record-description">${description}${tagsText}</div>
                </div>
                <div class="record-actions">
                    <button class="btn-edit-record" onclick="startEditRecord('${record.id}')">編集</button>
                    <button class="btn-delete-record" onclick="handleDeleteRecord('${record.id}')">削除</button>
                </div>
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

// 記録を削除
function deleteRecord(recordId) {
    const records = loadRecords();
    const filteredRecords = records.filter(record => record.id !== recordId);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(filteredRecords));

    // 記録一覧とカレンダーを更新
    if (selectedDate) {
        displayRecords(selectedDate);
    } else {
        displayRecords();
    }
    renderCalendar();
}

// 記録削除処理
function handleDeleteRecord(recordId) {
    const records = loadRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const displayStartTime = formatDateTimeForDisplay(record.startTime);
    const displayEndTime = formatDateTimeForDisplay(record.endTime);
    const description = record.description || '（作業内容なし）';

    if (confirm(`この記録を削除しますか？\n\n${record.date}\n${displayStartTime} - ${displayEndTime}\n${description}`)) {
        deleteRecord(recordId);
    }
}

// 記録の編集を開始
function startEditRecord(recordId) {
    const records = loadRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    // 編集フォームを表示
    const recordElement = document.querySelector(`[data-record-id="${recordId}"]`);
    if (!recordElement) return;

    // 時刻を<input type="time" step="1">用に変換
    // record.startTime は HH:MM:SS 形式または HH:MM 形式の可能性がある
    let startTimeForInput = record.startTime || '';
    let endTimeForInput = record.endTime || '';

    // 形式を確認して正規化（必ずHH:MM:SS形式にする）
    const startParts = startTimeForInput.split(':');
    if (startParts.length === 3) {
        // 既にHH:MM:SS形式の場合は正規化（秒を2桁に）
        const hours = startParts[0].padStart(2, '0');
        const minutes = startParts[1].padStart(2, '0');
        const seconds = startParts[2].padStart(2, '0');
        startTimeForInput = `${hours}:${minutes}:${seconds}`;
    } else if (startParts.length === 2) {
        // HH:MM形式の場合は:00を追加
        const hours = startParts[0].padStart(2, '0');
        const minutes = startParts[1].padStart(2, '0');
        startTimeForInput = `${hours}:${minutes}:00`;
    } else if (startTimeForInput.length === 0) {
        // 空の場合は現在時刻を使用
        const now = new Date();
        startTimeForInput = formatDateTime(now);
    } else {
        // 予期しない形式の場合はエラー
        console.error('開始時刻の形式が正しくありません:', startTimeForInput);
        const now = new Date();
        startTimeForInput = formatDateTime(now);
    }

    const endParts = endTimeForInput.split(':');
    if (endParts.length === 3) {
        // 既にHH:MM:SS形式の場合は正規化（秒を2桁に）
        const hours = endParts[0].padStart(2, '0');
        const minutes = endParts[1].padStart(2, '0');
        const seconds = endParts[2].padStart(2, '0');
        endTimeForInput = `${hours}:${minutes}:${seconds}`;
    } else if (endParts.length === 2) {
        // HH:MM形式の場合は:00を追加
        const hours = endParts[0].padStart(2, '0');
        const minutes = endParts[1].padStart(2, '0');
        endTimeForInput = `${hours}:${minutes}:00`;
    } else if (endTimeForInput.length === 0) {
        // 空の場合は現在時刻を使用
        const now = new Date();
        endTimeForInput = formatDateTime(now);
    } else {
        // 予期しない形式の場合はエラー
        console.error('終了時刻の形式が正しくありません:', endTimeForInput);
        const now = new Date();
        endTimeForInput = formatDateTime(now);
    }

    // 最終チェック：必ずHH:MM:SS形式（8文字）であることを確認
    if (startTimeForInput.length !== 8 || startTimeForInput.split(':').length !== 3) {
        console.error('開始時刻の正規化に失敗:', startTimeForInput);
        // フォールバック: 現在時刻を使用
        const now = new Date();
        startTimeForInput = formatDateTime(now);
    }
    if (endTimeForInput.length !== 8 || endTimeForInput.split(':').length !== 3) {
        console.error('終了時刻の正規化に失敗:', endTimeForInput);
        // フォールバック: 現在時刻を使用
        const now = new Date();
        endTimeForInput = formatDateTime(now);
    }

    // デバッグ用：値が正しく設定されているか確認
    console.log('編集開始 - record.startTime:', record.startTime, '-> startTimeForInput:', startTimeForInput);
    console.log('編集開始 - record.endTime:', record.endTime, '-> endTimeForInput:', endTimeForInput);

    // タグチェックボックスを作成
    const allTags = loadTags();
    const tagCheckboxes = allTags.map(tag => {
        const checked = record.tags.includes(tag) ? 'checked' : '';
        return `
            <label class="edit-tag-checkbox-label">
                <input type="checkbox" class="edit-tag-checkbox" value="${tag}" ${checked}>
                <span>${tag}</span>
            </label>
        `;
    }).join('');

    // 秒の情報を取得
    const startSeconds = startTimeForInput.split(':').length === 3 ? startTimeForInput.split(':')[2] : '00';
    const endSeconds = endTimeForInput.split(':').length === 3 ? endTimeForInput.split(':')[2] : '00';

    recordElement.innerHTML = `
        <div class="record-edit-form">
            <div class="edit-form-row">
                <label class="edit-label">日付:</label>
                <input type="date" class="edit-date-input" value="${record.date}">
            </div>
            <div class="edit-form-row">
                <label class="edit-label">開始時刻:</label>
                <input type="time" class="edit-time-input edit-start-time" value="${startTimeForInput}" step="1" data-seconds="${startSeconds}" data-record-id="${recordId}">
            </div>
            <div class="edit-form-row">
                <label class="edit-label">終了時刻:</label>
                <input type="time" class="edit-time-input edit-end-time" value="${endTimeForInput}" step="1" data-seconds="${endSeconds}" data-record-id="${recordId}">
            </div>
            <div class="edit-form-row">
                <label class="edit-label">作業内容:</label>
                <input type="text" class="edit-description-input" value="${record.description || ''}" placeholder="作業内容を入力">
            </div>
            <div class="edit-form-row">
                <label class="edit-label">タグ:</label>
                <div class="edit-tag-checkboxes">
                    ${tagCheckboxes || '<span class="no-tags">タグがありません</span>'}
                </div>
            </div>
            <div class="edit-form-actions">
                <button class="btn-save-record" onclick="saveEditedRecord('${recordId}')">保存</button>
                <button class="btn-cancel-edit" onclick="cancelEditRecord('${recordId}')">キャンセル</button>
            </div>
        </div>
    `;

    // input要素の変更時に秒の情報をdata-seconds属性に保存
    const startTimeInputElement = recordElement.querySelector('.edit-start-time');
    const endTimeInputElement = recordElement.querySelector('.edit-end-time');

    if (startTimeInputElement) {
        // 初期値の秒を保持
        let currentStartSeconds = startSeconds;

        startTimeInputElement.addEventListener('change', function () {
            // valueからHH:MM:SS形式で取得を試みる
            const value = this.value;
            // step="1"を使っている場合、valueはHH:MM:SS形式になる可能性がある
            if (value && value.includes(':') && value.split(':').length === 3) {
                const seconds = value.split(':')[2];
                currentStartSeconds = seconds.padStart(2, '0');
                this.setAttribute('data-seconds', currentStartSeconds);
            } else if (value && value.includes(':') && value.split(':').length === 2) {
                // HH:MM形式の場合は、既存の秒を保持
                this.setAttribute('data-seconds', currentStartSeconds);
            }
        });

        startTimeInputElement.addEventListener('input', function () {
            // リアルタイムで秒を更新（step="1"の場合）
            const value = this.value;
            if (value && value.includes(':') && value.split(':').length === 3) {
                const seconds = value.split(':')[2];
                currentStartSeconds = seconds.padStart(2, '0');
                this.setAttribute('data-seconds', currentStartSeconds);
            }
        });
    }

    if (endTimeInputElement) {
        // 初期値の秒を保持
        let currentEndSeconds = endSeconds;

        endTimeInputElement.addEventListener('change', function () {
            // valueからHH:MM:SS形式で取得を試みる
            const value = this.value;
            if (value && value.includes(':') && value.split(':').length === 3) {
                const seconds = value.split(':')[2];
                currentEndSeconds = seconds.padStart(2, '0');
                this.setAttribute('data-seconds', currentEndSeconds);
            } else if (value && value.includes(':') && value.split(':').length === 2) {
                // HH:MM形式の場合は、既存の秒を保持
                this.setAttribute('data-seconds', currentEndSeconds);
            }
        });

        endTimeInputElement.addEventListener('input', function () {
            // リアルタイムで秒を更新（step="1"の場合）
            const value = this.value;
            if (value && value.includes(':') && value.split(':').length === 3) {
                const seconds = value.split(':')[2];
                currentEndSeconds = seconds.padStart(2, '0');
                this.setAttribute('data-seconds', currentEndSeconds);
            }
        });
    }
}

// 編集をキャンセル
function cancelEditRecord(recordId) {
    // 記録一覧を再表示
    if (selectedDate) {
        displayRecords(selectedDate);
    } else {
        displayRecords();
    }
}

// 編集した記録を保存
function saveEditedRecord(recordId) {
    const recordElement = document.querySelector(`[data-record-id="${recordId}"]`);
    if (!recordElement) return;

    const dateInput = recordElement.querySelector('.edit-date-input');
    // より確実なセレクターを使用
    const startTimeInput = recordElement.querySelector('.edit-start-time') || recordElement.querySelector('.edit-time-input:first-of-type');
    const endTimeInput = recordElement.querySelector('.edit-end-time') || recordElement.querySelectorAll('.edit-time-input')[1];
    const descriptionInput = recordElement.querySelector('.edit-description-input');
    const tagCheckboxes = recordElement.querySelectorAll('.edit-tag-checkbox:checked');

    if (!dateInput || !startTimeInput || !endTimeInput || !descriptionInput) return;

    const newDate = dateInput.value;
    // <input type="time" step="1">から取得した値の処理
    // valueは"HH:MM"形式で返される（秒は別途data-seconds属性から取得）
    let startTimeValue = startTimeInput.value || '';
    let endTimeValue = endTimeInput.value || '';

    // data-seconds属性から秒を取得（存在しない場合は'00'）
    const startSeconds = startTimeInput.getAttribute('data-seconds') || '00';
    const endSeconds = endTimeInput.getAttribute('data-seconds') || '00';

    // デバッグ用：入力値を確認
    console.log('保存前 - startTimeInput.value:', startTimeValue, 'data-seconds:', startSeconds);
    console.log('保存前 - endTimeInput.value:', endTimeValue, 'data-seconds:', endSeconds);

    // HH:MM:SS形式に変換
    let newStartTime = '';
    let newEndTime = '';

    // 開始時刻の処理
    if (startTimeValue) {
        const startParts = startTimeValue.split(':');
        if (startParts.length === 2) {
            // HH:MM形式に秒を追加
            const hours = startParts[0].padStart(2, '0');
            const minutes = startParts[1].padStart(2, '0');
            const seconds = String(parseInt(startSeconds) || 0).padStart(2, '0');
            newStartTime = `${hours}:${minutes}:${seconds}`;
        } else if (startParts.length === 3) {
            // 既にHH:MM:SS形式の場合はそのまま使用（ただし秒を上書き）
            const hours = startParts[0].padStart(2, '0');
            const minutes = startParts[1].padStart(2, '0');
            const seconds = String(parseInt(startParts[2]) || parseInt(startSeconds) || 0).padStart(2, '0');
            newStartTime = `${hours}:${minutes}:${seconds}`;
        } else {
            alert('開始時刻の形式が正しくありません');
            return;
        }
    } else {
        alert('開始時刻を入力してください');
        return;
    }

    // 終了時刻の処理
    if (endTimeValue) {
        const endParts = endTimeValue.split(':');
        if (endParts.length === 2) {
            // HH:MM形式に秒を追加
            const hours = endParts[0].padStart(2, '0');
            const minutes = endParts[1].padStart(2, '0');
            const seconds = String(parseInt(endSeconds) || 0).padStart(2, '0');
            newEndTime = `${hours}:${minutes}:${seconds}`;
        } else if (endParts.length === 3) {
            // 既にHH:MM:SS形式の場合はそのまま使用（ただし秒を上書き）
            const hours = endParts[0].padStart(2, '0');
            const minutes = endParts[1].padStart(2, '0');
            const seconds = String(parseInt(endParts[2]) || parseInt(endSeconds) || 0).padStart(2, '0');
            newEndTime = `${hours}:${minutes}:${seconds}`;
        } else {
            alert('終了時刻の形式が正しくありません');
            return;
        }
    } else {
        alert('終了時刻を入力してください');
        return;
    }

    // 最終チェック：形式が正しいか（HH:MM:SS、8文字）
    if (newStartTime.length !== 8 || newStartTime.split(':').length !== 3) {
        alert('開始時刻の形式が正しくありません: ' + newStartTime);
        return;
    }
    if (newEndTime.length !== 8 || newEndTime.split(':').length !== 3) {
        alert('終了時刻の形式が正しくありません: ' + newEndTime);
        return;
    }

    const newDescription = descriptionInput.value.trim();
    const newTags = Array.from(tagCheckboxes).map(cb => cb.value);

    // 時刻のバリデーション（Date オブジェクトで比較）
    const tempStartDate = new Date(`2000-01-01T${newStartTime}`);
    const tempEndDate = new Date(`2000-01-01T${newEndTime}`);
    if (tempStartDate >= tempEndDate) {
        alert('終了時刻は開始時刻より後である必要があります');
        return;
    }

    // 時間差を計算してdurationを更新
    // ISO形式で日時を作成（YYYY-MM-DDTHH:mm:ss）
    const startDate = new Date(`${newDate}T${newStartTime}`);
    const endDate = new Date(`${newDate}T${newEndTime}`);

    // 日付が同じ日の場合は終了時刻が開始時刻より前の可能性があるので、1日追加
    if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }

    const durationMinutes = Math.floor((endDate - startDate) / 60000);

    if (durationMinutes <= 0) {
        alert('作業時間は1分以上である必要があります');
        return;
    }

    // 記録を更新
    const records = loadRecords();
    const recordIndex = records.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;

    records[recordIndex] = {
        ...records[recordIndex],
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationMinutes,
        description: newDescription,
        tags: newTags
    };

    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

    // 記録一覧とカレンダーを更新
    if (selectedDate) {
        displayRecords(selectedDate);
    } else {
        displayRecords();
    }
    renderCalendar();
}

// グローバルスコープに公開（onchange/onclickから呼び出すため）
window.toggleTag = toggleTag;
window.handleDeleteTag = handleDeleteTag;
window.handleDeleteRecord = handleDeleteRecord;
window.startEditRecord = startEditRecord;
window.cancelEditRecord = cancelEditRecord;
window.saveEditedRecord = saveEditedRecord;

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

