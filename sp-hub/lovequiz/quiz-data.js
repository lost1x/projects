// Love Language Quiz Data
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
                { text: "Coming home to find they've done something helpful around the house", type: "acts_of_service" },
                { text: "Finding a small surprise or thoughtful item they picked up for me", type: "receiving_gifts" },
                { text: "Having 30 minutes of uninterrupted conversation together", type: "quality_time" },
                { text: "Receiving a spontaneous hug, kiss, or back rub", type: "physical_touch" }
            ]
        },
        {
            id: 4,
            text: "When you're feeling disconnected from your partner, what would help you feel close again?",
            answers: [
                { text: "A sincere conversation where they express their feelings and listen to mine", type: "words_of_affirmation" },
                { text: "Them taking initiative to handle something I've been stressed about", type: "acts_of_service" },
                { text: "A meaningful gift that shows they understand what I value", type: "receiving_gifts" },
                { text: "Planning dedicated time together without distractions", type: "quality_time" },
                { text: "More physical affection and closeness throughout the day", type: "physical_touch" }
            ]
        },
        {
            id: 5,
            text: "What type of gesture from your partner stays with you longest?",
            answers: [
                { text: "Meaningful words of encouragement or appreciation", type: "words_of_affirmation" },
                { text: "When they handle a responsibility without me having to ask", type: "acts_of_service" },
                { text: "A gift that shows they really know and understand me", type: "receiving_gifts" },
                { text: "When they choose to spend their free time focused on me", type: "quality_time" },
                { text: "Unexpected moments of physical affection or intimacy", type: "physical_touch" }
            ]
        },
        {
            id: 6,
            text: "If your partner could only do one thing to show love this week, what would you want it to be?",
            answers: [
                { text: "Write me a heartfelt note explaining what I mean to them", type: "words_of_affirmation" },
                { text: "Take care of something on my to-do list without being asked", type: "acts_of_service" },
                { text: "Surprise me with something they know I've been wanting", type: "receiving_gifts" },
                { text: "Plan a special evening where we can talk and be together", type: "quality_time" },
                { text: "Be more physically affectionate throughout our daily interactions", type: "physical_touch" }
            ]
        },
        {
            id: 7,
            text: "When your partner apologizes for something, what makes it feel most genuine?",
            answers: [
                { text: "When they clearly explain what they did wrong and how they'll do better", type: "words_of_affirmation" },
                { text: "When they immediately take action to fix the problem or make it right", type: "acts_of_service" },
                { text: "When they offer a peace offering or gesture that shows they've thought about it", type: "receiving_gifts" },
                { text: "When they give me their full attention to talk through what happened", type: "quality_time" },
                { text: "When they offer physical comfort and closeness during the apology", type: "physical_touch" }
            ]
        },
        {
            id: 8,
            text: "What kind of support do you most appreciate when you're stressed or overwhelmed?",
            answers: [
                { text: "Verbal reassurance and words of encouragement", type: "words_of_affirmation" },
                { text: "Practical help with tasks and responsibilities", type: "acts_of_service" },
                { text: "A thoughtful gesture or comfort item to help me feel better", type: "receiving_gifts" },
                { text: "Uninterrupted time to talk through what's bothering me", type: "quality_time" },
                { text: "Physical comfort like hugs, back rubs, or just being close", type: "physical_touch" }
            ]
        },
        {
            id: 9,
            text: "Which scenario would make you feel most loved on your birthday?",
            answers: [
                { text: "A heartfelt speech or letter about what I mean to them", type: "words_of_affirmation" },
                { text: "They handle all the planning and details so I can just enjoy the day", type: "acts_of_service" },
                { text: "A carefully chosen gift that shows they really know me", type: "receiving_gifts" },
                { text: "A day planned around spending quality time together doing things I love", type: "quality_time" },
                { text: "Lots of physical affection and closeness throughout the celebration", type: "physical_touch" }
            ]
        },
        {
            id: 10,
            text: "When you think about feeling truly cherished, what comes to mind first?",
            answers: [
                { text: "Hearing specific things they love and appreciate about me", type: "words_of_affirmation" },
                { text: "Knowing they think about making my life easier in small ways", type: "acts_of_service" },
                { text: "Receiving unexpected tokens of their affection and thoughtfulness", type: "receiving_gifts" },
                { text: "Having their complete presence and attention when we're together", type: "quality_time" },
                { text: "Feeling physically connected through touch and closeness", type: "physical_touch" }
            ]
        },
        {
            id: 11,
            text: "What makes you feel most secure in your relationship?",
            answers: [
                { text: "Regular verbal affirmations of their love and commitment", type: "words_of_affirmation" },
                { text: "Seeing them consistently take action to support our life together", type: "acts_of_service" },
                { text: "Thoughtful gestures that show they're thinking of me even when we're apart", type: "receiving_gifts" },
                { text: "Knowing they prioritize spending meaningful time with me", type: "quality_time" },
                { text: "Regular physical affection and intimacy", type: "physical_touch" }
            ]
        },
        {
            id: 12,
            text: "If you were having a bad day, what would help you feel better most quickly?",
            answers: [
                { text: "Kind words and verbal comfort from my partner", type: "words_of_affirmation" },
                { text: "They take care of dinner, chores, or other responsibilities", type: "acts_of_service" },
                { text: "A small surprise or treat to brighten my mood", type: "receiving_gifts" },
                { text: "Time to decompress together without any agenda", type: "quality_time" },
                { text: "Physical comfort and affection", type: "physical_touch" }
            ]
        },
        {
            id: 13,
            text: "What aspect of your partner's love do you notice and appreciate most?",
            answers: [
                { text: "The encouraging and supportive things they say to me", type: "words_of_affirmation" },
                { text: "All the ways they help and support me practically", type: "acts_of_service" },
                { text: "The thoughtful surprises and gifts they give me", type: "receiving_gifts" },
                { text: "How they make time for me despite their busy schedule", type: "quality_time" },
                { text: "How naturally affectionate and physically loving they are", type: "physical_touch" }
            ]
        },
        {
            id: 14,
            text: "When you imagine the perfect romantic evening, what's most important?",
            answers: [
                { text: "Deep conversation where we share our feelings and dreams", type: "words_of_affirmation" },
                { text: "Everything is taken care of so we can both relax completely", type: "acts_of_service" },
                { text: "Thoughtful touches and surprises throughout the evening", type: "receiving_gifts" },
                { text: "Uninterrupted time together focused only on each other", type: "quality_time" },
                { text: "Lots of physical closeness, cuddling, and affection", type: "physical_touch" }
            ]
        },
        {
            id: 15,
            text: "What would make you feel most appreciated in your relationship?",
            answers: [
                { text: "Regular verbal recognition of my efforts and qualities", type: "words_of_affirmation" },
                { text: "My partner actively helping to lighten my load", type: "acts_of_service" },
                { text: "Thoughtful gestures that show they notice what matters to me", type: "receiving_gifts" },
                { text: "Knowing they choose to invest their time in our relationship", type: "quality_time" },
                { text: "Consistent physical affection and intimacy", type: "physical_touch" }
            ]
        }
    ],
    
    loveLanguages: {
        words_of_affirmation: {
            title: "Words of Affirmation",
            icon: "💬",
            description: "You feel most loved when your partner expresses their feelings through spoken or written words. Compliments, words of encouragement, verbal appreciation, and frequent 'I love you's make you feel secure and valued. Kind, encouraging words are what you crave most in a relationship.",
            tips: "Share your feelings openly, express appreciation regularly, and remember that your words have the power to build up or tear down your relationships."
        },
        acts_of_service: {
            title: "Acts of Service",
            icon: "🤝",
            description: "You feel most loved when your partner does thoughtful things for you. Whether it's making you coffee in the morning, handling a chore you dislike, or taking care of something on your to-do list, actions truly speak louder than words for you. You appreciate when love is expressed through helpful deeds.",
            tips: "Remember that actions speak louder than words for you. Look for ways to serve others and express appreciation when others serve you."
        },
        receiving_gifts: {
            title: "Receiving Gifts",
            icon: "🎁",
            description: "You feel most loved when your partner gives you thoughtful gifts. This isn't about materialism - it's about the thought, effort, and intention behind the gift. A meaningful gift shows that your partner was thinking of you and understands what brings you joy.",
            tips: "Focus on the thought behind gifts rather than their monetary value. Small, meaningful gestures can be just as powerful as grand ones."
        },
        quality_time: {
            title: "Quality Time",
            icon: "⏰",
            description: "You feel most loved when your partner gives you their full, undivided attention. This means putting away distractions, making eye contact, and being fully present. Whether it's a deep conversation or a fun activity together, what matters most is that you have your partner's complete focus.",
            tips: "Be fully present when spending time with loved ones. Put away distractions and give your complete attention to show you care."
        },
        physical_touch: {
            title: "Physical Touch",
            icon: "🤗",
            description: "You feel most loved through physical affection. Hugs, kisses, hand-holding, cuddling, and other forms of appropriate physical contact make you feel secure and loved. Physical touch is your emotional lifeline and helps you feel connected to your partner.",
            tips: "Physical touch is powerful for you. Be mindful of appropriate boundaries while expressing affection through gentle, caring touch."
        }
    }
};
