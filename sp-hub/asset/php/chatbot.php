<?php
require __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php'; 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = getCurrentUser($db);
if (!$user) {
    sendResponse(['error' => 'Authentication required'], 401);
}

$data = json_decode(file_get_contents('php://input'), true);
$prompt = trim($data['prompt'] ?? '');
$context = $data['context'] ?? [];

if (!$prompt) {
    sendResponse(['error' => 'Prompt is required'], 422);
}

// Enhanced system prompt with context awareness
$system = "You are the Spaarow Hub oracle. Provide short, friendly, mystical advice based on the user's question. Keep responses concise and kind. Consider the conversation context for more personalized responses.";

// Check if LLM is configured
$useLLM = !empty(LLM_API_KEY) && in_array(LLM_PROVIDER, ['openrouter', 'ollama', 'huggingface']);

if ($useLLM) {
    // LLM-powered responses
    $messages = [
        ['role' => 'system', 'content' => $system],
        ...array_map(function($msg) {
            return ['role' => $msg['role'], 'content' => $msg['message']];
        }, $context)
    ];
    
    $payload = [
        'model' => LLM_MODEL,
        'messages' => $messages,
        'temperature' => 0.8,
        'max_tokens' => 250
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . LLM_API_KEY
    ]);
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    
    if ($err) {
        sendResponse(['error' => 'LLM request failed', 'details' => $err], 500);
    }
    
    $data = json_decode($response, true);
    $reply = $data['choices'][0]['message']['content'] ?? 'The oracle is contemplating your question...';
    
    sendResponse(['response' => $reply]);
    
} else {
    // Enhanced rule-based responses
    function getRuleBasedResponse($prompt) {
    $prompt = strtolower(trim($prompt));
    
    // Greeting responses
    if (preg_match('/\b(hello|hi|hey|greetings)\b/', $prompt)) {
        $responses = [
            "Greetings, seeker! Welcome to your cosmic sanctuary. How may I illuminate your path today?",
            "Hello! The stars have been waiting for you. What wisdom do you seek?",
            "Welcome! I am here to guide you through the mystical realms. What's on your mind?"
        ];
        return $responses[array_rand($responses)];
    }
    
    // Love and relationships
    if (preg_match('/\b(love|relationship|romance|heart|partner)\b/', $prompt)) {
        $responses = [
            "Love is like the stars - mysterious and beautiful. Trust your intuition, for it knows the language of the heart.",
            "The cosmic energies support openness in matters of the heart. Be vulnerable, be authentic, be you.",
            "Your heart chakra is glowing with possibility. Listen to its whispers and follow where they lead.",
            "Relationships are like constellations - connected patterns that tell a beautiful story."
        ];
        return $responses[array_rand($responses)];
    }
    
    // Zodiac-specific responses
    if (preg_match('/\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|aquarius|pisces|zodiac|sign)\b/', $prompt)) {
        $zodiacResponses = [
            "Aries: Your fiery energy propels you forward. Take bold action, for Mars favors the brave.",
            "Taurus: Your steady persistence builds lasting foundations. Patience is your greatest strength.",
            "Gemini: Your curious mind explores many paths. Communication is your key to connection.",
            "Cancer: Your intuitive heart guides you well. Trust your emotional wisdom.",
            "Leo: Your radiant leadership inspires others. Shine brightly, for the Sun blesses your confidence.",
            "Virgo: Your analytical mind sees details others miss. Your perfectionism serves the greater good.",
            "Libra: Your balanced nature creates harmony. Seek justice and beauty in all things.",
            "Scorpio: Your passionate intensity transforms situations. Your power lies in your emotional depth.",
            "Sagittarius: Your adventurous spirit seeks truth. Your arrow of intuition rarely misses its mark.",
            "Capricorn: Your disciplined ambition achieves great heights. Your patience builds enduring success.",
            "Aquarius: Your innovative vision leads the way. Your unique perspective changes the world.",
            "Pisces: Your compassionate heart understands all souls. Your dreams connect you to universal wisdom."
        ];
        return $zodiacResponses[array_rand($zodiacResponses)];
    }
    
    // Career and money
    if (preg_match('/\b(career|job|money|work|business|finance)\b/', $prompt)) {
        $responses = [
            "The universe rewards those who align passion with purpose. Your unique gifts are needed in the world.",
            "Financial abundance flows when we value ourselves. Your skills are precious - don't underestimate them.",
            "Career paths are like rivers - sometimes they curve unexpectedly. Trust the journey."
        ];
        return $responses[array_rand($responses)];
    }
    
    // Future and destiny
    if (preg_match('/\b(future|destiny|fate|what will|predict)\b/', $prompt)) {
        $responses = [
            "The future is a canvas you paint with each choice. Your brushstrokes create tomorrow's masterpiece.",
            "Destiny is not written in stone, but in the stars that guide your free will.",
            "I see many paths ahead, each shining with possibility. Choose the one that feels most like home."
        ];
        return $responses[array_rand($responses)];
    }
    
    // Health and wellness
    if (preg_match('/\b(health|wellness|healing|body|mind)\b/', $prompt)) {
        $responses = [
            "Your body is a temple of the divine. Honor it with rest, nourishment, and gentle movement.",
            "Healing begins with self-compassion. You are worthy of care and wholeness.",
            "The mind-body connection is sacred. What heals one, heals the other."
        ];
        return $responses[array_rand($responses)];
    }
    
    // Spiritual guidance
    if (preg_match('/\b(spiritual|soul|enlighten|meditate|pray)\b/', $prompt)) {
        $responses = [
            "Your soul already knows the way. Meditation is simply remembering what you've always known.",
            "Spiritual growth is like a lotus rising from the mud - beautiful and inevitable.",
            "The divine speaks in whispers. In stillness, you will hear its guidance."
        ];
        return $responses[array_rand($responses)];
    }
    
    // Default mystical responses
    $responses = [
        "The cosmic energies are shifting in your favor. Trust the timing of your life.",
        "I sense the universe is conspiring to help you. Miracles are on their way.",
        "Your intuition is your superpower right now. Listen closely to its wisdom.",
        "The stars remind you: you are exactly where you need to be. All is well.",
        "Magic is real, and you are living proof of it. Believe in your own power.",
        "The universe has your back. Take that leap of faith you've been considering."
    ];
    
    return $responses[array_rand($responses)];
}

$responseText = '';

// Check if LLM is configured, otherwise use rule-based
if (!empty(LLM_API_KEY) && LLM_PROVIDER === 'openrouter') {
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

} elseif (!empty(LLM_API_KEY) && LLM_PROVIDER === 'ollama') {
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

} elseif (!empty(LLM_API_KEY)) {
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
} else {
    // Rule-based fallback when no LLM API is configured
    $responseText = getRuleBasedResponse($prompt);
    sendResponse(['response' => trim($responseText)]);
}
}
?>