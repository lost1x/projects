// ===== NUMEROLOGY DATA =====

const numberMeanings = {
    1: {
        name: "The Leader",
        description: "Independence, pioneering, leadership, and achievement",
        positive: ["leader", "pioneer", "independent", "courageous", "determined"],
        negative: ["selfish", "aggressive", "dominating", "impatient"],
        traits: ["Natural leader", "innovative thinker", "strong individuality"],
        career: ["Entrepreneur", "Manager", "Military", "Sports"],
        colors: ["Red", "Yellow"],
        days: ["Sunday", "Monday"],
        element: "Fire",
        ruling_planet: "Sun"
    },
    2: {
        name: "The Diplomat",
        description: "Cooperation, balance, harmony, and sensitivity",
        positive: ["diplomatic", "cooperative", "sensitive", "intuitive", "peaceful"],
        negative: ["overly sensitive", "emotional", "indecisive", "dependent"],
        traits: ["Natural mediator", "artistic soul", "empathetic nature"],
        career: ["Diplomat", "Counselor", "Artist", "Musician"],
        colors: ["Orange", "Green"],
        days: ["Monday", "Friday"],
        element: "Water",
        ruling_planet: "Moon"
    },
    3: {
        name: "The Communicator",
        description: "Creativity, communication, optimism, and self-expression",
        positive: ["creative", "communicative", "optimistic", "talented", "charming"],
        negative: ["scattered", "superficial", "exaggerating", "moody"],
        traits: ["Creative genius", "social butterfly", "versatile performer"],
        career: ["Writer", "Artist", "Entertainer", "Public Speaker"],
        colors: ["Yellow", "Purple"],
        days: ["Tuesday", "Thursday"],
        element: "Air",
        ruling_planet: "Jupiter"
    },
    4: {
        name: "The Builder",
        description: "Stability, practicality, discipline, and hard work",
        positive: ["practical", "disciplined", "reliable", "honest", "organized"],
        negative: ["rigid", "stubborn", "boring", "workaholic"],
        traits: ["Foundation builder", "master organizer", "steady achiever"],
        career: ["Architect", "Engineer", "Accountant", "Farmer"],
        colors: ["Green", "Brown"],
        days: ["Wednesday", "Saturday"],
        element: "Earth",
        ruling_planet: "Saturn"
    },
    5: {
        name: "The Adventurer",
        description: "Freedom, change, versatility, and curiosity",
        positive: ["adventurous", "versatile", "curious", "intelligent", "charismatic"],
        negative: ["irresponsible", "impulsive", "restless", "unreliable"],
        traits: ["Free spirit", "life of the party", "versatile talent"],
        career: ["Travel Agent", "Sales", "Entertainer", "Explorer"],
        colors: ["Blue", "Turquoise"],
        days: ["Thursday", "Wednesday"],
        element: "Air",
        ruling_planet: "Mercury"
    },
    6: {
        name: "The Nurturer",
        description: "Love, harmony, responsibility, and service",
        positive: ["loving", "harmonious", "responsible", "caring", "protective"],
        negative: ["overly protective", "self-sacrificing", "enabling", "anxious"],
        traits: ["Natural caregiver", "peaceful healer", "community builder"],
        career: ["Teacher", "Healthcare", "Counselor", "Chef"],
        colors: ["Indigo", "Pink"],
        days: ["Friday", "Monday"],
        element: "Water",
        ruling_planet: "Venus"
    },
    7: {
        name: "The Seeker",
        description: "Spirituality, analysis, wisdom, and introspection",
        positive: ["spiritual", "analytical", "wise", "intuitive", "perceptive"],
        negative: ["overly analytical", "skeptical", "detached", "isolated"],
        traits: ["Deep thinker", "spiritual seeker", "mystical advisor"],
        career: ["Researcher", "Analyst", "Philosopher", "Scientist"],
        colors: ["Purple", "Violet"],
        days: ["Saturday", "Tuesday"],
        element: "Water",
        ruling_planet: "Neptune"
    },
    8: {
        name: "The Powerhouse",
        description: "Authority, ambition, success, and material achievement",
        positive: ["ambitious", "successful", "organized", "authoritative", "practical"],
        negative: ["materialistic", "controlling", "workaholic", "stubborn"],
        traits: ["Natural leader", "business mogul", "empire builder"],
        career: ["CEO", "Business Owner", "Lawyer", "Politician"],
        colors: ["Black", "Gray"],
        days: ["Saturday", "Wednesday"],
        element: "Earth",
        ruling_planet: "Saturn"
    },
    9: {
        name: "The Humanitarian",
        description: "Compassion, idealism, creativity, and universal love",
        positive: ["compassionate", "idealistic", "creative", "generous", "tolerant"],
        negative: ["impractical", "overly emotional", "self-destructive", "martyrdom"],
        traits: ["Universal healer", "creative visionary", "global thinker"],
        career: ["Humanitarian", "Artist", "Writer", "Social Worker"],
        colors: ["Red", "White"],
        days: ["Monday", "Friday"],
        element: "Fire",
        ruling_planet: "Mars"
    },
    11: {
        name: "The Illuminator",
        description: "Intuition, enlightenment, inspiration, and spiritual insight",
        positive: ["intuitive", "inspirational", "spiritual", "visionary", "creative"],
        negative: ["overly sensitive", "impractical", "nervous", "escapist"],
        traits: ["Spiritual messenger", "creative visionary", "enlightened soul"],
        career: ["Spiritual Teacher", "Artist", "Musician", "Therapist"],
        colors: ["Silver", "Gold"],
        days: ["Sunday", "Tuesday"],
        element: "Air",
        ruling_planet: "Uranus"
    },
    22: {
        name: "The Master Builder",
        description: "Master number of practicality, manifestation, and universal achievement",
        positive: ["master builder", "practical", "ambitious", "organized", "successful"],
        negative: ["overly materialistic", "nervous tension", "extreme pressure"],
        traits: ["Master manifestor", "practical visionary", "universal achiever"],
        career: ["Master Builder", "CEO", "Architect", "Innovator"],
        colors: ["Gold", "Copper"],
        days: ["All days"],
        element: "All elements",
        ruling_planet: "All planets"
    },
    33: {
        name: "The Master Teacher",
        description: "Master number of healing, teaching, and universal service",
        positive: ["master teacher", "healing", "compassionate", "wise", "service-oriented"],
        negative: ["overly self-sacrificing", "extreme sensitivity", "martyr complex"],
        traits: ["Master healer", "universal teacher", "spiritual guide"],
        career: ["Spiritual Master", "Teacher", "Healer", "Philosopher"],
        colors: ["Crystal", "Platinum"],
        days: ["All days"],
        element: "All elements",
        ruling_planet: "All planets"
    }
};

const masterNumbers = [11, 22, 33];

const lifePathChallenges = {
    1: "Learning to stand alone and develop independence",
    2: "Learning cooperation and overcoming sensitivity",
    3: "Learning focus and effective communication",
    4: "Learning flexibility and embracing change",
    5: "Learning commitment and overcoming restlessness",
    6: "Learning self-care while maintaining harmony",
    7: "Learning trust and overcoming skepticism",
    8: "Learning balance between material and spiritual",
    9: "Learning completion and letting go",
    11: "Learning to use intuitive gifts wisely",
    22: "Learning to handle master responsibilities",
    33: "Learning to serve humanity with wisdom"
};

const nameNumberCalculations = {
    // Pythagorean numerology
    method: "Pythagorean",
    description: "Each letter is assigned a number 1-9, then summed and reduced to single digit"
};

const compatibilityMatrix = {
    1: [1, 3, 5, 7, 9],      // Compatible with odd numbers
    2: [2, 4, 6, 8],            // Compatible with even numbers
    3: [3, 6, 9],                // Creative harmony
    4: [4, 8, 22],               // Practical stability
    5: [5, 7, 14],               // Adventurous spirits
    6: [6, 9, 15, 24],           // Nurturing bonds
    7: [7, 11, 16, 25],           // Spiritual connection
    8: [8, 17, 26],               // Power dynamics
    9: [9, 18, 27],               // Universal love
    11: [11, 22, 33],             // Master connection
    22: [22, 33, 44],             // Master builders
    33: [33, 6, 9, 15, 24, 27]  // Universal teachers
};

// ===== HELPER FUNCTIONS =====

function calculateLifePathNumber(day, month, year) {
    // Convert to single digits and sum
    const daySum = reduceToSingleDigit(day);
    const monthSum = reduceToSingleDigit(month);
    const yearSum = reduceToSingleDigit(year);
    
    // Total sum
    const totalSum = daySum + monthSum + yearSum;
    let lifePath = reduceToSingleDigit(totalSum);
    
    // Check for master numbers
    if (totalSum === 11 || totalSum === 22 || totalSum === 33) {
        lifePath = totalSum;
    }
    
    return lifePath;
}

function calculateNameNumber(fullName) {
    if (!fullName) return null;
    
    // Remove spaces and convert to uppercase
    const name = fullName.replace(/\s/g, '').toUpperCase();
    
    // Pythagorean letter values
    const letterValues = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    };
    
    // Calculate name number
    let nameSum = 0;
    for (const letter of name) {
        if (letterValues[letter]) {
            nameSum += letterValues[letter];
        }
    }
    
    let nameNumber = reduceToSingleDigit(nameSum);
    
    // Check for master numbers
    if (nameSum === 11 || nameSum === 22 || nameSum === 33) {
        nameNumber = nameSum;
    }
    
    return nameNumber;
}

function calculateSoulNumber(fullName) {
    if (!fullName) return null;
    
    // Only vowels for soul number
    const vowels = fullName.replace(/[^AEIOUaeiou]/g, '').toUpperCase();
    
    const vowelValues = {
        'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3,
        'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3
    };
    
    let soulSum = 0;
    for (const vowel of vowels) {
        if (vowelValues[vowel]) {
            soulSum += vowelValues[vowel];
        }
    }
    
    let soulNumber = reduceToSingleDigit(soulSum);
    
    // Check for master numbers
    if (soulSum === 11 || soulSum === 22 || soulSum === 33) {
        soulNumber = soulSum;
    }
    
    return soulNumber;
}

function calculatePersonalityNumber(fullName) {
    if (!fullName) return null;
    
    // Only consonants for personality number
    const consonants = fullName.replace(/[AEIOUaeiou\s]/g, '').toUpperCase();
    
    const consonantValues = {
        'B': 2, 'C': 3, 'D': 4, 'F': 6, 'G': 7, 'H': 8, 'J': 1, 'K': 2, 'L': 3, 'M': 4,
        'N': 5, 'P': 7, 'Q': 8, 'R': 9, 'S': 1, 'T': 2, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
        'b': 2, 'c': 3, 'd': 4, 'f': 6, 'g': 7, 'h': 8, 'j': 1, 'k': 2, 'l': 3, 'm': 4,
        'n': 5, 'p': 7, 'q': 8, 'r': 9, 's': 1, 't': 2, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    };
    
    let personalitySum = 0;
    for (const consonant of consonants) {
        if (consonantValues[consonant]) {
            personalitySum += consonantValues[consonant];
        }
    }
    
    let personalityNumber = reduceToSingleDigit(personalitySum);
    
    // Check for master numbers
    if (personalitySum === 11 || personalitySum === 22 || personalitySum === 33) {
        personalityNumber = personalitySum;
    }
    
    return personalityNumber;
}

function reduceToSingleDigit(number) {
    while (number > 9 && number !== 11 && number !== 22 && number !== 33) {
        let sum = 0;
        const numStr = number.toString();
        for (const digit of numStr) {
            sum += parseInt(digit);
        }
        number = sum;
    }
    return number;
}

function getCompatibility(number1, number2) {
    const compat1 = compatibilityMatrix[number1] || [];
    const compat2 = compatibilityMatrix[number2] || [];
    
    // Check if numbers are compatible
    const isCompatible = compat1.includes(number2) || compat2.includes(number1);
    
    let compatibilityLevel = "Neutral";
    if (isCompatible) {
        compatibilityLevel = "Highly Compatible";
    } else if (Math.abs(number1 - number2) <= 2) {
        compatibilityLevel = "Compatible";
    } else if (Math.abs(number1 - number2) <= 4) {
        compatibilityLevel = "Moderately Compatible";
    } else {
        compatibilityLevel = "Challenging";
    }
    
    return {
        level: compatibilityLevel,
        score: isCompatible ? 85 : (100 - Math.abs(number1 - number2) * 10),
        description: getCompatibilityDescription(compatibilityLevel)
    };
}

function getCompatibilityDescription(level) {
    const descriptions = {
        "Highly Compatible": "Your energies naturally harmonize and support each other's growth.",
        "Compatible": "You share complementary traits and can build a stable relationship.",
        "Moderately Compatible": "With effort and understanding, you can create balance.",
        "Challenging": "Your differences require patience and compromise to overcome."
    };
    
    return descriptions[level] || "Unique dynamic requiring conscious effort.";
}

function getPersonalYearNumber(birthYear, currentYear) {
    const yearSum = reduceToSingleDigit(birthYear + currentYear);
    return yearSum;
}

function generatePersonalMessage(lifePath, nameNumber, soulNumber, personalityNumber) {
    const messages = [
        `Your Life Path ${lifePath} reveals you're a ${numberMeanings[lifePath].name.toLowerCase()}, destined to ${numberMeanings[lifePath].description.toLowerCase()}.`,
        `The universe has blessed you with the energy of ${lifePath}, bringing ${numberMeanings[lifePath].positive.join(', ').toLowerCase()} into your life.`,
        `Your sacred numbers align perfectly with your soul's purpose. The path of ${lifePath} awaits your unique expression.`,
        `With the wisdom of ${lifePath}, you have the power to transform challenges into stepping stones toward success.`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}

// Export for use in other files
window.numberMeanings = numberMeanings;
window.masterNumbers = masterNumbers;
window.lifePathChallenges = lifePathChallenges;
window.nameNumberCalculations = nameNumberCalculations;
window.compatibilityMatrix = compatibilityMatrix;
window.calculateLifePathNumber = calculateLifePathNumber;
window.calculateNameNumber = calculateNameNumber;
window.calculateSoulNumber = calculateSoulNumber;
window.calculatePersonalityNumber = calculatePersonalityNumber;
window.getCompatibility = getCompatibility;
window.getPersonalYearNumber = getPersonalYearNumber;
window.generatePersonalMessage = generatePersonalMessage;
window.reduceToSingleDigit = reduceToSingleDigit;
