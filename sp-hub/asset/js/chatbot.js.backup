// Enhanced Chatbot with preset questions and improved responses
const Chatbot = {
    api_url: 'asset/php',
    
    // Preset questions for guided conversations
    presetQuestions: [
        "What does my future hold?",
        "Will I find love soon?",
        "What is my life purpose?",
        "Am I on the right path?",
        "What challenges will I face?",
        "Should I take this opportunity?",
        "What does my zodiac sign say about me?",
        "How can I improve my relationships?",
        "What career path should I choose?",
        "What message does the universe have for me?"
    ],

    init() {
        this.chatContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.errorContainer = document.getElementById('chatbotError');
        this.currentQuestionIndex = 0;
        this.conversationContext = [];

        if (!this.chatContainer || !this.input || !this.sendButton) return;

        this.sendButton.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleSend();
            }
        });

        // Start with a preset question
        this.addPresetQuestionButtons();
    },

    addPresetQuestionButtons() {
        const questionsHtml = this.presetQuestions.map((question, index) => 
            `<button class="preset-question-btn" onclick="Chatbot.selectPresetQuestion(${index})">${question}</button>`
        ).join('');
        
        this.addMessage('system', 
            `<div class="preset-questions">
                <p class="preset-intro">Choose a question to begin your oracle session:</p>
                <div class="preset-buttons">${questionsHtml}</div>
            </div>`
        );
    },

    selectPresetQuestion(index) {
        const question = this.presetQuestions[index];
        this.input.value = question;
        this.currentQuestionIndex = index;
        
        // Remove preset buttons
        const presetButtons = this.chatContainer.querySelector('.preset-questions');
        if (presetButtons) {
            presetButtons.remove();
        }
        
        // Auto-send the selected question
        this.handleSend();
    },

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;
        
        // Add user message to conversation context
        this.conversationContext.push({ role: 'user', message: text });
        
        this.addMessage('user', text);
        this.input.value = '';
        this.setLoading(true);

        try {
            const response = await fetch(`${this.api_url}/chatbot.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(Auth.token ? { Authorization: `Bearer ${Auth.token}` } : {})
                },
                body: JSON.stringify({ 
                    prompt: text,
                    context: this.conversationContext.slice(-5) // Send last 5 messages for context
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.details || 'Chat request failed');
            }

            const reply = data.response || 'The oracle is contemplating your question...';
            
            // Add oracle response to conversation context
            this.conversationContext.push({ role: 'oracle', message: reply });
            
            this.addMessage('oracle', reply);
        } catch (err) {
            this.addMessage('oracle', 'Sorry, I could not connect to the oracle right now.');
            console.error('Chatbot error:', err);
        } finally {
            this.setLoading(false);
        }
    },

    addMessage(role, text) {
        if (!this.chatContainer) return;
        const msg = document.createElement('div');
        msg.className = `chatbot-message ${role}`;
        msg.textContent = text;
        this.chatContainer.appendChild(msg);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    },

    setLoading(loading) {
        if (!this.sendButton) return;
        this.sendButton.disabled = loading;
        this.sendButton.textContent = loading ? 'Thinking…' : 'Send';
    }
};

// Email subscription helper
async function subscribeToHoroscope(email) {
    try {
        const response = await fetch(`${Chatbot.api_url}/subscribe.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(Auth.token ? { Authorization: `Bearer ${Auth.token}` } : {})
            },
            body: JSON.stringify({ email, subscribe: true })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Subscription failed');
        return data;
    } catch (err) {
        console.error('Subscription error:', err);
        throw err;
    }
}

function initHoroscopeSubscription() {
    const form = document.getElementById('horoscopeForm');
    const input = document.getElementById('horoscopeEmail');
    const status = document.getElementById('horoscopeStatus');

    if (!form || !input || !status) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.textContent = '';
        const email = input.value.trim();
        if (!email) {
            status.textContent = 'Please enter a valid email.';
            return;
        }

        try {
            const result = await subscribeToHoroscope(email);
            status.textContent = result.message || 'Subscribed! Check your inbox soon.';
            status.className = 'subscription-success';
        } catch (err) {
            status.textContent = err.message || 'Subscription failed.';
            status.className = 'subscription-error';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Chatbot.init();
    initHoroscopeSubscription();
});