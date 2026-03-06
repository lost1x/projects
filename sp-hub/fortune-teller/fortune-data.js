// ===== FORTUNE TELLER DATA =====

const fortuneCategories = {
    "love": {
        name: "Love & Relationships",
        icon: "fa-heart",
        color: "#EC4899",
        keywords: ["heart", "love", "relationship", "romance", "partner", "soulmate", "connection", "passion"],
        fortunes: [
            "The crystal ball reveals a deep connection approaching your life. Keep your heart open to unexpected encounters.",
            "Your romantic future holds passion and devotion. A significant relationship will transform your life.",
            "Love surrounds you like a warm embrace. The universe conspires to bring you closer to your heart's desire.",
            "A soulmate connection is on the horizon. The mystical forces align to unite twin flames.",
            "Your heart's true calling will be answered soon. Love blooms in the most unexpected places."
        ],
        guidance: [
            "Trust your intuition in matters of the heart. Your inner wisdom guides you toward true love.",
            "Be vulnerable and authentic. The right person will love you for who you truly are.",
            "Focus on self-love first. When you radiate love from within, you attract it abundantly.",
            "Release past relationship baggage. The future holds new possibilities when you make space.",
            "Communication is key. Express your feelings honestly and listen with an open heart."
        ]
    },
    "career": {
        name: "Career & Success",
        icon: "fa-briefcase",
        color: "#3B82F6",
        keywords: ["career", "work", "success", "promotion", "business", "achievement", "goals", "ambition"],
        fortunes: [
            "The crystal ball shows a major career breakthrough on your horizon. Your hard work will soon be recognized.",
            "Success flows to you like a river of opportunity. Professional advancement is imminent.",
            "Your talents will be discovered by influential people. A dream opportunity awaits.",
            "The mystical forces favor your professional journey. Leadership and recognition are coming.",
            "Your career path aligns with your true purpose. Prosperity and fulfillment await."
        ],
        guidance: [
            "Network with intention. Meaningful connections will open doors to opportunity.",
            "Invest in your skills. Continuous learning leads to exponential growth.",
            "Trust your instincts when making career decisions. Your intuition rarely steers you wrong.",
            "Balance ambition with well-being. Sustainable success requires self-care.",
            "Take calculated risks. Fortune favors the bold who prepare thoroughly."
        ]
    },
    "health": {
        name: "Health & Wellness",
        icon: "fa-heartbeat",
        color: "#10B981",
        keywords: ["health", "wellness", "healing", "energy", "vitality", "strength", "recovery", "balance"],
        fortunes: [
            "The crystal ball reveals renewed vitality and energy flowing through your body. Healing is on the way.",
            "Your health journey takes a positive turn. Wellness and strength will be your companions.",
            "The mystical forces of restoration surround you. Complete healing is within reach.",
            "Your body responds beautifully to positive changes. Vibrant health manifests soon.",
            "Balance returns to your physical and energetic self. Harmony and wellness prevail."
        ],
        guidance: [
            "Listen to your body's wisdom. It communicates needs before problems arise.",
            "Nourish yourself holistically. Mind, body, and spirit connection brings true health.",
            "Rest is as important as activity. Recovery time amplifies your wellness efforts.",
            "Stay hydrated and move joyfully. Simple habits create profound health transformations.",
            "Manage stress through mindfulness. Peaceful thoughts support physical healing."
        ]
    },
    "money": {
        name: "Wealth & Prosperity",
        icon: "fa-coins",
        color: "#F59E0B",
        keywords: ["money", "wealth", "prosperity", "abundance", "financial", "riches", "success", "fortune"],
        fortunes: [
            "The crystal ball shows abundant wealth flowing into your life. Financial prosperity is imminent.",
            "Money magnetizes to you from unexpected sources. Your fortune multiplies rapidly.",
            "The mystical forces of abundance surround you. Financial freedom is your destiny.",
            "Your investments and efforts bear fruit. Wealth accumulation accelerates.",
            "Prosperity consciousness attracts unlimited abundance. Riches flow to you effortlessly."
        ],
        guidance: [
            "Practice gratitude for current abundance. Appreciation attracts more prosperity.",
            "Budget wisely but think abundantly. Smart planning meets expansive thinking.",
            "Multiple income streams strengthen your financial foundation. Diversify your wealth.",
            "Give generously within your means. The flow of giving and receiving creates abundance.",
            "Invest in yourself first. Personal growth compounds into financial success."
        ]
    },
    "general": {
        name: "General Guidance",
        icon: "fa-star",
        color: "#8B5CF6",
        keywords: ["life", "future", "destiny", "path", "journey", "guidance", "wisdom", "direction"],
        fortunes: [
            "The crystal ball reveals a beautiful journey unfolding. Your path is blessed by mystical forces.",
            "Destiny calls you toward greatness. The universe conspires to support your highest good.",
            "Your future holds magical possibilities. Wonder and delight await around every corner.",
            "The mystical realm embraces your journey. Divine guidance illuminates your path.",
            "Your life's purpose becomes clearer with each passing day. Fulfillment is your birthright."
        ],
        guidance: [
            "Trust the timing of your life. Everything unfolds in divine order.",
            "Stay present and mindful. The present moment holds all the power you need.",
            "Follow your joy and passion. Your enthusiasm is your compass to fulfillment.",
            "Embrace change as growth. Transformation leads to expanded possibilities.",
            "Connect with your inner wisdom. Your intuition is your most trusted guide."
        ]
    }
};

const fortuneMethods = [
    {
        name: "Crystal Ball Gazing",
        icon: "fa-circle-dot",
        description: "Ancient method of scrying using a crystal ball to reveal hidden truths and future possibilities through mystical visions and spiritual insight.",
        origin: "Dating back to Celtic druidic traditions over 2,000 years ago",
        detailedInfo: "Crystal ball gazing, or scrying, involves entering a meditative state while gazing into a crystal sphere. Practitioners believe the crystal acts as a portal to the spiritual realm, where visions and symbols appear in the mind's eye. This practice requires deep concentration and a quiet environment. The crystal ball is often cleansed and charged under moonlight to enhance its mystical properties.",
        famousPractitioners: "John Dee, Queen Elizabeth I's advisor; Nostradamus; Modern psychics like Sylvia Browne",
        accuracy: "Considered highly intuitive and personal, readings vary based on the practitioner's connection to spiritual energies",
        bestFor: "General life guidance, future possibilities, and spiritual insights"
    },
    {
        name: "Tarot Reading",
        icon: "fa-layer-group",
        description: "Using tarot cards to gain insight into past, present, and future events through symbolic interpretation and archetypal wisdom.",
        origin: "15th century Europe, evolved from playing cards into a divination system",
        detailedInfo: "Tarot cards consist of 78 cards divided into Major and Minor Arcana. Each card carries symbolic imagery representing universal archetypes and life experiences. A reading involves shuffling the deck while focusing on a question, then laying out cards in specific patterns called spreads. The position of cards and their combinations create a narrative about the querent's situation and potential future outcomes.",
        famousPractitioners: "Alistair Crowley, Pamela Colman Smith (Rider-Waite deck), Rachel Pollack, modern readers like Colette Baron-Reid",
        accuracy: "Highly structured system with consistent symbolism, making it reliable for pattern recognition and psychological insight",
        bestFor: "Specific questions, decision-making, and understanding psychological patterns"
    },
    {
        name: "Palm Reading",
        icon: "fa-hand-paper",
        description: "Analyzing the lines, shapes, and mounts of the hand to reveal character traits and predict future events through physical mapping.",
        origin: "Ancient India, spread through Roma culture across Europe and Asia",
        detailedInfo: "Palmistry examines both hands - the dominant hand shows potential and future possibilities, while the non-dominant hand reveals inherited traits. Major lines include the heart line (emotions), head line (intellect), life line (vitality), and fate line (destiny). Mounts on the palm correspond to planetary influences, and the shape of fingers and hands provide additional character insights.",
        famousPractitioners: "Cheiro (William John Warner), Count Louis Hamon, modern practitioners like Johnny Fincham",
        accuracy: "Based on physical characteristics that can be objectively read, though interpretation requires extensive experience",
        bestFor: "Personality analysis, health indicators, and life path understanding"
    },
    {
        name: "Astrology",
        icon: "fa-star",
        description: "Interpreting celestial positions and movements to understand personality and forecast future events through cosmic patterns.",
        origin: "Ancient Babylon, over 2,000 years old, developed in Greek, Egyptian, and Indian traditions",
        detailedInfo: "Astrology creates a natal chart based on the exact time, date, and location of birth, showing the positions of planets, sun, and moon in relation to Earth. Each planet represents different aspects of personality and life areas. The angles between planets (aspects) and their positions in zodiac signs and houses create a complex map of potential life patterns and timing for significant events.",
        famousPractitioners: "Ptolemy, Nostradamus, Johannes Kepler, modern astrologers like Susan Miller and Rick Levine",
        accuracy: "Mathematically precise with extensive historical data, though interpretation varies among schools of thought",
        bestFor: "Personality understanding, life timing, and compatibility analysis"
    },
    {
        name: "Numerology",
        icon: "fa-hashtag",
        description: "Using the mystical significance of numbers to analyze personality and predict future patterns through vibrational energies.",
        origin: "Ancient Greek and Pythagorean traditions, developed in Hebrew Kabbalah and Chinese systems",
        detailedInfo: "Numerology assigns numerical values to letters and dates, reducing them to single digits (1-9) or master numbers (11, 22, 33). Each number carries specific vibrational qualities and meanings. The life path number, derived from birth date, reveals life purpose and challenges. Expression numbers from names show natural talents, while other numbers provide insight into soul urges, destiny, and personal years.",
        famousPractitioners: "Pythagoras, Cornelius Agrippa, modern numerologists like Dan Millman and Linda Goodman",
        accuracy: "Based on consistent mathematical principles, making it one of the more systematic divination methods",
        bestFor: "Life purpose analysis, compatibility, and understanding personal cycles"
    },
    {
        name: "Tea Leaf Reading",
        icon: "fa-mug-hot",
        description: "Interpreting patterns formed by tea leaves in a cup to gain insight into future events through symbolic imagery.",
        origin: "Ancient China, popularized in Europe during the 17th century tea trade",
        detailedInfo: "Tasseography involves drinking loose-leaf tea, leaving a small amount at the bottom of the cup, then swirling the cup three times and turning it upside down. The remaining leaves form patterns that readers interpret as symbols, letters, numbers, or images. Different areas of the cup represent different time frames - near the rim for near future, bottom for distant future. The handle often represents the querent or their home.",
        famousPractitioners: "Highland Scottish tea readers, Victorian era parlor readers, modern practitioners like Jane Matthews",
        accuracy: "Highly intuitive and dependent on the reader's symbolic interpretation skills",
        bestFor: "Immediate future insights, creative problem-solving, and social guidance"
    }
];

const luckyElements = {
    numbers: [7, 11, 22, 33, 8, 13, 21],
    colors: ["Purple", "Gold", "Silver", "Blue", "Green", "Red"],
    stones: ["Amethyst", "Crystal", "Rose Quartz", "Citrine", "Black Tourmaline", "Moonstone"],
    days: ["Monday", "Wednesday", "Friday", "Sunday"],
    months: ["January", "March", "May", "July", "September", "November"]
};

const cosmicAlignments = [
    "Mercury in retrograde brings reflection and review",
    "Venus enters your sign bringing love and harmony",
    "Mars energizes your career sector with ambition",
    "Jupiter expands your financial opportunities",
    "Saturn brings structure to your creative projects",
    "Full moon illuminates your path to success",
    "New moon begins a cycle of abundance",
    "Solar eclipse catalyzes major life changes",
    "Lunar eclipse releases what no longer serves you",
    "Planetary alignment supports your highest good"
];

const sacredNumbers = [
    {
        number: 1,
        meaning: "New Beginnings",
        description: "The number of creation, leadership, and independence. Represents fresh starts and pioneering spirit.",
        energy: "Masculine, assertive, and initiating energy",
        symbolism: "The sun, new dawn, and the beginning of all journeys"
    },
    {
        number: 2,
        meaning: "Partnership & Balance",
        description: "The number of duality, cooperation, and harmony. Represents relationships and balance.",
        energy: "Feminine, receptive, and diplomatic energy",
        symbolism: "The moon, partnerships, and the union of opposites"
    },
    {
        number: 3,
        meaning: "Creativity & Expression",
        description: "The number of communication, creativity, and self-expression. Represents joy and optimism.",
        energy: "Creative, social, and expressive energy",
        symbolism: "The triangle, mind-body-spirit connection, and divine trinity"
    },
    {
        number: 4,
        meaning: "Stability & Foundation",
        description: "The number of structure, order, and practicality. Represents building solid foundations.",
        energy: "Grounded, organized, and reliable energy",
        symbolism: "The square, four seasons, and earthly stability"
    },
    {
        number: 5,
        meaning: "Freedom & Change",
        description: "The number of adventure, freedom, and versatility. Represents transformation and progress.",
        energy: "Dynamic, curious, and adaptable energy",
        symbolism: "The pentagon, five senses, and human experience"
    },
    {
        number: 6,
        meaning: "Harmony & Nurturing",
        description: "The number of love, family, and responsibility. Represents healing and service.",
        energy: "Nurturing, compassionate, and protective energy",
        symbolism: "The hexagon, family bonds, and unconditional love"
    },
    {
        number: 7,
        meaning: "Wisdom & Spirituality",
        description: "The number of intuition, analysis, and spiritual awakening. Represents inner knowledge.",
        energy: "Mystical, analytical, and introspective energy",
        symbolism: "The seven days of creation, spiritual completion, and divine wisdom"
    },
    {
        number: 8,
        meaning: "Abundance & Power",
        description: "The number of material success, achievement, and infinity. Represents abundance cycles.",
        energy: "Powerful, ambitious, and manifesting energy",
        symbolism: "The infinity symbol, material abundance, and karmic balance"
    },
    {
        number: 9,
        meaning: "Completion & Wisdom",
        description: "The number of humanitarianism, completion, and universal love. Represents endings and new beginnings.",
        energy: "Wise, compassionate, and universal energy",
        symbolism: "The completion of cycles, spiritual mastery, and global consciousness"
    },
    {
        number: 11,
        meaning: "Intuition & Enlightenment",
        description: "A master number representing spiritual insight, psychic ability, and enlightenment.",
        energy: "Highly intuitive, visionary, and transformative energy",
        symbolism: "Spiritual awakening, divine connection, and higher consciousness"
    },
    {
        number: 22,
        meaning: "Master Builder",
        description: "The master number of manifestation, practical idealism, and building dreams into reality.",
        energy: "Masterful, practical, and world-changing energy",
        symbolism: "Building bridges between spiritual and material realms"
    },
    {
        number: 33,
        meaning: "Master Teacher",
        description: "The master number of healing, compassion, and spiritual service to humanity.",
        energy: "Christ consciousness, healing, and universal love energy",
        symbolism: "The ultimate spiritual teacher and healer"
    }
];

// ===== HELPER FUNCTIONS =====

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateFortune(category, question, timeframe) {
    const categoryData = fortuneCategories[category] || fortuneCategories["general"];
    
    // Select random fortune
    const fortune = getRandomElement(categoryData.fortunes);
    const guidance = getRandomElement(categoryData.guidance);
    const alignment = getRandomElement(cosmicAlignments);
    
    // Generate lucky elements
    const luckyNumbers = [];
    for (let i = 0; i < 3; i++) {
        luckyNumbers.push(getRandomElement(luckyElements.numbers));
    }
    
    const luckyColor = getRandomElement(luckyElements.colors);
    const luckyStone = getRandomElement(luckyElements.stones);
    const luckyDay = getRandomElement(luckyElements.days);
    
    // Customize based on timeframe
    let timeframeModifier = "";
    if (timeframe === "near") {
        timeframeModifier = "In the coming month, ";
    } else if (timeframe === "mid") {
        timeframeModifier = "Over the next three months, ";
    } else {
        timeframeModifier = "In the year ahead, ";
    }
    
    // Customize based on question if provided
    let questionContext = "";
    if (question) {
        questionContext = ` Regarding your question about "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}", `;
    }
    
    return {
        fortune: timeframeModifier + questionContext + fortune,
        guidance: guidance,
        alignment: alignment,
        category: categoryData,
        luckyElements: {
            numbers: luckyNumbers.sort((a, b) => a - b),
            color: luckyColor,
            stone: luckyStone,
            day: luckyDay
        }
    };
}

function getPersonalizedMessage(category, question) {
    const categoryData = fortuneCategories[category] || fortuneCategories["general"];
    
    // Check for specific keywords in question
    if (question) {
        const lowerQuestion = question.toLowerCase();
        
        for (const [key, data] of Object.entries(fortuneCategories)) {
            for (const keyword of data.keywords) {
                if (lowerQuestion.includes(keyword)) {
                    return `The crystal ball senses your focus on ${data.name.toLowerCase()}. ${getRandomElement(data.fortunes)}`;
                }
            }
        }
    }
    
    return getRandomElement(categoryData.fortunes);
}

// Export for use in other files
window.fortuneCategories = fortuneCategories;
window.fortuneMethods = fortuneMethods;
window.luckyElements = luckyElements;
window.cosmicAlignments = cosmicAlignments;
window.sacredNumbers = sacredNumbers;
window.generateFortune = generateFortune;
window.getPersonalizedMessage = getPersonalizedMessage;
