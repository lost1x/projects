// ===== ELDER FUTHARK RUNE DATA =====

const runeData = [
    {
        name: "Fehu",
        symbol: "ᚠ",
        meaning: "Wealth, Cattle",
        upright: "New beginnings, prosperity, abundance, financial gain",
        reversed: "Loss, poverty, frustration, unfulfilled desires",
        element: "Fire",
        keywords: ["wealth", "success", "abundance", "new start"],
        mythology: "Represents cattle and material wealth in ancient Norse society. Symbolizes the power to create and manifest abundance."
    },
    {
        name: "Uruz",
        symbol: "ᚢ",
        meaning: "Aurochs, Strength",
        upright: "Physical strength, courage, health, vitality",
        reversed: "Weakness, sickness, lack of energy, misfortune",
        element: "Earth",
        keywords: ["strength", "power", "health", "courage"],
        mythology: "Represents the wild aurochs, symbolizing untamed strength and primal energy."
    },
    {
        name: "Thurisaz",
        symbol: "ᚦ",
        meaning: "Giant, Thor",
        upright: "Protection, defense, conflict, change",
        reversed: "Danger, betrayal, unexpected problems",
        element: "Fire",
        keywords: ["protection", "defense", "conflict", "change"],
        mythology: "Associated with Thor, the god of thunder. Represents destructive and protective forces."
    },
    {
        name: "Ansuz",
        symbol: "ᚨ",
        meaning: "God, Odin",
        upright: "Communication, wisdom, divine inspiration",
        reversed: "Misunderstanding, failed communication, deception",
        element: "Air",
        keywords: ["communication", "wisdom", "divine", "inspiration"],
        mythology: "Sacred to Odin, the chief god. Represents divine communication and wisdom."
    },
    {
        name: "Raidho",
        symbol: "ᚱ",
        meaning: "Journey, Riding",
        upright: "Travel, movement, life journey, change",
        reversed: "Delays, obstacles, wrong path",
        element: "Earth",
        keywords: ["journey", "travel", "movement", "change"],
        mythology: "Represents the act of riding or journeying, both physical and spiritual."
    },
    {
        name: "Kenaz",
        symbol: "ᚲ",
        meaning: "Torch, Knowledge",
        upright: "Knowledge, creativity, inspiration, clarity",
        reversed: "Confusion, lack of knowledge, darkness",
        element: "Fire",
        keywords: ["knowledge", "creativity", "inspiration", "clarity"],
        mythology: "Represents the torch that illuminates darkness, symbolizing knowledge and enlightenment."
    },
    {
        name: "Gebo",
        symbol: "ᚷ",
        meaning: "Gift, Generosity",
        upright: "Gift, generosity, partnership, exchange",
        reversed: "Selfishness, greed, imbalance",
        element: "Air",
        keywords: ["gift", "generosity", "partnership", "exchange"],
        mythology: "Represents the sacred act of gift-giving and the bonds it creates."
    },
    {
        name: "Wunjo",
        symbol: "ᚹ",
        meaning: "Joy, Pleasure",
        upright: "Joy, happiness, harmony, success",
        reversed: "Sorrow, conflict, unhappiness",
        element: "Earth",
        keywords: ["joy", "happiness", "harmony", "success"],
        mythology: "Represents pure joy and the pleasure of achievement and harmony."
    },
    {
        name: "Hagalaz",
        symbol: "ᚺ",
        meaning: "Hail, Disruption",
        upright: "Disruption, change, crisis, transformation",
        reversed: "Unavoidable change, loss of control",
        element: "Water",
        keywords: ["disruption", "change", "crisis", "transformation"],
        mythology: "Represents hail, a force of nature that cannot be controlled, symbolizing unavoidable change."
    },
    {
        name: "Nauthiz",
        symbol: "ᚾ",
        meaning: "Need, Necessity",
        upright: "Need, necessity, constraint, struggle",
        reversed: "Relief from hardship, end of struggle",
        element: "Fire",
        keywords: ["need", "necessity", "constraint", "struggle"],
        mythology: "Represents the driving force of necessity and the lessons learned through hardship."
    },
    {
        name: "Isa",
        symbol: "ᛁ",
        meaning: "Ice, Stillness",
        upright: "Stillness, pause, clarity, freezing",
        reversed: "Stagnation, coldness, lack of progress",
        element: "Water",
        keywords: ["stillness", "pause", "clarity", "freezing"],
        mythology: "Represents ice, symbolizing stillness and the power to pause and reflect."
    },
    {
        name: "Jera",
        symbol: "ᛃ",
        meaning: "Year, Harvest",
        upright: "Harvest, reward, cycles, completion",
        reversed: "Delay, poor timing, missed opportunity",
        element: "Earth",
        keywords: ["harvest", "reward", "cycles", "completion"],
        mythology: "Represents the annual harvest and the natural cycles of life."
    },
    {
        name: "Eihwaz",
        symbol: "ᛇ",
        meaning: "Yew Tree, Defense",
        upright: "Defense, protection, endurance, transformation",
        reversed: "Danger, vulnerability, weakness",
        element: "Earth",
        keywords: ["defense", "protection", "endurance", "transformation"],
        mythology: "Represents the yew tree, symbolizing endurance and the connection between worlds."
    },
    {
        name: "Perthro",
        symbol: "ᛈ",
        meaning: "Mystery, Fate",
        upright: "Mystery, fate, secrets, hidden knowledge",
        reversed: "Unexpected events, fate's intervention",
        element: "Water",
        keywords: ["mystery", "fate", "secrets", "hidden"],
        mythology: "Represents the unknown and the workings of fate and destiny."
    },
    {
        name: "Algiz",
        symbol: "ᛉ",
        meaning: "Protection, Elk",
        upright: "Protection, defense, connection to divine",
        reversed: "Vulnerability, lack of protection",
        element: "Air",
        keywords: ["protection", "defense", "divine", "shield"],
        mythology: "Represents the elk's antlers, symbolizing protection and divine connection."
    },
    {
        name: "Sowilo",
        symbol: "ᛊ",
        meaning: "Sun, Success",
        upright: "Success, victory, honor, achievement",
        reversed: "False success, disappointment, failure",
        element: "Fire",
        keywords: ["success", "victory", "honor", "achievement"],
        mythology: "Represents the sun, symbolizing success, victory, and divine guidance."
    },
    {
        name: "Tiwaz",
        symbol: "ᛏ",
        meaning: "Tyr, Justice",
        upright: "Justice, honor, courage, sacrifice",
        reversed: "Injustice, unfairness, lack of courage",
        element: "Air",
        keywords: ["justice", "honor", "courage", "sacrifice"],
        mythology: "Sacred to Tyr, the god of justice and law. Represents fairness and sacrifice."
    },
    {
        name: "Berkano",
        symbol: "ᛒ",
        meaning: "Birch, Growth",
        upright: "Growth, rebirth, fertility, new beginnings",
        reversed: "Stagnation, lack of growth, family problems",
        element: "Earth",
        keywords: ["growth", "rebirth", "fertility", "new"],
        mythology: "Represents the birch tree, symbolizing new growth and feminine energy."
    },
    {
        name: "Ehwaz",
        symbol: "ᛖ",
        meaning: "Horse, Movement",
        upright: "Movement, progress, cooperation, trust",
        reversed: "Stagnation, betrayal, lack of progress",
        element: "Earth",
        keywords: ["movement", "progress", "cooperation", "trust"],
        mythology: "Represents the horse, symbolizing movement, progress, and loyal partnership."
    },
    {
        name: "Mannaz",
        symbol: "ᛗ",
        meaning: "Man, Humanity",
        upright: "Humanity, cooperation, intelligence, tradition",
        reversed: "Selfishness, isolation, lack of cooperation",
        element: "Air",
        keywords: ["humanity", "cooperation", "intelligence", "tradition"],
        mythology: "Represents humanity and the power of cooperation and collective wisdom."
    },
    {
        name: "Laguz",
        symbol: "ᛚ",
        meaning: "Water, Flow",
        upright: "Intuition, emotions, flow, purification",
        reversed: "Emotional turmoil, confusion, lack of flow",
        element: "Water",
        keywords: ["intuition", "emotions", "flow", "purification"],
        mythology: "Represents water, symbolizing emotions, intuition, and the flow of life."
    },
    {
        name: "Ingwaz",
        symbol: "ᛜ",
        meaning: "Ing, Fertility",
        upright: "Fertility, potential, growth, completion",
        reversed: "Blocked potential, infertility, stagnation",
        element: "Earth",
        keywords: ["fertility", "potential", "growth", "completion"],
        mythology: "Sacred to Ing, the god of fertility. Represents potential and natural growth."
    },
    {
        name: "Dagaz",
        symbol: "ᛞ",
        meaning: "Day, Dawn",
        upright: "Dawn, awakening, clarity, transformation",
        reversed: "Darkness, confusion, lack of clarity",
        element: "Fire",
        keywords: ["dawn", "awakening", "clarity", "transformation"],
        mythology: "Represents the dawn, symbolizing new beginnings and the triumph of light over darkness."
    },
    {
        name: "Othala",
        symbol: "ᛟ",
        meaning: "Heritage, Home",
        upright: "Heritage, home, inheritance, security",
        reversed: "Loss of home, family problems, insecurity",
        element: "Earth",
        keywords: ["heritage", "home", "inheritance", "security"],
        mythology: "Represents ancestral heritage and the security of home and family."
    }
];

// Casting interpretations for different spreads
const castingInterpretations = {
    single: {
        title: "Single Rune Guidance",
        description: "This rune provides direct guidance for your question."
    },
    three: {
        title: "Past, Present, Future",
        description: "Three runes reveal the flow of time and energy."
    },
    five: {
        title: "Comprehensive Life Reading",
        description: "Five runes provide deep insight into your life situation."
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runeData, castingInterpretations };
}
