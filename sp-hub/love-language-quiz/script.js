// ===== LOVE LANGUAGE QUIZ FUNCTIONALITY =====

class LoveLanguageQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.results = {};
        this.init();
    }
    
    init() {
        this.loadQuizProgress();
        this.bindEvents();
        console.log('LoveLanguageQuiz initialized');
    }
    
    bindEvents() {
        window.startQuiz = () => this.startQuiz();
        window.previousQuestion = () => this.previousQuestion();
        window.nextQuestion = () => this.nextQuestion();
        window.retakeQuiz = () => this.retakeQuiz();
        window.shareResults = () => this.shareResults();
    }
    
    startQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.saveQuizProgress();
        this.showQuiz();
        this.displayQuestion();
    }
    
    showQuiz() {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('quizPage').style.display = 'block';
        document.getElementById('resultsPage').style.display = 'none';
    }
    
    displayQuestion() {
        const question = quizData.questions[this.currentQuestion];
        if (!question) return;
        
        const progress = ((this.currentQuestion + 1) / quizData.questions.length) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Question ${this.currentQuestion + 1} of ${quizData.questions.length}`;
        
        const questionCard = document.getElementById('questionCard');
        if (!questionCard) return;
        
        questionCard.innerHTML = `
            <div class="question-content">
                <h3>${question.text}</h3>
                <div class="answers-container">
                    ${question.answers.map((answer, index) => `
                        <div class="answer-option" onclick="selectAnswer(${index})">
                            <span class="answer-text">${answer.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Restore selected answer if exists
        if (this.answers[question.id] !== undefined) {
            const answerOptions = document.querySelectorAll('.answer-option');
            answerOptions[this.answers[question.id]].classList.add('selected');
        }
        
        this.updateButtonStates();
    }
    
    selectAnswer(answerIndex) {
        const question = quizData.questions[this.currentQuestion];
        this.answers[question.id] = answerIndex;
        
        // Update UI
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
        });
        
        this.updateButtonStates();
        this.saveQuizProgress();
    }
    
    updateButtonStates() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const question = quizData.questions[this.currentQuestion];
        
        if (prevBtn) prevBtn.disabled = this.currentQuestion === 0;
        if (nextBtn) {
            const hasAnswer = this.answers[question.id] !== undefined;
            const isLastQuestion = this.currentQuestion === quizData.questions.length - 1;
            
            nextBtn.disabled = !hasAnswer;
            nextBtn.innerHTML = isLastQuestion ? 
                '<i class="fas fa-check"></i> Finish' : 
                'Next <i class="fas fa-arrow-right"></i>';
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.displayQuestion();
        }
    }
    
    nextQuestion() {
        const question = quizData.questions[this.currentQuestion];
        if (this.answers[question.id] === undefined) return;
        
        if (this.currentQuestion < quizData.questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        } else {
            this.completeQuiz();
        }
    }
    
    completeQuiz() {
        console.log('Completing quiz with answers:', this.answers);
        this.calculateResults();
        this.showResults();
    }
    
    calculateResults() {
        // Initialize scores for each love language
        const scores = {
            words_of_affirmation: 0,
            acts_of_service: 0,
            receiving_gifts: 0,
            quality_time: 0,
            physical_touch: 0
        };
        
        // Calculate scores based on answers
        Object.keys(this.answers).forEach(questionId => {
            const question = quizData.questions.find(q => q.id == questionId);
            const answerIndex = this.answers[questionId];
            const answerType = question.answers[answerIndex].type;
            
            if (scores[answerType] !== undefined) {
                scores[answerType]++;
            }
        });
        
        // Convert to percentages
        const totalQuestions = Object.keys(this.answers).length;
        Object.keys(scores).forEach(key => {
            scores[key] = Math.round((scores[key] / totalQuestions) * 100);
        });
        
        // Find primary language
        this.results = {
            scores: scores,
            primary: Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b),
            totalQuestions: totalQuestions
        };
        
        console.log('Quiz results:', this.results);
    }
    
    showResults() {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('quizPage').style.display = 'none';
        document.getElementById('resultsPage').style.display = 'block';
        
        this.displayPrimaryLanguage();
        this.displayLanguageBreakdown();
        this.displayRelationshipTips();
    }
    
    displayPrimaryLanguage() {
        const primaryLanguage = loveLanguages[this.results.primary];
        const primaryDiv = document.getElementById('primaryLanguage');
        
        if (primaryDiv) {
            primaryDiv.innerHTML = `
                <div class="primary-language-card">
                    <div class="language-icon">
                        <i class="${primaryLanguage.icon}"></i>
                    </div>
                    <h2>Your Primary Love Language: ${primaryLanguage.name}</h2>
                    <p>${primaryLanguage.description}</p>
                    <div class="score-display">
                        <span class="score-number">${this.results.scores[this.results.primary]}%</span>
                        <span class="score-label">Match</span>
                    </div>
                </div>
            `;
        }
    }
    
    displayLanguageBreakdown() {
        const breakdownDiv = document.getElementById('languageBreakdown');
        
        if (breakdownDiv) {
            const sortedLanguages = Object.keys(this.results.scores)
                .sort((a, b) => this.results.scores[b] - this.results.scores[a]);
            
            breakdownDiv.innerHTML = `
                <h3>Your Love Language Breakdown</h3>
                <div class="language-bars">
                    ${sortedLanguages.map(lang => {
                        const language = loveLanguages[lang];
                        const score = this.results.scores[lang];
                        return `
                            <div class="language-bar">
                                <div class="language-info">
                                    <i class="${language.icon}"></i>
                                    <span class="language-name">${language.name}</span>
                                    <span class="language-score">${score}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${score}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }
    
    displayRelationshipTips() {
        const primaryLanguage = loveLanguages[this.results.primary];
        const tipsDiv = document.getElementById('relationshipTips');
        
        if (tipsDiv) {
            tipsDiv.innerHTML = `
                <h3>Relationship Tips for ${primaryLanguage.name}</h3>
                <div class="tips-content">
                    <div class="characteristics">
                        <h4>Your Characteristics:</h4>
                        <ul>
                            ${primaryLanguage.characteristics.map(char => `<li>${char}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="tips">
                        <h4>Tips for Your Partner:</h4>
                        <ul>
                            ${primaryLanguage.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
    }
    
    retakeQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.results = {};
        this.saveQuizProgress();
        this.startQuiz();
    }
    
    shareResults() {
        const primaryLanguage = loveLanguages[this.results.primary];
        const shareText = `My primary love language is ${primaryLanguage.name}! Take the quiz to discover yours: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Love Language Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: Copy to clipboard
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            this.showToast('Results copied to clipboard!');
        }
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(107, 70, 193, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    saveQuizProgress() {
        localStorage.setItem('loveLanguageQuizProgress', JSON.stringify({
            currentQuestion: this.currentQuestion,
            answers: this.answers
        }));
    }
    
    loadQuizProgress() {
        const saved = localStorage.getItem('loveLanguageQuizProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentQuestion = progress.currentQuestion || 0;
            this.answers = progress.answers || {};
        }
    }
}

// Global functions for onclick handlers
window.selectAnswer = (index) => window.loveQuiz.selectAnswer(index);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loveQuiz = new LoveLanguageQuiz();
});

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
        }
    }
    
    .toast {
        animation: slideUp 0.3s ease;
    }
    
    .toast.hide {
        animation: slideDown 0.3s ease;
    }
`;

document.head.appendChild(styleSheet);
