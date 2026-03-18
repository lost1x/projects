// ===== DREAM INTERPRETATION DATA =====

const commonDreams = [
    {
        title: "Falling",
        symbol: "🌊",
        meaning: "Often represents feelings of losing control, anxiety about life changes, or fear of failure.",
        interpretation: "Falling dreams may indicate you're feeling overwhelmed or that you're not in control of your life circumstances."
    },
    {
        title: "Flying",
        symbol: "🦅",
        meaning: "Symbolizes freedom, empowerment, and rising above problems.",
        interpretation: "Flying dreams often represent a desire for freedom or feeling empowered in your waking life."
    },
    {
        title: "Being Chased",
        symbol: "🏃",
        meaning: "Represents avoidance of issues or running from problems in your life.",
        interpretation: "Being chased suggests you may be avoiding confrontation or difficult emotions."
    },
    {
        title: "Teeth Falling Out",
        symbol: "🦷",
        meaning: "Often related to communication issues, loss of confidence, or powerlessness.",
        interpretation: "Teeth falling out can symbolize anxiety about how others perceive you or communication breakdowns."
    },
    {
        title: "Being Naked",
        symbol: "👤",
        meaning: "Represents vulnerability, fear of judgment, or feeling exposed.",
        interpretation: "Nudity in dreams often reflects feelings of vulnerability or fear of being exposed."
    },
    {
        title: "Taking a Test",
        symbol: "📝",
        meaning: "Symbolizes self-evaluation, fear of failure, or being judged.",
        interpretation: "Test dreams often occur when you're facing challenges or feeling evaluated in your waking life."
    }
];

const dreamSymbols = {
    // Nature Elements
    "water": {
        meaning: "Emotions, subconscious, purification",
        interpretation: "Water in dreams represents your emotional state and subconscious mind."
    },
    "fire": {
        meaning: "Passion, transformation, destruction",
        interpretation: "Fire symbolizes intense emotions, transformation, or destructive forces in your life."
    },
    "earth": {
        meaning: "Grounding, stability, foundation",
        interpretation: "Earth represents stability, security, and your connection to reality."
    },
    "air": {
        meaning: "Thoughts, communication, freedom",
        interpretation: "Air symbolizes mental activity, communication, and the desire for freedom."
    },
    
    // Animals
    "snake": {
        meaning: "Transformation, healing, hidden fears",
        interpretation: "Snakes often represent transformation, healing, or confronting hidden fears."
    },
    "dog": {
        meaning: "Loyalty, protection, friendship",
        interpretation: "Dogs symbolize loyalty, protection, and relationships in your life."
    },
    "cat": {
        meaning: "Independence, intuition, feminine energy",
        interpretation: "Cats represent independence, intuition, and your connection to feminine energy."
    },
    "bird": {
        meaning: "Freedom, spirituality, messages",
        interpretation: "Birds symbolize freedom, spiritual messages, and elevated consciousness."
    },
    
    // Objects
    "house": {
        meaning: "Self, security, personal space",
        interpretation: "Houses represent your self, your mind, and your sense of security."
    },
    "car": {
        meaning: "Life journey, control, direction",
        interpretation: "Cars symbolize your life's journey and how much control you feel you have."
    },
    "phone": {
        meaning: "Communication, connection",
        interpretation: "Phones represent your ability to communicate and connect with others."
    },
    "money": {
        meaning: "Self-worth, power, success",
        interpretation: "Money symbolizes your sense of self-worth, power, and success."
    },
    
    // People
    "family": {
        meaning: "Relationships, support, issues",
        interpretation: "Family members in dreams represent your relationships and unresolved issues."
    },
    "stranger": {
        meaning: "Unknown aspects of self",
        interpretation: "Strangers often represent unknown or unacknowledged aspects of yourself."
    },
    "baby": {
        meaning: "New beginnings, innocence",
        interpretation: "Babies symbolize new beginnings, innocence, and potential."
    }
};

const dreamMoods = {
    "happy": {
        color: "#FFD700",
        interpretation: "Happy dreams often reflect contentment in your waking life or positive changes coming.",
        guidance: "Continue nurturing the positive aspects of your life that bring you joy."
    },
    "scared": {
        color: "#FF4444",
        interpretation: "Fear in dreams may indicate anxiety about real-life situations or unresolved fears.",
        guidance: "Consider what's causing anxiety in your waking life and address those concerns."
    },
    "anxious": {
        color: "#FF8800",
        interpretation: "Anxiety in dreams often reflects stress or worry about upcoming events.",
        guidance: "Practice relaxation techniques and consider what's causing stress in your life."
    },
    "peaceful": {
        color: "#87CEEB",
        interpretation: "Peaceful dreams suggest inner harmony and satisfaction with your life path.",
        guidance: "Maintain the practices that bring you peace and contentment."
    },
    "confused": {
        color: "#9370DB",
        interpretation: "Confusion in dreams may indicate uncertainty or lack of clarity in your waking life.",
        guidance: "Take time to reflect on decisions and seek clarity in confusing situations."
    },
    "excited": {
        color: "#FF69B4",
        interpretation: "Excitement in dreams often reflects anticipation of positive events or opportunities.",
        guidance: "Channel this positive energy into your waking life pursuits."
    },
    "sad": {
        color: "#4169E1",
        interpretation: "Sadness in dreams may reflect unresolved grief or disappointment.",
        guidance: "Allow yourself to process emotions and seek support if needed."
    },
    "angry": {
        color: "#DC143C",
        interpretation: "Anger in dreams can indicate repressed anger or frustration with situations.",
        guidance: "Find healthy ways to express and process anger in your waking life."
    },
    "neutral": {
        color: "#808080",
        interpretation: "Neutral dreams suggest a balanced emotional state or processing of information.",
        guidance: "Continue maintaining emotional balance in your daily life."
    }
};

// ===== INTERPRETATION TEMPLATES =====

const interpretationTemplates = {
    "general": [
        "Your dream reflects your current emotional state and life circumstances.",
        "This dream suggests you're processing important aspects of your waking life.",
        "Your subconscious is bringing attention to areas that need your focus.",
        "This dream reveals deeper insights about your current life journey."
    ],
    "guidance": [
        "Consider how this dream's message applies to your current situation.",
        "This dream invites you to reflect on your choices and path forward.",
        "Your dream is encouraging you to pay attention to your intuition.",
        "This dream suggests it's time to address underlying issues."
    ]
};

// ===== HELPER FUNCTIONS =====

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function extractSymbols(description) {
    const symbols = [];
    const words = description.toLowerCase().split(/\s+/);
    
    for (const word of words) {
        if (dreamSymbols[word]) {
            symbols.push({
                word: word,
                data: dreamSymbols[word]
            });
        }
    }
    
    return symbols;
}

function generateInterpretation(description, mood, type) {
    const symbols = extractSymbols(description);
    const moodData = dreamMoods[mood] || dreamMoods["neutral"];
    
    let interpretation = getRandomElement(interpretationTemplates.general);
    
    // Add mood-specific interpretation
    interpretation += ` ${moodData.interpretation}`;
    
    // Add symbol interpretations if found
    if (symbols.length > 0) {
        interpretation += ` The presence of ${symbols.map(s => s.word).join(', ')} in your dream is significant.`;
    }
    
    // Add type-specific interpretation
    if (type === "nightmare") {
        interpretation += " As a nightmare, this dream highlights fears or anxieties that need attention.";
    } else if (type === "lucid") {
        interpretation += " Your lucid awareness in this dream shows growing consciousness and control.";
    } else if (type === "recurring") {
        interpretation += " The recurring nature suggests an important message your subconscious is emphasizing.";
    }
    
    interpretation += ` ${getRandomElement(interpretationTemplates.guidance)}`;
    
    return {
        interpretation: interpretation,
        symbols: symbols,
        mood: moodData,
        guidance: moodData.guidance
    };
}

function generateEmotionalInsights(mood, description) {
    const moodData = dreamMoods[mood] || dreamMoods["neutral"];
    
    const insights = [
        `Your emotional state in this dream (${mood}) suggests ${moodData.interpretation.toLowerCase()}`,
        "The dream is processing your emotions and helping you understand your feelings better.",
        "Your subconscious is using this dream to bring emotional awareness to your conscious mind.",
        "This dream provides valuable insights into your emotional well-being and inner state."
    ];
    
    return getRandomElement(insights);
}

// Export for use in other files
window.commonDreams = commonDreams;
window.dreamSymbols = dreamSymbols;
window.dreamMoods = dreamMoods;
window.generateInterpretation = generateInterpretation;
window.generateEmotionalInsights = generateEmotionalInsights;
window.extractSymbols = extractSymbols;
