<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = getCurrentUser($db);
if (!$user) {
    sendResponse(['error' => 'Authentication required'], 401);
}

$data = json_decode(file_get_contents('php://input'), true);
$prompt = trim($data['prompt'] ?? '');

if (!$prompt) {
    sendResponse(['error' => 'Prompt is required'], 422);
}

// Build a simple conversation context
$system = "You are the Spaarow Hub oracle. Provide short, friendly, mystical advice based on the user's question. Keep responses concise and kind.";

$responseText = '';

if (LLM_PROVIDER === 'openrouter') {
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    $payload = [
        'model' => LLM_MODEL,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $prompt]
        ],
        'temperature' => 0.8,
        'max_tokens' => 250
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . LLM_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        sendResponse(['error' => 'LLM request failed', 'details' => $err], 500);
    }

    $data = json_decode($response, true);
    if (isset($data['error'])) {
        sendResponse(['error' => 'LLM error', 'details' => $data['error']], 500);
    }

    $responseText = $data['choices'][0]['message']['content'] ?? '';

} elseif (LLM_PROVIDER === 'ollama') {
    // Ollama local inference API (https://ollama.com/docs/api)
    $host = OLLAMA_HOST;
    $port = OLLAMA_PORT;
    $model = LLM_MODEL ?: 'llama2';
    $url = "http://{$host}:{$port}/v1/chat/completions";

    $payload = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $prompt]
        ],
        'temperature' => 0.8,
        'max_tokens' => 250
    ];

    $headers = ['Content-Type: application/json'];
    if (!empty(OLLAMA_API_KEY)) {
        $headers[] = 'Authorization: Bearer ' . OLLAMA_API_KEY;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        sendResponse(['error' => 'LLM request failed', 'details' => $err], 500);
    }

    $data = json_decode($response, true);
    if (isset($data['error'])) {
        sendResponse(['error' => 'LLM error', 'details' => $data['error']], 500);
    }

    $responseText = $data['choices'][0]['message']['content'] ?? '';

} else {
    // Default to Hugging Face inference API
    $model = LLM_MODEL ?: 'gpt2';
    $url = "https://api-inference.huggingface.co/models/{$model}";

    $payload = [
        'inputs' => "${system}\n\nUser: ${prompt}\nOracle:",
        'parameters' => [
            'max_new_tokens' => 250,
            'temperature' => 0.8,
            'top_p' => 0.9
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . LLM_API_KEY
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        sendResponse(['error' => 'LLM request failed', 'details' => $err], 500);
    }

    $data = json_decode($response, true);
    if (isset($data['error'])) {
        sendResponse(['error' => 'LLM error', 'details' => $data['error']], 500);
    }

    // HuggingFace returns an array of outputs
    if (is_array($data) && isset($data[0]['generated_text'])) {
        $responseText = $data[0]['generated_text'];
    } else {
        $responseText = json_encode($data);
    }
}

sendResponse(['response' => trim($responseText)]);