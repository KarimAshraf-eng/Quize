// QuizMaster - Interactive Learning Platform
// Comprehensive Application Logic with All Requested Features (BUGS FIXED)

class QuizApp {
    constructor() {
        this.currentView = 'landing';
        this.currentLecture = null;
        this.currentQuestionIndex = 0;
        this.lectures = new Map();
        this.sessionData = {
            answers: new Map(),
            favorites: new Set(),
            currentLanguage: 'en',
            lectureProgress: new Map() // Track progress per lecture
        };
        this.explanationLanguage = 'en';
        this.reviewMode = null;
        this.reviewQuestions = null;
        this.originalLecture = null;
        this.viewOnlyMode = false;
        this.answerSubmitted = false;
        this.reviewOrigin = null; // Track where review started from

        this.init();
    }

    async init() {
        this.loadSessionData();
        this.bindEvents();
        await this.loadLectures();
        this.renderLectureCards(); // Render cards
        this.showView('landing');
        this.updateSiteLanguage(); // Update static text
    }

    // Data Management
    async loadLectures() {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');

        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');

        try {
            const lecturePromises = [];
            for (let i = 1; i <= 20; i++) {
                lecturePromises.push(this.loadLectureFile(i));
            }

            const results = await Promise.allSettled(lecturePromises);

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    this.lectures.set(index + 1, result.value);
                }
            });

            if (this.lectures.size === 0) {
                throw new Error('No lectures found');
            }

        } catch (error) {
            console.error('Error loading lectures:', error);
            errorState.classList.remove('hidden');
        } finally {
            loadingState.classList.add('hidden');
        }
    }

    async loadLectureFile(lectureNumber) {
        try {
            const response = await fetch(`Lecture_${lectureNumber}.json`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return {
                number: lectureNumber,
                questions: data,
                totalQuestions: data.length
            };
        } catch (error) {
            console.warn(`Failed to load Lecture ${lectureNumber}:`, error);
            return null;
        }
    }

    saveSessionData() {
        const data = {
            favorites: Array.from(this.sessionData.favorites),
            currentLanguage: this.sessionData.currentLanguage,
            answers: Array.from(this.sessionData.answers.entries()),
            lectureProgress: Array.from(this.sessionData.lectureProgress.entries())
        };
        localStorage.setItem('quizSession', JSON.stringify(data));
    }

    loadSessionData() {
        const saved = localStorage.getItem('quizSession');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.sessionData.favorites = new Set(data.favorites || []);
                this.sessionData.currentLanguage = data.currentLanguage || 'en';
                this.sessionData.answers = new Map(data.answers || []);
                this.sessionData.lectureProgress = new Map(data.lectureProgress || []);
            } catch (error) {
                console.warn('Failed to load session data:', error);
            }
        }
    }

    // Event Binding
    bindEvents() {
        // Global translate button
        document.getElementById('global-translate-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Global favorites button
        document.getElementById('global-favorites-btn').addEventListener('click', () => {
            this.showGlobalFavoritesModal();
        });

        // Navigation
        // **FIX: Corrected logic for back-arrow navigation**
        document.getElementById('back-to-landing').addEventListener('click', () => {
            const origin = this.reviewOrigin; // Get origin FIRST
            const inSpecialMode = this.reviewMode || this.viewOnlyMode;

            this.exitReviewMode();
            this.exitViewOnlyMode();

            if (inSpecialMode) {
                if (origin === 'landing') { // THEN check
                    this.showView('landing');
                } else {
                    this.showDashboard();
                }
            } else {
                this.showView('landing');
            }
        });

        document.getElementById('dashboard-home-btn').addEventListener('click', () => {
            this.exitReviewMode();
            this.showView('landing');
        });

        document.getElementById('reset-session-btn').addEventListener('click', () => {
            this.resetSession();
        });

        // Quiz Controls
        document.getElementById('ok-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('return-dashboard-btn').addEventListener('click', () => {
            this.exitViewOnlyMode();
            this.showDashboard();
        });

        // Favorite Button
        document.getElementById('favorite-btn').addEventListener('click', () => {
            this.toggleFavorite();
        });

        // Explanation toggle
        document.getElementById('toggle-explanation-lang').addEventListener('click', () => {
            this.toggleExplanationLanguage();
        });

        // Dashboard Actions
        document.getElementById('review-errors-btn').addEventListener('click', () => {
            this.showReviewModal('errors');
        });

        document.getElementById('review-favorites-btn').addEventListener('click', () => {
            this.showReviewModal('favorites');
        });

        document.getElementById('retake-all-btn').addEventListener('click', () => {
            this.retakeAllQuestions();
        });

        // Modal Events
        document.getElementById('resume-continue-btn').addEventListener('click', () => {
            this.hideModal('resume-modal');
            this.continueQuiz();
        });

        document.getElementById('resume-restart-btn').addEventListener('click', () => {
            this.hideModal('resume-modal');
            this.restartQuiz();
        });

        document.getElementById('review-retry-btn').addEventListener('click', () => {
            this.hideModal('review-modal');
            this.startReviewMode(this.currentReviewType, false);
        });

        document.getElementById('review-view-btn').addEventListener('click', () => {
            this.hideModal('review-modal');
            this.startReviewMode(this.currentReviewType, true);
        });

        document.getElementById('review-cancel-btn').addEventListener('click', () => {
            this.hideModal('review-modal');
        });

        document.getElementById('global-favorites-retry-btn').addEventListener('click', () => {
            this.hideModal('global-favorites-modal');
            this.startGlobalFavoritesReview(false);
        });

        document.getElementById('global-favorites-view-btn').addEventListener('click', () => {
            this.hideModal('global-favorites-modal');
            this.startGlobalFavoritesReview(true);
        });

        document.getElementById('global-favorites-cancel-btn').addEventListener('click', () => {
            this.hideModal('global-favorites-modal');
        });
    }

    // View Management
    showView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Removed transform properties that break position:fixed
            targetView.style.opacity = '0';

            setTimeout(() => {
                targetView.style.transition = 'all 0.5s ease-out';
                targetView.style.opacity = '1';
            }, 10);
        }
    }

    renderLectureCards() {
        const grid = document.getElementById('lecture-grid');
        grid.innerHTML = '';

        if (this.lectures.size === 0) {
            return;
        }

        this.lectures.forEach(lecture => {
            const card = this.createLectureCard(lecture);
            grid.appendChild(card);
        });
    }

    createLectureCard(lecture) {
        const card = document.createElement('div');
        card.className = 'lecture-card bounce-in';
        card.style.animationDelay = `${lecture.number * 0.1}s`;

        const title = this.sessionData.currentLanguage === 'en' ?
            `Lecture ${lecture.number}` : `محاضرة ${lecture.number}`;

        const questionText = this.sessionData.currentLanguage === 'en' ?
            `${lecture.totalQuestions} Questions` : `${lecture.totalQuestions} أسئلة`;

        card.innerHTML = `
            <div class="lecture-number">${title}</div>
            <div class="lecture-title">${this.sessionData.currentLanguage === 'en' ? 'Machine Learning Fundamentals' : 'أساسيات التعلم الآلي'}</div>
            <div class.lecture-meta">
                <div class="question-count">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    ${questionText}
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.handleLectureSelection(lecture.number);
        });

        return card;
    }

    handleLectureSelection(lectureNumber) {
        const progress = this.sessionData.lectureProgress.get(lectureNumber);

        if (progress && progress.completedQuestions < progress.totalQuestions) {
            // Show resume modal for incomplete lecture
            this.showResumeModal(lectureNumber);
        } else if (progress && progress.completedQuestions === progress.totalQuestions) {
            // Show dashboard for completed lecture
            this.currentLecture = this.lectures.get(lectureNumber);
            this.showDashboard();
        } else {
            // Start fresh quiz
            this.startQuiz(lectureNumber);
        }
    }

    showResumeModal(lectureNumber) {
        const modal = document.getElementById('resume-modal');
        const title = document.getElementById('resume-title');
        const message = document.getElementById('resume-message');

        title.textContent = this.sessionData.currentLanguage === 'en' ? 'Resume Quiz?' : 'استكمال الاختبار؟';
        message.textContent = this.sessionData.currentLanguage === 'en' ?
            'You have an incomplete quiz session. Would you like to continue where you left off or start fresh?' :
            'لديك جلسة اختبار غير مكتملة. هل تريد الاستمرار من حيث توقفت أم تبدأ من جديد؟';

        this.pendingLectureNumber = lectureNumber;
        this.showModal('resume-modal');
    }

    continueQuiz() {
        const progress = this.sessionData.lectureProgress.get(this.pendingLectureNumber);
        this.currentLecture = this.lectures.get(this.pendingLectureNumber);
        this.currentQuestionIndex = progress.completedQuestions;
        this.showView('quiz');
        this.renderQuestion();
    }

    restartQuiz() {
        this.startQuiz(this.pendingLectureNumber);
    }

    // Quiz Logic
    startQuiz(lectureNumber) {
        this.currentLecture = this.lectures.get(lectureNumber);
        this.currentQuestionIndex = 0;
        this.answerSubmitted = false;
        this.viewOnlyMode = false;

        // Clear previous answers for this lecture
        this.sessionData.answers.forEach((answer, key) => {
            if (key.startsWith(`${lectureNumber}-`)) {
                this.sessionData.answers.delete(key);
            }
        });

        this.renderQuestion();
        this.showView('quiz');
    }

    updateQuizHeader() {
        const lectureInfo = document.getElementById('lecture-info');
        const questionCounter = document.getElementById('question-counter');

        const lectureText = this.sessionData.currentLanguage === 'en' ?
            `Lecture ${this.currentLecture.number}` : `محاضرة ${this.currentLecture.number}`;

        const totalQuestions = this.getTotalQuestions();

        const counterText = this.sessionData.currentLanguage === 'en' ?
            `Question ${this.currentQuestionIndex + 1} of ${totalQuestions}` :
            `سؤال ${this.currentQuestionIndex + 1} من ${totalQuestions}`;

        lectureInfo.textContent = lectureText;
        questionCounter.textContent = counterText;
    }

    renderQuestion() {
        this.updateQuizHeader();

        const question = this.getCurrentQuestion();

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;

        // Update question number
        document.getElementById('question-number').textContent =
            this.sessionData.currentLanguage === 'en' ? `Q${question.question_number}` : `س${question.question_number}`;

        // Update question text
        const questionText = document.getElementById('question-text');
        questionText.textContent = this.sessionData.currentLanguage === 'en' ?
            question.question_en : question.question_ar;

        // Update favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        favoriteBtn.classList.toggle('active', this.sessionData.favorites.has(questionKey));

        // Render choices
        this.renderChoices(question);

        // Update progress
        this.updateProgress();

        // Re-show feedback if already answered
        const hasAnswer = this.sessionData.answers.has(questionKey);

        // **FIX: Logic for showing feedback**
        if (this.viewOnlyMode && hasAnswer) {
            this.showViewOnlyFeedback(question);
        } else if (this.answerSubmitted) {
            this.showAnswerFeedback(question, this.currentSelection);
        } else {
            this.hideAnswerFeedback();
        }

        // Update controls
        this.updateQuizControls();
    }

    getCurrentQuestion() {
        if (this.reviewMode && this.reviewQuestions) {
            return this.reviewQuestions[this.currentQuestionIndex];
        }
        return this.currentLecture.questions[this.currentQuestionIndex];
    }

    renderChoices(question) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';

        const choices = ['A', 'B', 'C', 'D'];

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;
        const userAnswer = this.sessionData.answers.get(questionKey);

        choices.forEach(choice => {
            const choiceItem = document.createElement('div');
            choiceItem.className = 'choice-item';
            choiceItem.dataset.choice = choice;

            const choiceText = this.sessionData.currentLanguage === 'en' ?
                question.choices[`${choice}_en`] : question.choices[`${choice}_ar`];

            choiceItem.innerHTML = `
                <div class="choice-letter">${choice}</div>
                <div class="choice-text">${choiceText}</div>
            `;

            // **FIX: New robust logic for "Retry" mode**
            if (this.viewOnlyMode && userAnswer) {
                // VIEW mode: Show old answers
                const correctChoice = question.correct_choice;
                const userChoice = userAnswer.choice;
                if (correctChoice === choice) choiceItem.classList.add('correct');
                else if (userChoice === choice) choiceItem.classList.add('incorrect');
                choiceItem.classList.add('disabled');

            } else if (this.answerSubmitted) {
                // RETRY mode, AFTER submitting: Show new answer
                const correctChoice = question.correct_choice;
                const userChoice = this.currentSelection; // The new answer
                if (correctChoice === choice) choiceItem.classList.add('correct');
                else if (userChoice === choice) choiceItem.classList.add('incorrect');
                choiceItem.classList.add('disabled');

            } else {
                // RETRY mode, BEFORE submitting: Interactive
                choiceItem.addEventListener('click', () => {
                    this.selectChoice(choice);
                });
            }

            container.appendChild(choiceItem);
        });
    }

    selectChoice(choice) {
        if (this.answerSubmitted) return;

        // Remove previous selection
        document.querySelectorAll('.choice-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked choice
        const selectedChoice = document.querySelector(`[data-choice="${choice}"]`);
        selectedChoice.classList.add('selected');

        // Enable OK button
        document.getElementById('ok-btn').disabled = false;

        // Store temporary selection
        this.currentSelection = choice;
    }

    submitAnswer() {
        if (!this.currentSelection || this.answerSubmitted) return;

        const question = this.getCurrentQuestion();

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;

        // Store answer
        this.sessionData.answers.set(questionKey, {
            choice: this.currentSelection,
            correct: this.currentSelection === question.correct_choice,
            timestamp: Date.now()
        });

        // Mark as submitted
        this.answerSubmitted = true;

        // Update lecture progress (only if not in review mode)
        if (!this.reviewMode) {
            this.updateLectureProgress();
        }

        // Show feedback
        this.showAnswerFeedback(question, this.currentSelection);

        // Update choices display (this is now redundant, renderChoices will handle it)
        // this.updateChoicesDisplay(question, this.currentSelection); 
        // Let's call renderQuestion instead to be consistent
        this.renderQuestion(); // Re-render to show state

        // Update controls
        this.updateQuizControls();

        // Save session
        this.saveSessionData();

        // currentSelection is used by renderQuestion
    }

    updateLectureProgress() {
        const lectureNumber = this.currentLecture.number;
        const totalQuestions = this.currentLecture.totalQuestions;
        const completedQuestions = Array.from(this.sessionData.answers.keys())
            .filter(key => key.startsWith(`${lectureNumber}-`)).length;

        this.sessionData.lectureProgress.set(lectureNumber, {
            totalQuestions,
            completedQuestions,
            isCompleted: completedQuestions === totalQuestions
        });
    }

    showAnswerFeedback(question, userChoice) {
        const feedback = document.getElementById('answer-feedback');
        const title = document.getElementById('feedback-title');
        const content = document.getElementById('explanation-content');

        const isCorrect = userChoice === question.correct_choice;

        // Update feedback appearance
        feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.classList.remove('hidden');

        // Update title
        const titleText = this.sessionData.currentLanguage === 'en' ?
            (isCorrect ? 'Correct!' : 'Incorrect') :
            (isCorrect ? 'صحيح!' : 'خاطئ');

        title.textContent = titleText;
        title.className = `feedback-title ${isCorrect ? 'correct' : 'incorrect'}`;

        // Generate explanation content
        this.renderExplanation(question, userChoice, content);

        // Animate in
        feedback.classList.add('bounce-in');
    }

    showViewOnlyFeedback(question) {
        const feedback = document.getElementById('answer-feedback');
        const title = document.getElementById('feedback-title');
        const content = document.getElementById('explanation-content');

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;
        const userAnswer = this.sessionData.answers.get(questionKey);

        if (userAnswer) {
            const isCorrect = userAnswer.correct;

            feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            feedback.classList.remove('hidden');

            const titleText = this.sessionData.currentLanguage === 'en' ?
                (isCorrect ? 'Correct!' : 'Incorrect') :
                (isCorrect ? 'صحيح!' : 'خاطئ');

            title.textContent = titleText;
            title.className = `feedback-title ${isCorrect ? 'correct' : 'incorrect'}`;

            this.renderExplanation(question, userAnswer.choice, content);
        }
    }

    renderExplanation(question, userChoice, container) {
        const lang = this.explanationLanguage;

        let html = '';

        // Correct answer explanation - always show with green border
        const correctExplanation = lang === 'en' ?
            question.explanation_correct_en :
            (question.explanation_correct_ar || question.explanation_correct_en);

        const correctAnswerTitle = lang === 'en' ?
            `Correct Answer (${question.correct_choice}):` :
            `الإجابة الصحيحة (${question.correct_choice}):`;

        html += `
            <div class="explanation-section correct">
                <h4>${correctAnswerTitle}</h4>
                <p>${correctExplanation}</p>
            </div>
        `;

        // User's answer explanation if wrong
        if (userChoice !== question.correct_choice) {
            const wrongExplanation = lang === 'en' ?
                question.explanation_wrong_en[userChoice] :
                (question.explanation_wrong_ar && question.explanation_wrong_ar[userChoice] ?
                    question.explanation_wrong_ar[userChoice] : question.explanation_wrong_en[userChoice]);

            const yourAnswerTitle = lang === 'en' ?
                `Your Answer (${userChoice}):` : `إجابتك (${userChoice}):`;

            html += `
                <div class="explanation-section incorrect">
                    <h4>${yourAnswerTitle}</h4>
                    <p>${wrongExplanation}</p>
                </div>
            `;
        }

        // Other wrong answers
        const wrongExplanations = lang === 'en' ?
            question.explanation_wrong_en :
            (question.explanation_wrong_ar || question.explanation_wrong_en);

        Object.keys(wrongExplanations).forEach(choice => {
            if (choice !== question.correct_choice && choice !== userChoice) {
                const optionTitle = lang === 'en' ? `Option ${choice}:` : `الاختيار ${choice}:`;
                html += `
                    <div class="explanation-section neutral">
                        <h4>${optionTitle}</h4>
                        <p>${wrongExplanations[choice]}</p>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }

    updateChoicesDisplay(question, userChoice) {
        // This function is now redundant, renderChoices handles all logic
    }

    hideAnswerFeedback() {
        document.getElementById('answer-feedback').classList.add('hidden');
    }

    updateQuizControls() {
        const question = this.getCurrentQuestion();

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;
        const hasAnswer = this.sessionData.answers.has(questionKey);

        const isLastQuestion = this.currentQuestionIndex === this.getTotalQuestions() - 1;

        // OK button
        const okBtn = document.getElementById('ok-btn');
        okBtn.disabled = this.viewOnlyMode || this.answerSubmitted || !this.currentSelection;

        // Back button
        document.getElementById('back-btn').disabled = this.currentQuestionIndex === 0;

        // Next button
        const nextBtn = document.getElementById('next-btn');
        const shouldShowNext = this.viewOnlyMode || this.answerSubmitted;

        // Return dashboard button
        const returnBtn = document.getElementById('return-dashboard-btn');

        // Always hide the bottom dashboard button
        returnBtn.classList.add('hidden');

        if (shouldShowNext) {
            nextBtn.classList.remove('hidden');
            nextBtn.disabled = false;
            const nextText = this.sessionData.currentLanguage === 'en' ?
                (isLastQuestion ? 'Finish' : 'Next') :
                (isLastQuestion ? 'إنهاء' : 'التالي');
            nextBtn.innerHTML = `
                <span class="next-text">${nextText}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            `;
        } else {
            nextBtn.classList.add('hidden');
            nextBtn.disabled = true;
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.getTotalQuestions()) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${Math.round(progress)}%`;
    }

    getTotalQuestions() {
        if (this.reviewMode && this.reviewQuestions) {
            return this.reviewQuestions.length;
        }
        return this.currentLecture.totalQuestions;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            this.currentQuestionIndex++;

            // **FIX: Only set answerSubmitted if in viewOnlyMode**
            this.answerSubmitted = this.viewOnlyMode;

            this.currentSelection = null; // Clear selection
            this.renderQuestion();
        } else {
            // We've finished the quiz or review
            const origin = this.reviewOrigin; // Get origin FIRST

            this.exitReviewMode();
            this.exitViewOnlyMode();

            if (origin === 'landing') { // THEN check
                this.showView('landing');
            } else {
                // Default (dashboard review or normal quiz)
                this.showDashboard();
            }
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;

            // **FIX: Only set answerSubmitted if in viewOnlyMode**
            this.answerSubmitted = this.viewOnlyMode;

            this.currentSelection = null; // Clear selection
            this.renderQuestion();
        }
    }

    // Language Management
    toggleLanguage() {
        this.sessionData.currentLanguage = this.sessionData.currentLanguage === 'en' ? 'ar' : 'en';
        document.documentElement.dir = this.sessionData.currentLanguage === 'ar' ? 'rtl' : 'ltr';

        this.updateSiteLanguage(); // This updates static text

        // Manually re-render dynamic content based on the current view
        if (this.currentView === 'quiz') {
            this.renderQuestion();
        } else if (this.currentView === 'landing') {
            this.renderLectureCards();
        } else if (this.currentView === 'dashboard') {
            this.renderDashboard();
        }

        this.saveSessionData();
    }

    updateSiteLanguage() {
        // Update global translate button
        const langIndicator = document.querySelector('.lang-indicator');
        if (langIndicator) {
            langIndicator.textContent = this.sessionData.currentLanguage.toUpperCase();
        }

        // Update all static text elements
        const elements = {
            'welcome-title': this.sessionData.currentLanguage === 'en' ? 'Choose Your Lecture' : 'اختر محاضرتك',
            'welcome-text': this.sessionData.currentLanguage === 'en' ? 'Select a lecture to start your interactive quiz experience' : 'اختر محاضرة لبدء تجربتك الاختبارية التفاعلية',
            'dashboard-title': this.sessionData.currentLanguage === 'en' ? 'Quiz Results' : 'نتائج الاختبار',
            'correct-label': this.sessionData.currentLanguage === 'en' ? 'Correct' : 'صحيح',
            'incorrect-label': this.sessionData.currentLanguage === 'en' ? 'Incorrect' : 'خاطئ',
            'score-label': this.sessionData.currentLanguage === 'en' ? 'Score' : 'النتيجة',
            'favorites-label': this.sessionData.currentLanguage === 'en' ? 'Favorites' : 'المفضلة',
            'section-title': this.sessionData.currentLanguage === 'en' ? 'Question Review' : 'مراجعة الأسئلة'
        };

        // Update table headers
        const tableHeaders = {
            'th-qnum': this.sessionData.currentLanguage === 'en' ? 'Q#' : 'س#',
            'th-lecture': this.sessionData.currentLanguage === 'en' ? 'Lecture' : 'محاضرة',
            'th-your-answer': this.sessionData.currentLanguage === 'en' ? 'Your Answer' : 'إجابتك',
            'th-correct': this.sessionData.currentLanguage === 'en' ? 'Correct' : 'الصحيحة',
            'th-status': this.sessionData.currentLanguage === 'en' ? 'Status' : 'الحالة',
            'th-action': this.sessionData.currentLanguage === 'en' ? 'Action' : 'إجراء'
        };

        Object.entries({ ...elements, ...tableHeaders }).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });

        // Update action buttons
        const actionButtons = document.querySelectorAll('.action-btn span');
        const buttonTexts = {
            'Review Errors': this.sessionData.currentLanguage === 'en' ? 'Review Errors' : 'مراجعة الأخطاء',
            'Review Favorites': this.sessionData.currentLanguage === 'en' ? 'Review Favorites' : 'مراجعة المفضلة',
            'Retake All Questions': this.sessionData.currentLanguage === 'en' ? 'Retake All Questions' : 'إعادة جميع الأسئلة'
        };

        actionButtons.forEach(btn => {
            const originalText = btn.dataset.originalText || btn.textContent;
            btn.dataset.originalText = originalText; // Store original text if not already
            if (buttonTexts[originalText]) {
                btn.textContent = buttonTexts[originalText];
            } else {
                Object.values(buttonTexts).forEach(val => {
                    if (btn.textContent === val) {
                        btn.textContent = buttonTexts[originalText];
                    }
                });
            }
        });

        // Update global favorites button
        const globalFavoritesBtn = document.querySelector('.global-favorites-btn span');
        if (globalFavoritesBtn) {
            globalFavoritesBtn.textContent = this.sessionData.currentLanguage === 'en' ?
                'Review All Favorites' : 'مراجعة جميع المفضلة';
        }
    }

    toggleExplanationLanguage() {
        this.explanationLanguage = this.explanationLanguage === 'en' ? 'ar' : 'en';

        const feedback = document.getElementById('answer-feedback');
        if (!feedback.classList.contains('hidden')) {
            const question = this.getCurrentQuestion();

            const lectureNum = question.lectureNumber || this.currentLecture.number;
            const questionKey = `${lectureNum}-${question.question_number}`;
            // **FIX: Use currentSelection if it exists, otherwise fall back to saved answer**
            const userAnswer = this.sessionData.answers.get(questionKey);
            const userChoice = this.currentSelection || (userAnswer ? userAnswer.choice : null);

            const content = document.getElementById('explanation-content');

            if (userChoice) {
                this.renderExplanation(question, userChoice, content);
            }
        }

        document.getElementById('current-lang').textContent = this.explanationLanguage.toUpperCase();
    }

    // Favorites Management
    toggleFavorite() {
        const question = this.getCurrentQuestion();

        const lectureNum = question.lectureNumber || this.currentLecture.number;
        const questionKey = `${lectureNum}-${question.question_number}`;

        if (this.sessionData.favorites.has(questionKey)) {
            this.sessionData.favorites.delete(questionKey);
        } else {
            this.sessionData.favorites.add(questionKey);
        }

        document.getElementById('favorite-btn').classList.toggle('active',
            this.sessionData.favorites.has(questionKey));

        this.saveSessionData();
    }

    // Dashboard
    showDashboard() {
        this.calculateResults();
        this.renderDashboard();
        this.showView('dashboard');
    }

    calculateResults() {
        const results = {
            correct: 0,
            incorrect: 0,
            total: this.currentLecture.totalQuestions,
            percentage: 0,
            favoriteCount: 0, // Will be calculated globally now
            wrongAnswers: []
        };

        // Calculate favorites count globally
        this.sessionData.favorites.forEach(key => {
            if (key.startsWith(`${this.currentLecture.number}-`)) {
                results.favoriteCount++;
            }
        });

        this.sessionData.answers.forEach((answer, key) => {
            if (key.startsWith(`${this.currentLecture.number}-`)) {
                if (answer.correct) {
                    results.correct++;
                } else {
                    results.incorrect++;
                    const [lectureNum, questionNum] = key.split('-');
                    const question = this.currentLecture.questions.find(q => q.question_number == questionNum);
                    if (question) {
                        results.wrongAnswers.push({
                            question: question,
                            userChoice: answer.choice,
                            questionKey: key
                        });
                    }
                }
            }
        });

        results.percentage = this.currentLecture.totalQuestions > 0 ? Math.round((results.correct / results.total) * 100) : 0;

        this.currentResults = results;
    }

    renderDashboard() {
        // Update summary cards
        document.getElementById('correct-count').textContent = this.currentResults.correct;
        document.getElementById('incorrect-count').textContent = this.currentResults.incorrect;
        document.getElementById('percentage-score').textContent = `${this.currentResults.percentage}%`;
        document.getElementById('favorites-count').textContent = this.currentResults.favoriteCount;

        // Render results table
        this.renderResultsTable();
    }

    renderResultsTable() {
        const tbody = document.getElementById('results-tbody');
        tbody.innerHTML = '';

        // Show wrong answers first with detailed information
        this.currentResults.wrongAnswers.forEach(({ question, userChoice, questionKey }) => {
            const row = document.createElement('tr');

            const statusText = this.sessionData.currentLanguage === 'en' ? 'Incorrect' : 'خاطئ';
            const viewText = this.sessionData.currentLanguage === 'en' ? 'View' : 'عرض';

            row.innerHTML = `
                <td>Q${question.question_number}</td>
                <td>L${this.currentLecture.number}</td>
                <td>${userChoice}</td>
                <td>${question.correct_choice}</td>
                <td>
                    <span class="status-badge incorrect">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <button class="view-explanation-btn" data-qnum="${question.question_number}">
                        ${viewText}
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Show correct answers
        this.currentLecture.questions.forEach(question => {
            const questionKey = `${this.currentLecture.number}-${question.question_number}`;
            const userAnswer = this.sessionData.answers.get(questionKey);

            if (userAnswer && userAnswer.correct) {
                const row = document.createElement('tr');

                const statusText = this.sessionData.currentLanguage === 'en' ? 'Correct' : 'صحيح';
                const viewText = this.sessionData.currentLanguage === 'en' ? 'View' : 'عرض';

                row.innerHTML = `
                    <td>Q${question.question_number}</td>
                    <td>L${this.currentLecture.number}</td>
                    <td>${userAnswer.choice}</td>
                    <td>${question.correct_choice}</td>
                    <td>
                        <span class="status-badge correct">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <button class="view-explanation-btn" data-qnum="${question.question_number}">
                            ${viewText}
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            }
        });

        // Add event listeners to new buttons
        tbody.querySelectorAll('.view-explanation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showQuestionExplanation(parseInt(e.currentTarget.dataset.qnum));
            });
        });
    }

    showQuestionExplanation(questionNumber) {
        this.reviewOrigin = 'dashboard';

        // Find the question and show its explanation
        const question = this.currentLecture.questions.find(q => q.question_number === questionNumber);
        if (question) {
            const questionKey = `${this.currentLecture.number}-${question.question_number}`;
            const userAnswer = this.sessionData.answers.get(questionKey);

            // Switch to quiz view and show the question
            this.currentQuestionIndex = this.currentLecture.questions.indexOf(question);
            this.viewOnlyMode = true;
            this.answerSubmitted = true; // Ensure feedback shows
            this.showView('quiz');
            this.renderQuestion();
        }
    }

    exitViewOnlyMode() {
        this.viewOnlyMode = false;
        this.answerSubmitted = false;
        this.reviewOrigin = null; // Reset origin
    }

    // Review Options
    showReviewModal(type) {
        this.reviewOrigin = 'dashboard';
        this.currentReviewType = type;
        const modal = document.getElementById('review-modal');
        const title = document.getElementById('review-title');
        const message = document.getElementById('review-message');
        const retryText = document.getElementById('retry-text');
        const viewText = document.getElementById('view-text');

        if (type === 'errors') {
            title.textContent = this.sessionData.currentLanguage === 'en' ? 'Review Incorrect Questions' : 'مراجعة الأسئلة الخاطئة';
            message.textContent = this.sessionData.currentLanguage === 'en' ? 'How would you like to review the incorrect questions?' : 'كيف تريد مراجعة الأسئلة الخاطئة؟';
            retryText.textContent = this.sessionData.currentLanguage === 'en' ? 'Retry Questions' : 'إعادة المحاولة';
        } else {
            title.textContent = this.sessionData.currentLanguage === 'en' ? 'Review Favorite Questions' : 'مراجعة الأسئلة المفضلة';
            message.textContent = this.sessionData.currentLanguage === 'en' ? 'How would you like to review your favorite questions?' : 'كيف تريد مراجعة الأسئلة المفضلة؟';
            retryText.textContent = this.sessionData.currentLanguage === 'en' ? 'Retry Questions' : 'إعادة المحاولة';
        }

        viewText.textContent = this.sessionData.currentLanguage === 'en' ? 'View with Solutions' : 'عرض مع الحلول';

        this.showModal('review-modal');
    }

    showGlobalFavoritesModal() {
        this.reviewOrigin = 'landing';
        this.showModal('global-favorites-modal');
    }

    startReviewMode(type, viewOnly) {
        // Origin is already set by showReviewModal
        const questions = type === 'errors' ?
            this.getIncorrectQuestions() : this.getFavoriteQuestions();

        if (questions.length === 0) {
            const message = type === 'errors' ?
                (this.sessionData.currentLanguage === 'en' ? 'No incorrect answers to review!' : 'لا توجد إجابات خاطئة للمراجعة!') :
                (this.sessionData.currentLanguage === 'en' ? 'No favorite questions to review!' : 'لا توجد أسئلة مفضلة للمراجعة!');
            alert(message);
            return;
        }

        this.reviewMode = type;
        this.reviewQuestions = questions;
        this.currentQuestionIndex = 0;
        this.viewOnlyMode = viewOnly;
        this.answerSubmitted = viewOnly; // If viewOnly, treat as submitted

        this.showView('quiz');
        this.renderQuestion();
    }

    startGlobalFavoritesReview(viewOnly) {
        // Origin is already set by showGlobalFavoritesModal
        const allFavoriteQuestions = [];

        this.lectures.forEach(lecture => {
            lecture.questions.forEach(question => {
                const questionKey = `${lecture.number}-${question.question_number}`;
                if (this.sessionData.favorites.has(questionKey)) {
                    allFavoriteQuestions.push({
                        ...question,
                        lectureNumber: lecture.number
                    });
                }
            });
        });

        if (allFavoriteQuestions.length === 0) {
            const message = this.sessionData.currentLanguage === 'en' ?
                'No favorite questions found!' : 'لم يتم العثور على أسئلة مفضلة!';
            alert(message);
            return;
        }

        // Create a virtual lecture with all favorite questions
        this.originalLecture = this.currentLecture; // Save original lecture context
        this.currentLecture = {
            number: 'favorites',
            questions: allFavoriteQuestions,
            totalQuestions: allFavoriteQuestions.length
        };

        this.reviewMode = 'global-favorites';
        this.reviewQuestions = allFavoriteQuestions;
        this.currentQuestionIndex = 0;
        this.viewOnlyMode = viewOnly;
        this.answerSubmitted = viewOnly; // If viewOnly, treat as submitted

        this.showView('quiz');
        this.renderQuestion();
    }

    getIncorrectQuestions() {
        return this.currentLecture.questions.filter(question => {
            const questionKey = `${this.currentLecture.number}-${question.question_number}`;
            const answer = this.sessionData.answers.get(questionKey);
            return answer && !answer.correct;
        });
    }

    getFavoriteQuestions() {
        return this.currentLecture.questions.filter(question => {
            const questionKey = `${this.currentLecture.number}-${question.question_number}`;
            return this.sessionData.favorites.has(questionKey);
        });
    }

    retakeAllQuestions() {
        if (confirm(this.sessionData.currentLanguage === 'en' ?
            'Are you sure you want to retake all questions? This will clear your current answers.' :
            'هل أنت متأكد أنك تريد إعادة جميع الأسئلة؟ سيتم مسح إجاباتك الحالية.')) {

            // Clear answers for current lecture
            this.sessionData.answers.forEach((answer, key) => {
                if (key.startsWith(`${this.currentLecture.number}-`)) {
                    this.sessionData.answers.delete(key);
                }
            });

            this.currentQuestionIndex = 0;
            this.answerSubmitted = false;
            this.viewOnlyMode = false;

            this.renderQuestion();
            this.showView('quiz');

            this.saveSessionData();
        }
    }

    exitReviewMode() {
        if (this.reviewMode) {
            this.reviewMode = null;
            this.reviewQuestions = null;
            this.viewOnlyMode = false;
            this.answerSubmitted = false;
            // Restore original lecture if we were in global favorites
            if (this.originalLecture) {
                this.currentLecture = this.originalLecture;
                this.originalLecture = null;
            }
            this.currentQuestionIndex = 0;
            this.reviewOrigin = null;
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        modal.classList.remove('hidden');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }

    // Session Management
    resetSession() {
        const message = this.sessionData.currentLanguage === 'en' ?
            'Are you sure you want to reset your session? This will clear all progress.' :
            'هل أنت متأكد أنك تريد إعادة تعيين الجلسة؟ سيتم مسح جميع التقدم.';

        if (confirm(message)) {
            this.sessionData.answers.clear();
            this.sessionData.favorites.clear();
            this.sessionData.lectureProgress.clear();
            localStorage.removeItem('quizSession');

            if (this.currentView === 'quiz') {
                this.startQuiz(this.currentLecture.number);
            } else if (this.currentView === 'dashboard') {
                this.calculateResults();
                this.renderDashboard();
            }
        }
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new QuizApp();
    setTimeout(() => {
        // Make app globally accessible for inline event handlers (like view-explanation-btn)
        window.app = app;
    }, 100);
});