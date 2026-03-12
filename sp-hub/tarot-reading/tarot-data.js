// ===== TAROT READING DATA =====

const tarotSpreads = {
  "past-present-future": {
    name: "Past, Present & Future",
    description: "Three-card spread revealing your journey through time",
    cards: 3,
    positions: ["past", "present", "future"],
  },
  "celtic-cross": {
    name: "Celtic Cross",
    description: "Comprehensive ten-card reading for deep insights",
    cards: 10,
    positions: [
      "present",
      "challenge",
      "past",
      "future",
      "above",
      "below",
      "hopes",
      "fears",
      "external",
      "outcome",
    ],
  },
  relationship: {
    name: "Relationship Guidance",
    description: "Insights into love and connections",
    cards: 5,
    positions: ["you", "partner", "connection", "challenges", "outcome"],
  },
  "life-path": {
    name: "Life Path",
    description: "Discover your soul's journey and purpose",
    cards: 7,
    positions: [
      "where_you_are",
      "where_you_come_from",
      "where_you_are_going",
      "what_you_need",
      "what_blocks_you",
      "what_helps",
      "final_outcome",
    ],
  },
};

const tarotCards = [
  {
    name: "The Fool",
    suit: "Major Arcana",
    number: 0,
    element: "Air",
    keywords: ["new beginnings", "innocence", "spontaneity", "free spirit"],
    upright: "New beginnings, innocence, spontaneity, free spirit",
    reversed: "Naivety, foolishness, recklessness, risk-taking",
  },
  {
    name: "The Magician",
    suit: "Major Arcana",
    number: 1,
    element: "Air",
    keywords: ["manifestation", "resourcefulness", "power", "skill"],
    upright: "Manifestation, resourcefulness, power, skill",
    reversed: "Manipulation, poor planning, untapped talent, deceit",
  },
  {
    name: "The High Priestess",
    suit: "Major Arcana",
    number: 2,
    element: "Water",
    keywords: ["intuition", "unconscious", "divine feminine", "secrets"],
    upright: "Intuition, unconscious, divine feminine, secrets",
    reversed: "Secrets kept, intuition ignored, confusion, hidden agendas",
  },
  {
    name: "The Empress",
    suit: "Major Arcana",
    number: 3,
    element: "Earth",
    keywords: ["femininity", "beauty", "nature", "abundance"],
    upright: "Femininity, beauty, nature, abundance",
    reversed: "Creative block, dependence, smothering, stagnation",
  },
  {
    name: "The Emperor",
    suit: "Major Arcana",
    number: 4,
    element: "Fire",
    keywords: ["authority", "structure", "control", "father figure"],
    upright: "Authority, structure, control, father figure",
    reversed: "Domination, rigidity, chaos, excessive control",
  },
  {
    name: "The Hierophant",
    suit: "Major Arcana",
    number: 5,
    element: "Earth",
    keywords: ["spiritual wisdom", "tradition", "conformity", "religion"],
    upright: "Spiritual wisdom, tradition, conformity, religion",
    reversed:
      "Personal beliefs, freedom, challenging status quo, unconventional",
  },
  {
    name: "The Lovers",
    suit: "Major Arcana",
    number: 6,
    element: "Air",
    keywords: ["love", "relationships", "choices", "harmony"],
    upright: "Love, relationships, choices, harmony",
    reversed: "Conflict, disharmony, misalignment of values, choices",
  },
  {
    name: "The Chariot",
    suit: "Major Arcana",
    number: 7,
    element: "Water",
    keywords: ["control", "willpower", "determination", "victory"],
    upright: "Control, willpower, determination, victory",
    reversed: "Lack of control, lack of direction, aggression, opposition",
  },
  {
    name: "Strength",
    suit: "Major Arcana",
    number: 8,
    element: "Fire",
    keywords: ["strength", "courage", "patience", "control"],
    upright: "Strength, courage, patience, control",
    reversed: "Weakness, self-doubt, lack of confidence, low self-esteem",
  },
  {
    name: "The Hermit",
    suit: "Major Arcana",
    number: 9,
    element: "Earth",
    keywords: ["soul searching", "introspection", "inner guidance", "solitude"],
    upright: "Soul searching, introspection, inner guidance, solitude",
    reversed: "Isolation, loneliness, withdrawal, lost in distractions",
  },
  {
    name: "Wheel of Fortune",
    suit: "Major Arcana",
    number: 10,
    element: "Fire",
    keywords: ["good luck", "change", "cycles", "destiny"],
    upright: "Good luck, change, cycles, destiny",
    reversed:
      "Bad luck, resistance to change, breaking cycles, external forces",
  },
  {
    name: "Justice",
    suit: "Major Arcana",
    number: 11,
    element: "Air",
    keywords: ["justice", "fairness", "truth", "cause and effect"],
    upright: "Justice, fairness, truth, cause and effect",
    reversed: "Injustice, unfairness, lack of accountability, dishonesty",
  },
  {
    name: "The Hanged Man",
    suit: "Major Arcana",
    number: 12,
    element: "Water",
    keywords: ["sacrifice", "new perspective", "suspension", "letting go"],
    upright: "Sacrifice, new perspective, suspension, letting go",
    reversed: "Stalling, needless sacrifice, resistance, indecision",
  },
  {
    name: "Death",
    suit: "Major Arcana",
    number: 13,
    element: "Water",
    keywords: ["endings", "change", "transformation", "transition"],
    upright: "Endings, change, transformation, transition",
    reversed:
      "Resistance to change, personal transformation, inner purging, cleansing",
  },
  {
    name: "Temperance",
    suit: "Major Arcana",
    number: 14,
    element: "Water",
    keywords: ["balance", "moderation", "patience", "purpose"],
    upright: "Balance, moderation, patience, purpose",
    reversed: "Imbalance, excess, conflict, extremes",
  },
  {
    name: "The Devil",
    suit: "Major Arcana",
    number: 15,
    element: "Earth",
    keywords: ["bondage", "addiction", "materialism", "ignorance"],
    upright: "Bondage, addiction, materialism, ignorance",
    reversed:
      "Breaking free, exploration, releasing limitations, new perspectives",
  },
  {
    name: "The Tower",
    suit: "Major Arcana",
    number: 16,
    element: "Fire",
    keywords: ["sudden change", "upheaval", "chaos", "revelation"],
    upright: "Sudden change, upheaval, chaos, revelation",
    reversed:
      "Avoiding disaster, fear of change, personal transformation, awakening",
  },
  {
    name: "The Star",
    suit: "Major Arcana",
    number: 17,
    element: "Air",
    keywords: ["hope", "faith", "rejuvenation", "serenity"],
    upright: "Hope, faith, rejuvenation, serenity",
    reversed: "Hopelessness, lack of faith, despair, discouragement",
  },
  {
    name: "The Moon",
    suit: "Major Arcana",
    number: 18,
    element: "Water",
    keywords: ["illusion", "fear", "anxiety", "subconscious"],
    upright: "Illusion, fear, anxiety, subconscious",
    reversed: "Confusion, fear, misinterpretation, hidden dangers",
  },
  {
    name: "The Sun",
    suit: "Major Arcana",
    number: 19,
    element: "Fire",
    keywords: ["joy", "success", "positivity", "vitality"],
    upright: "Joy, success, positivity, vitality",
    reversed: "Temporary sadness, lack of success, pessimism, negativity",
  },
  {
    name: "Judgement",
    suit: "Major Arcana",
    number: 20,
    element: "Fire",
    keywords: ["judgement", "rebirth", "inner calling", "absolution"],
    upright: "Judgement, rebirth, inner calling, absolution",
    reversed:
      "Doubt, self-judgment, ignoring inner calling, lack of self-awareness",
  },
  {
    name: "The World",
    suit: "Major Arcana",
    number: 21,
    element: "Earth",
    keywords: ["completion", "integration", "accomplishment", "travel"],
    upright: "Completion, integration, accomplishment, travel",
    reversed: "Seeking closure, shortcuts, incomplete, delays",
  },
];

// Helper functions
function getRandomCard() {
  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
}

function getRandomCards(count, allowRepeats = false) {
  const cards = [];
  const availableCards = [...tarotCards];

  for (let i = 0; i < count; i++) {
    if (allowRepeats || availableCards.length === 0) {
      cards.push(getRandomCard());
    } else {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      cards.push(availableCards.splice(randomIndex, 1)[0]);
    }
  }

  return cards;
}

function getInterpretation(card, position, focus = "general") {
  const interpretations = {
    past: {
      upright: `In your past, ${card.name} represents ${card.upright.toLowerCase()}. This energy has shaped who you are today.`,
      reversed: `In your past, ${card.name} reversed indicates ${card.reversed.toLowerCase()}. This may have created challenges you're still working through.`,
    },
    present: {
      upright: `Currently, ${card.name} suggests ${card.upright.toLowerCase()}. This is the dominant energy in your life right now.`,
      reversed: `Currently, ${card.name} reversed indicates ${card.reversed.toLowerCase()}. You may be facing challenges in this area.`,
    },
    future: {
      upright: `Looking ahead, ${card.name} promises ${card.upright.toLowerCase()}. This energy is coming into your life.`,
      reversed: `Looking ahead, ${card.name} reversed warns of ${card.reversed.toLowerCase()}. Be prepared for these challenges.`,
    },
  };

  const positionKey = position.toLowerCase().replace(/\s+/g, "_");
  const isReversed = Math.random() > 0.7; // 30% chance of reversed

  return {
    card: card,
    position: position,
    reversed: isReversed,
    interpretation:
      interpretations[position]?.[isReversed ? "reversed" : "upright"] ||
      `${card.name} ${isReversed ? "reversed" : "upright"} in the ${position} position.`,
  };
}

// Export for use in main script
window.tarotSpreads = tarotSpreads;
window.tarotCards = tarotCards;
window.getRandomCard = getRandomCard;
window.getRandomCards = getRandomCards;
window.getInterpretation = getInterpretation;
