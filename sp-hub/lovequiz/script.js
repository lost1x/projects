// Love Language Quiz Application
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
    }
    
    bindEvents() {
        window.startQuiz = () => this.startQuiz();
        window.goToLanding = () => this.goToLanding();
        window.goToQuiz = () => this.goToQuiz();
        window.nextQuestion = () => this.nextQuestion();
        window.previousQuestion = () => this.previousQuestion();
        window.retakeQuiz = () => this.retakeQuiz();
        window.shareOnFacebook = () => this.shareOnFacebook();
    }
    
    startQuiz() {
        this.currentQuestion = 0;
        this.answers = {};
        this.saveQuizProgress();
        this.showQuiz();
        this.displayQuestion();
    }
    
    showQuiz() {
        this.showPage('quiz-page');
    }
    
    goToLanding() {
        this.showPage('landing-page');
    }
    
    goToQuiz() {
        this.showPage('quiz-page');
        this.displayQuestion();
    }
    
    showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        const targetPage = document.getElementById(pageId);
        
        if (!targetPage) {
            console.error('Page not found:', pageId);
            return;
        }
        
        pages.forEach(page => {
            page.classList.remove('active');
        });
        targetPage.classList.add('active');
    }
    
    displayQuestion() {
        const question = quizData.questions[this.currentQuestion];
        if (!question) return;
        
        const progress = ((this.currentQuestion + 1) / quizData.questions.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `Question ${this.currentQuestion + 1} of ${quizData.questions.length}`;
        
        const questionCard = document.getElementById('question-card');
        if (!questionCard) return;
        
        questionCard.innerHTML = `
            <div class="question-text">
                <h3>${question.text}</h3>
            </div>
            <div class="answers-container" id="answers-container">
                <!-- Answers will be inserted here -->
            </div>
        `;
        
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.textContent = answer.text;
            answerElement.addEventListener('click', () => this.selectAnswer(index));
            
            if (this.answers[question.id] === index) {
                answerElement.classList.add('selected');
            }
            
            answersContainer.appendChild(answerElement);
        });
        
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) prevBtn.disabled = this.currentQuestion === 0;
        if (nextBtn) nextBtn.disabled = this.answers[question.id] === undefined;
    }
    
    selectAnswer(answerIndex) {
        const question = quizData.questions[this.currentQuestion];
        this.answers[question.id] = answerIndex;
        
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
        });
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.disabled = false;
        
        this.saveQuizProgress();
    }
    
    nextQuestion() {
        if (this.currentQuestion < quizData.questions.length - 1) {
            this.currentQuestion++;
            this.displayQuestion();
        } else {
            this.completeQuiz();
        }
    }
    
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.displayQuestion();
        }
    }
    
    completeQuiz() {
        this.calculateResults();
        this.showResults(); // ← No payment gate
    }
    
    calculateResults() {
        const scores = {
            words_of_affirmation: 0,
            acts_of_service: 0,
            receiving_gifts: 0,
            quality_time: 0,
            physical_touch: 0
        };
        
        Object.keys(this.answers).forEach(questionId => {
            const questionIndex = parseInt(questionId) - 1;
            const answerIndex = this.answers[questionId];
            const question = quizData.questions[questionIndex];
            const answer = question.answers[answerIndex];
            
            scores[answer.type]++;
        });
        
        const primaryLoveLanguage = Object.keys(scores).reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );
        
        this.results = {
            scores,
            primaryLoveLanguage,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('quizResults', JSON.stringify(this.results));
    }
    
    async showResults() {
        const results = JSON.parse(localStorage.getItem('quizResults'));
        if (!results) {
            alert('Quiz results not found. Please retake the quiz.');
            this.goToLanding();
            return;
        }
        
        const loveLanguageData = quizData.loveLanguages[results.primaryLoveLanguage];
        
        // Update language display
        const languageDisplay = document.getElementById('language-display');
        if (languageDisplay) {
            languageDisplay.innerHTML = `
                <div class="primary-language">
                    <div class="language-icon">${loveLanguageData.icon}</div>
                    <div class="language-info">
                        <h3>${loveLanguageData.title}</h3>
                        <p>${loveLanguageData.description}</p>
                    </div>
                </div>
            `;
        }
        
        // Update score breakdown
        const scoreBreakdown = document.getElementById('score-breakdown');
        if (scoreBreakdown) {
            const sortedScores = Object.entries(results.scores)
                .sort(([,a], [,b]) => b - a)
                .map(([language, score]) => {
                    const langData = quizData.loveLanguages[language];
                    return { language, score, ...langData };
                });
            
            scoreBreakdown.innerHTML = sortedScores.map(item => `
                <div class="score-item ${item.language === results.primaryLoveLanguage ? 'primary' : ''}">
                    <span class="score-icon">${item.icon}</span>
                    <span class="score-name">${item.title}</span>
                    <span class="score-value">${item.score}</span>
                </div>
            `).join('');
        }
        
        // Generate certificate
        try {
            await generateCertificate(results.primaryLoveLanguage);
        } catch (error) {
            console.error('Certificate generation failed:', error);
        }
        
        this.showPage('results-page');
    }
    
    retakeQuiz() {
        localStorage.removeItem('quizResults');
        localStorage.removeItem('quizProgress');
        
        this.currentQuestion = 0;
        this.answers = {};
        this.results = {};
        this.goToLanding();
    }
    
    shareOnFacebook() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('I just took this amazing Love Language Quiz! Discover your love language too.');
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
    
    saveQuizProgress() {
        const progress = {
            currentQuestion: this.currentQuestion,
            answers: this.answers,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }
    
    loadQuizProgress() {
        try {
            const progress = localStorage.getItem('quizProgress');
            if (progress) {
                const data = JSON.parse(progress);
                this.currentQuestion = data.currentQuestion || 0;
                this.answers = data.answers || {};
            }
        } catch (error) {
            console.error('Error loading quiz progress:', error);
        }
    }
}

// Utility functions
function showResults() {
    quiz.showResults();
}

// Initialize the quiz
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new LoveLanguageQuiz();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.quiz) {
        window.quiz.saveQuizProgress();
    }
});

window.addEventListener('beforeunload', () => {
    if (window.quiz) {
        window.quiz.saveQuizProgress();
    }
});