// ===== ASTROLOGY DATA =====

const zodiacSigns = [
    {
        name: "Aries",
        symbol: "♈",
        element: "Fire",
        quality: "Cardinal",
        ruler: "Mars",
        dates: "March 21 - April 19",
        traits: ["Courageous", "Confident", "Enthusiastic", "Impulsive"],
        description: "The first sign of the zodiac, representing new beginnings and pioneering spirit."
    },
    {
        name: "Taurus",
        symbol: "♉",
        element: "Earth",
        quality: "Fixed",
        ruler: "Venus",
        dates: "April 20 - May 20",
        traits: ["Reliable", "Patient", "Practical", "Stubborn"],
        description: "An earth sign known for stability, sensuality, and determination."
    },
    {
        name: "Gemini",
        symbol: "♊",
        element: "Air",
        quality: "Mutable",
        ruler: "Mercury",
        dates: "May 21 - June 20",
        traits: ["Adaptable", "Curious", "Communicative", "Nervous"],
        description: "An air sign representing duality, communication, and intellectual curiosity."
    },
    {
        name: "Cancer",
        symbol: "♋",
        element: "Water",
        quality: "Cardinal",
        ruler: "Moon",
        dates: "June 21 - July 22",
        traits: ["Intuitive", "Emotional", "Protective", "Moody"],
        description: "A water sign representing nurturing, emotions, and home life."
    },
    {
        name: "Leo",
        symbol: "♌",
        element: "Fire",
        quality: "Fixed",
        ruler: "Sun",
        dates: "July 23 - August 22",
        traits: ["Creative", "Generous", "Confident", "Arrogant"],
        description: "A fire sign representing creativity, leadership, and self-expression."
    },
    {
        name: "Virgo",
        symbol: "♍",
        element: "Earth",
        quality: "Mutable",
        ruler: "Mercury",
        dates: "August 23 - September 22",
        traits: ["Analytical", "Practical", "Helpful", "Critical"],
        description: "An earth sign representing service, analysis, and perfectionism."
    },
    {
        name: "Libra",
        symbol: "♎",
        element: "Air",
        quality: "Cardinal",
        ruler: "Venus",
        dates: "September 23 - October 22",
        traits: ["Diplomatic", "Fair", "Social", "Indecisive"],
        description: "An air sign representing balance, relationships, and justice."
    },
    {
        name: "Scorpio",
        symbol: "♏",
        element: "Water",
        quality: "Fixed",
        ruler: "Pluto",
        dates: "October 23 - November 21",
        traits: ["Intense", "Passionate", "Secretive", "Jealous"],
        description: "A water sign representing transformation, depth, and power."
    },
    {
        name: "Sagittarius",
        symbol: "♐",
        element: "Fire",
        quality: "Mutable",
        ruler: "Jupiter",
        dates: "November 22 - December 21",
        traits: ["Optimistic", "Adventurous", "Philosophical", "Restless"],
        description: "A fire sign representing exploration, freedom, and higher learning."
    },
    {
        name: "Capricorn",
        symbol: "♑",
        element: "Earth",
        quality: "Cardinal",
        ruler: "Saturn",
        dates: "December 22 - January 19",
        traits: ["Ambitious", "Disciplined", "Responsible", "Pessimistic"],
        description: "An earth sign representing structure, achievement, and responsibility."
    },
    {
        name: "Aquarius",
        symbol: "♒",
        element: "Air",
        quality: "Fixed",
        ruler: "Uranus",
        dates: "January 20 - February 18",
        traits: ["Innovative", "Independent", "Humanitarian", "Detached"],
        description: "An air sign representing innovation, community, and progressive thinking."
    },
    {
        name: "Pisces",
        symbol: "♓",
        element: "Water",
        quality: "Mutable",
        ruler: "Neptune",
        dates: "February 19 - March 20",
        traits: ["Compassionate", "Artistic", "Intuitive", "Escapist"],
        description: "A water sign representing spirituality, empathy, and imagination."
    }
];

const planets = [
    {
        name: "Sun",
        symbol: "☉",
        type: "star",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Core identity, ego, life purpose"
    },
    {
        name: "Moon",
        symbol: "☽",
        type: "satellite",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Emotions, instincts, subconscious"
    },
    {
        name: "Mercury",
        symbol: "☿",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Communication, thinking, learning"
    },
    {
        name: "Venus",
        symbol: "♀",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Love, values, relationships"
    },
    {
        name: "Mars",
        symbol: "♂",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Action, desire, aggression"
    },
    {
        name: "Jupiter",
        symbol: "♃",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Expansion, luck, philosophy"
    },
    {
        name: "Saturn",
        symbol: "♄",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Structure, discipline, limitations"
    },
    {
        name: "Uranus",
        symbol: "♅",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Innovation, rebellion, change"
    },
    {
        name: "Neptune",
        symbol: "♆",
        type: "planet",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Spirituality, dreams, illusion"
    },
    {
        name: "Pluto",
        symbol: "♇",
        type: "dwarf",
        sign: null,
        degree: 0,
        house: 1,
        meaning: "Transformation, power, regeneration"
    }
];

const houses = [
    {
        number: 1,
        name: "House of Self",
        sign: null,
        meaning: "Identity, appearance, first impressions"
    },
    {
        number: 2,
        name: "House of Values",
        sign: null,
        meaning: "Money, possessions, self-worth"
    },
    {
        number: 3,
        name: "House of Communication",
        sign: null,
        meaning: "Thinking, learning, siblings"
    },
    {
        number: 4,
        name: "House of Home",
        sign: null,
        meaning: "Family, roots, private life"
    },
    {
        number: 5,
        name: "House of Creativity",
        sign: null,
        meaning: "Romance, children, self-expression"
    },
    {
        number: 6,
        name: "House of Service",
        sign: null,
        meaning: "Work, health, daily routines"
    },
    {
        number: 7,
        name: "House of Partnership",
        sign: null,
        meaning: "Relationships, marriage, contracts"
    },
    {
        number: 8,
        name: "House of Transformation",
        sign: null,
        meaning: "Death, taxes, shared resources"
    },
    {
        number: 9,
        name: "House of Philosophy",
        sign: null,
        meaning: "Travel, education, beliefs"
    },
    {
        number: 10,
        name: "House of Career",
        sign: null,
        meaning: "Public life, reputation, achievement"
    },
    {
        number: 11,
        name: "House of Friends",
        sign: null,
        meaning: "Social groups, hopes, dreams"
    },
    {
        number: 12,
        name: "House of Subconscious",
        sign: null,
        meaning: "Secrets, spirituality, endings"
    }
];

const aspects = [
    {
        name: "Conjunction",
        angle: 0,
        orb: 8,
        type: "hard",
        meaning: "Fusion of energies, new beginnings"
    },
    {
        name: "Sextile",
        angle: 60,
        orb: 6,
        type: "soft",
        meaning: "Harmonious opportunities, communication"
    },
    {
        name: "Square",
        angle: 90,
        orb: 8,
        type: "hard",
        meaning: "Challenges, tension, growth opportunities"
    },
    {
        name: "Trine",
        angle: 120,
        orb: 8,
        type: "soft",
        meaning: "Flow, ease, natural talent"
    },
    {
        name: "Opposition",
        angle: 180,
        orb: 8,
        type: "hard",
        meaning: "Balance, relationships, awareness"
    }
];

const timezones = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" }
];

const majorCities = [
    { name: "New York, USA", lat: 40.7128, lon: -74.0060, timezone: "America/New_York" },
    { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles" },
    { name: "Chicago, USA", lat: 41.8781, lon: -87.6298, timezone: "America/Chicago" },
    { name: "London, UK", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
    { name: "Paris, France", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris" },
    { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
    { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
    { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, timezone: "Asia/Kolkata" },
    { name: "Beijing, China", lat: 39.9042, lon: 116.4074, timezone: "Asia/Shanghai" },
    { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow" }
];

// Chart calculation functions
class AstrologyCalculator {
    static getZodiacSign(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0]; // Aries
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1]; // Taurus
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2]; // Gemini
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3]; // Cancer
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4]; // Leo
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5]; // Virgo
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6]; // Libra
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7]; // Scorpio
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8]; // Sagittarius
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9]; // Capricorn
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10]; // Aquarius
        return zodiacSigns[11]; // Pisces
    }
    
    static calculateHousePositions(date, location) {
        // Simplified house calculation - in real implementation would use complex astronomical calculations
        const houses = [...houses];
        const ascendantSign = this.getZodiacSign(date);
        
        houses.forEach((house, index) => {
            house.sign = zodiacSigns[(zodiacSigns.indexOf(ascendantSign) + index) % 12];
        });
        
        return houses;
    }
    
    static calculatePlanetaryPositions(date, location) {
        // Simplified planetary calculation - in real implementation would use ephemeris data
        const positions = [...planets];
        const baseDegree = (date.getTime() / 1000) % 360; // Simplified calculation
        
        positions.forEach((planet, index) => {
            planet.degree = (baseDegree + index * 30) % 360;
            planet.sign = zodiacSigns[Math.floor(planet.degree / 30)];
            planet.house = Math.floor(planet.degree / 30) + 1;
        });
        
        return positions;
    }
    
    static calculateAspects(planets) {
        const foundAspects = [];
        
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                const planet1 = planets[i];
                const planet2 = planets[j];
                const angle = Math.abs(planet1.degree - planet2.degree);
                
                aspects.forEach(aspect => {
                    const diff = Math.abs(angle - aspect.angle);
                    if (diff <= aspect.orb || diff >= 360 - aspect.orb) {
                        foundAspects.push({
                            planet1: planet1.name,
                            planet2: planet2.name,
                            aspect: aspect.name,
                            angle: angle,
                            type: aspect.type,
                            meaning: aspect.meaning
                        });
                    }
                });
            }
        }
        
        return foundAspects;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        zodiacSigns,
        planets,
        houses,
        aspects,
        timezones,
        majorCities,
        AstrologyCalculator
    };
}
