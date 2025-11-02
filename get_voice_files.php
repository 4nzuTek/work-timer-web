<?php
header('Content-Type: application/json; charset=utf-8');

$requestedType = isset($_GET['type']) ? $_GET['type'] : 'cheer';

if ($requestedType === 'start') {
    // スタートボイスフォルダ
    $voiceDir = 'voice/start_voice/';
} else if ($requestedType === 'end') {
    // エンドボイスフォルダ
    $voiceDir = 'voice/end_voice/';
} else {
    // 応援ボイスフォルダ（デフォルト）
    $voiceDir = 'voice/cheer_voice/';
}

$files = [];

if (is_dir($voiceDir)) {
    $items = scandir($voiceDir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $voiceDir . $item;
        if (is_file($path)) {
            // 音声ファイルの拡張子をチェック
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (in_array($ext, ['wav', 'mp3', 'ogg', 'm4a', 'aac'])) {
                $files[] = $path;
            }
        }
    }
    
    // ファイル名でソート
    sort($files);
}

echo json_encode($files, JSON_UNESCAPED_UNICODE);
?>

