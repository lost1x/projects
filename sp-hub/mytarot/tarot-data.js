// ===== TAROT READING DATA =====

const tarotSpreads = {
    "past-present-future": {
        name: "Past, Present & Future",
        description: "Three-card spread revealing your journey through time",
        cards: 3,
        positions: ["past", "present", "future"]
    },
    "celtic-cross": {
        name: "Celtic Cross",
        description: "Comprehensive ten-card reading for deep insights",
        cards: 10,
        positions: ["present", "challenge", "past", "future", "above", "below", "hopes", "fears", "external", "outcome"]
    },
    "relationship": {
        name: "Relationship Guidance",
        description: "Insights into love and connections",
        cards: 4,
        positions: ["you", "partner", "connection", "outcome"]
    },
    "life-path": {
        name: "Life Path",
        description: "Discover your soul's journey and purpose",
        cards: 5,
        positions: ["where_you_are", "where_you_come_from", "where_you_are_going", "what_you_need", "final_outcome"]
    }
};

const tarotCards = [
    // Major Arcana
    { name: "The Fool", symbol: "🃏", type: "major", number: 0, element: "air", 
      meaning: "New beginnings, innocence, spontaneity, free spirit",
      reversed: "Foolishness, recklessness, taking unnecessary risks",
      keywords: ["beginning", "adventure", "freedom", "potential"] },
    
    { name: "The Magician", symbol: "🃏", type: "major", number: 1, element: "earth",
      meaning: "Manifestation, resourcefulness, power, skill",
      reversed: "Manipulation, poor planning, untapped potential",
      keywords: ["power", "creation", "skill", "action"] },
    
    { name: "The High Priestess", symbol: "🃏", type: "major", number: 2, element: "water",
      meaning: "Intuition, unconscious, mystery, inner wisdom",
      reversed: "Secrets, confusion, hidden agendas",
      keywords: ["intuition", "mystery", "wisdom", "subconscious"] },
    
    { name: "The Empress", symbol: "🃏", type: "major", number: 3, element: "earth",
      meaning: "Fertility, abundance, nurturing, creativity",
      reversed: "Creative blocks, dependence, stagnation",
      keywords: ["abundance", "nurturing", "creativity", "nature"] },
    
    { name: "The Emperor", symbol: "🃏", type: "major", number: 4, element: "fire",
      meaning: "Authority, structure, control, father figure",
      reversed: "Domination, rigidity, tyranny",
      keywords: ["authority", "structure", "leadership", "power"] },
    
    { name: "The Hierophant", symbol: "🃏", type: "major", number: 5, element: "earth",
      meaning: "Tradition, conformity, spiritual guidance",
      reversed: "Rebellion, unconventional thinking, challenging authority",
      keywords: ["tradition", "spirituality", "guidance", "conformity"] },
    
    { name: "The Lovers", symbol: "🃏", type: "major", number: 6, element: "air",
      meaning: "Harmony, relationships, values alignment, choices",
      reversed: "Conflict, imbalance, difficult decisions",
      keywords: ["harmony", "relationships", "choices", "union"] },
    
    { name: "The Chariot", symbol: "🃏", type: "major", number: 7, element: "water",
      meaning: "Determination, willpower, victory, control",
      reversed: "Lack of direction, aggression, defeat",
      keywords: ["victory", "determination", "control", "willpower"] },
    
    { name: "Strength", symbol: "🃏", type: "major", number: 8, element: "fire",
      meaning: "Inner strength, courage, compassion, patience",
      reversed: "Weakness, self-doubt, lack of confidence",
      keywords: ["strength", "courage", "patience", "compassion"] },
    
    { name: "The Hermit", symbol: "🃏", type: "major", number: 9, element: "earth",
      meaning: "Introspection, soul searching, inner guidance",
      reversed: "Isolation, withdrawal, loneliness",
      keywords: ["introspection", "wisdom", "solitude", "guidance"] },
    
    { name: "Wheel of Fortune", symbol: "🃏", type: "major", number: 10, element: "fire",
      meaning: "Destiny, change, cycles, luck",
      reversed: "Bad luck, resistance to change, external control",
      keywords: ["destiny", "change", "cycles", "fortune"] },
    
    { name: "Justice", symbol: "🃏", type: "major", number: 11, element: "air",
      meaning: "Fairness, truth, law, cause and effect",
      reversed: "Injustice, dishonesty, unfairness",
      keywords: ["justice", "fairness", "truth", "balance"] },
    
    { name: "The Hanged Man", symbol: "🃏", type: "major", number: 12, element: "water",
      meaning: "Surrender, new perspectives, sacrifice",
      reversed: "Resistance, pointless sacrifice, stagnation",
      keywords: ["surrender", "perspective", "sacrifice", "letting go"] },
    
    { name: "Death", symbol: "🃏", type: "major", number: 13, element: "water",
      meaning: "Transformation, endings, change, transition",
      reversed: "Resistance to change, stagnation, fear of transformation",
      keywords: ["transformation", "change", "endings", "rebirth"] },
    
    { name: "Temperance", symbol: "🃏", type: "major", number: 14, element: "fire",
      meaning: "Balance, moderation, patience, finding middle ground",
      reversed: "Imbalance, excess, conflict",
      keywords: ["balance", "moderation", "patience", "harmony"] },
    
    { name: "The Devil", symbol: "🃏", type: "major", number: 15, element: "earth",
      meaning: "Bondage, materialism, temptation, illusion",
      reversed: "Breaking free, overcoming temptation, spiritual awareness",
      keywords: ["bondage", "temptation", "materialism", "illusion"] },
    
    { name: "The Tower", symbol: "🃏", type: "major", number: 16, element: "fire",
      meaning: "Sudden change, upheaval, revelation, chaos",
      reversed: "Avoiding disaster, fear of change, personal transformation",
      keywords: ["change", "upheaval", "revelation", "chaos"] },
    
    { name: "The Star", symbol: "🃏", type: "major", number: 17, element: "air",
      meaning: "Hope, inspiration, serenity, healing",
      reversed: "Despair, lack of faith, disconnection",
      keywords: ["hope", "inspiration", "healing", "serenity"] },
    
    { name: "The Moon", symbol: "🃏", type: "major", number: 18, element: "water",
      meaning: "Illusion, intuition, subconscious, anxiety",
      reversed: "Clarity, truth, overcoming fears",
      keywords: ["illusion", "intuition", "subconscious", "mystery"] },
    
    { name: "The Sun", symbol: "🃏", type: "major", number: 19, element: "fire",
      meaning: "Joy, success, vitality, clarity",
      reversed: "Temporary depression, lack of success, negativity",
      keywords: ["joy", "success", "vitality", "clarity"] },
    
    { name: "Judgement", symbol: "🃏", type: "major", number: 20, element: "fire",
      meaning: "Awakening, rebirth, inner calling, forgiveness",
      reversed: "Self-doubt, ignoring inner calling, harsh judgment",
      keywords: ["awakening", "rebirth", "judgment", "forgiveness"] },
    
    { name: "The World", symbol: "🃏", type: "major", number: 21, element: "earth",
      meaning: "Completion, integration, achievement, fulfillment",
      reversed: "Incompletion, lack of closure, short of goals",
      keywords: ["completion", "integration", "achievement", "fulfillment"] }
];

const readingInterpretations = {
    love: {
        keywords: ["heart", "relationship", "connection", "emotion", "partnership", "intimacy"],
        guidance: "Focus on emotional authenticity and open communication. Your heart knows the way forward.",
        elements: ["water", "fire"]
    },
    career: {
        keywords: ["work", "ambition", "success", "opportunity", "achievement", "goals"],
        guidance: "Your professional path requires both practical action and intuitive insight. Trust your abilities.",
        elements: ["earth", "air"]
    },
    health: {
        keywords: ["wellness", "healing", "balance", "vitality", "recovery", "energy"],
        guidance: "Listen to your body's wisdom. Healing comes from addressing both physical and emotional needs.",
        elements: ["water", "earth"]
    },
    spiritual: {
        keywords: ["growth", "wisdom", "intuition", "enlightenment", "purpose", "soul"],
        guidance: "Your spiritual journey is unfolding perfectly. Embrace the mysteries and trust divine timing.",
        elements: ["air", "fire"]
    },
    general: {
        keywords: ["path", "journey", "direction", "clarity", "purpose", "destiny"],
        guidance: "The universe is conspiring in your favor. Stay open to unexpected opportunities.",
        elements: ["fire", "water", "earth", "air"]
    }
};

const cardSymbols = ["🃏", "🎭", "🌙", "⭐", "🔮", "✨", "💫", "🌟", "💎", "🗝️", "🔑", "🌌", "⚖️", "🏛️", "⚡", "🌊", "🔥", "🌍️", "💨", "🌬"];

// ===== HELPER FUNCTIONS =====

function getRandomCard() {
    return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}

function getRandomCards(count, allowRepeats = false) {
    const cards = [];
    const availableCards = [...tarotCards];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const card = availableCards[randomIndex];
        cards.push(card);
        
        if (!allowRepeats) {
            availableCards.splice(randomIndex, 1);
        }
    }
    
    return cards;
}

function getInterpretation(cards, spread, focus) {
    const focusData = readingInterpretations[focus] || readingInterpretations.general;
    const spreadData = tarotSpreads[spread];
    
    // Generate interpretation based on cards and focus
    let interpretation = {
        summary: generateSummary(cards, spread, focus),
        guidance: focusData.guidance,
        elements: focusData.elements,
        keywords: focusData.keywords,
        message: generatePersonalMessage(cards, focus)
    };
    
    return interpretation;
}

function generateSummary(cards, spread, focus) {
    const spreadData = tarotSpreads[spread];
    const majorArcanaCount = cards.filter(card => card.type === 'major').length;
    
    let summary = `Your ${spreadData.name.toLowerCase()} reveals `;
    
    if (majorArcanaCount >= 2) {
        summary += "significant life changes and spiritual transformation. ";
    } else if (majorArcanaCount === 1) {
        summary += "important guidance from the universe. ";
    } else {
        summary += "practical matters and everyday influences. ";
    }
    
    // Add card-specific insights
    cards.forEach((card, index) => {
        const position = spreadData.positions[index];
        summary += `In the ${position.replace('_', ' ')} position, ${card.name.toLowerCase()} suggests ${card.meaning.toLowerCase()}. `;
    });
    
    return summary;
}

function generatePersonalMessage(cards, focus) {
    const messages = [
        "The universe is aligning to support your highest good.",
        "Trust the timing of your life - everything unfolds as it should.",
        "Your intuition is your greatest guide right now.",
        "The cards confirm you're on the right path.",
        "Mystical forces are working in your favor.",
        "Your spiritual journey is reaching a pivotal moment.",
        "The answers you seek are already within you.",
        "Divine timing is bringing your desires to fruition.",
        "Your energy is attracting exactly what you need."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// Export for use in other files
window.tarotSpreads = tarotSpreads;
window.tarotCards = tarotCards;
window.readingInterpretations = readingInterpretations;
window.getRandomCard = getRandomCard;
window.getRandomCards = getRandomCards;
window.getInterpretation = getInterpretation;
