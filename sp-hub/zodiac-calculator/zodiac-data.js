// ===== ZODIAC SIGNS DATA =====

const zodiacSigns = [
    {
        name: "Aries",
        symbol: "♈",
        icon: "fa-fire",
        dates: "March 21 - April 19",
        element: "Fire",
        quality: "Cardinal",
        ruler: "Mars",
        color: "#FF4444",
        traits: [
            "Courageous and confident",
            "Enthusiastic and optimistic",
            "Determined and ambitious",
            "Honest and straightforward",
            "Passionate and energetic"
        ],
        message: "As a bold Aries, you're a natural-born leader with endless energy. Your pioneering spirit inspires others to follow your adventurous path through life.",
        compatibility: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
        luckyNumbers: [1, 8, 17],
        luckyDay: "Tuesday"
    },
    {
        name: "Taurus",
        symbol: "♉",
        icon: "fa-leaf",
        dates: "April 20 - May 20",
        element: "Earth",
        quality: "Fixed",
        ruler: "Venus",
        color: "#4CAF50",
        traits: [
            "Reliable and patient",
            "Practical and grounded",
            "Devoted and loyal",
            "Sensual and romantic",
            "Stable and persistent"
        ],
        message: "As a steadfast Taurus, you bring stability and comfort to those around you. Your appreciation for beauty and pleasure creates a life of harmony and contentment.",
        compatibility: ["Virgo", "Capricorn", "Cancer", "Pisces"],
        luckyNumbers: [2, 6, 9],
        luckyDay: "Friday"
    },
    {
        name: "Gemini",
        symbol: "♊",
        icon: "fa-wind",
        dates: "May 21 - June 20",
        element: "Air",
        quality: "Mutable",
        ruler: "Mercury",
        color: "#FFD700",
        traits: [
            "Adaptable and versatile",
            "Curious and intellectual",
            "Communicative and witty",
            "Youthful and lively",
            "Social and charming"
        ],
        message: "As a brilliant Gemini, your mind is always buzzing with ideas and possibilities. Your gift of communication connects you with people from all walks of life.",
        compatibility: ["Libra", "Aquarius", "Aries", "Leo"],
        luckyNumbers: [3, 5, 14],
        luckyDay: "Wednesday"
    },
    {
        name: "Cancer",
        symbol: "♋",
        icon: "fa-droplet",
        dates: "June 21 - July 22",
        element: "Water",
        quality: "Cardinal",
        ruler: "Moon",
        color: "#C0C0C0",
        traits: [
            "Intuitive and emotional",
            "Nurturing and caring",
            "Protective and loyal",
            "Imaginative and creative",
            "Sympathetic and compassionate"
        ],
        message: "As a caring Cancer, you create emotional safety for yourself and others. Your intuitive nature guides you through life's deepest waters with grace.",
        compatibility: ["Scorpio", "Pisces", "Taurus", "Virgo"],
        luckyNumbers: [2, 7, 11],
        luckyDay: "Monday"
    },
    {
        name: "Leo",
        symbol: "♌",
        icon: "fa-sun",
        dates: "July 23 - August 22",
        element: "Fire",
        quality: "Fixed",
        ruler: "Sun",
        color: "#FFA500",
        traits: [
            "Confident and charismatic",
            "Generous and warm-hearted",
            "Creative and passionate",
            "Leadership qualities",
            "Loyal and protective"
        ],
        message: "As a magnificent Leo, you shine with natural leadership and creative brilliance. Your generous spirit illuminates the lives of everyone you encounter.",
        compatibility: ["Aries", "Sagittarius", "Gemini", "Libra"],
        luckyNumbers: [1, 4, 10],
        luckyDay: "Sunday"
    },
    {
        name: "Virgo",
        symbol: "♍",
        icon: "fa-seedling",
        dates: "August 23 - September 22",
        element: "Earth",
        quality: "Mutable",
        ruler: "Mercury",
        color: "#8B4513",
        traits: [
            "Analytical and practical",
            "Hardworking and diligent",
            "Perfectionist and detail-oriented",
            "Loyal and kind",
            "Modest and humble"
        ],
        message: "As a meticulous Virgo, you bring order and improvement to everything you touch. Your dedication to excellence inspires others to strive for their best.",
        compatibility: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
        luckyNumbers: [5, 14, 23],
        luckyDay: "Wednesday"
    },
    {
        name: "Libra",
        symbol: "♎",
        icon: "fa-scale-balanced",
        dates: "September 23 - October 22",
        element: "Air",
        quality: "Cardinal",
        ruler: "Venus",
        color: "#FF69B4",
        traits: [
            "Diplomatic and fair-minded",
            "Social and charming",
            "Artistic and creative",
            "Cooperative and gracious",
            "Peace-loving and harmonious"
        ],
        message: "As a balanced Libra, you seek harmony and beauty in all aspects of life. Your diplomatic nature brings people together and creates understanding.",
        compatibility: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
        luckyNumbers: [4, 6, 13],
        luckyDay: "Friday"
    },
    {
        name: "Scorpio",
        symbol: "♏",
        icon: "fa-scorpion",
        dates: "October 23 - November 21",
        element: "Water",
        quality: "Fixed",
        ruler: "Pluto",
        color: "#8B0000",
        traits: [
            "Passionate and intense",
            "Resourceful and brave",
            "Determined and focused",
            "Mysterious and magnetic",
            "Loyal and protective"
        ],
        message: "As a powerful Scorpio, you possess deep emotional intensity and transformative power. Your ability to see beneath the surface reveals hidden truths.",
        compatibility: ["Cancer", "Pisces", "Virgo", "Capricorn"],
        luckyNumbers: [8, 11, 18],
        luckyDay: "Tuesday"
    },
    {
        name: "Sagittarius",
        symbol: "♐",
        icon: "fa-bow-arrow",
        dates: "November 22 - December 21",
        element: "Fire",
        quality: "Mutable",
        ruler: "Jupiter",
        color: "#9370DB",
        traits: [
            "Optimistic and adventurous",
            "Honest and straightforward",
            "Philosophical and intellectual",
            "Generous and open-minded",
            "Freedom-loving and energetic"
        ],
        message: "As an adventurous Sagittarius, you're on a perpetual quest for truth and wisdom. Your optimistic outlook inspires others to see life's infinite possibilities.",
        compatibility: ["Aries", "Leo", "Libra", "Aquarius"],
        luckyNumbers: [3, 7, 21],
        luckyDay: "Thursday"
    },
    {
        name: "Capricorn",
        symbol: "♑",
        icon: "fa-mountain",
        dates: "December 22 - January 19",
        element: "Earth",
        quality: "Cardinal",
        ruler: "Saturn",
        color: "#696969",
        traits: [
            "Ambitious and disciplined",
            "Responsible and patient",
            "Practical and realistic",
            "Loyal and reliable",
            "Traditional and conservative"
        ],
        message: "As a determined Capricorn, you build lasting foundations for success. Your steady climb toward your goals inspires admiration and respect.",
        compatibility: ["Taurus", "Virgo", "Scorpio", "Pisces"],
        luckyNumbers: [4, 8, 22],
        luckyDay: "Saturday"
    },
    {
        name: "Aquarius",
        symbol: "♒",
        icon: "fa-bolt",
        dates: "January 20 - February 18",
        element: "Air",
        quality: "Fixed",
        ruler: "Uranus",
        color: "#00CED1",
        traits: [
            "Innovative and original",
            "Humanitarian and altruistic",
            "Intellectual and analytical",
            "Independent and unconventional",
            "Friendly and social"
        ],
        message: "As a visionary Aquarius, you see the world through a unique lens of innovation and humanitarian ideals. Your forward-thinking approach shapes the future.",
        compatibility: ["Gemini", "Libra", "Aries", "Sagittarius"],
        luckyNumbers: [4, 11, 22],
        luckyDay: "Wednesday"
    },
    {
        name: "Pisces",
        symbol: "♓",
        icon: "fa-fish",
        dates: "February 19 - March 20",
        element: "Water",
        quality: "Mutable",
        ruler: "Neptune",
        color: "#4682B4",
        traits: [
            "Compassionate and empathetic",
            "Artistic and intuitive",
            "Wisdom and imagination",
            "Gentle and kind",
            "Romantic and dreamy"
        ],
        message: "As a mystical Pisces, you bridge the material and spiritual worlds with your deep intuition and artistic sensitivity. Your compassion heals and inspires.",
        compatibility: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
        luckyNumbers: [3, 7, 12],
        luckyDay: "Thursday"
    }
];

// ===== HELPER FUNCTIONS =====

function getZodiacSign(month, day) {
    const date = new Date(2000, month - 1, day); // Year doesn't matter for zodiac
    const monthDay = (month * 100) + day;
    
    if (monthDay >= 321 && monthDay <= 419) return zodiacSigns[0];  // Aries
    if (monthDay >= 420 && monthDay <= 520) return zodiacSigns[1];  // Taurus
    if (monthDay >= 521 && monthDay <= 620) return zodiacSigns[2];  // Gemini
    if (monthDay >= 621 && monthDay <= 722) return zodiacSigns[3];  // Cancer
    if (monthDay >= 723 && monthDay <= 822) return zodiacSigns[4];  // Leo
    if (monthDay >= 823 && monthDay <= 922) return zodiacSigns[5];  // Virgo
    if (monthDay >= 923 && monthDay <= 1022) return zodiacSigns[6]; // Libra
    if (monthDay >= 1023 && monthDay <= 1121) return zodiacSigns[7]; // Scorpio
    if (monthDay >= 1122 && monthDay <= 1221) return zodiacSigns[8]; // Sagittarius
    if (monthDay >= 1222 || monthDay <= 119) return zodiacSigns[9];  // Capricorn
    if (monthDay >= 120 && monthDay <= 218) return zodiacSigns[10];  // Aquarius
    if (monthDay >= 219 && monthDay <= 320) return zodiacSigns[11];  // Pisces
    
    return zodiacSigns[0]; // Default to Aries
}

function getElementColor(element) {
    const colors = {
        'Fire': '#FF6B6B',
        'Earth': '#4CAF50',
        'Air': '#87CEEB',
        'Water': '#4682B4'
    };
    return colors[element] || '#CCCCCC';
}

// Export for use in other files
window.zodiacSigns = zodiacSigns;
window.getZodiacSign = getZodiacSign;
window.getElementColor = getElementColor;
