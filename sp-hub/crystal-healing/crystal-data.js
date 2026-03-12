// ===== CRYSTAL HEALING DATA =====

const crystals = [
    {
        name: "Clear Quartz",
        chakra: "Crown",
        element: "All",
        properties: ["Amplification", "Clarity", "Healing", "Programmability"],
        uses: ["Energy amplification", "Meditation", "Healing", "Programming intentions"],
        color: "Clear",
        hardness: 7,
        description: "The master healer crystal that amplifies energy and thought."
    },
    {
        name: "Amethyst",
        chakra: "Crown, Third Eye",
        element: "Air",
        properties: ["Intuition", "Spiritual growth", "Calming", "Protection"],
        uses: ["Meditation", "Stress relief", "Intuitive development", "Addiction recovery"],
        color: "Purple",
        hardness: 7,
        description: "A powerful protective stone that enhances spiritual awareness and intuition."
    },
    {
        name: "Rose Quartz",
        chakra: "Heart",
        element: "Earth",
        properties: ["Love", "Compassion", "Emotional healing", "Self-esteem"],
        uses: ["Heart healing", "Self-love", "Relationship harmony", "Emotional balance"],
        color: "Pink",
        hardness: 7,
        description: "The stone of unconditional love and infinite peace."
    },
    {
        name: "Citrine",
        chakra: "Solar Plexus",
        element: "Fire",
        properties: ["Abundance", "Success", "Joy", "Energy"],
        uses: ["Manifestation", "Prosperity", "Confidence", "Creativity"],
        color: "Yellow",
        hardness: 7,
        description: "The success stone that attracts abundance and prosperity."
    },
    {
        name: "Black Tourmaline",
        chakra: "Root",
        element: "Earth",
        properties: ["Protection", "Grounding", "Purification", "EMF protection"],
        uses: ["Psychic protection", "Negative energy clearing", "Grounding", "EMF shielding"],
        color: "Black",
        hardness: 7,
        description: "The most powerful protective stone that absorbs negative energy."
    },
    {
        name: "Selenite",
        chakra: "Crown",
        element: "Air",
        properties: ["Angel communication", "Clarity", "Divine connection", "Energy clearing"],
        uses: ["Meditation", "Angel communication", "Space clearing", "Crown chakra"],
        color: "White",
        hardness: 2,
        description: "A high-vibration crystal that connects to angelic realms."
    },
    {
        name: "Labradorite",
        chakra: "Third Eye, Crown",
        element: "Air",
        properties: ["Transformation", "Intuition", "Magic", "Protection"],
        uses: ["Spiritual awakening", "Psychic abilities", "Protection", "Auric field"],
        color: "Green/Gold flash",
        hardness: 6,
        description: "The stone of magic and transformation that awakens psychic abilities."
    },
    {
        name: "Hematite",
        chakra: "Root",
        element: "Earth",
        properties: ["Grounding", "Protection", "Focus", "Courage"],
        uses: ["Grounding", "Protection", "Blood health", "Confidence"],
        color: "Metallic gray",
        hardness: 6,
        description: "A grounding stone that absorbs negative energy and promotes courage."
    },
    {
        name: "Fluorite",
        chakra: "All",
        element: "Air",
        properties: ["Focus", "Clarity", "Organization", "Protection"],
        uses: ["Mental clarity", "Focus", "Protection", "Chakra balancing"],
        color: "Various (Green, Purple, Blue, Yellow)",
        hardness: 4,
        description: "The focus stone that brings order to chaos and enhances mental clarity."
    },
    {
        name: "Black Obsidian",
        chakra: "Root",
        element: "Earth",
        properties: ["Protection", "Truth", "Grounding", "Shadow work"],
        uses: ["Protection", "Truth revealing", "Shadow work", "Grounding"],
        color: "Black",
        hardness: 5,
        description: "A powerful protection stone that reveals truth and absorbs negativity."
    },
    {
        name: "Carnelian",
        chakra: "Sacral, Solar Plexus",
        element: "Fire",
        properties: ["Creativity", "Courage", "Motivation", "Vitality"],
        uses: ["Creativity", "Motivation", "Confidence", "Physical energy"],
        color: "Orange/Red",
        hardness: 7,
        description: "The stone of creativity and courage that stimulates motivation."
    },
    {
        name: "Lapis Lazuli",
        chakra: "Third Eye, Throat",
        element: "Air",
        properties: ["Wisdom", "Truth", "Communication", "Intuition"],
        uses: ["Wisdom", "Truth", "Communication", "Psychic abilities"],
        color: "Deep blue with gold flecks",
        hardness: 5,
        description: "The wisdom stone that enhances intellectual ability and truth."
    },
    {
        name: "Green Aventurine",
        chakra: "Heart",
        element: "Earth",
        properties: ["Luck", "Opportunity", "Heart healing", "Prosperity"],
        uses: ["Luck", "Opportunity", "Heart healing", "Prosperity"],
        color: "Green",
        hardness: 7,
        description: "The luck stone that attracts opportunity and prosperity."
    },
    {
        name: "Blue Lace Agate",
        chakra: "Throat",
        element: "Water",
        properties: ["Communication", "Calming", "Expression", "Clarity"],
        uses: ["Communication", "Calming", "Expression", "Throat chakra"],
        color: "Blue with lace patterns",
        hardness: 7,
        description: "A calming stone that enhances communication and expression."
    },
    {
        name: "Smoky Quartz",
        chakra: "Root, Solar Plexus",
        element: "Earth",
        properties: ["Grounding", "Protection", "Transformation", "Stress relief"],
        uses: ["Grounding", "Protection", "Stress relief", "Transformation"],
        color: "Smoky brown/gray",
        hardness: 7,
        description: "A grounding stone that transforms negative energy into positive."
    },
    {
        name: "Moonstone",
        chakra: "Crown, Sacral",
        element: "Water",
        properties: ["Intuition", "Feminine energy", "New beginnings", "Emotional balance"],
        uses: ["Intuition", "Feminine energy", "New beginnings", "Emotional balance"],
        color: "White with blue sheen",
        hardness: 6,
        description: "The stone of new beginnings that enhances intuition and feminine energy."
    },
    {
        name: "Sunstone",
        chakra: "Solar Plexus, Sacral",
        element: "Fire",
        properties: ["Joy", "Leadership", "Personal power", "Abundance"],
        uses: ["Joy", "Leadership", "Personal power", "Abundance"],
        color: "Orange/Red with sparkles",
        hardness: 7,
        description: "The leadership stone that brings joy and personal power."
    },
    {
        name: "Tiger's Eye",
        chakra: "Solar Plexus",
        element: "Earth",
        properties: ["Courage", "Confidence", "Protection", "Mental clarity"],
        uses: ["Courage", "Confidence", "Protection", "Mental clarity"],
        color: "Golden brown bands",
        hardness: 7,
        description: "The courage stone that brings confidence and protection."
    },
    {
        name: "Red Jasper",
        chakra: "Root",
        element: "Earth",
        properties: ["Grounding", "Stamina", "Strength", "Passion"],
        uses: ["Grounding", "Physical stamina", "Passion", "Root chakra"],
        color: "Red with patterns",
        hardness: 7,
        description: "A grounding stone that enhances physical stamina and passion."
    }
];

const chakras = [
    {
        name: "Root",
        sanskrit: "Muladhara",
        color: "Red",
        element: "Earth",
        location: "Base of spine",
        issues: ["Survival", "Grounding", "Security", "Fear"],
        crystals: ["Red Jasper", "Black Tourmaline", "Hematite", "Smoky Quartz", "Black Obsidian"],
        affirmation: "I am grounded, secure, and safe."
    },
    {
        name: "Sacral",
        sanskrit: "Svadhisthana",
        color: "Orange",
        element: "Water",
        location: "Below navel",
        issues: ["Creativity", "Sexuality", "Emotions", "Pleasure"],
        crystals: ["Carnelian", "Moonstone", "Orange Calcite", "Sunstone"],
        affirmation: "I embrace my creativity and express my emotions freely."
    },
    {
        name: "Solar Plexus",
        sanskrit: "Manipura",
        color: "Yellow",
        element: "Fire",
        location: "Above navel",
        issues: ["Personal power", "Confidence", "Self-esteem", "Control"],
        crystals: ["Citrine", "Tiger's Eye", "Yellow Jasper", "Pyrite"],
        affirmation: "I am confident, powerful, and worthy of success."
    },
    {
        name: "Heart",
        sanskrit: "Anahata",
        color: "Green",
        element: "Air",
        location: "Center of chest",
        issues: ["Love", "Compassion", "Relationships", "Forgiveness"],
        crystals: ["Rose Quartz", "Green Aventurine", "Emerald", "Rhodonite"],
        affirmation: "I give and receive love freely and unconditionally."
    },
    {
        name: "Throat",
        sanskrit: "Vishuddha",
        color: "Blue",
        element: "Sound",
        location: "Throat",
        issues: ["Communication", "Expression", "Truth", "Creativity"],
        crystals: ["Blue Lace Agate", "Lapis Lazuli", "Aquamarine", "Sodalite"],
        affirmation: "I speak my truth with clarity and confidence."
    },
    {
        name: "Third Eye",
        sanskrit: "Ajna",
        color: "Indigo",
        element: "Light",
        location: "Between eyebrows",
        issues: ["Intuition", "Insight", "Imagination", "Awareness"],
        crystals: ["Amethyst", "Fluorite", "Labradorite", "Sodalite"],
        affirmation: "I trust my intuition and see with clarity."
    },
    {
        name: "Crown",
        sanskrit: "Sahasrara",
        color: "Violet",
        element: "Thought",
        location: "Top of head",
        issues: ["Spirituality", "Connection", "Purpose", "Enlightenment"],
        crystals: ["Clear Quartz", "Selenite", "Amethyst", "White Howlite"],
        affirmation: "I am connected to divine wisdom and universal consciousness."
    }
];

const healingMethods = [
    {
        name: "Meditation",
        description: "Hold crystal during meditation or place on corresponding chakra",
        duration: "10-30 minutes",
        bestFor: ["Spiritual growth", "Stress relief", "Chakra balancing"]
    },
    {
        name: "Crystal Grid",
        description: "Arrange crystals in sacred geometry patterns for amplified energy",
        duration: "24 hours to several days",
        bestFor: ["Manifestation", "Space clearing", "Energy amplification"]
    },
    {
        name: "Wearing",
        description: "Wear as jewelry or carry in pocket/purse",
        duration: "Continuous",
        bestFor: ["Daily protection", "Emotional support", "Energy maintenance"]
    },
    {
        name: "Elixir",
        description: "Place crystal in water (research safety first) for energized drinking water",
        duration: "2-24 hours",
        bestFor: ["Internal healing", "Emotional balance", "Energy infusion"]
    },
    {
        name: "Placement",
        description: "Place in home, office, or sacred space",
        duration: "Continuous",
        bestFor: ["Space clearing", "Environmental harmony", "Protection"]
    }
];

// Crystal recommendation engine
class CrystalRecommender {
    static getCrystalsByCategory(category) {
        const categoryMap = {
            emotional: ["Rose Quartz", "Amethyst", "Moonstone", "Blue Lace Agate"],
            physical: ["Clear Quartz", "Carnelian", "Red Jasper", "Green Aventurine"],
            spiritual: ["Amethyst", "Selenite", "Labradorite", "Lapis Lazuli"],
            protection: ["Black Tourmaline", "Black Obsidian", "Fluorite", "Hematite"]
        };
        
        return categoryMap[category] || crystals;
    }
    
    static getCrystalsByChakra(chakraName) {
        const chakra = chakras.find(c => c.name === chakraName);
        return chakra ? chakra.crystals : [];
    }
    
    static searchCrystals(query) {
        const searchTerm = query.toLowerCase();
        return crystals.filter(crystal => 
            crystal.name.toLowerCase().includes(searchTerm) ||
            crystal.properties.some(prop => prop.toLowerCase().includes(searchTerm)) ||
            crystal.uses.some(use => use.toLowerCase().includes(searchTerm))
        );
    }
    
    static getPersonalizedRecommendations(answers) {
        const recommendations = [];
        
        // Analyze answers and recommend based on needs
        if (answers.stress || answers.anxiety) {
            recommendations.push(
                crystals.find(c => c.name === "Amethyst"),
                crystals.find(c => c.name === "Blue Lace Agate")
            );
        }
        
        if (answers.lowEnergy || answers.fatigue) {
            recommendations.push(
                crystals.find(c => c.name === "Carnelian"),
                crystals.find(c => c.name === "Sunstone")
            );
        }
        
        if (answers.relationshipIssues || answers.heartbreak) {
            recommendations.push(
                crystals.find(c => c.name === "Rose Quartz"),
                crystals.find(c => c.name === "Green Aventurine")
            );
        }
        
        if (answers.needsProtection || answers.negativeEnergy) {
            recommendations.push(
                crystals.find(c => c.name === "Black Tourmaline"),
                crystals.find(c => c.name === "Black Obsidian")
            );
        }
        
        if (answers.spiritualGrowth || answers.intuition) {
            recommendations.push(
                crystals.find(c => c.name === "Selenite"),
                crystals.find(c => c.name === "Labradorite")
            );
        }
        
        // Remove duplicates and return
        return [...new Set(recommendations)].slice(0, 5);
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        crystals,
        chakras,
        healingMethods,
        CrystalRecommender
    };
}
