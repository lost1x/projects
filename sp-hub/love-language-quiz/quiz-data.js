// ===== LOVE LANGUAGE QUIZ DATA =====

const quizData = {
    questions: [
        {
            id: 1,
            text: "When your partner does something nice for you without being asked, how do you typically react?",
            answers: [
                { text: "I feel loved when they tell me why they did it and how much I mean to them", type: "words_of_affirmation" },
                { text: "I appreciate the thoughtful action itself more than any explanation", type: "acts_of_service" },
                { text: "I'm touched if it's something I mentioned wanting or needing", type: "receiving_gifts" },
                { text: "I love it most when they stay and spend time with me afterward", type: "quality_time" },
                { text: "I feel closest when they give me a hug or physical affection while doing it", type: "physical_touch" }
            ]
        },
        {
            id: 2,
            text: "What makes you feel most connected to your partner during a difficult time?",
            answers: [
                { text: "When they tell me they believe in me and express confidence in our relationship", type: "words_of_affirmation" },
                { text: "When they take care of practical things so I don't have to worry about them", type: "acts_of_service" },
                { text: "When they bring me something thoughtful that shows they were thinking of me", type: "receiving_gifts" },
                { text: "When they sit with me and give me their full, undivided attention", type: "quality_time" },
                { text: "When they hold me close or offer comforting physical presence", type: "physical_touch" }
            ]
        },
        {
            id: 3,
            text: "If you had to choose, which would mean the most to you on a typical day?",
            answers: [
                { text: "Hearing 'I love you' or receiving a heartfelt compliment", type: "words_of_affirmation" },
                { text: "Having them help with chores or tasks without being asked", type: "acts_of_service" },
                { text: "Receiving a small, unexpected gift or token of affection", type: "receiving_gifts" },
                { text: "Having their complete attention during a conversation or activity", type: "quality_time" },
                { text: "A spontaneous hug, kiss, or other physical affection", type: "physical_touch" }
            ]
        },
        {
            id: 4,
            text: "How do you prefer to celebrate special occasions like anniversaries?",
            answers: [
                { text: "Through heartfelt cards, letters, or verbal expressions of love", type: "words_of_affirmation" },
                { text: "When they plan everything and handle all the arrangements", type: "acts_of_service" },
                { text: "With meaningful, well-thought-out gifts that show they know me", type: "receiving_gifts" },
                { text: "By spending uninterrupted, quality time together doing something special", type: "quality_time" },
                { text: "Through physical intimacy and affection throughout the day", type: "physical_touch" }
            ]
        },
        {
            id: 5,
            text: "What hurts you most when your partner is upset with you?",
            answers: [
                { text: "When they say hurtful things or give me the silent treatment", type: "words_of_affirmation" },
                { text: "When they stop helping me or doing things for me", type: "acts_of_service" },
                { text: "When they forget important dates or don't acknowledge special moments", type: "receiving_gifts" },
                { text: "When they're too busy to spend time with me or seem distracted", type: "quality_time" },
                { text: "When they withdraw physically or avoid touching me", type: "physical_touch" }
            ]
        },
        {
            id: 6,
            text: "How do you typically show your partner that you love them?",
            answers: [
                { text: "I tell them how much they mean to me and give them compliments", type: "words_of_affirmation" },
                { text: "I do things for them that make their life easier or better", type: "acts_of_service" },
                { text: "I buy them thoughtful gifts or surprises that show I care", type: "receiving_gifts" },
                { text: "I make sure we spend quality time together without distractions", type: "quality_time" },
                { text: "I'm very physically affectionate - hugs, kisses, holding hands", type: "physical_touch" }
            ]
        },
        {
            id: 7,
            text: "What makes you feel most appreciated in your relationship?",
            answers: [
                { text: "When they verbally acknowledge my efforts and express gratitude", type: "words_of_affirmation" },
                { text: "When they notice and appreciate the things I do for them", type: "acts_of_service" },
                { text: "When they remember special occasions and give meaningful gifts", type: "receiving_gifts" },
                { text: "When they prioritize spending time with me over other activities", type: "quality_time" },
                { text: "When they initiate physical affection and intimacy", type: "physical_touch" }
            ]
        },
        {
            id: 8,
            text: "How do you prefer to receive apologies?",
            answers: [
                { text: "Through sincere verbal apologies and explanations", type: "words_of_affirmation" },
                { text: "When they change their behavior and make things right", type: "acts_of_service" },
                { text: "When they bring me something as a peace offering", type: "receiving_gifts" },
                { text: "When they sit down and talk through everything with me", type: "quality_time" },
                { text: "When they give me a hug and show physical affection", type: "physical_touch" }
            ]
        },
        {
            id: 9,
            text: "What's your ideal way to spend a weekend together?",
            answers: [
                { text: "Having deep conversations and sharing our feelings", type: "words_of_affirmation" },
                { text: "Working on projects together or accomplishing something meaningful", type: "acts_of_service" },
                { text: "Going shopping for things for each other or our home", type: "receiving_gifts" },
                { text: "Uninterrupted time together without phones or distractions", type: "quality_time" },
                { text: "Lots of physical affection, cuddling, and intimacy", type: "physical_touch" }
            ]
        },
        {
            id: 10,
            text: "How do you feel when your partner is busy or distracted?",
            answers: [
                { text: "I miss hearing their voice and words of affirmation", type: "words_of_affirmation" },
                { text: "I wish they would make time to help with things", type: "acts_of_service" },
                { text: "I wish they'd send a text or small gift to show they're thinking of me", type: "receiving_gifts" },
                { text: "I miss having their full attention and presence", type: "quality_time" },
                { text: "I miss their physical touch and affection", type: "physical_touch" }
            ]
        },
        {
            id: 11,
            text: "What makes you feel most secure in your relationship?",
            answers: [
                { text: "Hearing consistent words of love and commitment", type: "words_of_affirmation" },
                { text: "Knowing they'll always be there to help and support me", type: "acts_of_service" },
                { text: "Receiving regular tokens of their love and thoughtfulness", type: "receiving_gifts" },
                { text: "Having dedicated time together that's protected from interruptions", type: "quality_time" },
                { text: "Regular physical affection and intimate connection", type: "physical_touch" }
            ]
        },
        {
            id: 12,
            text: "How do you prefer to resolve conflicts?",
            answers: [
                { text: "Through open, honest communication and verbal reassurance", type: "words_of_affirmation" },
                { text: "By taking action to fix the problem and make things better", type: "acts_of_service" },
                { text: "Exchanging thoughtful gifts or tokens of reconciliation", type: "receiving_gifts" },
                { text: "Sitting down together to talk and reconnect", type: "quality_time" },
                { text: "Physical closeness and affection to restore connection", type: "physical_touch" }
            ]
        },
        {
            id: 13,
            text: "What's your favorite way to be surprised?",
            answers: [
                { text: "Surprise notes, letters, or expressions of love", type: "words_of_affirmation" },
                { text: "When they surprise me by doing something I needed done", type: "acts_of_service" },
                { text: "Unexpected gifts that show they really know me", type: "receiving_gifts" },
                { text: "Surprise dates or activities planned just for us", type: "quality_time" },
                { text: "Surprise hugs, kisses, or other physical affection", type: "physical_touch" }
            ]
        },
        {
            id: 14,
            text: "How do you show support when your partner is stressed?",
            answers: [
                { text: "I offer encouraging words and verbal support", type: "words_of_affirmation" },
                { text: "I take on extra responsibilities to lighten their load", type: "acts_of_service" },
                { text: "I bring them something comforting or their favorite treat", type: "receiving_gifts" },
                { text: "I make time to listen and be present with them", type: "quality_time" },
                { text: "I offer physical comfort through hugs and touch", type: "physical_touch" }
            ]
        },
        {
            id: 15,
            text: "What's most important for maintaining long-term relationship happiness?",
            answers: [
                { text: "Regular verbal expressions of love and appreciation", type: "words_of_affirmation" },
                { text: "Continuously serving and supporting each other's needs", type: "acts_of_service" },
                { text: "Ongoing thoughtful gestures and gift-giving", type: "receiving_gifts" },
                { text: "Consistent quality time together without distractions", type: "quality_time" },
                { text: "Maintaining physical intimacy and affection", type: "physical_touch" }
            ]
        }
    ]
};

const loveLanguages = {
    words_of_affirmation: {
        name: "Words of Affirmation",
        icon: "fas fa-comment",
        description: "You feel most loved when you hear verbal expressions of love, appreciation, and encouragement.",
        characteristics: [
            "Values verbal expressions of love",
            "Appreciates compliments and praise",
            "Needs to hear 'I love you' regularly",
            "Values written notes and messages",
            "Appreciates verbal reassurance"
        ],
        tips: [
            "Say 'I love you' often and mean it",
            "Give specific compliments",
            "Write love notes or send thoughtful texts",
            "Express appreciation for small things",
            "Use words to encourage and support"
        ]
    },
    acts_of_service: {
        name: "Acts of Service",
        icon: "fas fa-hands-helping",
        description: "You feel most loved when your partner does helpful things for you without being asked.",
        characteristics: [
            "Values actions over words",
            "Appreciates practical help",
            "Notices when things are done for them",
            "Values thoughtfulness in daily tasks",
            "Feels loved through helpful gestures"
        ],
        tips: [
            "Do helpful things without being asked",
            "Take care of tasks they dislike",
            "Anticipate their needs",
            "Help reduce their stress",
            "Show love through practical actions"
        ]
    },
    receiving_gifts: {
        name: "Receiving Gifts",
        icon: "fas fa-gift",
        description: "You feel most loved when you receive thoughtful gifts that show your partner was thinking of you.",
        characteristics: [
            "Values thoughtfulness and effort",
            "Appreciates meaningful presents",
            "Notices the thought behind gifts",
            "Values visual symbols of love",
            "Keeps sentimental items"
        ],
        tips: [
            "Give thoughtful, personal gifts",
            "Remember special occasions",
            "Give small tokens of affection",
            "Pay attention to their preferences",
            "Make gifts meaningful and personal"
        ]
    },
    quality_time: {
        name: "Quality Time",
        icon: "fas fa-clock",
        description: "You feel most loved when you have your partner's undivided attention and focused time together.",
        characteristics: [
            "Values undivided attention",
            "Appreciates focused conversations",
            "Dislikes distractions and interruptions",
            "Values shared experiences",
            "Needs regular dedicated time"
        ],
        tips: [
            "Put away phones during time together",
            "Plan regular date nights",
            "Give your full attention",
            "Create meaningful shared experiences",
            "Be present and engaged"
        ]
    },
    physical_touch: {
        name: "Physical Touch",
        icon: "fas fa-hand-holding-heart",
        description: "You feel most loved through physical touch, hugs, and affectionate contact.",
        characteristics: [
            "Values physical affection",
            "Feels connected through touch",
            "Appreciates spontaneous affection",
            "Needs regular physical contact",
            "Values intimacy and closeness"
        ],
        tips: [
            "Offer hugs and physical affection",
            "Hold hands when walking together",
            "Be physically present and close",
            "Offer comforting touch during stress",
            "Maintain physical intimacy"
        ]
    }
};

// Export for use in main script
window.quizData = quizData;
window.loveLanguages = loveLanguages;
