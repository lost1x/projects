// Chatbot UI + API integration
const Chatbot = {
    api_url: 'asset/php',

    init() {
        this.chatContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');
        this.errorContainer = document.getElementById('chatbotError');

        if (!this.chatContainer || !this.input || !this.sendButton) return;

        this.sendButton.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleSend();
            }
        });

        this.addMessage('system', 'Ask me anything about your journey or let me share a quick insight.');
    },

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;
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
                body: JSON.stringify({ prompt: text })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.details || 'Chat request failed');
            }

            const reply = data.response || 'Hmm… I did not receive a response.';
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