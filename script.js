// タイマーの状態管理
let startTime = null;
let elapsedTime = 0; // 一時停止時の経過時間を保持
let timerInterval = null;
let isRunning = false;
let recordStartTime = null; // 記録開始時刻（Date オブジェクト）
let selectedTags = []; // 選択中のタグ
let currentDescription = ''; // 現在の作業内容
let voiceInterval = null; // ボイス再生用のタイマー
let voiceAudio = null; // ボイス用のaudio要素
let voiceIntervalSeconds = 15; // ボイス再生間隔（秒）
let bgmMuted = false; // BGMミュート状態
let voiceMuted = false; // ボイスミュート状態
let bgmVolumeBeforeMute = 50; // ミュート前のBGM音量
let voiceVolumeBeforeMute = 50; // ミュート前のボイス音量
let zundaImageTimeout = null; // ずんだもん画像切り替え用のタイマー

// カレンダーの状態管理
let currentCalendarDate = new Date(); // カレンダーで表示している年月
let selectedDate = null; // 選択中の日付（YYYY-MM-DD形式）

// 統計の状態管理
let statisticsPeriod = 'all'; // 'all', 'month', 'week', 'day'

// タイムテーブルのズーム状態管理
let timelineZoomLevel = 0.98; // ズームレベル（初期値は最小ズーム）
const TIMELINE_MIN_ZOOM = 0.98; // 最小ズーム（スクロールバーが出ないように少し余裕を持たせる）
const TIMELINE_MAX_ZOOM = 5.0; // 最大ズーム
const TIMELINE_ZOOM_STEP = 0.1; // ズームのステップ

// ローカルストレージのキー
const STORAGE_KEY_RECORDS = 'workingTimer_records';
const STORAGE_KEY_TAGS = 'workingTimer_tags';
const STORAGE_KEY_VOLUME = 'workingTimer_volume';
const STORAGE_KEY_VOICE_VOLUME = 'workingTimer_voice_volume';
const STORAGE_KEY_VOICE_INTERVAL = 'workingTimer_voice_interval';
const STORAGE_KEY_BGM_MUTED = 'workingTimer_bgm_muted';
const STORAGE_KEY_VOICE_MUTED = 'workingTimer_voice_muted';
const STORAGE_KEY_LAST_DESCRIPTION = 'workingTimer_last_description';
const STORAGE_KEY_LAST_SELECTED_TAGS = 'workingTimer_last_selected_tags';
const STORAGE_KEY_ZUNDA_POSITION = 'workingTimer_zunda_position';

// ボイスファイルのリスト（動的に読み込む）
let CHEER_VOICE_FILES = [];
let START_VOICE_FILES = []; // スタートボイスファイルのリスト
let END_VOICE_FILES = []; // エンドボイスファイルのリスト

// 既知のボイスファイルリスト（サーバー環境ではPHPスクリプトで自動検出される）
const KNOWN_VOICE_FILES = [
    'voice/cheer_voice/001_ずんだもん（ノーマル）_集中できててえらい….wav',
    'voice/cheer_voice/002_ずんだもん（ノーマル）_ちょっと疲れたら深….wav',
    'voice/cheer_voice/003_ずんだもん（ノーマル）_がんばってる姿かっ….wav',
    'voice/cheer_voice/004_ずんだもん（ノーマル）_無理しなくていいの….wav',
    'voice/cheer_voice/005_ずんだもん（ノーマル）_ふふん、このペース….wav',
    'voice/cheer_voice/006_ずんだもん（ノーマル）_やる気どんどん湧い….wav',
    'voice/cheer_voice/007_ずんだもん（ノーマル）_あきらめたらもった….wav',
    'voice/cheer_voice/008_ずんだもん（ノーマル）_目がしょぼしょぼし….wav',
    'voice/cheer_voice/009_ずんだもん（ノーマル）_静かな集中、いい感….wav',
    'voice/cheer_voice/010_ずんだもん（ノーマル）_パワー全開なのだ！….wav',
    'voice/cheer_voice/011_ずんだもん（ノーマル）_集中してる顔、すご….wav',
    'voice/cheer_voice/012_ずんだもん（ノーマル）_小さな一歩でも、ち….wav',
    'voice/cheer_voice/013_ずんだもん（ノーマル）_手を止めないで、そ….wav',
    'voice/cheer_voice/014_ずんだもん（ノーマル）_やればやるほど、上….wav',
    'voice/cheer_voice/015_ずんだもん（ノーマル）_今のリズム、すごく….wav',
    'voice/cheer_voice/016_ずんだもん（ノーマル）_少しずつでも積み重….wav',
    'voice/cheer_voice/017_ずんだもん（ノーマル）_集中モード突入なの….wav',
    'voice/cheer_voice/018_ずんだもん（ノーマル）_やりたい気持ちがあ….wav',
    'voice/cheer_voice/019_ずんだもん（ノーマル）_ミスしても大丈夫な….wav',
    'voice/cheer_voice/020_ずんだもん（ノーマル）_思ったより進んでる….wav',
    'voice/cheer_voice/021_ずんだもん（ノーマル）_ちょっと息抜きして….wav',
    'voice/cheer_voice/022_ずんだもん（ノーマル）_大丈夫、できるのだ….wav',
    'voice/cheer_voice/023_ずんだもん（ノーマル）_一瞬の迷いなんて気….wav',
    'voice/cheer_voice/024_ずんだもん（ノーマル）_頭の中がすっきりし….wav',
    'voice/cheer_voice/025_ずんだもん（ノーマル）_何度だって挑戦でき….wav',
    'voice/cheer_voice/026_ずんだもん（ノーマル）_自分のペースでいい….wav',
    'voice/cheer_voice/027_ずんだもん（ノーマル）_静かに燃えてる感じ….wav',
    'voice/cheer_voice/028_ずんだもん（ノーマル）_やり切った後の達成….wav',
    'voice/cheer_voice/029_ずんだもん（ノーマル）_休むのも戦略なのだ….wav',
    'voice/cheer_voice/030_ずんだもん（ノーマル）_最後までやり抜いた….wav'
];

// ボイスファイルリストを動的に検出する
async function loadCheerVoiceFiles() {
    // 方法1: PHPスクリプトでディレクトリをスキャン（サーバー環境の場合のみ）
    // file://プロトコルでは動作しないため、http/https環境でのみ実行
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        try {
            const response = await fetch('get_voice_files.php?type=cheer');
            if (response.ok) {
                const files = await response.json();
                if (files && Array.isArray(files) && files.length > 0) {
                    CHEER_VOICE_FILES = files;
                    console.log(`ボイスファイル ${CHEER_VOICE_FILES.length}個を自動検出しました`);
                    return;
                }
            }
        } catch (error) {
            console.warn('PHPスクリプトでの検出に失敗しました（サーバー環境でない可能性があります）:', error);
        }

        // 方法2: ディレクトリリスティングから取得（サーバーが許可している場合）
        try {
            const files = await getFilesFromDirectoryListing('voice/cheer_voice/');
            if (files.length > 0) {
                CHEER_VOICE_FILES = files;
                console.log(`ディレクトリリスティングから ${CHEER_VOICE_FILES.length}個のファイルを検出しました`);
                return;
            }
        } catch (error) {
            console.warn('ディレクトリリスティングの取得に失敗しました:', error);
        }
    }

    // 方法3: 既知のファイルリストを使用（ローカルファイルやサーバーでの自動検出失敗時）
    console.log('既知のファイルリストを使用します');
    CHEER_VOICE_FILES = KNOWN_VOICE_FILES;
    console.log(`ボイスファイル ${CHEER_VOICE_FILES.length}個を読み込みました`);
}

// スタートボイスファイルリストを動的に検出する
async function loadStartVoiceFiles() {
    // 方法1: PHPスクリプトでディレクトリをスキャン（サーバー環境の場合のみ）
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        try {
            const response = await fetch('get_voice_files.php?type=start');
            if (response.ok) {
                const files = await response.json();
                if (files && Array.isArray(files) && files.length > 0) {
                    START_VOICE_FILES = files;
                    console.log(`スタートボイスファイル ${START_VOICE_FILES.length}個を自動検出しました`);
                    return;
                }
            }
        } catch (error) {
            console.warn('PHPスクリプトでのスタートボイス検出に失敗しました:', error);
        }

        // 方法2: ディレクトリリスティングから取得
        try {
            const files = await getFilesFromDirectoryListing('voice/start_voice/');
            if (files.length > 0) {
                START_VOICE_FILES = files;
                console.log(`ディレクトリリスティングからスタートボイス ${START_VOICE_FILES.length}個を検出しました`);
                return;
            }
        } catch (error) {
            console.warn('ディレクトリリスティングの取得に失敗しました:', error);
        }
    }

    // 方法3: 既知のファイルリストを使用
    console.log('既知のスタートボイスファイルリストを使用します');
    START_VOICE_FILES = KNOWN_START_VOICE_FILES;
    console.log(`スタートボイスファイル ${START_VOICE_FILES.length}個を読み込みました`);
}

// エンドボイスファイルリストを動的に検出する
async function loadEndVoiceFiles() {
    // 方法1: PHPスクリプトでディレクトリをスキャン（サーバー環境の場合のみ）
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        try {
            const response = await fetch('get_voice_files.php?type=end');
            if (response.ok) {
                const files = await response.json();
                if (files && Array.isArray(files) && files.length > 0) {
                    END_VOICE_FILES = files;
                    console.log(`エンドボイスファイル ${END_VOICE_FILES.length}個を自動検出しました`);
                    return;
                }
            }
        } catch (error) {
            console.warn('PHPスクリプトでのエンドボイス検出に失敗しました:', error);
        }

        // 方法2: ディレクトリリスティングから取得
        try {
            const files = await getFilesFromDirectoryListing('voice/end_voice/');
            if (files.length > 0) {
                END_VOICE_FILES = files;
                console.log(`ディレクトリリスティングからエンドボイス ${END_VOICE_FILES.length}個を検出しました`);
                return;
            }
        } catch (error) {
            console.warn('ディレクトリリスティングの取得に失敗しました:', error);
        }
    }

    // 方法3: 既知のファイルリストを使用
    console.log('既知のエンドボイスファイルリストを使用します');
    END_VOICE_FILES = KNOWN_END_VOICE_FILES;
    console.log(`エンドボイスファイル ${END_VOICE_FILES.length}個を読み込みました`);
}

// 既知のスタートボイスファイルリスト（フォールバック用）
const KNOWN_START_VOICE_FILES = [
    'voice/start_voice/001_ずんだもん（ノーマル）_作業、スタートなの….wav'
];

// 既知のエンドボイスファイルリスト（フォールバック用）
const KNOWN_END_VOICE_FILES = [
    'voice/end_voice/002_ずんだもん（ノーマル）_お疲れ様なのだ！よ….wav'
];

// ディレクトリリスティングからファイルを取得（サーバー環境のみ）
async function getFilesFromDirectoryListing(dir = 'voice/cheer_voice/') {
    try {
        const response = await fetch(dir);
        if (!response.ok) return [];

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');

        const files = [];
        const audioExtensions = ['.wav', '.mp3', '.ogg', '.m4a', '.aac'];

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '../' && href !== './') {
                const lowerHref = href.toLowerCase();
                if (audioExtensions.some(ext => lowerHref.endsWith(ext))) {
                    // hrefが既に絶対パス（/で始まる）か、dirで始まっている場合はそのまま使用
                    let filePath;
                    if (href.startsWith('/') || href.startsWith(dir)) {
                        filePath = href;
                    } else {
                        filePath = `${dir}${href}`;
                    }
                    files.push(filePath);
                }
            }
        });

        return files.sort();
    } catch {
        return [];
    }
}

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
const bgmAudio = document.getElementById('bgmAudio');
const bgmVolumeSlider = document.getElementById('bgmVolumeSlider');
const bgmVolumeValue = document.getElementById('bgmVolumeValue');
const bgmMuteBtn = document.getElementById('bgmMuteBtn');
const voiceVolumeSlider = document.getElementById('voiceVolumeSlider');
const voiceVolumeValue = document.getElementById('voiceVolumeValue');
const voiceMuteBtn = document.getElementById('voiceMuteBtn');
const voiceIntervalInput = document.getElementById('voiceIntervalInput');

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
    const skyboxCanvas = document.getElementById('skyboxCanvas');

    if (isRunning) {
        timerDisplay.classList.remove('timer-stopped');
        document.body.classList.add('timer-running');
        // タイマー実行中はカラー表示
        if (skyboxCanvas) {
            skyboxCanvas.style.filter = 'grayscale(0%)';
        }
    } else {
        timerDisplay.classList.add('timer-stopped');
        document.body.classList.remove('timer-running');
        // タイマー停止中はグレースケール（彩度0）
        if (skyboxCanvas) {
            skyboxCanvas.style.filter = 'grayscale(100%)';
        }
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

// 秒を含む時間を時間:分:秒形式で取得
function formatDurationWithSeconds(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}時間${minutes}分${seconds}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${seconds}秒`;
    } else {
        return `${seconds}秒`;
    }
}

// 記録を作成して保存（エンドボイス再生なし）
function saveRecordWithoutEndVoice() {
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

    // 統計を更新
    updateStatistics();

    // タイムテーブルを更新
    updateTimeline();

    // タグと作業内容はリセットしない（次の作業でも使えるように保持）
    // 直近のタイマー設定を保存（作業内容とタグ選択を保持）
    saveLastTimerSettings();
}

// 記録を作成して保存（後方互換性のため残す）
function saveRecord() {
    saveRecordWithoutEndVoice();
    // 直接呼ばれた場合はエンドボイスも再生
    playEndVoice();
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

// BGMを再生
function playBGM() {
    if (bgmAudio) {
        bgmAudio.play().catch(error => {
            console.error('BGMの再生に失敗しました:', error);
        });
    }
}

// BGMを停止
function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0; // 再生位置をリセット
    }
}

// ずんだもん画像を話している画像に切り替え
function switchToSpeakImage() {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    // 既存のタイマーがあればクリア
    if (zundaImageTimeout) {
        clearTimeout(zundaImageTimeout);
        zundaImageTimeout = null;
    }

    // 画像を話している状態に切り替え
    zundaImage.src = 'image/zunda_speak.png';
}

// ずんだもん画像を通常の画像に戻す
function switchToNormalImage() {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    // 既存のタイマーがあればクリア
    if (zundaImageTimeout) {
        clearTimeout(zundaImageTimeout);
        zundaImageTimeout = null;
    }

    // 画像を通常の状態に戻す
    zundaImage.src = 'image/zunda_normal.png';
}

// ボイスが再生中かどうかをチェック
function isVoicePlaying() {
    return voiceAudio && !voiceAudio.paused && !voiceAudio.ended;
}

// ずんだもん画像のグレースケールを更新
function updateZundaGrayscale() {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    if (isRunning) {
        // タイマー実行中はカラー
        zundaImage.classList.remove('grayscale');
    } else {
        // タイマー停止中はグレースケール
        zundaImage.classList.add('grayscale');
    }
}

// ずんだもん画像の表示/非表示を更新（ボイスミュート状態に応じて）
function updateZundaVisibility() {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    if (voiceMuted) {
        zundaImage.classList.add('voice-muted');
    } else {
        zundaImage.classList.remove('voice-muted');
    }
}

// ずんだもん画像の向きを更新（画面の中心を向くように）
function updateZundaDirection(animateFlip = false) {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    const rect = zundaImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const screenCenter = window.innerWidth / 2;

    const shouldFlip = centerX < screenCenter;
    const currentDirection = shouldFlip ? 'left' : 'right';

    // 方向が変わった場合のみ処理（アニメーションが必要な場合）
    if (animateFlip && lastDirection !== null && lastDirection !== currentDirection) {
        // 現在の反転状態を確認
        const currentlyFlipped = zundaImage.classList.contains('flipped');

        // 既存のアニメーションクラスをクリア
        zundaImage.classList.remove('flipping-to-flipped', 'flipping-to-normal');

        // 紙がめくれるアニメーション: 10段階で変化
        // 反転状態から通常状態へ、または通常状態から反転状態へ
        if (shouldFlip && !currentlyFlipped) {
            // 通常から反転へ
            // アニメーションクラスを先に追加してから.flippedを削除
            zundaImage.classList.add('flipping-to-flipped');
            zundaImage.classList.remove('flipped');
        } else if (!shouldFlip && currentlyFlipped) {
            // 反転から通常へ
            // アニメーションクラスを追加（.flippedは残したまま）
            zundaImage.classList.add('flipping-to-normal');
            // 強制的に再描画をトリガーしてアニメーションを開始
            void zundaImage.offsetHeight; // reflowをトリガー
        }

        // アニメーション完了後に反転状態を適用
        setTimeout(() => {
            zundaImage.classList.remove('flipping-to-flipped', 'flipping-to-normal');
            // アニメーション完了後に.flippedクラスを更新
            if (shouldFlip) {
                zundaImage.classList.add('flipped');
            } else {
                zundaImage.classList.remove('flipped');
            }
            lastDirection = currentDirection;
        }, 150); // animationの時間に合わせる（0.15s）
    } else {
        // 通常の切り替え（アニメーションなし）
        if (shouldFlip) {
            zundaImage.classList.add('flipped');
        } else {
            zundaImage.classList.remove('flipped');
        }
        lastDirection = currentDirection;
    }
}

// ランダムにボイスを再生
function playRandomCheerVoice() {
    if (CHEER_VOICE_FILES.length === 0) return;
    if (voiceMuted) return; // ミュート中は再生しない

    // ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * CHEER_VOICE_FILES.length);
    const voiceFile = CHEER_VOICE_FILES[randomIndex];

    // 既存のaudio要素があれば削除
    if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio = null;
    }

    // 新しいaudio要素を作成
    voiceAudio = new Audio(voiceFile);

    // 現在のボイス音量を設定（ミュート状態を考慮）
    const stored = localStorage.getItem(STORAGE_KEY_VOICE_VOLUME);
    const volume = stored ? parseInt(stored, 10) : 50;
    voiceAudio.volume = voiceMuted ? 0 : volume / 100;

    // 再生
    voiceAudio.play()
        .then(() => {
            // 再生開始時に画像を切り替え
            switchToSpeakImage();
        })
        .catch(error => {
            console.error('ボイスの再生に失敗しました:', error);
        });

    // 再生終了時にaudio要素をクリアし、画像を通常に戻す
    voiceAudio.onended = () => {
        voiceAudio = null;
        // 再生が終了したら通常画像に戻す
        switchToNormalImage();
    };
}

// スタートボイスを再生
function playStartVoice() {
    if (voiceMuted) return; // ミュート中は再生しない
    if (START_VOICE_FILES.length === 0) return; // ファイルがない場合は再生しない

    // 既存のaudio要素を確実に停止して削除
    if (voiceAudio) {
        try {
            voiceAudio.pause();
            voiceAudio.currentTime = 0;
        } catch (e) {
            // エラーは無視
        }
        voiceAudio = null;
    }

    // 少し待ってから新しい音声を再生（前の音声が完全に停止するまで待つ）
    setTimeout(() => {
        // ランダムに1つ選択（複数ある場合）
        const randomIndex = Math.floor(Math.random() * START_VOICE_FILES.length);
        const startVoiceFile = START_VOICE_FILES[randomIndex];

        // 新しいaudio要素を作成
        const startAudio = new Audio(startVoiceFile);

        // 現在のボイス音量を設定
        const stored = localStorage.getItem(STORAGE_KEY_VOICE_VOLUME);
        const volume = stored ? parseInt(stored, 10) : 50;
        startAudio.volume = voiceMuted ? 0 : volume / 100;

        // 再生
        const playPromise = startAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // 再生成功
                    voiceAudio = startAudio;
                    // 再生開始時に画像を切り替え
                    switchToSpeakImage();
                })
                .catch(error => {
                    // 中断された場合などのエラーは無視（AbortErrorなど）
                    if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                        console.warn('スタートボイスの再生に失敗しました:', error);
                    }
                    voiceAudio = null;
                });
        }

        // 再生終了時にaudio要素をクリアし、画像を通常に戻す
        startAudio.onended = () => {
            if (voiceAudio === startAudio) {
                voiceAudio = null;
                // 再生が終了したら通常画像に戻す
                switchToNormalImage();
            }
        };
    }, 50); // 50ms待機
}

// エンドボイスを再生
function playEndVoice() {
    if (voiceMuted) {
        // ミュート中は再生しないが、グレースケールにする
        updateZundaGrayscale();
        return;
    }
    if (END_VOICE_FILES.length === 0) {
        // ファイルがない場合は再生しないが、グレースケールにする
        updateZundaGrayscale();
        return;
    }

    // 既存のaudio要素を確実に停止して削除
    if (voiceAudio) {
        try {
            voiceAudio.pause();
            voiceAudio.currentTime = 0;
        } catch (e) {
            // エラーは無視
        }
        voiceAudio = null;
    }

    // 少し待ってから新しい音声を再生（前の音声が完全に停止するまで待つ）
    setTimeout(() => {
        // ランダムに1つ選択（複数ある場合）
        const randomIndex = Math.floor(Math.random() * END_VOICE_FILES.length);
        const endVoiceFile = END_VOICE_FILES[randomIndex];

        // 新しいaudio要素を作成
        const endAudio = new Audio(endVoiceFile);

        // 現在のボイス音量を設定
        const stored = localStorage.getItem(STORAGE_KEY_VOICE_VOLUME);
        const volume = stored ? parseInt(stored, 10) : 50;
        endAudio.volume = voiceMuted ? 0 : volume / 100;

        // 再生
        const playPromise = endAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // 再生成功
                    voiceAudio = endAudio;
                    // 再生開始時に画像を切り替え
                    switchToSpeakImage();
                })
                .catch(error => {
                    // 中断された場合などのエラーは無視（AbortErrorなど）
                    if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                        console.warn('エンドボイスの再生に失敗しました:', error);
                    }
                    voiceAudio = null;
                    // 再生失敗時もグレースケールにする
                    if (!isRunning) {
                        updateZundaGrayscale();
                    }
                });
        }

        // 再生終了時にaudio要素をクリアし、画像を通常に戻す
        endAudio.onended = () => {
            if (voiceAudio === endAudio) {
                voiceAudio = null;
                // 再生が終了したら通常画像に戻す
                switchToNormalImage();
                // タイマーが停止中なら、エンドボイス終了後にグレースケールにする
                if (!isRunning) {
                    updateZundaGrayscale();
                }
            }
        };
    }, 50); // 50ms待機
}

// ボイス再生タイマーを開始
function startVoiceTimer() {
    // 既存のタイマーがあればクリア
    stopVoiceTimer();

    // 設定された間隔ごとにボイスを再生（即座には再生しない）
    const intervalMs = voiceIntervalSeconds * 1000;
    voiceInterval = setInterval(() => {
        if (isRunning) {
            playRandomCheerVoice();
        }
    }, intervalMs);
}

// ボイス再生タイマーを停止
function stopVoiceTimer() {
    if (voiceInterval) {
        clearInterval(voiceInterval);
        voiceInterval = null;
    }
    // 再生中のボイスがあれば停止
    if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio = null;
    }
    // ボイス停止時に通常画像に戻す
    switchToNormalImage();
}

// BGM音量を設定
function setBGMVolume(volume, updateMuteState = true) {
    if (bgmAudio && !bgmMuted) {
        // 0-100の値を0.0-0.5に変換（ベースを半分にする）
        // スライダー値100が実際の音量50%になる
        bgmAudio.volume = (volume / 100) * 0.5;
    } else if (bgmAudio && bgmMuted) {
        // ミュート中は音量を0にする
        bgmAudio.volume = 0;
    }
    if (bgmVolumeSlider) {
        bgmVolumeSlider.value = volume;
    }
    if (bgmVolumeValue) {
        bgmVolumeValue.textContent = volume;
    }

    // ミュート状態を更新しない場合は音量のみ保存
    if (updateMuteState && !bgmMuted) {
        bgmVolumeBeforeMute = volume;
    }

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY_VOLUME, volume.toString());
    updateBGMMuteButton();
}

// BGMミュートを切り替え
function toggleBGMMute() {
    bgmMuted = !bgmMuted;

    if (bgmMuted) {
        // ミュート: 音量を保存して0にする
        bgmVolumeBeforeMute = parseInt(bgmVolumeSlider.value, 10);
        if (bgmAudio) {
            bgmAudio.volume = 0;
        }
    } else {
        // ミュート解除: 保存した音量に戻す
        if (bgmAudio) {
            bgmAudio.volume = (bgmVolumeBeforeMute / 100) * 0.5;
        }
    }

    localStorage.setItem(STORAGE_KEY_BGM_MUTED, bgmMuted.toString());
    updateBGMMuteButton();
}

// BGMミュートボタンの表示を更新
function updateBGMMuteButton() {
    if (bgmMuteBtn) {
        bgmMuteBtn.textContent = bgmMuted ? '🔇' : '🔊';
        bgmMuteBtn.title = bgmMuted ? 'ミュート解除' : 'ミュート';
    }
}

// ボイス音量を設定
function setVoiceVolume(volume, updateMuteState = true) {
    if (voiceAudio && !voiceMuted) {
        // 0-100の値を0.0-1.0に変換
        voiceAudio.volume = volume / 100;
    } else if (voiceAudio && voiceMuted) {
        // ミュート中は音量を0にする
        voiceAudio.volume = 0;
    }
    if (voiceVolumeSlider) {
        voiceVolumeSlider.value = volume;
    }
    if (voiceVolumeValue) {
        voiceVolumeValue.textContent = volume;
    }

    // ミュート状態を更新しない場合は音量のみ保存
    if (updateMuteState && !voiceMuted) {
        voiceVolumeBeforeMute = volume;
    }

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY_VOICE_VOLUME, volume.toString());
    updateVoiceMuteButton();
}

// ボイスミュートを切り替え
function toggleVoiceMute() {
    voiceMuted = !voiceMuted;

    if (voiceMuted) {
        // ミュート: 音量を保存して0にする
        voiceVolumeBeforeMute = parseInt(voiceVolumeSlider.value, 10);
        if (voiceAudio) {
            voiceAudio.volume = 0;
        }
    } else {
        // ミュート解除: 保存した音量に戻す
        if (voiceAudio) {
            voiceAudio.volume = voiceVolumeBeforeMute / 100;
        }
    }

    localStorage.setItem(STORAGE_KEY_VOICE_MUTED, voiceMuted.toString());
    updateVoiceMuteButton();
    updateZundaVisibility(); // ずんだもんの表示/非表示を更新
}

// ボイスミュートボタンの表示を更新
function updateVoiceMuteButton() {
    if (voiceMuteBtn) {
        voiceMuteBtn.textContent = voiceMuted ? '🔇' : '🔊';
        voiceMuteBtn.title = voiceMuted ? 'ミュート解除' : 'ミュート';
    }
}

// BGM音量を読み込み
function loadBGMVolume() {
    const stored = localStorage.getItem(STORAGE_KEY_VOLUME);
    let volume = 50;
    if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            volume = parsed;
        }
    }
    bgmVolumeBeforeMute = volume;

    // ミュート状態を読み込み
    const mutedStored = localStorage.getItem(STORAGE_KEY_BGM_MUTED);
    bgmMuted = mutedStored === 'true';

    setBGMVolume(volume, false);
}

// ボイス音量を読み込み
function loadVoiceVolume() {
    const stored = localStorage.getItem(STORAGE_KEY_VOICE_VOLUME);
    let volume = 50;
    if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            volume = parsed;
        }
    }
    voiceVolumeBeforeMute = volume;

    // ミュート状態を読み込み
    const mutedStored = localStorage.getItem(STORAGE_KEY_VOICE_MUTED);
    voiceMuted = mutedStored === 'true';

    setVoiceVolume(volume, false);
    updateZundaVisibility(); // 初期状態のずんだもんの表示/非表示を設定
}

// ボイス間隔を設定
function setVoiceInterval(seconds) {
    if (seconds < 1) seconds = 1;
    if (seconds > 300) seconds = 300;

    voiceIntervalSeconds = seconds;

    if (voiceIntervalInput) {
        voiceIntervalInput.value = seconds;
    }

    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEY_VOICE_INTERVAL, seconds.toString());

    // タイマーが実行中の場合、再起動して新しい間隔を適用
    if (isRunning && voiceInterval) {
        startVoiceTimer();
    }
}

// ボイス間隔を読み込み
function loadVoiceInterval() {
    const stored = localStorage.getItem(STORAGE_KEY_VOICE_INTERVAL);
    if (stored) {
        const seconds = parseInt(stored, 10);
        if (!isNaN(seconds) && seconds >= 1 && seconds <= 300) {
            setVoiceInterval(seconds);
            return;
        }
    }
    // デフォルト間隔15秒
    setVoiceInterval(15);
}

// タイマーを開始する関数
function startTimer() {
    if (!isRunning) {
        isRunning = true;

        // 経過時間が0の場合（新規開始）、記録開始時刻と作業内容を設定
        if (elapsedTime === 0) {
            recordStartTime = new Date();
            // 作業内容を保存（入力欄の値を優先、空の場合は既存のcurrentDescriptionを保持）
            if (descriptionInput) {
                const inputValue = descriptionInput.value.trim();
                if (inputValue !== '') {
                    currentDescription = inputValue;
                }
                // 入力欄が空で、currentDescriptionがある場合は入力欄に反映
                if (inputValue === '' && currentDescription !== '') {
                    descriptionInput.value = currentDescription;
                }
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

        // BGMを再生
        playBGM();

        // 経過時間が0の場合（新規開始）、スタートボイスを再生
        if (elapsedTime === 0) {
            playStartVoice();
        }

        // ボイス再生タイマーを開始
        startVoiceTimer();

        // タイマーの色を更新
        updateTimerColor();

        // ずんだもん画像のグレースケールを更新
        updateZundaGrayscale();
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

        // BGMを停止
        stopBGM();

        // ボイス再生タイマーを停止
        stopVoiceTimer();

        // タイマーの色を更新
        updateTimerColor();

        // ずんだもん画像のグレースケールを更新
        updateZundaGrayscale();
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
        showEndTimerDialog();
        return; // ダイアログで処理するのでここで終了
    }

    // 記録がない場合はそのままリセット
    resetTimer();
}

// 終了確認ダイアログを表示
function showEndTimerDialog() {
    const durationMinutes = Math.floor(elapsedTime / 60000);
    const descriptionText = currentDescription ? `作業内容: ${currentDescription}` : '';
    const message = `作業記録を終了しますか？\n\n（${formatDuration(durationMinutes)}の作業）${descriptionText ? '\n' + descriptionText : ''}`;

    const dialog = document.getElementById('endTimerDialog');
    const messageElement = document.getElementById('endTimerDialogMessage');
    const saveBtn = document.getElementById('endTimerSaveBtn');
    const noSaveBtn = document.getElementById('endTimerNoSaveBtn');
    const cancelBtn = document.getElementById('endTimerCancelBtn');

    messageElement.textContent = message;
    dialog.style.display = 'flex';

    // 既存のイベントリスナーを削除（重複防止）
    const newSaveBtn = saveBtn.cloneNode(true);
    const newNoSaveBtn = noSaveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    noSaveBtn.parentNode.replaceChild(newNoSaveBtn, noSaveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // 保存して終了
    newSaveBtn.addEventListener('click', () => {
        dialog.style.display = 'none';
        saveRecordWithoutEndVoice(); // エンドボイスは別途再生
        resetTimer(true); // エンドボイス再生フラグをtrueに
        playEndVoice(); // エンドボイスを再生
    });

    // 保存せずに終了
    newNoSaveBtn.addEventListener('click', () => {
        dialog.style.display = 'none';
        resetTimer(true); // エンドボイス再生フラグをtrueに
        playEndVoice(); // エンドボイスを再生
    });

    // キャンセル（タイマーを再開）
    newCancelBtn.addEventListener('click', () => {
        dialog.style.display = 'none';
        // タイマーが一時停止中の場合、再開する
        if (!isRunning && elapsedTime > 0) {
            startTimer();
        }
    });
}

// タイマーをリセット
function resetTimer(skipGrayscaleUpdate = false) {
    // タイマーをリセット
    isRunning = false;
    startTime = null;
    elapsedTime = 0;
    recordStartTime = null;
    // currentDescription はリセットしない（次の作業でも使えるように保持）
    clearInterval(timerInterval);
    timerDisplay.textContent = formatTime(0);
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    // 入力欄を有効化（値は保持）
    updateDescriptionInput();

    // 直近のタイマー設定を保存（作業内容とタグ選択を保持）
    saveLastTimerSettings();

    // BGMを停止
    stopBGM();

    // ボイス再生タイマーを停止
    stopVoiceTimer();

    // タイマーの色を更新
    updateTimerColor();

    // ずんだもん画像のグレースケールを更新
    // エンドボイス再生時はスキップ（エンドボイス終了後にグレースケールにするため）
    if (!skipGrayscaleUpdate) {
        updateZundaGrayscale();
    }
}

// 記録一覧を表示
function displayRecords(targetDate = null) {
    const recordsContainer = document.getElementById('recordsList');
    if (!recordsContainer) return;

    const records = loadRecords();
    let filteredRecords = records;

    // targetDateが指定されていない場合は今日の日付を使用
    if (!targetDate) {
        const today = new Date();
        targetDate = formatDate(today);
    }

    // 特定の日付の記録のみを表示
    filteredRecords = records.filter(record => record.date === targetDate);

    // 開始時刻でソート
    filteredRecords.sort((a, b) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);
        return aTime - bTime;
    });

    // 今日の日付かどうかを判定
    const today = new Date();
    const todayStr = formatDate(today);
    const isToday = targetDate === todayStr;

    if (recordsSectionTitle) {
        if (isToday) {
            recordsSectionTitle.textContent = '今日の記録';
        } else {
            const dateObj = new Date(targetDate);
            const displayDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
            recordsSectionTitle.textContent = `${displayDate}の記録`;
        }
    }

    if (filteredRecords.length === 0) {
        recordsContainer.innerHTML = '<p class="no-records">記録がありません</p>';
        return;
    }

    recordsContainer.innerHTML = filteredRecords.map(record => {
        const dateObj = new Date(record.date);
        const displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        const description = record.description || '';
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
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日
            let classes = 'calendar-day calendar-day-other';
            if (dayOfWeek === 0) classes += ' calendar-day-sunday'; // 日曜日
            if (dayOfWeek === 6) classes += ' calendar-day-saturday'; // 土曜日
            calendarHTML += `<div class="${classes}">${day}</div>`;
        }
    }

    // 今月の日付を表示
    const today = new Date();
    const todayStr = formatDate(today);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日
        const dateStr = formatDate(date);
        const isToday = dateStr === todayStr;
        const hasRecords = datesWithRecords.has(dateStr);
        const isSelected = selectedDate === dateStr;

        let classes = 'calendar-day';
        if (isToday) classes += ' calendar-day-today';
        if (hasRecords) classes += ' calendar-day-has-records';
        if (isSelected) classes += ' calendar-day-selected';
        if (dayOfWeek === 0) classes += ' calendar-day-sunday'; // 日曜日
        if (dayOfWeek === 6) classes += ' calendar-day-saturday'; // 土曜日

        calendarHTML += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }

    // 次月の最初の数日を表示（カレンダーを埋めるため）
    const totalCells = firstDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6週分（42日）を表示
    if (remainingCells > 0) {
        for (let day = 1; day <= remainingCells && day <= 7; day++) {
            const date = new Date(year, month + 1, day);
            const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日
            let classes = 'calendar-day calendar-day-other';
            if (dayOfWeek === 0) classes += ' calendar-day-sunday'; // 日曜日
            if (dayOfWeek === 6) classes += ' calendar-day-saturday'; // 土曜日
            calendarHTML += `<div class="${classes}">${day}</div>`;
        }
    }

    calendarHTML += '</div>';
    calendarContainer.innerHTML = calendarHTML;

    // カレンダー更新後に右パネルの高さを調整
    setTimeout(() => {
        adjustRightPanelHeight();
    }, 0);

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
    updateTimeline(); // タイムテーブルも更新
}

// 前月に移動
function goToPrevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    selectedDate = null; // 日付選択をリセット
    renderCalendar();
    displayRecords(); // 記録一覧をリセット
    updateTimeline(); // タイムテーブルも更新（今日の記録を表示）
}

// 次月に移動
function goToNextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    selectedDate = null; // 日付選択をリセット
    renderCalendar();
    displayRecords(); // 記録一覧をリセット
    updateTimeline(); // タイムテーブルも更新（今日の記録を表示）
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
        // currentDescriptionと入力欄の値を同期
        if (currentDescription !== '' && descriptionInput.value !== currentDescription) {
            descriptionInput.value = currentDescription;
        }
    }
}

// 直近のタイマー設定（作業内容とタグ選択）を保存
function saveLastTimerSettings() {
    // 作業内容を保存（入力欄の値またはcurrentDescription）
    let descriptionToSave = '';
    if (descriptionInput && descriptionInput.value.trim() !== '') {
        descriptionToSave = descriptionInput.value.trim();
    } else if (currentDescription) {
        descriptionToSave = currentDescription;
    }
    localStorage.setItem(STORAGE_KEY_LAST_DESCRIPTION, descriptionToSave);

    // タグ選択を保存
    localStorage.setItem(STORAGE_KEY_LAST_SELECTED_TAGS, JSON.stringify(selectedTags));
}

// 直近のタイマー設定（作業内容とタグ選択）を復元
function loadLastTimerSettings() {
    // 作業内容を復元
    const savedDescription = localStorage.getItem(STORAGE_KEY_LAST_DESCRIPTION);
    if (savedDescription) {
        currentDescription = savedDescription;
        if (descriptionInput) {
            descriptionInput.value = savedDescription;
        }
    }

    // タグ選択を復元
    const savedTags = localStorage.getItem(STORAGE_KEY_LAST_SELECTED_TAGS);
    if (savedTags) {
        try {
            selectedTags = JSON.parse(savedTags);
            // タグチェックボックスを更新
            updateTagCheckboxes();
        } catch (e) {
            console.error('タグ選択の復元に失敗しました:', e);
            selectedTags = [];
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
    // タグ選択状態を保存
    saveLastTimerSettings();
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

    // 一度にHTMLを生成してから、イベントリスナーを追加
    tagListContainer.innerHTML = tags.map((tag, index) => {
        return `
            <div class="tag-item" data-tag-index="${index}" data-tag-name="${tag.replace(/"/g, '&quot;')}">
                <span class="tag-name">${tag}</span>
                <div class="tag-item-buttons">
                    <button class="btn-edit-tag" data-tag-name="${tag.replace(/"/g, '&quot;')}">編集</button>
                    <button class="btn-delete-tag" data-tag-name="${tag.replace(/"/g, '&quot;')}">削除</button>
                </div>
            </div>
        `;
    }).join('');

    // イベントリスナーを追加
    tagListContainer.querySelectorAll('.btn-edit-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagName = btn.getAttribute('data-tag-name');
            startEditTag(tagName);
        });
    });

    tagListContainer.querySelectorAll('.btn-delete-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagName = btn.getAttribute('data-tag-name');
            handleDeleteTag(tagName);
        });
    });
}

// タグ削除処理
function handleDeleteTag(tagName) {
    if (confirm(`タグ「${tagName}」を削除しますか？\n（既存の記録のタグには影響しません）`)) {
        deleteTag(tagName);
        displayTags();
        updateTagCheckboxes();
    }
}

// タグの編集を開始
function startEditTag(tagName) {
    const tagItem = document.querySelector(`[data-tag-name="${tagName.replace(/"/g, '&quot;')}"]`);
    if (!tagItem) return;

    // data-tag-name属性を保持したまま編集モードに
    tagItem.setAttribute('data-tag-name', tagName.replace(/"/g, '&quot;'));
    tagItem.innerHTML = `
        <input type="text" class="tag-edit-input" value="${tagName.replace(/"/g, '&quot;')}" data-old-tag-name="${tagName.replace(/"/g, '&quot;')}">
        <div class="tag-item-buttons">
            <button class="btn-save-tag" data-old-tag-name="${tagName.replace(/"/g, '&quot;')}">保存</button>
            <button class="btn-cancel-edit-tag" data-old-tag-name="${tagName.replace(/"/g, '&quot;')}">キャンセル</button>
        </div>
    `;

    // イベントリスナーを追加
    const saveBtn = tagItem.querySelector('.btn-save-tag');
    const cancelBtn = tagItem.querySelector('.btn-cancel-edit-tag');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveEditedTag(tagName);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelEditTag(tagName);
        });
    }

    // 入力フィールドにフォーカス
    const input = tagItem.querySelector('.tag-edit-input');
    if (input) {
        input.focus();
        input.select();

        // Enterキーで保存
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEditedTag(tagName);
            }
        });

        // Escapeキーでキャンセル
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelEditTag(tagName);
            }
        });
    }
}

// タグの編集をキャンセル
function cancelEditTag(tagName) {
    displayTags();
}

// タグ名を更新（記録内のタグも更新）
function updateTagName(oldTagName, newTagName) {
    // 新しいタグ名の検証
    const trimmedNewTag = newTagName.trim();
    if (!trimmedNewTag) {
        alert('タグ名を入力してください');
        return false;
    }

    if (trimmedNewTag === oldTagName) {
        // 変更がない場合は何もしない
        return true;
    }

    const tags = loadTags();

    // 新しいタグ名が既に存在するかチェック
    if (tags.includes(trimmedNewTag)) {
        alert('このタグ名は既に登録されています');
        return false;
    }

    // タグリストを更新
    const tagIndex = tags.indexOf(oldTagName);
    if (tagIndex === -1) {
        return false;
    }
    tags[tagIndex] = trimmedNewTag;
    saveTags(tags);

    // すべての記録内のタグを更新
    updateTagInRecords(oldTagName, trimmedNewTag);

    // 選択中のタグも更新
    const selectedIndex = selectedTags.indexOf(oldTagName);
    if (selectedIndex > -1) {
        selectedTags[selectedIndex] = trimmedNewTag;
    }

    return true;
}

// すべての記録内のタグを更新
function updateTagInRecords(oldTagName, newTagName) {
    const records = loadRecords();
    let updated = false;

    records.forEach(record => {
        if (record.tags && Array.isArray(record.tags)) {
            const tagIndex = record.tags.indexOf(oldTagName);
            if (tagIndex > -1) {
                record.tags[tagIndex] = newTagName;
                updated = true;
            }
        }
    });

    if (updated) {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));

        // 記録一覧を更新
        if (selectedDate) {
            displayRecords(selectedDate);
        } else {
            displayRecords();
        }

        // 統計を更新
        updateStatistics();
    }
}

// 編集したタグを保存
function saveEditedTag(oldTagName) {
    // 編集モードの要素を検索（data-tag-name属性またはdata-old-tag-name属性から）
    const tagItems = document.querySelectorAll('[data-tag-name]');
    let tagItem = null;
    const escapedOldTagName = oldTagName.replace(/"/g, '&quot;');

    for (let item of tagItems) {
        const input = item.querySelector('.tag-edit-input');
        if (input) {
            const inputOldTagName = input.getAttribute('data-old-tag-name');
            if (inputOldTagName === escapedOldTagName ||
                inputOldTagName === oldTagName ||
                item.getAttribute('data-tag-name') === escapedOldTagName ||
                item.getAttribute('data-tag-name') === oldTagName) {
                tagItem = item;
                break;
            }
        }
    }

    if (!tagItem) {
        console.error('タグ要素が見つかりません');
        return;
    }

    const input = tagItem.querySelector('.tag-edit-input');
    if (!input) {
        console.error('入力フィールドが見つかりません');
        return;
    }

    const newTagName = input.value.trim();

    if (updateTagName(oldTagName, newTagName)) {
        // 更新成功
        displayTags();
        updateTagCheckboxes();
    } else {
        // 更新失敗（エラーメッセージは updateTagName 内で表示済み）
        // 入力フィールドにフォーカスを戻す
        input.focus();
        input.select();
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
    updateStatistics(); // 統計を更新
}

// 記録削除処理
function handleDeleteRecord(recordId) {
    const records = loadRecords();
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const displayStartTime = formatDateTimeForDisplay(record.startTime);
    const displayEndTime = formatDateTimeForDisplay(record.endTime);
    const description = record.description ? `\n${record.description}` : '';

    if (confirm(`この記録を削除しますか？\n\n${record.date}\n${displayStartTime} - ${displayEndTime}${description}`)) {
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
    updateStatistics(); // 統計を更新
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
    updateStatistics(); // 統計を更新
}

// グローバルスコープに公開（onchange/onclickから呼び出すため）
window.toggleTag = toggleTag;
window.handleDeleteTag = handleDeleteTag;
window.handleDeleteRecord = handleDeleteRecord;
window.startEditRecord = startEditRecord;
window.cancelEditRecord = cancelEditRecord;
window.saveEditedRecord = saveEditedRecord;
window.startEditTag = startEditTag;
window.cancelEditTag = cancelEditTag;
window.saveEditedTag = saveEditedTag;

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

// BGM音量調整のイベントリスナー
if (bgmVolumeSlider) {
    bgmVolumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value, 10);
        if (bgmMuted && volume > 0) {
            // 音量を変更したらミュート解除
            bgmMuted = false;
            localStorage.setItem(STORAGE_KEY_BGM_MUTED, 'false');
            updateBGMMuteButton();
        }
        setBGMVolume(volume);
    });
}

// BGMミュートボタンのイベントリスナー
if (bgmMuteBtn) {
    bgmMuteBtn.addEventListener('click', toggleBGMMute);
}

// ボイス音量調整のイベントリスナー
if (voiceVolumeSlider) {
    voiceVolumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value, 10);
        if (voiceMuted && volume > 0) {
            // 音量を変更したらミュート解除
            voiceMuted = false;
            localStorage.setItem(STORAGE_KEY_VOICE_MUTED, 'false');
            updateVoiceMuteButton();
        }
        setVoiceVolume(volume);
    });
}

// ボイスミュートボタンのイベントリスナー
if (voiceMuteBtn) {
    voiceMuteBtn.addEventListener('click', toggleVoiceMute);
}

// ボイス間隔入力のイベントリスナー
if (voiceIntervalInput) {
    voiceIntervalInput.addEventListener('change', (e) => {
        const seconds = parseInt(e.target.value, 10);
        if (!isNaN(seconds) && seconds >= 1 && seconds <= 300) {
            setVoiceInterval(seconds);
        } else {
            // 無効な値の場合は元の値に戻す
            voiceIntervalInput.value = voiceIntervalSeconds;
        }
    });

    // 入力中はリアルタイムで更新しない（changeイベントのみ）
    voiceIntervalInput.addEventListener('input', (e) => {
        const seconds = parseInt(e.target.value, 10);
        if (isNaN(seconds) || seconds < 1 || seconds > 300) {
            // 無効な値の場合は赤く表示するなどしてもいいが、今回は何もしない
        }
    });
}

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

// 作業内容入力欄の変更イベントリスナー
if (descriptionInput) {
    descriptionInput.addEventListener('input', () => {
        // 入力内容を保存（タイマー実行中でない場合のみ）
        if (!isRunning && elapsedTime === 0) {
            saveLastTimerSettings();
        }
    });
    descriptionInput.addEventListener('change', () => {
        // フォーカスが外れた時も保存（タイマー実行中でない場合のみ）
        if (!isRunning && elapsedTime === 0) {
            saveLastTimerSettings();
        }
    });
}

// 初期表示
timerDisplay.textContent = formatTime(0);
updateTimerColor();
updateDescriptionInput();
loadBGMVolume(); // BGM音量を読み込み
loadVoiceVolume(); // ボイス音量を読み込み
loadVoiceInterval(); // ボイス間隔を読み込み
loadCheerVoiceFiles(); // ボイスファイルリストを読み込み
loadStartVoiceFiles(); // スタートボイスファイルリストを読み込み
loadEndVoiceFiles(); // エンドボイスファイルリストを読み込み
renderCalendar();
displayRecords();
displayTags();
updateTagCheckboxes();
loadLastTimerSettings(); // 直近のタイマー設定を復元（updateTagCheckboxesの後）
updateStatistics(); // 統計を表示
updateTimeline(); // タイムテーブルを表示
adjustRightPanelHeight(); // 右パネルの高さをカレンダーに合わせる

// エクスポート/インポートボタンのイベントリスナー
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

if (exportBtn) {
    exportBtn.addEventListener('click', exportRecords);
}

if (importBtn) {
    importBtn.addEventListener('click', importRecords);
}

if (importFileInput) {
    importFileInput.addEventListener('change', handleImportFile);
}

// 統計期間切り替えプルダウンのイベントリスナー
const statisticsPeriodSelect = document.getElementById('statisticsPeriodSelect');
if (statisticsPeriodSelect) {
    statisticsPeriodSelect.value = statisticsPeriod; // 初期値を設定
    statisticsPeriodSelect.addEventListener('change', (e) => {
        statisticsPeriod = e.target.value;
        updateStatistics();
    });
}

// 統計を更新
function updateStatistics() {
    const statisticsContent = document.getElementById('statisticsContent');
    if (!statisticsContent) return;

    const records = loadRecords();
    if (records.length === 0) {
        statisticsContent.innerHTML = '<div class="statistics-empty">記録がありません</div>';
        return;
    }

    // 期間に応じてフィルタリング
    const filteredRecords = filterRecordsByPeriod(records, statisticsPeriod);

    if (filteredRecords.length === 0) {
        statisticsContent.innerHTML = '<div class="statistics-empty">選択した期間に記録がありません</div>';
        return;
    }

    // 総作業時間を計算（秒まで）
    const totalSeconds = calculateTotalDuration(filteredRecords);

    // タグごとの作業時間を計算
    const tagStatistics = calculateTagStatistics(filteredRecords);

    // 期間情報を取得
    const periodInfo = getPeriodInfo(statisticsPeriod, records, filteredRecords);

    // HTMLを生成（総作業時間とタグ別作業時間を同じコンテナに入れる）
    let html = `<div class="statistics-main">`;

    // 総作業時間
    html += `<div class="statistics-total">
        <div class="statistics-label-row">
            <div class="statistics-label">総作業時間</div>
            <div class="statistics-period-info">${periodInfo}</div>
        </div>
        <div class="statistics-value">${formatDurationWithSeconds(totalSeconds)}</div>
    </div>`;

    // タグ別作業時間
    if (tagStatistics.length > 0) {
        html += '<div class="statistics-tags-title">タグ別作業時間</div>';
        html += '<div class="statistics-tags">';

        // 作業時間が多い順にソート
        tagStatistics.sort((a, b) => b.totalSeconds - a.totalSeconds);

        // 最大値を取得（グラフの100%とする）
        const maxSeconds = tagStatistics[0].totalSeconds;

        tagStatistics.forEach(tag => {
            // 最大値に対する割合を計算（%）
            const percentage = maxSeconds > 0 ? (tag.totalSeconds / maxSeconds) * 100 : 0;

            html += `
                <div class="statistics-tag-item">
                    <div class="statistics-tag-name">${tag.tag}</div>
                    <div class="statistics-tag-bar-container">
                        <div class="statistics-tag-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="statistics-tag-value">${formatDurationWithSeconds(tag.totalSeconds)}</div>
                </div>
            `;
        });

        html += '</div>';
    }

    html += '</div>'; // statistics-mainの閉じタグ

    statisticsContent.innerHTML = html;

    // タイムテーブルを独立して更新
    updateTimeline();
}

// タイムテーブルを更新（選択中の日付または今日の記録を表示）
function updateTimeline() {
    const timelineSection = document.getElementById('timelineSection');
    if (!timelineSection) return;

    // 選択中の日付があればそれを使い、なければ今日の日付を使う
    const targetDate = selectedDate || formatDate(new Date());
    const html = generateTimeline(targetDate);
    timelineSection.innerHTML = html;

    // タイムテーブルのズーム機能を設定
    setupTimelineZoom();
}

// タイムテーブルを生成（指定された日付の記録を表示）
function generateTimeline(targetDateStr) {
    const records = loadRecords();
    const dateRecords = records.filter(record => record.date === targetDateStr);

    if (dateRecords.length === 0) {
        return '<h2 class="timeline-title">タイムライン</h2><p class="no-records">記録がありません</p>';
    }

    // 作業記録を開始時刻でソート
    dateRecords.sort((a, b) => {
        const aTime = parseTime(a.startTime);
        const bTime = parseTime(b.startTime);
        return aTime - bTime;
    });

    let html = '<h2 class="timeline-title">タイムライン</h2>';
    html += '<div class="timeline-container">';
    html += '<div class="timeline-container-scroll">';
    html += '<div class="timeline-background"></div>';
    html += '<div class="timeline-hours">';

    // 0時から24時までの時間表示（3時間ごと）
    for (let hour = 0; hour <= 24; hour += 3) {
        const hourPercent = (hour / 24) * 100;
        html += `<div class="timeline-hour" data-hour-percent="${hourPercent}" style="left: ${hourPercent}%">${hour}時</div>`;
    }

    html += '</div>';
    html += '<div class="timeline-bar-shadows"></div>';
    html += '<div class="timeline-bars">';

    // 重なりを検出して縦に配置
    const lanes = [];
    dateRecords.forEach(record => {
        const startTime = parseTime(record.startTime);
        const endTime = parseTime(record.endTime);

        // 開始時刻と終了時刻を0-24時での位置（%）に変換
        const left = (startTime / (24 * 60 * 60)) * 100;
        const width = ((endTime - startTime) / (24 * 60 * 60)) * 100;

        // 重なっていないレーンを見つける
        let laneIndex = 0;
        while (laneIndex < lanes.length) {
            const hasOverlap = lanes[laneIndex].some(existing => {
                const existingLeft = parseTime(existing.startTime) / (24 * 60 * 60) * 100;
                const existingWidth = (parseTime(existing.endTime) - parseTime(existing.startTime)) / (24 * 60 * 60) * 100;
                const existingRight = existingLeft + existingWidth;
                const currentRight = left + width;

                // 重なりをチェック
                return !(currentRight <= existingLeft || left >= existingRight);
            });

            if (!hasOverlap) {
                break;
            }
            laneIndex++;
        }

        // 必要に応じて新しいレーンを作成
        if (laneIndex >= lanes.length) {
            lanes.push([]);
        }

        lanes[laneIndex].push({
            ...record,
            laneIndex: laneIndex
        });
    });

    // 影専用レイヤーのHTMLを生成
    let shadowsHtml = '';

    // 各レーンに配置された帯を描画（影も同時に生成）
    lanes.forEach((lane, laneIdx) => {
        lane.forEach(record => {
            const startTime = parseTime(record.startTime);
            const endTime = parseTime(record.endTime);

            // 開始時刻と終了時刻を0-24時での位置（%）に変換
            const left = (startTime / (24 * 60 * 60)) * 100;
            const width = ((endTime - startTime) / (24 * 60 * 60)) * 100;

            // 全てのイベントを削除ボタンと同じ色に
            const tagColor = '#f07282';

            // 作業内容があればツールチップに表示
            const tooltip = record.description ?
                `${record.startTime} - ${record.endTime}\n${record.description}` :
                `${record.startTime} - ${record.endTime}`;

            // レーンごとに縦位置を調整
            const topOffset = 5 + record.laneIndex * 35;

            // 影要素を生成
            shadowsHtml += `
                <div class="timeline-bar-shadow" 
                     data-left-percent="${left}"
                     data-width-percent="${width}"
                     data-top="${topOffset}"
                     style="left: ${left}%; width: ${width}%; top: ${topOffset}px;"></div>
            `;

            // 実際のイベント要素を生成
            html += `
                <div class="timeline-bar" 
                     data-left-percent="${left}"
                     data-width-percent="${width}"
                     style="left: ${left}%; width: ${width}%; background-color: ${tagColor}; top: ${topOffset}px;"
                     title="${tooltip.replace(/\n/g, ' / ')}">
                    <div class="timeline-bar-label">${formatDurationWithSeconds((record.duration || 0) * 60 + (record.durationSeconds || 0))}</div>
                </div>
            `;
        });
    });

    html += '</div>';
    // 影レイヤーに影要素を挿入
    html = html.replace('<div class="timeline-bar-shadows"></div>', `<div class="timeline-bar-shadows">${shadowsHtml}</div>`);
    html += '</div>';
    html += '</div>';

    return html;
}

// タイムテーブルのズーム機能を設定
function setupTimelineZoom() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    const timelineScrollWrapper = timelineContainer.querySelector('.timeline-container-scroll');
    const timelineContent = timelineContainer.querySelector('.timeline-bars');
    const timelineShadows = timelineContainer.querySelector('.timeline-bar-shadows');
    const timelineHours = timelineContainer.querySelector('.timeline-hours');
    if (!timelineScrollWrapper || !timelineContent || !timelineHours) return;

    // 初期ズームレベルを適用（少し遅延させて、レイアウトが確定してから実行）
    // これにより、正しい幅を取得できる
    setTimeout(() => {
        applyTimelineZoom(timelineScrollWrapper, timelineContent, timelineShadows, timelineHours, timelineZoomLevel);
    }, 10);

    // ドラッグでスクロールする機能
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;

    timelineContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartScrollLeft = timelineScrollWrapper.scrollLeft;
        timelineContainer.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartX;
        timelineScrollWrapper.scrollLeft = dragStartScrollLeft - deltaX;
        e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            timelineContainer.style.cursor = 'grab';
        }
    });

    // マウスがタイムテーブルから離れた場合もドラッグを終了
    timelineContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            timelineContainer.style.cursor = 'grab';
        }
    });

    // マウスホイールイベントでズーム（タイムテーブル内のみ）
    timelineContainer.addEventListener('wheel', (e) => {
        // ドラッグ中はズームしない
        if (isDragging) {
            return;
        }
        // タイムテーブルコンテナ内でのみ処理（子要素からのイベントも含む）
        // イベントの伝播を防ぐ（統計セクションなどの親要素への伝播を防止）
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY;

        // ズームレベルに応じてステップを動的に調整（高いズーム率ほど感度を上げる）
        let dynamicStep = TIMELINE_ZOOM_STEP;
        if (timelineZoomLevel >= 3.5) {
            dynamicStep = 0.2; // 非常に高いズーム率の時
        } else if (timelineZoomLevel >= 2.5) {
            dynamicStep = 0.15; // 高いズーム率の時
        } else if (timelineZoomLevel >= 1.5) {
            dynamicStep = 0.12; // 中程度のズーム率の時
        } else if (timelineZoomLevel >= 1.0) {
            dynamicStep = 0.08; // 低いズーム率の時
        } else {
            dynamicStep = 0.05; // 最小ズーム率の時
        }

        const zoomChange = delta > 0 ? -dynamicStep : dynamicStep;
        const oldZoomLevel = timelineZoomLevel;
        const newZoomLevel = Math.max(TIMELINE_MIN_ZOOM, Math.min(TIMELINE_MAX_ZOOM, timelineZoomLevel + zoomChange));

        // ズームレベルが変わらない場合は何もしない
        if (oldZoomLevel === newZoomLevel) {
            return;
        }

        // マウスの位置を基準にズーム
        const rect = timelineScrollWrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scrollLeft = timelineScrollWrapper.scrollLeft;
        const containerWidth = rect.width;

        // ズーム前のコンテンツ内でのマウスの絶対位置を計算
        // これは、コンテンツの左端からマウスの位置までの距離
        const contentPositionBeforeZoom = scrollLeft + mouseX;

        // ズームレベルを更新
        timelineZoomLevel = newZoomLevel;
        const shadowsElement = timelineScrollWrapper.querySelector('.timeline-bar-shadows');
        applyTimelineZoom(timelineScrollWrapper, timelineContent, shadowsElement, timelineHours, timelineZoomLevel, containerWidth);

        // ズーム後のコンテンツ幅
        const newContentWidth = containerWidth * timelineZoomLevel;

        // ズーム後、同じコンテンツ内の位置がマウスの下に来るようにスクロール位置を計算
        // ズーム前の位置をズーム比率でスケールした後、マウスの位置を引く
        const zoomRatio = newZoomLevel / oldZoomLevel;
        const contentPositionAfterZoom = contentPositionBeforeZoom * zoomRatio;
        const newScrollLeft = contentPositionAfterZoom - mouseX;

        // スクロール位置を調整（範囲内に制限）
        timelineScrollWrapper.scrollLeft = Math.max(0, Math.min(newScrollLeft, newContentWidth - containerWidth));
    }, { passive: false });
}

// タイムテーブルにズームを適用
function applyTimelineZoom(scrollWrapperElement, contentElement, shadowsElement, hoursElement, zoomLevel, baseWidth = null) {
    if (!contentElement || !hoursElement || !scrollWrapperElement) return;

    // スクロールラッパーの実際の幅を取得
    if (!baseWidth) {
        const scrollRect = scrollWrapperElement.getBoundingClientRect();
        baseWidth = scrollRect.width;
    }

    const scaledWidth = baseWidth * zoomLevel;

    // 背景要素も取得して幅を調整
    const backgroundElement = scrollWrapperElement.querySelector('.timeline-background');
    if (backgroundElement) {
        backgroundElement.style.width = `${scaledWidth}px`;
        // min-widthをスクロールラッパーの幅に合わせる
        backgroundElement.style.minWidth = `${baseWidth}px`;
    }

    // コンテンツの幅を変更（スクロール可能にするため）
    // ただし、コンテナの見た目のサイズは変わらない（overflow-x: auto でスクロール）
    // widthを直接設定することで、親要素のサイズに影響を与えない
    contentElement.style.width = `${scaledWidth}px`;
    hoursElement.style.width = `${scaledWidth}px`;
    if (shadowsElement) {
        shadowsElement.style.width = `${scaledWidth}px`;
        // min-widthをスクロールラッパーの幅に合わせる
        shadowsElement.style.minWidth = `${baseWidth}px`;
    }

    // transformは使わない（フォントの縦長化を防ぐ）
    contentElement.style.transform = 'none';
    hoursElement.style.transform = 'none';

    // 各時間表示の位置を再計算（パーセンテージからpxに変換）
    const hourElements = hoursElement.querySelectorAll('.timeline-hour');
    hourElements.forEach(hourEl => {
        const hourPercent = parseFloat(hourEl.getAttribute('data-hour-percent'));
        hourEl.style.left = `${(hourPercent / 100) * scaledWidth}px`;
    });

    // 各帯の位置と幅を再計算（パーセンテージからpxに変換）
    const barElements = contentElement.querySelectorAll('.timeline-bar');
    barElements.forEach(barEl => {
        const leftPercent = parseFloat(barEl.getAttribute('data-left-percent'));
        const widthPercent = parseFloat(barEl.getAttribute('data-width-percent'));
        barEl.style.left = `${(leftPercent / 100) * scaledWidth}px`;
        barEl.style.width = `${(widthPercent / 100) * scaledWidth}px`;
    });

    // 各影要素の位置と幅を再計算（パーセンテージからpxに変換）
    if (shadowsElement) {
        const shadowElements = shadowsElement.querySelectorAll('.timeline-bar-shadow');
        shadowElements.forEach(shadowEl => {
            const leftPercent = parseFloat(shadowEl.getAttribute('data-left-percent'));
            const widthPercent = parseFloat(shadowEl.getAttribute('data-width-percent'));
            const top = shadowEl.getAttribute('data-top') || '0';
            shadowEl.style.left = `${(leftPercent / 100) * scaledWidth}px`;
            shadowEl.style.width = `${(widthPercent / 100) * scaledWidth}px`;
            shadowEl.style.top = `${top}px`;
        });
    }
}

// 時刻文字列（HH:MM:SS または HH:MM）を秒数に変換
function parseTime(timeStr) {
    if (!timeStr) return 0;

    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;

    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parts.length > 2 ? (parseInt(parts[2], 10) || 0) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

// タグの色を取得（同じタグには同じ色を返す）
function getTagColor(tag) {
    // タグのハッシュ値を使って色を決定
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 色相を決定（0-360度）
    const hue = Math.abs(hash) % 360;

    // HSLからRGBに変換（彩度と明度は固定）
    const saturation = 70;
    const lightness = 60;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// 期間情報を取得（表示用の文字列を返す）
function getPeriodInfo(period, allRecords, filteredRecords) {
    if (filteredRecords.length === 0) {
        return '';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
        case 'all':
            return '全期間';
        case 'month': {
            // 今月の1日
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            // 今月の最終日（次月の1日の前日）
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const year1 = firstDayOfMonth.getFullYear();
            const month1 = firstDayOfMonth.getMonth() + 1;
            const day1 = firstDayOfMonth.getDate();
            const year2 = lastDayOfMonth.getFullYear();
            const month2 = lastDayOfMonth.getMonth() + 1;
            const day2 = lastDayOfMonth.getDate();
            return `${year1}年${month1}月${day1}日～${year2}年${month2}月${day2}日`;
        }
        case 'week': {
            // 本日を含む週の日曜日を計算
            const sunday = new Date(now);
            const dayOfWeek = now.getDay(); // 0 = 日曜日, 1 = 月曜日, ...
            sunday.setDate(now.getDate() - dayOfWeek);
            sunday.setHours(0, 0, 0, 0);
            // 本日を含む週の土曜日を計算
            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);
            saturday.setHours(0, 0, 0, 0);
            const year1 = sunday.getFullYear();
            const month1 = sunday.getMonth() + 1;
            const day1 = sunday.getDate();
            const year2 = saturday.getFullYear();
            const month2 = saturday.getMonth() + 1;
            const day2 = saturday.getDate();
            return `${year1}年${month1}月${day1}日～${year2}年${month2}月${day2}日`;
        }
        case 'day': {
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            return `${year}年${month}月${day}日`;
        }
        default:
            return '';
    }
}

function filterRecordsByPeriod(records, period) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
        case 'week': {
            // 本日を含む週の日曜日を計算
            const sunday = new Date(now);
            const dayOfWeek = now.getDay(); // 0 = 日曜日, 1 = 月曜日, ...
            sunday.setDate(now.getDate() - dayOfWeek);
            sunday.setHours(0, 0, 0, 0);
            // 本日を含む週の土曜日を計算
            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);
            saturday.setHours(0, 0, 0, 0);

            return records.filter(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate >= sunday && recordDate <= saturday;
            });
        }
        case 'month': {
            // 今月の1日
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0);
            // 今月の最終日（次月の1日の前日）
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            lastDayOfMonth.setHours(0, 0, 0, 0);

            return records.filter(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate >= firstDayOfMonth && recordDate <= lastDayOfMonth;
            });
        }
        case 'day': {
            // 今日の記録をフィルタリング
            return records.filter(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() === now.getTime();
            });
        }
        case 'all':
        default:
            return records;
    }
}

// 記録の総作業時間を計算（秒まで）
function calculateTotalDuration(records) {
    let totalSeconds = 0;

    records.forEach(record => {
        // durationMinutes と durationSeconds から計算
        const minutes = record.duration || 0;
        const seconds = record.durationSeconds || 0;
        totalSeconds += minutes * 60 + seconds;
    });

    return totalSeconds;
}

// タグごとの作業時間を計算
function calculateTagStatistics(records) {
    const tagMap = new Map();

    records.forEach(record => {
        const minutes = record.duration || 0;
        const seconds = record.durationSeconds || 0;
        const totalSecondsForRecord = minutes * 60 + seconds;

        // タグがない場合はスキップ
        if (!record.tags || record.tags.length === 0) {
            return;
        }

        // 各タグに作業時間を配分（複数タグの場合は均等に分割）
        const secondsPerTag = totalSecondsForRecord / record.tags.length;

        record.tags.forEach(tag => {
            if (tagMap.has(tag)) {
                tagMap.set(tag, tagMap.get(tag) + secondsPerTag);
            } else {
                tagMap.set(tag, secondsPerTag);
            }
        });
    });

    // Mapを配列に変換
    return Array.from(tagMap.entries()).map(([tag, totalSeconds]) => ({
        tag,
        totalSeconds: Math.round(totalSeconds) // 秒を整数に丸める
    }));
}

// 全ユーザーデータをエクスポート
function exportRecords() {
    const records = loadRecords();
    const tags = loadTags();

    // 全ての設定データを取得
    const settings = {
        volume: localStorage.getItem(STORAGE_KEY_VOLUME) || '50',
        voiceVolume: localStorage.getItem(STORAGE_KEY_VOICE_VOLUME) || '50',
        voiceInterval: localStorage.getItem(STORAGE_KEY_VOICE_INTERVAL) || '15',
        bgmMuted: localStorage.getItem(STORAGE_KEY_BGM_MUTED) || 'false',
        voiceMuted: localStorage.getItem(STORAGE_KEY_VOICE_MUTED) || 'false'
    };

    const exportData = {
        version: '1.1',
        exportDate: new Date().toISOString(),
        records: records,
        tags: tags,
        settings: settings
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    const filename = `work-timer-data-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`全データをエクスポートしました。\n記録数: ${records.length}件\nタグ数: ${tags.length}個\n設定も含まれています`);
}

// 作業記録をインポート
function importRecords() {
    const importFileInput = document.getElementById('importFileInput');
    if (!importFileInput) return;

    importFileInput.click();
}

// ファイルが選択されたときの処理
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importData = JSON.parse(e.target.result);

            // データ形式の検証
            if (!importData.records || !Array.isArray(importData.records)) {
                alert('インポートファイルの形式が正しくありません。\nrecordsプロパティが見つかりません。');
                return;
            }

            const existingRecords = loadRecords();
            const existingTags = loadTags();

            // 記録をマージ（IDで重複チェック）
            const existingIds = new Set(existingRecords.map(r => r.id));
            const newRecords = importData.records.filter(r => !existingIds.has(r.id));
            const mergedRecords = [...existingRecords, ...newRecords];

            // タグをマージ（重複を避ける）
            const newTags = importData.tags || [];
            const mergedTags = [...new Set([...existingTags, ...newTags])];

            // 設定データを取得（旧バージョン対応）
            const settings = importData.settings || {};
            const hasSettings = Object.keys(settings).length > 0;

            // 確認ダイアログ
            let message = `インポートしますか？\n\n新規記録: ${newRecords.length}件\n既存記録: ${existingRecords.length}件\n合計: ${mergedRecords.length}件\n\n新規タグ: ${mergedTags.length - existingTags.length}個\n既存タグ: ${existingTags.length}個\n合計: ${mergedTags.length}個`;
            if (hasSettings) {
                message += `\n\n設定データもインポートされます`;
            }

            if (confirm(message)) {
                // ローカルストレージに保存
                localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(mergedRecords));
                localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(mergedTags));

                // 設定データを復元（存在する場合）
                if (hasSettings) {
                    if (settings.volume !== undefined) {
                        localStorage.setItem(STORAGE_KEY_VOLUME, settings.volume);
                    }
                    if (settings.voiceVolume !== undefined) {
                        localStorage.setItem(STORAGE_KEY_VOICE_VOLUME, settings.voiceVolume);
                    }
                    if (settings.voiceInterval !== undefined) {
                        localStorage.setItem(STORAGE_KEY_VOICE_INTERVAL, settings.voiceInterval);
                    }
                    if (settings.bgmMuted !== undefined) {
                        localStorage.setItem(STORAGE_KEY_BGM_MUTED, settings.bgmMuted);
                    }
                    if (settings.voiceMuted !== undefined) {
                        localStorage.setItem(STORAGE_KEY_VOICE_MUTED, settings.voiceMuted);
                    }

                    // 設定を再読み込みしてUIに反映
                    loadBGMVolume();
                    loadVoiceVolume();
                    loadVoiceInterval();
                }

                // UIを更新
                if (selectedDate) {
                    displayRecords(selectedDate);
                } else {
                    displayRecords();
                }
                renderCalendar();
                displayTags();
                updateTagCheckboxes();
                updateStatistics();

                let successMessage = `インポートが完了しました。\n新規追加された記録: ${newRecords.length}件`;
                if (hasSettings) {
                    successMessage += `\n設定も復元されました`;
                }
                alert(successMessage);
            }
        } catch (error) {
            console.error('インポートエラー:', error);
            alert('ファイルの読み込みに失敗しました。\nJSON形式が正しくない可能性があります。\n\nエラー: ' + error.message);
        }

        // ファイル入力の値をリセット（同じファイルを再度選択できるように）
        event.target.value = '';
    };

    reader.onerror = function () {
        alert('ファイルの読み込みに失敗しました。');
        event.target.value = '';
    };

    reader.readAsText(file);
}

// Skyboxの初期化
function initSkybox() {
    const canvas = document.getElementById('skyboxCanvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Three.jsのシーン、カメラ、レンダラーを作成
    const scene = new THREE.Scene();

    // コンテナのサイズを取得
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // 透明な背景

    // テスト用の背景色は削除（正常表示確認のため）
    // canvas.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

    console.log('Skybox initializing...');
    console.log('Canvas size:', width, height);
    console.log('Container:', container);

    // カメラを中心に配置（最初に設定）
    camera.position.set(0, 0, 0);
    // カメラを10度上に向ける
    camera.rotation.x = 10 * Math.PI / 180;

    // エクイレクタングラー形式のテクスチャを読み込む
    const loader = new THREE.TextureLoader();
    const imagePath = 'image/M3_Photoreal_equirectangular-jpg_wide_open_plaza_in_847306475_455207.jpg';
    console.log('Loading texture from:', imagePath);

    let sphereMesh = null;

    const texture = loader.load(
        imagePath,
        (loadedTexture) => {
            console.log('Skybox texture loaded successfully');
            console.log('Texture size:', loadedTexture.image.width, loadedTexture.image.height);

            // テクスチャの設定（エクイレクタングラー形式用）
            // エクイレクタングラー形式の向きを調整（上下が逆なのでtrueに）
            loadedTexture.flipY = true;  // 上下を修正
            // エクイレクタングラー形式は繰り返し不要
            loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
            loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
            // テクスチャの更新が必要
            loadedTexture.needsUpdate = true;

            // テクスチャ読み込み完了後、球体を作成
            // 球体のサイズを大きくして、確実にカメラの視野内に収まるようにする
            const geometry = new THREE.SphereGeometry(1000, 64, 32);
            // 球体を内側から見るように裏返す
            geometry.scale(-1, 1, 1);

            // エクイレクタングラー形式は通常のUVマッピングで正しく表示される
            // DoubleSideで両面表示にして、内側から見えるようにする
            const material = new THREE.MeshBasicMaterial({
                map: loadedTexture,
                side: THREE.DoubleSide,  // BackSideからDoubleSideに変更
                fog: false,
                transparent: false
            });

            sphereMesh = new THREE.Mesh(geometry, material);
            scene.add(sphereMesh);

            console.log('Sphere mesh created');
            console.log('Material map:', material.map);
            console.log('Texture:', loadedTexture);
            console.log('Texture image:', loadedTexture.image);

            // マテリアルの設定を確認
            console.log('Material side:', material.side);
            console.log('Material map exists:', !!material.map);

            // テスト：テクスチャが正しく適用されているか確認
            // テクスチャなしの単色マテリアルと比較
            // const debugGeometry = new THREE.SphereGeometry(1000, 64, 32);
            // debugGeometry.scale(-1, 1, 1);
            // const debugMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.BackSide });
            // const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);
            // debugSphere.position.x = 10; // 少しずらして確認
            // scene.add(debugSphere);

            // カメラを中心に配置（すでに設定済み）
            // カメラの向きを確認（デフォルトで(0,0,-1)方向を見ている）
            // lookAtは必要ない（カメラは既に正しい方向を向いている）

            console.log('Skybox sphere created and added to scene');
            console.log('Scene children count:', scene.children.length);
            console.log('Camera position:', camera.position);
            console.log('Camera rotation:', camera.rotation);
            console.log('Sphere radius: 1000');

            // レンダリングを即座に実行
            renderer.render(scene, camera);

            // デバッグ：canvasが実際に描画されているか確認
            console.log('Canvas rendered');
            console.log('Canvas width/height:', canvas.width, canvas.height);
            const renderSize = new THREE.Vector2();
            renderer.getSize(renderSize);
            console.log('Renderer size:', renderSize.x, renderSize.y);
        },
        (progress) => {
            if (progress && progress.total) {
                const percent = (progress.loaded / progress.total) * 100;
                console.log('Skybox texture loading progress:', percent.toFixed(0) + '%');
            }
        },
        (error) => {
            console.error('Skybox texture loading failed:', error);
            console.error('Failed to load image:', imagePath);
        }
    );

    // リサイズ処理
    function handleResize() {
        const container = canvas.parentElement;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    // 初回リサイズ
    handleResize();

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);

        // skyboxをゆっくり右に回転（Y軸周り）- タイマー実行中のみ
        if (sphereMesh && isRunning) {
            sphereMesh.rotation.y += 0.0001; // 回転速度（調整可能）
        }

        renderer.render(scene, camera);
    }

    animate();
}

// 右パネルの高さをカレンダーの高さに合わせる
function adjustRightPanelHeight() {
    const centerPanel = document.querySelector('.center-panel');
    const rightPanel = document.querySelector('.right-panel');

    if (centerPanel && rightPanel) {
        // カレンダーの高さを取得
        const calendarHeight = centerPanel.offsetHeight;
        // 右パネルの高さをカレンダーに合わせる
        rightPanel.style.maxHeight = `${calendarHeight}px`;
    }
}

// リサイズやカレンダー更新時に高さを再調整
window.addEventListener('resize', adjustRightPanelHeight);

// ページ読み込み時にskyboxを初期化
function initSkyboxOnLoad() {
    // 少し遅延させて、コンテナのサイズが確定してから初期化
    setTimeout(() => {
        initSkybox();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkyboxOnLoad);
} else {
    initSkyboxOnLoad();
}

// ずんだもん画像のドラッグ機能
function initZundaDraggable() {
    const zundaImage = document.getElementById('zundaImage');
    if (!zundaImage) return;

    // デフォルトのドラッグ動作を無効化
    zundaImage.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });

    // ローカルストレージから位置を復元
    const savedPosition = localStorage.getItem(STORAGE_KEY_ZUNDA_POSITION);
    if (savedPosition) {
        try {
            const pos = JSON.parse(savedPosition);
            zundaImage.style.bottom = 'auto';
            zundaImage.style.right = 'auto';
            zundaImage.style.top = pos.top + 'px';
            zundaImage.style.left = pos.left + 'px';
            // 位置復元後に画像の向きを更新（初期化時はアニメーションなし）
            setTimeout(() => {
                updateZundaDirection(false);
            }, 0);
        } catch (e) {
            console.warn('位置情報の復元に失敗しました:', e);
        }
    }

    let isDragging = false;
    let startX;
    let startY;
    let initialX;
    let initialY;
    let lastDirection = null; // 最後の向き（'left' または 'right'）

    // 現在の位置を取得
    function getCurrentPosition() {
        const rect = zundaImage.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top
        };
    }

    // 初期位置を設定（保存された位置がない場合）
    if (!savedPosition) {
        const rect = zundaImage.getBoundingClientRect();
        initialX = window.innerWidth - rect.width - 20;
        initialY = window.innerHeight - rect.height - 20;
    } else {
        try {
            const pos = JSON.parse(savedPosition);
            initialX = pos.left;
            initialY = pos.top;
        } catch (e) {
            const rect = zundaImage.getBoundingClientRect();
            initialX = window.innerWidth - rect.width - 20;
            initialY = window.innerHeight - rect.height - 20;
        }
    }

    // 初期方向を設定
    const rect = zundaImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const screenCenter = window.innerWidth / 2;
    lastDirection = centerX < screenCenter ? 'left' : 'right';

    // マウスダウン
    zundaImage.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // 左クリックのみ
        e.preventDefault();
        e.stopPropagation();

        const pos = getCurrentPosition();
        startX = e.clientX;
        startY = e.clientY;
        initialX = pos.left;
        initialY = pos.top;

        isDragging = true;
        zundaImage.style.cursor = 'grabbing';
    });

    // マウス移動
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newX = initialX + deltaX;
        let newY = initialY + deltaY;

        // 画面外に出ないように制限
        const maxX = window.innerWidth - zundaImage.offsetWidth;
        const maxY = window.innerHeight - zundaImage.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        zundaImage.style.bottom = 'auto';
        zundaImage.style.right = 'auto';
        zundaImage.style.top = newY + 'px';
        zundaImage.style.left = newX + 'px';

        // 画像の向きを更新（ドラッグ中はアニメーションあり）
        updateZundaDirection(true);
    });

    // マウスアップ
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            zundaImage.style.cursor = 'move';

            // 現在の位置を更新
            const pos = getCurrentPosition();
            initialX = pos.left;
            initialY = pos.top;

            // 位置をローカルストレージに保存
            savePosition();

            // 画像の向きを更新（ドラッグ終了時はアニメーションなし）
            updateZundaDirection(false);
        }
    });

    // タッチイベント対応
    zundaImage.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        const pos = getCurrentPosition();
        startX = touch.clientX;
        startY = touch.clientY;
        initialX = pos.left;
        initialY = pos.top;

        isDragging = true;
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        let newX = initialX + deltaX;
        let newY = initialY + deltaY;

        // 画面外に出ないように制限
        const maxX = window.innerWidth - zundaImage.offsetWidth;
        const maxY = window.innerHeight - zundaImage.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        zundaImage.style.bottom = 'auto';
        zundaImage.style.right = 'auto';
        zundaImage.style.top = newY + 'px';
        zundaImage.style.left = newX + 'px';

        // 画像の向きを更新（ドラッグ中はアニメーションあり）
        updateZundaDirection(true);
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;

            // 現在の位置を更新
            const pos = getCurrentPosition();
            initialX = pos.left;
            initialY = pos.top;

            // 位置をローカルストレージに保存
            savePosition();

            // 画像の向きを更新（ドラッグ終了時はアニメーションなし）
            updateZundaDirection(false);
        }
    });

    // 位置を保存
    function savePosition() {
        const pos = getCurrentPosition();
        const position = {
            top: pos.top,
            left: pos.left
        };
        localStorage.setItem(STORAGE_KEY_ZUNDA_POSITION, JSON.stringify(position));
    }

    // リサイズ時に位置を調整
    window.addEventListener('resize', () => {
        const pos = getCurrentPosition();
        const maxX = window.innerWidth - zundaImage.offsetWidth;
        const maxY = window.innerHeight - zundaImage.offsetHeight;

        if (pos.left > maxX || pos.top > maxY) {
            const newX = Math.min(pos.left, maxX);
            const newY = Math.min(pos.top, maxY);
            zundaImage.style.top = newY + 'px';
            zundaImage.style.left = newX + 'px';
            savePosition();
        }

        // リサイズ時に画像の向きを更新（アニメーションなし）
        updateZundaDirection(false);
    });
}

// ページ読み込み時にずんだもんのドラッグ機能を初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initZundaDraggable();
        updateZundaGrayscale(); // 初期状態のグレースケールを設定
        updateZundaDirection(false); // 初期状態の向きを設定（アニメーションなし）
        updateZundaVisibility(); // 初期状態のずんだもんの表示/非表示を設定
    });
} else {
    initZundaDraggable();
    updateZundaGrayscale(); // 初期状態のグレースケールを設定
    updateZundaDirection(); // 初期状態の向きを設定
    updateZundaVisibility(); // 初期状態のずんだもんの表示/非表示を設定
}
