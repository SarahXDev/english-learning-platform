// =============================================
// English Learning Platform - Main JavaScript File
// Comprehensive functionality for all pages
// Uses localStorage for data persistence
// =============================================

// =============================================
// 1. COMMON UTILITIES AND HELPER FUNCTIONS
// =============================================

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initLevelSelection();
    initQuizPage();
    initReadingPage();
    initWritingPage();
    initListeningPage();
    initSpeakingPage();
    initProgressPage();
    
    // Load user progress data
    loadUserProgress();
    
    // Update all stats on the page
    updateAllStats();
});

// Navigation initialization
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// User data management
const USER_DATA_KEY = 'english_learning_user_data';

// Default user data structure
const defaultUserData = {
    // User info
    userLevel: null,
    registrationDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    
    // Quiz data
    quizStats: {
        totalQuizzes: 0,
        totalCorrect: 0,
        averageScore: 0,
        quizHistory: []
    },
    
    // Reading data
    readingStats: {
        textsRead: 0,
        readingTime: 0, // in minutes
        correctAnswers: 0,
        totalQuestions: 0,
        readingHistory: []
    },
    
    // Writing data
    writingStats: {
        writingCount: 0,
        totalWords: 0,
        writingDays: 0,
        lastWritingDate: null,
        writingHistory: []
    },
    
    // Listening data
    listeningStats: {
        listeningCount: 0,
        listeningTime: 0, // in minutes
        correctAnswers: 0,
        totalQuestions: 0,
        listeningHistory: []
    },
    
    // Speaking data
    speakingStats: {
        speakingCount: 0,
        speakingTime: 0, // in minutes
        selfRatingTotal: 0,
        totalEvaluations: 0,
        speakingHistory: []
    },
    
    // Activity log
    activityLog: [],
    
    // Learning streak
    streak: {
        current: 0,
        longest: 0,
        lastActive: null
    }
};

// Get user data from localStorage
function getUserData() {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (data) {
        return JSON.parse(data);
    } else {
        // Initialize with default data
        const defaultData = {...defaultUserData};
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(defaultData));
        return defaultData;
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    // Update last active timestamp
    userData.lastActive = new Date().toISOString();
    
    // Update streak
    updateStreak(userData);
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

// Update user streak
function updateStreak(userData) {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userData.streak.lastActive ? 
        new Date(userData.streak.lastActive).toISOString().split('T')[0] : null;
    
    if (lastActive === today) {
        // Already active today
        return;
    }
    
    if (!lastActive) {
        // First time activity
        userData.streak.current = 1;
        userData.streak.lastActive = new Date().toISOString();
    } else {
        const lastActiveDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastActiveDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            userData.streak.current++;
        } else {
            // Streak broken
            userData.streak.current = 1;
        }
        
        userData.streak.lastActive = new Date().toISOString();
    }
    
    // Update longest streak if current is longer
    if (userData.streak.current > userData.streak.longest) {
        userData.streak.longest = userData.streak.current;
    }
}

// Add activity to log
function addActivity(activityType, activityDetails, score = null) {
    const userData = getUserData();
    
    const activity = {
        id: Date.now(),
        type: activityType,
        details: activityDetails,
        score: score,
        timestamp: new Date().toISOString()
    };
    
    userData.activityLog.unshift(activity);
    
    // Keep only last 50 activities
    if (userData.activityLog.length > 50) {
        userData.activityLog = userData.activityLog.slice(0, 50);
    }
    
    saveUserData(userData);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// =============================================
// 2. LEVEL SELECTION PAGE
// =============================================

function initLevelSelection() {
    const levelButtons = document.querySelectorAll('.btn-level-select');
    const currentLevelInfo = document.getElementById('currentLevelInfo');
    
    if (levelButtons.length === 0) return;
    
    // Load current level
    const userData = getUserData();
    const userLevel = userData.userLevel;
    
    // Update current level display
    if (currentLevelInfo) {
        if (userLevel) {
            const levelNames = {
                beginner: 'مبتدئ',
                intermediate: 'متوسط',
                advanced: 'متقدم'
            };
            
            currentLevelInfo.innerHTML = `
                <div class="current-level-display">
                    <i class="fas fa-check-circle"></i>
                    <h3>المستوى الحالي: <span class="level-name">${levelNames[userLevel]}</span></h3>
                    <p>أنت تتدرب حاليًا على محتوى مستوى <strong>${levelNames[userLevel]}</strong>. يمكنك تغيير مستواك في أي وقت.</p>
                </div>
            `;
        } else {
            currentLevelInfo.innerHTML = `
                <div class="current-level-display">
                    <i class="fas fa-info-circle"></i>
                    <h3>لم تحدد مستواك بعد</h3>
                    <p>اختر مستواك المناسب من الخيارات أدناه لتحصل على محتوى يتناسب مع مهاراتك.</p>
                </div>
            `;
        }
    }
    
    // Handle level selection
    levelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const level = this.getAttribute('data-level');
            selectUserLevel(level);
        });
    });
}

// Select user level
function selectUserLevel(level) {
    const userData = getUserData();
    userData.userLevel = level;
    saveUserData(userData);
    
    // Show success message
    const levelNames = {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم'
    };
    
    alert(`تم اختيار مستوى ${levelNames[level]} بنجاح! سيتم توجيهك إلى المحتوى المناسب لمستواك.`);
    
    // Update display
    initLevelSelection();
    
    // Add activity
    addActivity('level_selection', `اختيار مستوى ${levelNames[level]}`);
}

// =============================================
// 3. QUIZ PAGE
// =============================================

function initQuizPage() {
    // Initialize quiz functionality if on quiz page
    if (!document.querySelector('.quiz-page')) return;
    
    // Quiz data
    const quizData = {
        grammar: [
            {
                id: 1,
                question: "She _____ to the store every day.",
                options: ["go", "goes", "going", "went"],
                correctAnswer: 1,
                explanation: "الجملة في المضارع البسيط مع ضمير she (هي) تأخذ الفعل بـ s",
                level: "beginner",
                type: "grammar"
            },
            {
                id: 2,
                question: "If I _____ you, I would study more.",
                options: ["am", "was", "were", "be"],
                correctAnswer: 2,
                explanation: "في الجمل الشرطية من النوع الثاني نستخدم were مع جميع الضمائر",
                level: "intermediate",
                type: "grammar"
            },
            {
                id: 3,
                question: "By next year, he _____ here for ten years.",
                options: ["will work", "will have worked", "will be working", "works"],
                correctAnswer: 1,
                explanation: "نستخدم future perfect للتعبير عن حدث سيتم بحلول وقت معين في المستقبل",
                level: "advanced",
                type: "grammar"
            }
        ],
        vocabulary: [
            {
                id: 4,
                question: "What is the synonym of 'happy'?",
                options: ["sad", "joyful", "angry", "tired"],
                correctAnswer: 1,
                explanation: "كلمة joyful تعني سعيد وهي مرادف لكلمة happy",
                level: "beginner",
                type: "vocabulary"
            },
            {
                id: 5,
                question: "The weather was so _____ that we decided to stay indoors.",
                options: ["pleasant", "mild", "inclement", "balmy"],
                correctAnswer: 2,
                explanation: "كلمة inclement تعني قاسٍ أو عاصف وتستخدم لوصف الطقس السيء",
                level: "intermediate",
                type: "vocabulary"
            },
            {
                id: 6,
                question: "He showed great _____ in dealing with the difficult situation.",
                options: ["apathy", "sagacity", "frivolity", "malevolence"],
                correctAnswer: 1,
                explanation: "كلمة sagacity تعني الحكمة والتبصر",
                level: "advanced",
                type: "vocabulary"
            }
        ]
    };
    
    // Quiz state
    let quizState = {
        currentQuizType: 'grammar',
        currentDifficulty: 'all',
        currentQuestionIndex: 0,
        score: 0,
        totalQuestions: 0,
        userAnswers: [],
        quizStarted: false,
        timeRemaining: 600, // 10 minutes in seconds
        timerInterval: null
    };
    
    // DOM elements
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizTypeBtns = document.querySelectorAll('.quiz-type-btn');
    const difficultySelect = document.getElementById('difficulty');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizAnswers = document.getElementById('quizAnswers');
    const quizFeedback = document.getElementById('quizFeedback');
    const quizNavigation = document.getElementById('quizNavigation');
    const quizResults = document.getElementById('quizResults');
    
    // Initialize quiz stats
    updateQuizStats();
    
    // Event listeners for quiz type buttons
    quizTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            quizTypeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update quiz type
            quizState.currentQuizType = this.getAttribute('data-type');
        });
    });
    
    // Event listener for difficulty select
    if (difficultySelect) {
        difficultySelect.addEventListener('change', function() {
            quizState.currentDifficulty = this.value;
        });
    }
    
    // Event listener for start quiz button
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    // Start quiz function
    function startQuiz() {
        // Get questions based on type and difficulty
        const questions = getQuizQuestions();
        
        if (questions.length === 0) {
            alert('لا توجد أسئلة متاحة للاختيارات المحددة. يرجى تغيير نوع الاختبار أو مستوى الصعوبة.');
            return;
        }
        
        // Reset quiz state
        quizState.currentQuestionIndex = 0;
        quizState.score = 0;
        quizState.totalQuestions = questions.length;
        quizState.userAnswers = [];
        quizState.quizStarted = true;
        quizState.timeRemaining = 600; // 10 minutes
        
        // Hide start screen and show quiz
        document.querySelector('.start-quiz-screen').style.display = 'none';
        
        // Start timer
        startTimer();
        
        // Display first question
        displayQuestion(questions[0], 0, questions.length);
        
        // Update quiz header
        updateQuizHeader(questions.length);
    }
    
    // Get quiz questions based on current type and difficulty
    function getQuizQuestions() {
        let questions = [];
        
        // Get questions based on type
        if (quizState.currentQuizType === 'grammar') {
            questions = [...quizData.grammar];
        } else if (quizState.currentQuizType === 'vocabulary') {
            questions = [...quizData.vocabulary];
        } else if (quizState.currentQuizType === 'mixed') {
            questions = [...quizData.grammar, ...quizData.vocabulary];
            // Shuffle questions
            questions = shuffleArray(questions);
        }
        
        // Filter by difficulty if not 'all'
        if (quizState.currentDifficulty !== 'all') {
            questions = questions.filter(q => q.level === quizState.currentDifficulty);
        }
        
        // Limit to 10 questions
        return questions.slice(0, 10);
    }
    
    // Display question
    function displayQuestion(question, index, total) {
        // Update question counter
        document.getElementById('currentQuestion').textContent = index + 1;
        document.getElementById('totalQuestions').textContent = total;
        
        // Display question
        quizQuestion.innerHTML = `
            <div class="question-text english-content">${question.question}</div>
        `;
        
        // Display answer options
        quizAnswers.innerHTML = '';
        question.options.forEach((option, i) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'answer-option';
            optionElement.textContent = option;
            optionElement.setAttribute('data-index', i);
            optionElement.addEventListener('click', () => selectAnswer(i, question.correctAnswer));
            quizAnswers.appendChild(optionElement);
        });
        
        // Clear feedback
        quizFeedback.innerHTML = '';
        
        // Update navigation buttons
        updateNavigationButtons(index, total);
    }
    
    // Select answer
    function selectAnswer(selectedIndex, correctIndex) {
        // Disable all answer buttons
        const answerButtons = document.querySelectorAll('.answer-option');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'default';
        });
        
        // Mark selected answer
        const selectedBtn = document.querySelector(`.answer-option[data-index="${selectedIndex}"]`);
        selectedBtn.classList.add('selected');
        
        // Check if answer is correct
        const isCorrect = selectedIndex === correctIndex;
        
        // Mark correct answer
        const correctBtn = document.querySelector(`.answer-option[data-index="${correctIndex}"]`);
        correctBtn.classList.add('correct');
        
        // If wrong, mark selected as wrong
        if (!isCorrect) {
            selectedBtn.classList.add('wrong');
        }
        
        // Update score
        if (isCorrect) {
            quizState.score++;
            updateScoreDisplay();
        }
        
        // Store user answer
        quizState.userAnswers.push({
            questionIndex: quizState.currentQuestionIndex,
            selected: selectedIndex,
            correct: correctIndex,
            isCorrect: isCorrect
        });
        
        // Show feedback
        showFeedback(isCorrect, getCurrentQuestion().explanation);
    }
    
    // Get current question
    function getCurrentQuestion() {
        const questions = getQuizQuestions();
        return questions[quizState.currentQuestionIndex];
    }
    
    // Show feedback
    function showFeedback(isCorrect, explanation) {
        const feedbackClass = isCorrect ? 'feedback-correct' : 'feedback-wrong';
        const feedbackIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
        const feedbackText = isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة';
        
        quizFeedback.innerHTML = `
            <div class="quiz-feedback ${feedbackClass}">
                <i class="fas ${feedbackIcon}"></i>
                <strong>${feedbackText}</strong>
                <p>${explanation}</p>
            </div>
        `;
        
        // Show next button after a delay
        setTimeout(() => {
            document.getElementById('nextQuestionBtn').style.display = 'inline-block';
        }, 1000);
    }
    
    // Update navigation buttons
    function updateNavigationButtons(currentIndex, total) {
        quizNavigation.innerHTML = '';
        
        if (currentIndex > 0) {
            const prevButton = document.createElement('button');
            prevButton.className = 'btn btn-secondary';
            prevButton.innerHTML = '<i class="fas fa-arrow-right"></i> السؤال السابق';
            prevButton.addEventListener('click', () => {
                quizState.currentQuestionIndex--;
                const questions = getQuizQuestions();
                displayQuestion(questions[quizState.currentQuestionIndex], quizState.currentQuestionIndex, total);
            });
            quizNavigation.appendChild(prevButton);
        }
        
        if (currentIndex < total - 1) {
            const nextButton = document.createElement('button');
            nextButton.className = 'btn btn-primary';
            nextButton.id = 'nextQuestionBtn';
            nextButton.innerHTML = 'السؤال التالي <i class="fas fa-arrow-left"></i>';
            nextButton.style.display = 'none';
            nextButton.addEventListener('click', () => {
                quizState.currentQuestionIndex++;
                const questions = getQuizQuestions();
                displayQuestion(questions[quizState.currentQuestionIndex], quizState.currentQuestionIndex, total);
            });
            quizNavigation.appendChild(nextButton);
        } else {
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-primary';
            finishButton.id = 'finishQuizBtn';
            finishButton.innerHTML = 'إنهاء الاختبار <i class="fas fa-flag-checkered"></i>';
            finishButton.style.display = 'none';
            finishButton.addEventListener('click', finishQuiz);
            quizNavigation.appendChild(finishButton);
        }
    }
    
    // Finish quiz
    function finishQuiz() {
        // Stop timer
        clearInterval(quizState.timerInterval);
        
        // Calculate percentage
        const percentage = Math.round((quizState.score / quizState.totalQuestions) * 100);
        
        // Display results
        quizQuestion.style.display = 'none';
        quizAnswers.style.display = 'none';
        quizFeedback.style.display = 'none';
        quizNavigation.style.display = 'none';
        
        quizResults.innerHTML = `
            <div class="quiz-results">
                <div class="results-score">${percentage}%</div>
                <h3 class="results-message">${getResultMessage(percentage)}</h3>
                <div class="results-details">
                    <div class="detail-box">
                        <span class="detail-value">${quizState.score}/${quizState.totalQuestions}</span>
                        <span class="detail-label">إجابات صحيحة</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-value">${formatTime(600 - quizState.timeRemaining)}</span>
                        <span class="detail-label">الوقت المستغرق</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-value">${getDifficultyText()}</span>
                        <span class="detail-label">مستوى الصعوبة</span>
                    </div>
                </div>
                <button class="btn btn-primary" id="restartQuizBtn">بدء اختبار جديد</button>
                <button class="btn btn-secondary" id="reviewAnswersBtn">مراجعة الإجابات</button>
            </div>
        `;
        
        // Save quiz results
        saveQuizResults(percentage);
        
        // Add activity
        addActivity('quiz_completed', `اختبار ${quizState.currentQuizType} - النتيجة: ${percentage}%`, percentage);
        
        // Event listeners for result buttons
        document.getElementById('restartQuizBtn').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('reviewAnswersBtn').addEventListener('click', reviewAnswers);
    }
    
    // Review answers
    function reviewAnswers() {
        const questions = getQuizQuestions();
        
        let reviewHTML = '<div class="answers-review"><h3>مراجعة الإجابات</h3>';
        
        questions.forEach((question, index) => {
            const userAnswer = quizState.userAnswers[index];
            const isCorrect = userAnswer.isCorrect;
            
            reviewHTML += `
                <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
                    <h4>السؤال ${index + 1}: ${question.question}</h4>
                    <p><strong>إجابتك:</strong> ${question.options[userAnswer.selected]}</p>
                    <p><strong>الإجابة الصحيحة:</strong> ${question.options[userAnswer.correct]}</p>
                    <p><strong>التفسير:</strong> ${question.explanation}</p>
                </div>
            `;
        });
        
        reviewHTML += '</div>';
        
        quizResults.innerHTML = reviewHTML;
    }
    
    // Get result message based on percentage
    function getResultMessage(percentage) {
        if (percentage >= 90) return 'ممتاز! أداء رائع';
        if (percentage >= 70) return 'جيد جداً! استمر في التقدم';
        if (percentage >= 50) return 'جيد! يمكنك التحسين أكثر';
        return 'تحتاج إلى ممارسة أكثر';
    }
    
    // Get difficulty text
    function getDifficultyText() {
        const difficultyMap = {
            'all': 'جميع المستويات',
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط',
            'advanced': 'متقدم'
        };
        return difficultyMap[quizState.currentDifficulty];
    }
    
    // Update quiz header
    function updateQuizHeader(totalQuestions) {
        document.getElementById('quizTitle').textContent = `اختبار ${getQuizTypeText()} - ${getDifficultyText()}`;
        document.getElementById('totalQuestions').textContent = totalQuestions;
    }
    
    // Get quiz type text
    function getQuizTypeText() {
        const typeMap = {
            'grammar': 'القواعد',
            'vocabulary': 'المفردات',
            'mixed': 'المختلط'
        };
        return typeMap[quizState.currentQuizType];
    }
    
    // Update score display
    function updateScoreDisplay() {
        document.getElementById('score').textContent = quizState.score;
    }
    
    // Start timer
    function startTimer() {
        updateTimerDisplay();
        
        quizState.timerInterval = setInterval(() => {
            quizState.timeRemaining--;
            updateTimerDisplay();
            
            if (quizState.timeRemaining <= 0) {
                clearInterval(quizState.timerInterval);
                finishQuiz();
            }
        }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(quizState.timeRemaining / 60);
        const seconds = quizState.timeRemaining % 60;
        document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Save quiz results
    function saveQuizResults(percentage) {
        const userData = getUserData();
        
        // Update quiz stats
        userData.quizStats.totalQuizzes++;
        userData.quizStats.totalCorrect += quizState.score;
        userData.quizStats.averageScore = Math.round(
            ((userData.quizStats.averageScore * (userData.quizStats.totalQuizzes - 1)) + percentage) / 
            userData.quizStats.totalQuizzes
        );
        
        // Add to history
        userData.quizStats.quizHistory.unshift({
            date: new Date().toISOString(),
            type: quizState.currentQuizType,
            difficulty: quizState.currentDifficulty,
            score: percentage,
            time: formatTime(600 - quizState.timeRemaining),
            details: {
                correct: quizState.score,
                total: quizState.totalQuestions
            }
        });
        
        // Keep only last 20 quizzes
        if (userData.quizStats.quizHistory.length > 20) {
            userData.quizStats.quizHistory = userData.quizStats.quizHistory.slice(0, 20);
        }
        
        saveUserData(userData);
        updateQuizStats();
        updateQuizHistoryTable();
    }
    
    // Update quiz stats display
    function updateQuizStats() {
        const userData = getUserData();
        const stats = userData.quizStats;
        
        document.getElementById('totalCorrect').textContent = stats.totalCorrect;
        document.getElementById('totalQuizzes').textContent = stats.totalQuizzes;
        document.getElementById('averageScore').textContent = stats.averageScore + '%';
    }
    
    // Update quiz history table
    function updateQuizHistoryTable() {
        const userData = getUserData();
        const history = userData.quizStats.quizHistory;
        const tableBody = document.querySelector('#quizHistoryTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        history.forEach(quiz => {
            const row = document.createElement('tr');
            
            const typeMap = {
                'grammar': 'القواعد',
                'vocabulary': 'المفردات',
                'mixed': 'مختلط'
            };
            
            const difficultyMap = {
                'all': 'جميع المستويات',
                'beginner': 'مبتدئ',
                'intermediate': 'متوسط',
                'advanced': 'متقدم'
            };
            
            row.innerHTML = `
                <td>${formatDate(quiz.date)}</td>
                <td>${typeMap[quiz.type] || quiz.type}</td>
                <td>${difficultyMap[quiz.difficulty] || quiz.difficulty}</td>
                <td>${quiz.score}%</td>
                <td>${quiz.time}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Clear quiz history
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من مسح سجل الاختبارات؟ لا يمكن التراجع عن هذا الإجراء.')) {
                const userData = getUserData();
                userData.quizStats.quizHistory = [];
                saveUserData(userData);
                updateQuizHistoryTable();
                updateQuizStats();
            }
        });
    }
    
    // Utility function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Initialize quiz history table
    updateQuizHistoryTable();
}

// =============================================
// 4. READING PAGE
// =============================================

function initReadingPage() {
    if (!document.querySelector('.reading-page')) return;
    
    // Reading texts data
    const readingTexts = {
        1: {
            id: 1,
            title: "يوم في حياة عائلة",
            level: "beginner",
            content: `My name is Sarah. I am 25 years old. I live with my family in a small house. We have four rooms: a living room, a kitchen, and two bedrooms. Every morning, I wake up at 7 o'clock. I eat breakfast with my family. Then I go to work. I work in an office. I finish work at 5 PM. In the evening, I watch TV with my family. We eat dinner together. Sometimes we visit our friends. I go to bed at 11 o'clock.`,
            wordCount: 150,
            duration: 2,
            vocabulary: [
                { word: "wake up", meaning: "يستيقظ" },
                { word: "breakfast", meaning: "فطور" },
                { word: "office", meaning: "مكتب" },
                { word: "evening", meaning: "مساء" },
                { word: "together", meaning: "معًا" }
            ],
            questions: [
                {
                    question: "What time does Sarah wake up?",
                    options: ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"],
                    correctAnswer: 1
                },
                {
                    question: "Where does Sarah work?",
                    options: ["In a school", "In a hospital", "In an office", "In a shop"],
                    correctAnswer: 2
                },
                {
                    question: "What does Sarah do in the evening?",
                    options: ["She reads books", "She watches TV", "She goes shopping", "She exercises"],
                    correctAnswer: 1
                }
            ],
            fillBlanks: [
                {
                    sentence: "Sarah wakes up at ___ o'clock in the morning.",
                    answer: "7"
                },
                {
                    sentence: "She works in an ___.",
                    answer: "office"
                },
                {
                    sentence: "In the evening, she watches ___ with her family.",
                    answer: "TV"
                }
            ]
        },
        2: {
            id: 2,
            title: "زيارة إلى السوق",
            level: "beginner",
            content: `Today is Saturday. I go to the market with my mother. The market is very big. There are many fruits and vegetables. We buy apples, bananas, and oranges. We also buy tomatoes, onions, and potatoes. My mother buys fish and chicken for dinner. I see my friend Ahmed at the market. He is with his father. We talk for a few minutes. Then we go home. My mother cooks dinner. We eat together. The food is delicious.`,
            wordCount: 200,
            duration: 3,
            vocabulary: [
                { word: "market", meaning: "سوق" },
                { word: "vegetables", meaning: "خضروات" },
                { word: "delicious", meaning: "لذيذ" },
                { word: "few", meaning: "قليل" },
                { word: "cooks", meaning: "يطبخ" }
            ],
            questions: [
                {
                    question: "What day is it in the story?",
                    options: ["Monday", "Wednesday", "Saturday", "Sunday"],
                    correctAnswer: 2
                },
                {
                    question: "Who does the narrator go to the market with?",
                    options: ["Father", "Mother", "Sister", "Friend"],
                    correctAnswer: 1
                },
                {
                    question: "What do they buy at the market?",
                    options: ["Only fruits", "Only vegetables", "Fruits and vegetables", "Only meat"],
                    correctAnswer: 2
                }
            ],
            fillBlanks: [
                {
                    sentence: "They go to the ___ on Saturday.",
                    answer: "market"
                },
                {
                    sentence: "They buy apples, bananas, and ___.",
                    answer: "oranges"
                },
                {
                    sentence: "The mother cooks ___ for dinner.",
                    answer: "fish and chicken"
                }
            ]
        }
    };
    
    // DOM elements
    const textCards = document.querySelectorAll('.select-text-btn');
    const backToSelectionBtn = document.getElementById('backToSelection');
    const readingArea = document.getElementById('readingArea');
    const textSelection = document.querySelector('.text-selection');
    
    // Event listeners for text selection
    textCards.forEach(card => {
        card.addEventListener('click', function() {
            const textId = this.getAttribute('data-text');
            selectReadingText(textId);
        });
    });
    
    // Event listener for back button
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            readingArea.style.display = 'none';
            textSelection.style.display = 'block';
        });
    }
    
    // Select reading text
    function selectReadingText(textId) {
        const text = readingTexts[textId];
        if (!text) return;
        
        // Hide selection and show reading area
        textSelection.style.display = 'none';
        readingArea.style.display = 'block';
        
        // Display text
        displayReadingText(text);
        
        // Initialize reading tools
        initReadingTools(text);
    }
    
    // Display reading text
    function displayReadingText(text) {
        // Update text info
        document.getElementById('readingTitle').textContent = text.title;
        document.getElementById('textLevelDisplay').textContent = 
            text.level === 'beginner' ? 'مبتدئ' : text.level === 'intermediate' ? 'متوسط' : 'متقدم';
        document.getElementById('wordCount').textContent = text.wordCount;
        document.getElementById('readingDuration').textContent = text.duration;
        
        // Display text content
        const textContent = document.getElementById('textContent');
        textContent.innerHTML = `<div class="english-content">${text.content}</div>`;
        
        // Display vocabulary
        const vocabularyList = document.getElementById('vocabularyList');
        vocabularyList.innerHTML = '';
        
        text.vocabulary.forEach(vocab => {
            const vocabItem = document.createElement('div');
            vocabItem.className = 'vocabulary-item';
            vocabItem.innerHTML = `
                <div class="vocabulary-word">${vocab.word}</div>
                <div class="vocabulary-meaning">${vocab.meaning}</div>
            `;
            vocabularyList.appendChild(vocabItem);
        });
        
        // Display comprehension questions
        displayComprehensionQuestions(text.questions);
        
        // Display fill in the blanks
        displayFillBlanks(text.fillBlanks);
    }
    
    // Display comprehension questions
    function displayComprehensionQuestions(questions) {
        const questionsContainer = document.getElementById('questionsContainer');
        questionsContainer.innerHTML = '';
        
        questions.forEach((q, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <div class="question-text english-content">${index + 1}. ${q.question}</div>
                <div class="question-options">
                    ${q.options.map((option, i) => `
                        <div class="option">
                            <input type="radio" id="q${index}_${i}" name="q${index}" value="${i}">
                            <label for="q${index}_${i}" class="english-content">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            questionsContainer.appendChild(questionItem);
        });
        
        // Event listeners for check answers
        const checkAnswersBtn = document.getElementById('checkAnswersBtn');
        const showAnswersBtn = document.getElementById('showAnswersBtn');
        const resultsFeedback = document.getElementById('resultsFeedback');
        
        if (checkAnswersBtn) {
            checkAnswersBtn.addEventListener('click', function() {
                checkReadingAnswers(questions);
            });
        }
        
        if (showAnswersBtn) {
            showAnswersBtn.addEventListener('click', function() {
                showReadingAnswers(questions);
            });
        }
    }
    
    // Display fill in the blanks
    function displayFillBlanks(blanks) {
        const blanksContainer = document.getElementById('blanksContainer');
        if (!blanksContainer) return;
        
        blanksContainer.innerHTML = '';
        
        blanks.forEach((blank, index) => {
            const blankItem = document.createElement('div');
            blankItem.className = 'blank-sentence';
            blankItem.innerHTML = `
                <p class="english-content">${blank.sentence.replace('___', '<input type="text" class="blank-input" data-answer="' + blank.answer + '">')}</p>
            `;
            blanksContainer.appendChild(blankItem);
        });
        
        // Event listeners for fill blanks buttons
        const checkBlanksBtn = document.getElementById('checkBlanksBtn');
        const showBlanksAnswersBtn = document.getElementById('showBlanksAnswersBtn');
        
        if (checkBlanksBtn) {
            checkBlanksBtn.addEventListener('click', checkFillBlanks);
        }
        
        if (showBlanksAnswersBtn) {
            showBlanksAnswersBtn.addEventListener('click', showFillBlanksAnswers);
        }
    }
    
    // Initialize reading tools
    function initReadingTools(text) {
        const highlightToggle = document.getElementById('highlightToggle');
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        
        if (highlightToggle) {
            highlightToggle.addEventListener('click', function() {
                toggleVocabularyHighlight(text.vocabulary);
            });
        }
        
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', function() {
                adjustFontSize(1);
            });
        }
        
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', function() {
                adjustFontSize(-1);
            });
        }
    }
    
    // Toggle vocabulary highlighting
    function toggleVocabularyHighlight(vocabulary) {
        const textContent = document.getElementById('textContent');
        const content = textContent.textContent;
        
        // Remove existing highlights
        textContent.innerHTML = content;
        
        // Add highlights if not already highlighted
        if (!textContent.querySelector('.highlighted-word')) {
            let highlightedContent = content;
            
            vocabulary.forEach(vocab => {
                const regex = new RegExp(`\\b${vocab.word}\\b`, 'gi');
                highlightedContent = highlightedContent.replace(regex, 
                    `<span class="highlighted-word" title="${vocab.meaning}">$&</span>`);
            });
            
            textContent.innerHTML = highlightedContent;
        }
    }
    
    // Adjust font size
    function adjustFontSize(change) {
        const textContent = document.getElementById('textContent');
        const currentSize = parseFloat(window.getComputedStyle(textContent).fontSize);
        const newSize = currentSize + change;
        
        if (newSize >= 12 && newSize <= 24) {
            textContent.style.fontSize = `${newSize}px`;
        }
    }
    
    // Check reading answers
    function checkReadingAnswers(questions) {
        let correctCount = 0;
        const resultsFeedback = document.getElementById('resultsFeedback');
        
        questions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            const options = document.querySelectorAll(`input[name="q${index}"]`);
            
            if (selectedOption) {
                const isCorrect = parseInt(selectedOption.value) === q.correctAnswer;
                
                // Mark options
                options.forEach((option, i) => {
                    const label = document.querySelector(`label[for="q${index}_${i}"]`);
                    if (i === q.correctAnswer) {
                        label.style.color = 'var(--success-color)';
                        label.style.fontWeight = 'bold';
                    } else if (parseInt(option.value) === parseInt(selectedOption.value) && !isCorrect) {
                        label.style.color = 'var(--error-color)';
                    }
                });
                
                if (isCorrect) correctCount++;
            }
        });
        
        // Display results
        const percentage = Math.round((correctCount / questions.length) * 100);
        resultsFeedback.innerHTML = `
            <div class="results-summary">
                <h4>نتيجة الاختبار: ${correctCount}/${questions.length} (${percentage}%)</h4>
                <p>${getReadingResultMessage(percentage)}</p>
            </div>
        `;
        
        // Save reading progress
        saveReadingProgress(correctCount, questions.length);
    }
    
    // Show reading answers
    function showReadingAnswers(questions) {
        const resultsFeedback = document.getElementById('resultsFeedback');
        let answersHTML = '<h4>الإجابات الصحيحة:</h4><ul>';
        
        questions.forEach((q, index) => {
            answersHTML += `<li>السؤال ${index + 1}: ${q.options[q.correctAnswer]}</li>`;
        });
        
        answersHTML += '</ul>';
        resultsFeedback.innerHTML = answersHTML;
    }
    
    // Check fill blanks
    function checkFillBlanks() {
        const blankInputs = document.querySelectorAll('.blank-input');
        let correctCount = 0;
        
        blankInputs.forEach(input => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.getAttribute('data-answer').toLowerCase();
            
            if (userAnswer === correctAnswer) {
                input.style.borderColor = 'var(--success-color)';
                input.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                correctCount++;
            } else {
                input.style.borderColor = 'var(--error-color)';
                input.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            }
        });
        
        // Show results
        alert(`الإجابات الصحيحة: ${correctCount}/${blankInputs.length}`);
    }
    
    // Show fill blanks answers
    function showFillBlanksAnswers() {
        const blankInputs = document.querySelectorAll('.blank-input');
        
        blankInputs.forEach(input => {
            const correctAnswer = input.getAttribute('data-answer');
            input.value = correctAnswer;
            input.style.borderColor = 'var(--success-color)';
            input.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        });
    }
    
    // Get reading result message
    function getReadingResultMessage(percentage) {
        if (percentage >= 90) return 'فهم ممتاز للنص!';
        if (percentage >= 70) return 'فهم جيد للنص';
        if (percentage >= 50) return 'فهم مقبول، يمكنك التحسين';
        return 'تحتاج إلى قراءة النص مرة أخرى وفهمه بشكل أفضل';
    }
    
    // Save reading progress
    function saveReadingProgress(correct, total) {
        const userData = getUserData();
        
        // Update reading stats
        userData.readingStats.textsRead++;
        userData.readingStats.correctAnswers += correct;
        userData.readingStats.totalQuestions += total;
        
        // Calculate reading time (estimate: 2 minutes per 100 words)
        const currentText = document.querySelector('.text-display');
        if (currentText) {
            const wordCount = parseInt(document.getElementById('wordCount').textContent);
            userData.readingStats.readingTime += Math.ceil(wordCount / 50); // 2 minutes per 100 words
        }
        
        // Add to history
        userData.readingStats.readingHistory.unshift({
            date: new Date().toISOString(),
            title: document.getElementById('readingTitle').textContent,
            level: document.getElementById('textLevelDisplay').textContent,
            score: Math.round((correct / total) * 100),
            details: {
                correct: correct,
                total: total
            }
        });
        
        // Keep only last 20 readings
        if (userData.readingStats.readingHistory.length > 20) {
            userData.readingStats.readingHistory = userData.readingStats.readingHistory.slice(0, 20);
        }
        
        saveUserData(userData);
        updateReadingStats();
    }
    
    // Update reading stats
    function updateReadingStats() {
        const userData = getUserData();
        const stats = userData.readingStats;
        
        document.getElementById('textsRead').textContent = stats.textsRead;
        document.getElementById('readingTime').textContent = stats.readingTime;
        
        const accuracy = stats.totalQuestions > 0 ? 
            Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
        document.getElementById('correctAnswers').textContent = accuracy + '%';
    }
    
    // Initialize reading stats
    updateReadingStats();
}

// =============================================
// 5. WRITING PAGE
// =============================================

function initWritingPage() {
    if (!document.querySelector('.writing-page')) return;
    
    // Writing topics data
    const writingTopics = {
        1: {
            id: 1,
            title: "وصف روتينك اليومي",
            level: "beginner",
            category: "daily",
            wordTarget: "80-100",
            timeTarget: 15,
            instructions: "اكتب فقرة تصف فيها روتينك اليومي من الاستيقاظ حتى النوم. استخدم الأفعال في الزمن الحاضر البسيط (Present Simple) وحاول أن تكون وصفك مفصلاً ومنظمًا.",
            modelAnswer: `My daily routine starts early in the morning. I usually wake up at 6:30 AM. After waking up, I brush my teeth and take a shower. Then I have breakfast with my family. I eat toast and drink tea for breakfast. After breakfast, I go to work. I work as a teacher at a local school. My work starts at 8:00 AM and finishes at 3:00 PM. After work, I go home and rest for a while. In the evening, I watch TV or read a book. Sometimes I visit my friends or go for a walk. I have dinner with my family at 7:00 PM. After dinner, I help clean the kitchen. Then I spend some time on my hobbies. I usually go to bed at 11:00 PM.`,
            usefulVocabulary: [
                { word: "wake up", meaning: "يستيقظ" },
                { word: "brush teeth", meaning: "ينظف أسنانه" },
                { word: "take a shower", meaning: "يستحم" },
                { word: "have breakfast", meaning: "يتناول الفطور" },
                { word: "go to work", meaning: "يذهب إلى العمل" },
                { word: "after work", meaning: "بعد العمل" },
                { word: "go to bed", meaning: "يذهب إلى النوم" }
            ]
        },
        2: {
            id: 2,
            title: "وصف عائلتك",
            level: "beginner",
            category: "daily",
            wordTarget: "100-120",
            timeTarget: 20,
            instructions: "اكتب فقرة تصف فيها أفراد عائلتك وعلاقتك بهم. تحدث عن والديك، إخوتك، وأي أفراد آخرين في العائلة.",
            modelAnswer: `I come from a small family. There are five people in my family. My father's name is Ahmed. He is 55 years old. He works as a doctor in a hospital. My mother's name is Fatima. She is 50 years old. She is a teacher at a primary school. I have two siblings. My brother's name is Omar. He is 25 years old. He is an engineer. My sister's name is Sara. She is 20 years old. She is a university student. We live together in a big house in the city. We have a good relationship. We eat dinner together every day. On weekends, we go out together. Sometimes we visit our relatives. I love my family very much. They are always supportive and helpful.`,
            usefulVocabulary: [
                { word: "come from", meaning: "ينحدر من" },
                { word: "siblings", meaning: "إخوة" },
                { word: "engineer", meaning: "مهندس" },
                { word: "university student", meaning: "طالب جامعي" },
                { word: "relationship", meaning: "علاقة" },
                { word: "relatives", meaning: "أقارب" },
                { word: "supportive", meaning: "داعم" }
            ]
        }
    };
    
    // DOM elements
    const topicButtons = document.querySelectorAll('.select-topic-btn');
    const backToTopicsBtn = document.getElementById('backToTopics');
    const writingArea = document.getElementById('writingArea');
    const topicsSelection = document.querySelector('.topics-selection');
    const writingTextarea = document.getElementById('writingTextarea');
    const submitWritingBtn = document.getElementById('submitWritingBtn');
    const showModelAnswerBtn = document.getElementById('showModelAnswerBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');
    
    // Current writing state
    let currentTopic = null;
    let writingTimer = 0;
    let timerInterval = null;
    
    // Event listeners for topic selection
    topicButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topicId = this.getAttribute('data-topic');
            selectWritingTopic(topicId);
        });
    });
    
    // Event listener for back button
    if (backToTopicsBtn) {
        backToTopicsBtn.addEventListener('click', function() {
            writingArea.style.display = 'none';
            topicsSelection.style.display = 'block';
            stopWritingTimer();
        });
    }
    
    // Event listener for textarea input
    if (writingTextarea) {
        writingTextarea.addEventListener('input', updateWritingStats);
    }
    
    // Event listener for submit writing
    if (submitWritingBtn) {
        submitWritingBtn.addEventListener('click', submitWriting);
    }
    
    // Event listener for show model answer
    if (showModelAnswerBtn) {
        showModelAnswerBtn.addEventListener('click', toggleModelAnswer);
    }
    
    // Event listener for save draft
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveWritingDraft);
    }
    
    // Event listener for clear text
    if (clearTextBtn) {
        clearTextBtn.addEventListener('click', clearWritingText);
    }
    
    // Select writing topic
    function selectWritingTopic(topicId) {
        const topic = writingTopics[topicId];
        if (!topic) return;
        
        currentTopic = topic;
        
        // Hide selection and show writing area
        topicsSelection.style.display = 'none';
        writingArea.style.display = 'block';
        
        // Display topic info
        displayTopicInfo(topic);
        
        // Load any saved draft for this topic
        loadWritingDraft(topicId);
        
        // Start writing timer
        startWritingTimer();
        
        // Update previous attempts
        updatePreviousAttempts(topicId);
    }
    
    // Display topic info
    function displayTopicInfo(topic) {
        document.getElementById('writingTopicTitle').textContent = topic.title;
        
        const levelMap = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط',
            'advanced': 'متقدم'
        };
        
        const categoryMap = {
            'daily': 'الحياة اليومية',
            'work': 'العمل والمهنة',
            'education': 'التعليم',
            'opinion': 'الرأي والمناقشة'
        };
        
        document.getElementById('topicLevelDisplay').textContent = levelMap[topic.level];
        document.getElementById('topicCategoryDisplay').textContent = categoryMap[topic.category];
        document.getElementById('wordTarget').textContent = topic.wordTarget;
        document.getElementById('timeTarget').textContent = topic.timeTarget;
        document.getElementById('writingInstructions').textContent = topic.instructions;
        
        // Set model answer content
        document.getElementById('modelAnswerContent').innerHTML = 
            `<div class="english-content">${topic.modelAnswer}</div>`;
        
        // Set useful vocabulary
        const vocabularyContainer = document.getElementById('modelVocabulary');
        vocabularyContainer.innerHTML = '';
        
        topic.usefulVocabulary.forEach(vocab => {
            const vocabItem = document.createElement('div');
            vocabItem.className = 'vocabulary-item';
            vocabItem.innerHTML = `
                <div class="vocabulary-word">${vocab.word}</div>
                <div class="vocabulary-meaning">${vocab.meaning}</div>
            `;
            vocabularyContainer.appendChild(vocabItem);
        });
    }
    
    // Start writing timer
    function startWritingTimer() {
        writingTimer = 0;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            writingTimer++;
            updateTimerDisplay();
        }, 1000);
    }
    
    // Stop writing timer
    function stopWritingTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const timerElement = document.getElementById('writingTimer');
        if (timerElement) {
            timerElement.textContent = formatTime(writingTimer);
        }
    }
    
    // Update writing stats
    function updateWritingStats() {
        const text = writingTextarea.value;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;
        
        document.getElementById('wordCountDisplay').textContent = `${wordCount} كلمة`;
        document.getElementById('characterCountDisplay').textContent = `${charCount} حرف`;
    }
    
    // Submit writing
    function submitWriting() {
        const text = writingTextarea.value.trim();
        
        if (!text) {
            alert('الرجاء كتابة موضوع قبل الإنهاء');
            return;
        }
        
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const wordTarget = currentTopic.wordTarget.split('-').map(Number);
        const minWords = wordTarget[0];
        const maxWords = wordTarget[1] || wordTarget[0];
        
        if (wordCount < minWords) {
            alert(`عدد الكلمات أقل من المطلوب. المطلوب: ${minWords} كلمة على الأقل. كلماتك: ${wordCount}`);
            return;
        }
        
        // Save writing
        saveWritingSubmission(currentTopic.id, text, wordCount, writingTimer);
        
        // Show success message
        alert(`تم حفظ موضوعك بنجاح! عدد الكلمات: ${wordCount}\nالوقت المستغرق: ${formatTime(writingTimer)}`);
        
        // Clear textarea
        writingTextarea.value = '';
        updateWritingStats();
        
        // Stop timer
        stopWritingTimer();
        
        // Update previous attempts
        updatePreviousAttempts(currentTopic.id);
    }
    
    // Toggle model answer
    function toggleModelAnswer() {
        const modelAnswer = document.getElementById('modelAnswer');
        if (modelAnswer.style.display === 'none') {
            modelAnswer.style.display = 'block';
            showModelAnswerBtn.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء نموذج الإجابة';
        } else {
            modelAnswer.style.display = 'none';
            showModelAnswerBtn.innerHTML = '<i class="fas fa-eye"></i> عرض نموذج الإجابة';
        }
    }
    
    // Save writing draft
    function saveWritingDraft() {
        if (!currentTopic) return;
        
        const text = writingTextarea.value;
        const draft = {
            topicId: currentTopic.id,
            text: text,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`writing_draft_${currentTopic.id}`, JSON.stringify(draft));
        alert('تم حفظ المسودة بنجاح');
    }
    
    // Load writing draft
    function loadWritingDraft(topicId) {
        const draftData = localStorage.getItem(`writing_draft_${topicId}`);
        if (draftData) {
            const draft = JSON.parse(draftData);
            writingTextarea.value = draft.text;
            updateWritingStats();
            
            // Ask user if they want to continue with draft
            if (draft.text.trim().length > 0) {
                if (confirm('يوجد مسودة محفوظة لهذا الموضوع. هل تريد استكمالها؟')) {
                    writingTextarea.value = draft.text;
                    updateWritingStats();
                }
            }
        }
    }
    
    // Clear writing text
    function clearWritingText() {
        if (confirm('هل أنت متأكد من مسح النص؟')) {
            writingTextarea.value = '';
            updateWritingStats();
        }
    }
    
    // Save writing submission
    function saveWritingSubmission(topicId, text, wordCount, timeSpent) {
        const userData = getUserData();
        
        // Update writing stats
        userData.writingStats.writingCount++;
        userData.writingStats.totalWords += wordCount;
        
        // Update writing streak
        const today = new Date().toISOString().split('T')[0];
        const lastWritingDate = userData.writingStats.lastWritingDate ? 
            new Date(userData.writingStats.lastWritingDate).toISOString().split('T')[0] : null;
        
        if (lastWritingDate !== today) {
            userData.writingStats.writingDays++;
            userData.writingStats.lastWritingDate = new Date().toISOString();
        }
        
        // Add to history
        const submission = {
            id: Date.now(),
            topicId: topicId,
            title: currentTopic.title,
            level: currentTopic.level,
            text: text,
            wordCount: wordCount,
            timeSpent: timeSpent,
            date: new Date().toISOString()
        };
        
        userData.writingStats.writingHistory.unshift(submission);
        
        // Keep only last 20 submissions
        if (userData.writingStats.writingHistory.length > 20) {
            userData.writingStats.writingHistory = userData.writingStats.writingHistory.slice(0, 20);
        }
        
        saveUserData(userData);
        
        // Clear draft
        localStorage.removeItem(`writing_draft_${topicId}`);
        
        // Add activity
        addActivity('writing_submission', `كتابة موضوع: ${currentTopic.title} - ${wordCount} كلمة`, wordCount);
        
        // Update stats
        updateWritingStatsDisplay();
        updateWritingHistoryTable();
    }
    
    // Update previous attempts
    function updatePreviousAttempts(topicId) {
        const userData = getUserData();
        const previousAttempts = document.getElementById('previousAttempts');
        
        if (!previousAttempts) return;
        
        // Filter attempts for this topic
        const attempts = userData.writingStats.writingHistory
            .filter(attempt => attempt.topicId == topicId)
            .slice(0, 5); // Show only last 5 attempts
        
        if (attempts.length === 0) {
            previousAttempts.innerHTML = '<p>لا توجد محاولات سابقة لهذا الموضوع.</p>';
            return;
        }
        
        let attemptsHTML = '';
        attempts.forEach(attempt => {
            const date = formatDate(attempt.date);
            attemptsHTML += `
                <div class="attempt-item">
                    <div class="attempt-info">
                        <div class="attempt-date">${date}</div>
                        <div class="attempt-words">${attempt.wordCount} كلمة</div>
                    </div>
                    <div class="attempt-time">${formatTime(attempt.timeSpent)}</div>
                </div>
            `;
        });
        
        previousAttempts.innerHTML = attemptsHTML;
    }
    
    // Update writing stats display
    function updateWritingStatsDisplay() {
        const userData = getUserData();
        const stats = userData.writingStats;
        
        document.getElementById('writingCount').textContent = stats.writingCount;
        document.getElementById('totalWords').textContent = stats.totalWords;
        document.getElementById('writingDays').textContent = stats.writingDays;
    }
    
    // Update writing history table
    function updateWritingHistoryTable() {
        const userData = getUserData();
        const history = userData.writingStats.writingHistory;
        const tableBody = document.querySelector('#writingHistoryTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        history.forEach(writing => {
            const row = document.createElement('tr');
            
            const levelMap = {
                'beginner': 'مبتدئ',
                'intermediate': 'متوسط',
                'advanced': 'متقدم'
            };
            
            row.innerHTML = `
                <td>${formatDate(writing.date)}</td>
                <td>${writing.title}</td>
                <td>${levelMap[writing.level] || writing.level}</td>
                <td>${writing.wordCount}</td>
                <td>${formatTime(writing.timeSpent)}</td>
                <td>
                    <button class="btn btn-small view-writing-btn" data-id="${writing.id}">عرض</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-writing-btn').forEach(button => {
            button.addEventListener('click', function() {
                const writingId = parseInt(this.getAttribute('data-id'));
                viewWritingSubmission(writingId);
            });
        });
    }
    
    // View writing submission
    function viewWritingSubmission(writingId) {
        const userData = getUserData();
        const writing = userData.writingStats.writingHistory.find(w => w.id === writingId);
        
        if (writing) {
            alert(`الموضوع: ${writing.title}\n\n${writing.text}\n\nعدد الكلمات: ${writing.wordCount}\nالوقت المستغرق: ${formatTime(writing.timeSpent)}\nالتاريخ: ${formatDate(writing.date)}`);
        }
    }
    
    // Initialize writing stats and history
    updateWritingStatsDisplay();
    updateWritingHistoryTable();
}

// =============================================
// 6. LISTENING PAGE
// =============================================

function initListeningPage() {
    if (!document.querySelector('.listening-page')) return;
    
    // Listening exercises data
    const listeningExercises = {
        1: {
            id: 1,
            title: "في المطعم",
            level: "beginner",
            category: "dialogues",
            duration: "1:30",
            words: 120,
            instructions: "استمع إلى الحوار بعناية. يمكنك الاستماع مرة واحدة أو مرتين حسب حاجتك. بعد الانتهاء، أجب على الأسئلة الموجودة أدناه.",
            transcript: `Waiter: Good evening. Are you ready to order?
Customer: Yes, I think so. I'd like the chicken soup to start.
Waiter: Very good. And for the main course?
Customer: I'll have the grilled salmon with vegetables.
Waiter: Would you like anything to drink?
Customer: Just water, please.
Waiter: Still or sparkling?
Customer: Still water, please.
Waiter: Thank you. Your food will be ready soon.`,
            questions: [
                {
                    question: "What does the customer order first?",
                    options: ["Salad", "Chicken soup", "Fish", "Coffee"],
                    correctAnswer: 1
                },
                {
                    question: "What is the main course?",
                    options: ["Steak", "Grilled salmon", "Pasta", "Pizza"],
                    correctAnswer: 1
                },
                {
                    question: "What does the customer drink?",
                    options: ["Coffee", "Tea", "Juice", "Water"],
                    correctAnswer: 3
                }
            ],
            fillBlanks: [
                {
                    sentence: "The customer orders ___ soup to start.",
                    answer: "chicken"
                },
                {
                    sentence: "For the main course, he has grilled ___.",
                    answer: "salmon"
                },
                {
                    sentence: "He drinks ___ water.",
                    answer: "still"
                }
            ],
            repeatPhrases: [
                "I'd like the chicken soup to start.",
                "I'll have the grilled salmon with vegetables.",
                "Still water, please."
            ]
        },
        2: {
            id: 2,
            title: "في الفندق",
            level: "beginner",
            category: "dialogues",
            duration: "2:00",
            words: 150,
            instructions: "استمع إلى الحوار بين موظف الاستقبال والسائح. حاول فهم التفاصيل الرئيسية للحجز.",
            transcript: `Receptionist: Good morning. How can I help you?
Guest: Good morning. I have a reservation under the name Smith.
Receptionist: Let me check. Yes, Mr. Smith. You've booked a single room for three nights.
Guest: That's right.
Receptionist: Could I see your passport, please?
Guest: Here you are.
Receptionist: Thank you. Your room is 302 on the third floor. Breakfast is served from 7 to 10 AM.
Guest: Thank you. Is there Wi-Fi in the room?
Receptionist: Yes, free Wi-Fi is available throughout the hotel. The password is on your key card.
Guest: Perfect. Thank you.`,
            questions: [
                {
                    question: "How many nights is the reservation for?",
                    options: ["One night", "Two nights", "Three nights", "Four nights"],
                    correctAnswer: 2
                },
                {
                    question: "What room number does the guest get?",
                    options: ["202", "302", "402", "502"],
                    correctAnswer: 1
                },
                {
                    question: "What time is breakfast served?",
                    options: ["6 to 9 AM", "7 to 10 AM", "8 to 11 AM", "9 to 12 PM"],
                    correctAnswer: 1
                }
            ],
            fillBlanks: [
                {
                    sentence: "The reservation is under the name ___.",
                    answer: "Smith"
                },
                {
                    sentence: "The room is on the ___ floor.",
                    answer: "third"
                },
                {
                    sentence: "Free ___ is available in the hotel.",
                    answer: "Wi-Fi"
                }
            ],
            repeatPhrases: [
                "I have a reservation under the name Smith.",
                "Your room is 302 on the third floor.",
                "Breakfast is served from 7 to 10 AM."
            ]
        }
    };
    
    // DOM elements
    const exerciseButtons = document.querySelectorAll('.select-exercise-btn');
    const backToExercisesBtn = document.getElementById('backToExercises');
    const listeningArea = document.getElementById('listeningArea');
    const exercisesSelection = document.querySelector('.exercises-selection');
    
    // Audio simulation (since we can't include real audio files)
    // In a real implementation, you would have actual audio files
    let audioSimulation = {
        isPlaying: false,
        currentTime: 0,
        duration: 90, // 1:30 in seconds
        interval: null
    };
    
    // Event listeners for exercise selection
    exerciseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const exerciseId = this.getAttribute('data-exercise');
            selectListeningExercise(exerciseId);
        });
    });
    
    // Event listener for back button
    if (backToExercisesBtn) {
        backToExercisesBtn.addEventListener('click', function() {
            listeningArea.style.display = 'none';
            exercisesSelection.style.display = 'block';
            stopAudioSimulation();
        });
    }
    
    // Select listening exercise
    function selectListeningExercise(exerciseId) {
        const exercise = listeningExercises[exerciseId];
        if (!exercise) return;
        
        // Hide selection and show listening area
        exercisesSelection.style.display = 'none';
        listeningArea.style.display = 'block';
        
        // Display exercise info
        displayExerciseInfo(exercise);
        
        // Initialize audio player
        initAudioPlayer(exercise);
        
        // Display comprehension questions
        displayListeningQuestions(exercise.questions);
        
        // Display fill in the blanks
        displayListeningFillBlanks(exercise.fillBlanks);
        
        // Initialize repeat after me
        initRepeatExercise(exercise.repeatPhrases);
    }
    
    // Display exercise info
    function displayExerciseInfo(exercise) {
        document.getElementById('listeningTitle').textContent = exercise.title;
        
        const levelMap = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط',
            'advanced': 'متقدم'
        };
        
        const categoryMap = {
            'dialogues': 'حوار',
            'monologues': 'مونولوج',
            'stories': 'قصة',
            'news': 'أخبار'
        };
        
        document.getElementById('exerciseLevelDisplay').textContent = levelMap[exercise.level];
        document.getElementById('exerciseCategoryDisplay').textContent = categoryMap[exercise.category];
        document.getElementById('exerciseDuration').textContent = exercise.duration;
        document.getElementById('exerciseWords').textContent = exercise.words;
        document.getElementById('listeningInstructions').textContent = exercise.instructions;
        
        // Set transcript content
        document.getElementById('transcriptContent').innerHTML = 
            `<div class="english-content">${exercise.transcript}</div>`;
    }
    
    // Initialize audio player
    function initAudioPlayer(exercise) {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const audioProgress = document.getElementById('audioProgress');
        const currentTime = document.getElementById('currentTime');
        const totalTime = document.getElementById('totalTime');
        
        // Parse duration from "MM:SS" format
        const [minutes, seconds] = exercise.duration.split(':').map(Number);
        audioSimulation.duration = minutes * 60 + seconds;
        
        // Update total time display
        totalTime.textContent = exercise.duration;
        
        // Reset simulation
        audioSimulation.currentTime = 0;
        audioSimulation.isPlaying = false;
        
        // Event listeners for audio controls
        if (playBtn) {
            playBtn.addEventListener('click', playAudioSimulation);
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', pauseAudioSimulation);
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', restartAudioSimulation);
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', function() {
                // In a real implementation, this would control audio volume
                console.log(`Volume set to: ${this.value}%`);
            });
        }
        
        // Update progress display
        updateAudioProgress();
    }
    
    // Play audio simulation
    function playAudioSimulation() {
        if (audioSimulation.isPlaying) return;
        
        audioSimulation.isPlaying = true;
        
        audioSimulation.interval = setInterval(() => {
            audioSimulation.currentTime++;
            updateAudioProgress();
            
            if (audioSimulation.currentTime >= audioSimulation.duration) {
                stopAudioSimulation();
            }
        }, 1000);
    }
    
    // Pause audio simulation
    function pauseAudioSimulation() {
        if (!audioSimulation.isPlaying) return;
        
        audioSimulation.isPlaying = false;
        clearInterval(audioSimulation.interval);
    }
    
    // Restart audio simulation
    function restartAudioSimulation() {
        stopAudioSimulation();
        audioSimulation.currentTime = 0;
        updateAudioProgress();
    }
    
    // Stop audio simulation
    function stopAudioSimulation() {
        audioSimulation.isPlaying = false;
        clearInterval(audioSimulation.interval);
        audioSimulation.interval = null;
    }
    
    // Update audio progress
    function updateAudioProgress() {
        const progress = (audioSimulation.currentTime / audioSimulation.duration) * 100;
        const audioProgress = document.getElementById('audioProgress');
        const currentTime = document.getElementById('currentTime');
        
        if (audioProgress) {
            audioProgress.style.width = `${progress}%`;
        }
        
        if (currentTime) {
            currentTime.textContent = formatTime(audioSimulation.currentTime);
        }
    }
    
    // Display listening questions
    function displayListeningQuestions(questions) {
        const questionsContainer = document.getElementById('questionsContainer');
        questionsContainer.innerHTML = '';
        
        questions.forEach((q, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <div class="question-text english-content">${index + 1}. ${q.question}</div>
                <div class="question-options">
                    ${q.options.map((option, i) => `
                        <div class="option">
                            <input type="radio" id="lq${index}_${i}" name="lq${index}" value="${i}">
                            <label for="lq${index}_${i}" class="english-content">${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            questionsContainer.appendChild(questionItem);
        });
        
        // Event listeners for check answers
        const checkAnswersBtn = document.getElementById('checkListeningAnswersBtn');
        const showAnswersBtn = document.getElementById('showListeningAnswersBtn');
        
        if (checkAnswersBtn) {
            checkAnswersBtn.addEventListener('click', function() {
                checkListeningAnswers(questions);
            });
        }
        
        if (showAnswersBtn) {
            showAnswersBtn.addEventListener('click', function() {
                showListeningAnswers(questions);
            });
        }
    }
    
    // Display listening fill blanks
    function displayListeningFillBlanks(blanks) {
        const blanksContainer = document.getElementById('blanksContainer');
        if (!blanksContainer) return;
        
        blanksContainer.innerHTML = '';
        
        blanks.forEach((blank, index) => {
            const blankItem = document.createElement('div');
            blankItem.className = 'blank-sentence';
            blankItem.innerHTML = `
                <p class="english-content">${blank.sentence.replace('___', '<input type="text" class="blank-input" data-answer="' + blank.answer + '">')}</p>
            `;
            blanksContainer.appendChild(blankItem);
        });
        
        // Event listeners for fill blanks buttons
        const checkBlanksBtn = document.getElementById('checkBlanksBtn');
        const showBlanksAnswersBtn = document.getElementById('showBlanksAnswersBtn');
        
        if (checkBlanksBtn) {
            checkBlanksBtn.addEventListener('click', checkListeningFillBlanks);
        }
        
        if (showBlanksAnswersBtn) {
            showBlanksAnswersBtn.addEventListener('click', showListeningFillBlanksAnswers);
        }
    }
    
    // Initialize repeat exercise
    function initRepeatExercise(phrases) {
        const repeatPhrase = document.getElementById('repeatPhrase');
        const playPhraseBtn = document.getElementById('playPhraseBtn');
        const recordBtn = document.getElementById('recordBtn');
        const playRecordedBtn = document.getElementById('playRecordedBtn');
        const recordingStatus = document.getElementById('recordingStatus');
        
        let currentPhraseIndex = 0;
        let recordedAudio = null;
        
        if (repeatPhrase && phrases.length > 0) {
            repeatPhrase.textContent = phrases[currentPhraseIndex];
            
            // Event listener for play phrase button
            if (playPhraseBtn) {
                playPhraseBtn.addEventListener('click', function() {
                    // In a real implementation, this would play the audio
                    alert(`جاري تشغيل الجملة: "${phrases[currentPhraseIndex]}"\n\n(في التطبيق الحقيقي، سيتم تشغيل التسجيل الصوتي)`);
                });
            }
            
            // Event listener for record button
            if (recordBtn) {
                recordBtn.addEventListener('click', function() {
                    if (!recordedAudio) {
                        recordedAudio = [];
                    }
                    
                    // In a real implementation, this would start recording
                    if (recordingStatus) {
                        recordingStatus.textContent = 'جاري التسجيل... اضغط على إيقاف للتوقف';
                        recordingStatus.style.color = 'var(--error-color)';
                    }
                    
                    // Simulate recording
                    setTimeout(() => {
                        if (recordingStatus) {
                            recordingStatus.textContent = 'تم التسجيل بنجاح! اضغط على "استمع لتسجيلك" للاستماع';
                            recordingStatus.style.color = 'var(--success-color)';
                        }
                        
                        // Simulate saving recording
                        recordedAudio[currentPhraseIndex] = `تسجيل محاكاة للجملة: "${phrases[currentPhraseIndex]}"`;
                    }, 2000);
                });
            }
            
            // Event listener for play recorded button
            if (playRecordedBtn) {
                playRecordedBtn.addEventListener('click', function() {
                    if (recordedAudio && recordedAudio[currentPhraseIndex]) {
                        alert(recordedAudio[currentPhraseIndex]);
                    } else {
                        alert('لم تقم بتسجيل هذه الجملة بعد.');
                    }
                });
            }
        }
    }
    
    // Check listening answers
    function checkListeningAnswers(questions) {
        let correctCount = 0;
        const resultsFeedback = document.getElementById('listeningResultsFeedback');
        
        questions.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="lq${index}"]:checked`);
            const options = document.querySelectorAll(`input[name="lq${index}"]`);
            
            if (selectedOption) {
                const isCorrect = parseInt(selectedOption.value) === q.correctAnswer;
                
                // Mark options
                options.forEach((option, i) => {
                    const label = document.querySelector(`label[for="lq${index}_${i}"]`);
                    if (i === q.correctAnswer) {
                        label.style.color = 'var(--success-color)';
                        label.style.fontWeight = 'bold';
                    } else if (parseInt(option.value) === parseInt(selectedOption.value) && !isCorrect) {
                        label.style.color = 'var(--error-color)';
                    }
                });
                
                if (isCorrect) correctCount++;
            }
        });
        
        // Display results
        const percentage = Math.round((correctCount / questions.length) * 100);
        resultsFeedback.innerHTML = `
            <div class="results-summary">
                <h4>نتيجة الاختبار: ${correctCount}/${questions.length} (${percentage}%)</h4>
                <p>${getListeningResultMessage(percentage)}</p>
            </div>
        `;
        
        // Save listening progress
        saveListeningProgress(correctCount, questions.length);
    }
    
    // Show listening answers
    function showListeningAnswers(questions) {
        const resultsFeedback = document.getElementById('listeningResultsFeedback');
        let answersHTML = '<h4>الإجابات الصحيحة:</h4><ul>';
        
        questions.forEach((q, index) => {
            answersHTML += `<li>السؤال ${index + 1}: ${q.options[q.correctAnswer]}</li>`;
        });
        
        answersHTML += '</ul>';
        resultsFeedback.innerHTML = answersHTML;
    }
    
    // Check listening fill blanks
    function checkListeningFillBlanks() {
        const blankInputs = document.querySelectorAll('.blank-input');
        let correctCount = 0;
        
        blankInputs.forEach(input => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.getAttribute('data-answer').toLowerCase();
            
            if (userAnswer === correctAnswer) {
                input.style.borderColor = 'var(--success-color)';
                input.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                correctCount++;
            } else {
                input.style.borderColor = 'var(--error-color)';
                input.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            }
        });
        
        // Show results
        alert(`الإجابات الصحيحة: ${correctCount}/${blankInputs.length}`);
    }
    
    // Show listening fill blanks answers
    function showListeningFillBlanksAnswers() {
        const blankInputs = document.querySelectorAll('.blank-input');
        
        blankInputs.forEach(input => {
            const correctAnswer = input.getAttribute('data-answer');
            input.value = correctAnswer;
            input.style.borderColor = 'var(--success-color)';
            input.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        });
    }
    
    // Get listening result message
    function getListeningResultMessage(percentage) {
        if (percentage >= 90) return 'استماع ممتاز!';
        if (percentage >= 70) return 'فهم جيد للمسموع';
        if (percentage >= 50) return 'فهم مقبول، يمكنك التحسين';
        return 'تحتاج إلى الاستماع مرة أخرى وفهم المسموع بشكل أفضل';
    }
    
    // Save listening progress
    function saveListeningProgress(correct, total) {
        const userData = getUserData();
        
        // Update listening stats
        userData.listeningStats.listeningCount++;
        userData.listeningStats.correctAnswers += correct;
        userData.listeningStats.totalQuestions += total;
        
        // Estimate listening time (use exercise duration)
        const durationElement = document.getElementById('exerciseDuration');
        if (durationElement) {
            const durationText = durationElement.textContent;
            const [minutes, seconds] = durationText.split(':').map(Number);
            userData.listeningStats.listeningTime += minutes + (seconds / 60);
        }
        
        // Add to history
        userData.listeningStats.listeningHistory.unshift({
            date: new Date().toISOString(),
            title: document.getElementById('listeningTitle').textContent,
            level: document.getElementById('exerciseLevelDisplay').textContent,
            score: Math.round((correct / total) * 100),
            details: {
                correct: correct,
                total: total
            }
        });
        
        // Keep only last 20 exercises
        if (userData.listeningStats.listeningHistory.length > 20) {
            userData.listeningStats.listeningHistory = userData.listeningStats.listeningHistory.slice(0, 20);
        }
        
        saveUserData(userData);
        updateListeningStats();
        updateListeningHistoryTable();
        
        // Add activity
        addActivity('listening_completed', `تمرين استماع: ${document.getElementById('listeningTitle').textContent}`, 
                   Math.round((correct / total) * 100));
    }
    
    // Update listening stats
    function updateListeningStats() {
        const userData = getUserData();
        const stats = userData.listeningStats;
        
        document.getElementById('listeningCount').textContent = stats.listeningCount;
        document.getElementById('listeningTime').textContent = Math.round(stats.listeningTime);
        
        const accuracy = stats.totalQuestions > 0 ? 
            Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
        document.getElementById('listeningAccuracy').textContent = accuracy + '%';
    }
    
    // Update listening history table
    function updateListeningHistoryTable() {
        const userData = getUserData();
        const history = userData.listeningStats.listeningHistory;
        const tableBody = document.querySelector('#listeningHistoryTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        history.forEach(exercise => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(exercise.date)}</td>
                <td>${exercise.title}</td>
                <td>${exercise.level}</td>
                <td>${exercise.score}%</td>
                <td>${exercise.details ? `${exercise.details.correct}/${exercise.details.total}` : 'N/A'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Initialize listening stats and history
    updateListeningStats();
    updateListeningHistoryTable();
    
    // Event listener for show transcript button
    const showTranscriptBtn = document.getElementById('showTranscriptBtn');
    if (showTranscriptBtn) {
        showTranscriptBtn.addEventListener('click', function() {
            const transcript = document.getElementById('transcript');
            if (transcript.style.display === 'none') {
                transcript.style.display = 'block';
                showTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> إخفاء النص';
            } else {
                transcript.style.display = 'none';
                showTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> عرض النص';
            }
        });
    }
    
    // Event listener for repeat button
    const repeatBtn = document.getElementById('repeatBtn');
    if (repeatBtn) {
        repeatBtn.addEventListener('click', restartAudioSimulation);
    }
}

// =============================================
// 7. SPEAKING PAGE
// =============================================

function initSpeakingPage() {
    if (!document.querySelector('.speaking-page')) return;
    
    // Speaking topics data
    const speakingTopics = {
        1: {
            id: 1,
            title: "تقديم نفسك",
            level: "beginner",
            category: "personal",
            timeTarget: "1-2",
            wordTarget: "80-100",
            instructions: "تحدث عن نفسك بالإنجليزية: قدم اسمك، جنسيتك، عمرك، مهنتك، هواياتك، وعائلتك. حاول أن تتحدث لمدة دقيقة إلى دقيقتين.",
            guide: [
                "اسمك ومن أين أنت",
                "عمرك ومكان إقامتك",
                "مهنتك أو دراستك",
                "هواياتك واهتماماتك",
                "عائلتك وأفرادها",
                "أي معلومات أخرى تريد مشاركتها"
            ],
            usefulVocabulary: [
                { word: "My name is...", meaning: "اسمي..." },
                { word: "I am from...", meaning: "أنا من..." },
                { word: "I live in...", meaning: "أعيش في..." },
                { word: "I work as...", meaning: "أعمل كـ..." },
                { word: "I study...", meaning: "أدرس..." },
                { word: "My hobby is...", meaning: "هوايتي هي..." },
                { word: "I like to...", meaning: "أحب أن..." }
            ]
        },
        2: {
            id: 2,
            title: "وصف منزلك",
            level: "beginner",
            category: "descriptive",
            timeTarget: "1-2",
            wordTarget: "80-100",
            instructions: "صف منزلك أو شقتك: عدد الغرف، الأثاث، والأماكن المفضلة لديك. حاول أن تتحدث لمدة دقيقة إلى دقيقتين.",
            guide: [
                "نوع المسكن (منزل، شقة، إلخ)",
                "عدد الغرف ووظيفة كل غرفة",
                "الأثاث الموجود في كل غرفة",
                "المكان المفضل لديك في المنزل",
                "ما تحب فعله في المنزل",
                "أي تفاصيل أخرى تريد مشاركتها"
            ],
            usefulVocabulary: [
                { word: "I live in a...", meaning: "أعيش في..." },
                { word: "There are... rooms", meaning: "هناك... غرف" },
                { word: "The living room has...", meaning: "غرفة المعيشة تحتوي على..." },
                { word: "My favorite room is...", meaning: "غرفتي المفضلة هي..." },
                { word: "I like to... in the...", meaning: "أحب أن... في ال..." },
                { word: "It is... (big, small, comfortable)", meaning: "إنه... (كبير، صغير، مريح)" }
            ]
        }
    };
    
    // DOM elements
    const topicButtons = document.querySelectorAll('.select-topic-btn');
    const backToTopicsBtn = document.getElementById('backToTopics');
    const speakingArea = document.getElementById('speakingArea');
    const topicsSelection = document.querySelector('.topics-selection');
    
    // Microphone and recording state
    let recordingState = {
        isRecording: false,
        isPlaying: false,
        recordingTime: 0,
        recordedChunks: [],
        mediaRecorder: null,
        audioBlob: null,
        timerInterval: null
    };
    
    // Event listeners for topic selection
    topicButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topicId = this.getAttribute('data-topic');
            selectSpeakingTopic(topicId);
        });
    });
    
    // Event listener for back button
    if (backToTopicsBtn) {
        backToTopicsBtn.addEventListener('click', function() {
            speakingArea.style.display = 'none';
            topicsSelection.style.display = 'block';
            stopRecording();
        });
    }
    
    // Microphone test functionality
    const testMicBtn = document.getElementById('testMicBtn');
    const stopTestBtn = document.getElementById('stopTestBtn');
    const micLevel = document.getElementById('micLevel');
    const micStatus = document.getElementById('micStatus');
    
    let testInterval = null;
    
    if (testMicBtn) {
        testMicBtn.addEventListener('click', startMicrophoneTest);
    }
    
    if (stopTestBtn) {
        stopTestBtn.addEventListener('click', stopMicrophoneTest);
    }
    
    // Recording controls
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const playRecordingBtn = document.getElementById('playRecordingBtn');
    const saveRecordingBtn = document.getElementById('saveRecordingBtn');
    
    if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', startRecording);
    }
    
    if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', stopRecording);
    }
    
    if (playRecordingBtn) {
        playRecordingBtn.addEventListener('click', playRecording);
    }
    
    if (saveRecordingBtn) {
        saveRecordingBtn.addEventListener('click', saveRecording);
    }
    
    // Self-evaluation
    const evaluationCheckboxes = document.querySelectorAll('.evaluation-checkbox');
    const saveEvaluationBtn = document.getElementById('saveEvaluationBtn');
    
    evaluationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateEvaluationScore);
    });
    
    if (saveEvaluationBtn) {
        saveEvaluationBtn.addEventListener('click', saveEvaluation);
    }
    
    // Tools buttons
    const showTipsBtn = document.getElementById('showTipsBtn');
    const showVocabularyBtn = document.getElementById('showVocabularyBtn');
    
    if (showTipsBtn) {
        showTipsBtn.addEventListener('click', toggleSpeakingTips);
    }
    
    if (showVocabularyBtn) {
        showVocabularyBtn.addEventListener('click', toggleUsefulVocabulary);
    }
    
    // Select speaking topic
    function selectSpeakingTopic(topicId) {
        const topic = speakingTopics[topicId];
        if (!topic) return;
        
        // Hide selection and show speaking area
        topicsSelection.style.display = 'none';
        speakingArea.style.display = 'block';
        
        // Display topic info
        displaySpeakingTopicInfo(topic);
        
        // Update previous recordings
        updatePreviousRecordings(topicId);
    }
    
    // Display speaking topic info
    function displaySpeakingTopicInfo(topic) {
        document.getElementById('speakingTopicTitle').textContent = topic.title;
        
        const levelMap = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط',
            'advanced': 'متقدم'
        };
        
        const categoryMap = {
            'personal': 'شخصي',
            'descriptive': 'وصفي',
            'opinion': 'الرأي',
            'roleplay': 'تمثيل الأدوار'
        };
        
        document.getElementById('topicLevelDisplay').textContent = levelMap[topic.level];
        document.getElementById('topicCategoryDisplay').textContent = categoryMap[topic.category];
        document.getElementById('timeTarget').textContent = topic.timeTarget;
        document.getElementById('wordTarget').textContent = topic.wordTarget;
        document.getElementById('speakingInstructions').textContent = topic.instructions;
        
        // Display speaking guide
        const speakingGuide = document.getElementById('speakingGuide');
        speakingGuide.innerHTML = '';
        
        topic.guide.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            speakingGuide.appendChild(li);
        });
        
        // Display useful vocabulary
        const vocabularyContent = document.getElementById('vocabularyContent');
        vocabularyContent.innerHTML = '';
        
        topic.usefulVocabulary.forEach(vocab => {
            const vocabItem = document.createElement('div');
            vocabItem.className = 'vocabulary-item';
            vocabItem.innerHTML = `
                <div class="vocabulary-word">${vocab.word}</div>
                <div class="vocabulary-meaning">${vocab.meaning}</div>
            `;
            vocabularyContent.appendChild(vocabItem);
        });
    }
    
    // Start microphone test
    function startMicrophoneTest() {
        // In a real implementation, this would access the microphone
        // For this simulation, we'll just simulate microphone activity
        
        if (testInterval) {
            clearInterval(testInterval);
        }
        
        micStatus.textContent = 'جاري اختبار الميكروفون... تحدث الآن';
        micStatus.style.color = 'var(--info-color)';
        
        let level = 0;
        let direction = 1;
        
        testInterval = setInterval(() => {
            // Simulate microphone level changing
            level += direction * 10;
            
            if (level >= 100) {
                direction = -1;
                level = 100;
            } else if (level <= 0) {
                direction = 1;
                level = 0;
            }
            
            micLevel.style.width = `${level}%`;
            
            // Change color based on level
            if (level < 30) {
                micLevel.style.backgroundColor = 'var(--error-color)';
            } else if (level < 70) {
                micLevel.style.backgroundColor = 'var(--warning-color)';
            } else {
                micLevel.style.backgroundColor = 'var(--success-color)';
            }
        }, 100);
    }
    
    // Stop microphone test
    function stopMicrophoneTest() {
        if (testInterval) {
            clearInterval(testInterval);
            testInterval = null;
        }
        
        micLevel.style.width = '0%';
        micStatus.textContent = 'تم إيقاف اختبار الميكروفون';
        micStatus.style.color = 'var(--text-medium)';
    }
    
    // Start recording
    function startRecording() {
        // In a real implementation, this would use the MediaRecorder API
        // For this simulation, we'll simulate recording
        
        recordingState.isRecording = true;
        recordingState.recordingTime = 0;
        
        // Update UI
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        playRecordingBtn.disabled = true;
        saveRecordingBtn.disabled = true;
        
        document.getElementById('recordingStatus').textContent = 'جاري التسجيل...';
        document.getElementById('recordingStatus').style.color = 'var(--error-color)';
        
        // Start timer
        recordingState.timerInterval = setInterval(() => {
            recordingState.recordingTime++;
            updateRecordingTimer();
        }, 1000);
        
        // Simulate visualizer activity
        simulateVisualizer();
    }
    
    // Stop recording
    function stopRecording() {
        if (!recordingState.isRecording) return;
        
        recordingState.isRecording = false;
        
        // Update UI
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        playRecordingBtn.disabled = false;
        saveRecordingBtn.disabled = false;
        
        document.getElementById('recordingStatus').textContent = 'تم التسجيل بنجاح';
        document.getElementById('recordingStatus').style.color = 'var(--success-color)';
        
        // Stop timer
        if (recordingState.timerInterval) {
            clearInterval(recordingState.timerInterval);
        }
        
        // Stop visualizer
        clearInterval(visualizerInterval);
        document.getElementById('visualizerBar').style.height = '0%';
        
        // Update recording info
        document.getElementById('recordingDuration').textContent = `${recordingState.recordingTime} ثانية`;
        document.getElementById('audioQuality').textContent = 'جيد (محاكاة)';
        
        // Simulate creating audio blob
        recordingState.audioBlob = {
            duration: recordingState.recordingTime,
            timestamp: new Date().toISOString()
        };
    }
    
    // Play recording
    function playRecording() {
        if (!recordingState.audioBlob) {
            alert('لا يوجد تسجيل للعب');
            return;
        }
        
        // In a real implementation, this would play the recorded audio
        // For this simulation, we'll show a message
        
        alert(`جاري تشغيل التسجيل...\nالمدة: ${recordingState.recordingTime} ثانية\n\n(في التطبيق الحقيقي، سيتم تشغيل التسجيل الصوتي)`);
    }
    
    // Save recording
    function saveRecording() {
        if (!recordingState.audioBlob) {
            alert('لا يوجد تسجيل لحفظه');
            return;
        }
        
        const topicTitle = document.getElementById('speakingTopicTitle').textContent;
        
        // Save recording data
        saveSpeakingRecording(topicTitle, recordingState.audioBlob);
        
        alert('تم حفظ التسجيل بنجاح');
    }
    
    // Simulate visualizer
    let visualizerInterval = null;
    
    function simulateVisualizer() {
        const visualizerBar = document.getElementById('visualizerBar');
        let height = 0;
        let direction = 1;
        
        visualizerInterval = setInterval(() => {
            if (!recordingState.isRecording) {
                clearInterval(visualizerInterval);
                return;
            }
            
            height += direction * 10;
            
            if (height >= 100) {
                direction = -1;
                height = 100;
            } else if (height <= 0) {
                direction = 1;
                height = 0;
            }
            
            visualizerBar.style.height = `${height}%`;
            
            // Change color based on height
            if (height < 30) {
                visualizerBar.style.backgroundColor = 'var(--error-color)';
            } else if (height < 70) {
                visualizerBar.style.backgroundColor = 'var(--warning-color)';
            } else {
                visualizerBar.style.backgroundColor = 'var(--success-color)';
            }
        }, 100);
    }
    
    // Update recording timer
    function updateRecordingTimer() {
        const timerElement = document.getElementById('recordingTimer');
        if (timerElement) {
            timerElement.textContent = formatTime(recordingState.recordingTime);
        }
    }
    
    // Update evaluation score
    function updateEvaluationScore() {
        const checkboxes = document.querySelectorAll('.evaluation-checkbox:checked');
        const score = checkboxes.length;
        const total = document.querySelectorAll('.evaluation-checkbox').length;
        
        document.getElementById('evaluationScore').textContent = `${score}/${total}`;
    }
    
    // Save evaluation
    function saveEvaluation() {
        const checkboxes = document.querySelectorAll('.evaluation-checkbox:checked');
        const score = checkboxes.length;
        const total = document.querySelectorAll('.evaluation-checkbox').length;
        
        if (score === 0) {
            alert('الرجاء تقييم أدائك قبل الحفظ');
            return;
        }
        
        const topicTitle = document.getElementById('speakingTopicTitle').textContent;
        
        // Save evaluation
        saveSpeakingEvaluation(topicTitle, score, total);
        
        alert(`تم حفظ التقييم بنجاح: ${score}/${total}`);
        
        // Reset checkboxes
        document.querySelectorAll('.evaluation-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        updateEvaluationScore();
    }
    
    // Toggle speaking tips
    function toggleSpeakingTips() {
        const tipsContent = document.getElementById('speakingTipsContent');
        if (tipsContent.style.display === 'none') {
            tipsContent.style.display = 'block';
            showTipsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> إخفاء نصائح التحدث';
        } else {
            tipsContent.style.display = 'none';
            showTipsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> نصائح التحدث';
        }
    }
    
    // Toggle useful vocabulary
    function toggleUsefulVocabulary() {
        const vocabularyContent = document.getElementById('usefulVocabulary');
        if (vocabularyContent.style.display === 'none') {
            vocabularyContent.style.display = 'block';
            showVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> إخفاء المفردات';
        } else {
            vocabularyContent.style.display = 'none';
            showVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> مفردات مفيدة';
        }
    }
    
    // Save speaking recording
    function saveSpeakingRecording(topicTitle, recordingData) {
        const userData = getUserData();
        
        // Update speaking stats
        userData.speakingStats.speakingCount++;
        userData.speakingStats.speakingTime += recordingData.duration / 60; // Convert to minutes
        
        // Add to history
        const recording = {
            id: Date.now(),
            topicTitle: topicTitle,
            duration: recordingData.duration,
            date: new Date().toISOString(),
            evaluation: null // Will be added when evaluation is saved
        };
        
        userData.speakingStats.speakingHistory.unshift(recording);
        
        // Keep only last 20 recordings
        if (userData.speakingStats.speakingHistory.length > 20) {
            userData.speakingStats.speakingHistory = userData.speakingStats.speakingHistory.slice(0, 20);
        }
        
        saveUserData(userData);
        
        // Update previous recordings
        updatePreviousRecordings(getCurrentTopicId());
        
        // Add activity
        addActivity('speaking_recording', `تسجيل تحدث: ${topicTitle} - ${recordingData.duration} ثانية`);
    }
    
    // Save speaking evaluation
    function saveSpeakingEvaluation(topicTitle, score, total) {
        const userData = getUserData();
        
        // Update speaking stats
        userData.speakingStats.selfRatingTotal += score;
        userData.speakingStats.totalEvaluations += total;
        
        // Find the latest recording for this topic and add evaluation
        if (userData.speakingStats.speakingHistory.length > 0) {
            const latestRecording = userData.speakingStats.speakingHistory[0];
            if (latestRecording.topicTitle === topicTitle && !latestRecording.evaluation) {
                latestRecording.evaluation = {
                    score: score,
                    total: total,
                    date: new Date().toISOString()
                };
            }
        }
        
        saveUserData(userData);
        updateSpeakingStats();
        updateSpeakingHistoryTable();
        
        // Add activity
        addActivity('speaking_evaluation', `تقييم تحدث: ${topicTitle} - ${score}/${total}`, 
                   Math.round((score / total) * 100));
    }
    
    // Get current topic ID (simplified)
    function getCurrentTopicId() {
        // This is a simplified version - in a real implementation, 
        // you would track the current topic ID properly
        const title = document.getElementById('speakingTopicTitle').textContent;
        
        // Find topic by title
        for (const id in speakingTopics) {
            if (speakingTopics[id].title === title) {
                return id;
            }
        }
        
        return 1; // Default to first topic
    }
    
    // Update previous recordings
    function updatePreviousRecordings(topicId) {
        const userData = getUserData();
        const recordingsList = document.getElementById('recordingsList');
        
        if (!recordingsList) return;
        
        // Filter recordings for this topic
        const recordings = userData.speakingStats.speakingHistory
            .filter(recording => {
                // Match by topic title (simplified)
                const topic = speakingTopics[topicId];
                return topic && recording.topicTitle === topic.title;
            })
            .slice(0, 5); // Show only last 5 recordings
        
        if (recordings.length === 0) {
            recordingsList.innerHTML = '<p>لا توجد تسجيلات سابقة لهذا الموضوع.</p>';
            return;
        }
        
        let recordingsHTML = '';
        recordings.forEach(recording => {
            const date = formatDate(recording.date);
            const evaluation = recording.evaluation ? 
                `التقييم: ${recording.evaluation.score}/${recording.evaluation.total}` : 
                'لم يتم التقييم';
            
            recordingsHTML += `
                <div class="recording-item">
                    <div class="recording-info">
                        <div class="recording-date">${date}</div>
                        <div class="recording-duration">${recording.duration} ثانية</div>
                    </div>
                    <div class="recording-evaluation">${evaluation}</div>
                </div>
            `;
        });
        
        recordingsList.innerHTML = recordingsHTML;
    }
    
    // Update speaking stats
    function updateSpeakingStats() {
        const userData = getUserData();
        const stats = userData.speakingStats;
        
        document.getElementById('speakingCount').textContent = stats.speakingCount;
        document.getElementById('speakingTime').textContent = Math.round(stats.speakingTime);
        
        const averageRating = stats.totalEvaluations > 0 ? 
            (stats.selfRatingTotal / stats.totalEvaluations).toFixed(1) : 0;
        document.getElementById('selfRating').textContent = averageRating;
    }
    
    // Update speaking history table
    function updateSpeakingHistoryTable() {
        const userData = getUserData();
        const history = userData.speakingStats.speakingHistory;
        const tableBody = document.querySelector('#speakingHistoryTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        history.forEach(recording => {
            const row = document.createElement('tr');
            
            const evaluation = recording.evaluation ? 
                `${recording.evaluation.score}/${recording.evaluation.total}` : 
                'لم يتم';
            
            row.innerHTML = `
                <td>${formatDate(recording.date)}</td>
                <td>${recording.topicTitle}</td>
                <td>${getLevelFromTitle(recording.topicTitle)}</td>
                <td>${formatTime(recording.duration)}</td>
                <td>${evaluation}</td>
                <td>
                    <button class="btn btn-small view-speaking-btn" data-id="${recording.id}">تفاصيل</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-speaking-btn').forEach(button => {
            button.addEventListener('click', function() {
                const recordingId = parseInt(this.getAttribute('data-id'));
                viewSpeakingRecording(recordingId);
            });
        });
    }
    
    // Get level from title (simplified)
    function getLevelFromTitle(title) {
        // This is a simplified version - in a real implementation, 
        // you would store the level with the recording
        for (const id in speakingTopics) {
            if (speakingTopics[id].title === title) {
                const levelMap = {
                    'beginner': 'مبتدئ',
                    'intermediate': 'متوسط',
                    'advanced': 'متقدم'
                };
                return levelMap[speakingTopics[id].level];
            }
        }
        
        return 'غير محدد';
    }
    
    // View speaking recording
    function viewSpeakingRecording(recordingId) {
        const userData = getUserData();
        const recording = userData.speakingStats.speakingHistory.find(r => r.id === recordingId);
        
        if (recording) {
            const evaluation = recording.evaluation ? 
                `التقييم: ${recording.evaluation.score}/${recording.evaluation.total}` : 
                'لم يتم التقييم';
            
            alert(`الموضوع: ${recording.topicTitle}\n\nالمدة: ${recording.duration} ثانية\n${evaluation}\nالتاريخ: ${formatDate(recording.date)}`);
        }
    }
    
    // Initialize speaking stats and history
    updateSpeakingStats();
    updateSpeakingHistoryTable();
}

// =============================================
// 8. PROGRESS PAGE
// =============================================

function initProgressPage() {
    if (!document.querySelector('.progress-page')) return;
    
    // DOM elements
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importDataInput = document.getElementById('importDataInput');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const updateGoalsBtn = document.getElementById('updateGoalsBtn');
    
    // Event listeners
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportUserData);
    }
    
    if (importDataBtn) {
        importDataBtn.addEventListener('click', () => {
            importDataInput.click();
        });
    }
    
    if (importDataInput) {
        importDataInput.addEventListener('change', importUserData);
    }
    
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetUserData);
    }
    
    if (updateGoalsBtn) {
        updateGoalsBtn.addEventListener('click', updateWeeklyGoals);
    }
    
    // Load and display progress data
    loadProgressData();
    updateActivityFeed();
    updateRecommendations();
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeProgressCharts();
    }
}

// Load progress data
function loadProgressData() {
    const userData = getUserData();
    
    // Calculate overall stats
    const totalDays = calculateTotalLearningDays(userData);
    const totalActivities = calculateTotalActivities(userData);
    const totalTime = calculateTotalLearningTime(userData);
    const currentLevel = userData.userLevel ? 
        getLevelName(userData.userLevel) : 'غير محدد';
    
    // Update overall stats
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('totalActivities').textContent = totalActivities;
    document.getElementById('totalTime').textContent = Math.round(totalTime);
    document.getElementById('currentLevel').textContent = currentLevel;
    
    // Update skills progress
    updateSkillsProgress(userData);
}

// Calculate total learning days
function calculateTotalLearningDays(userData) {
    if (!userData.registrationDate) return 0;
    
    const registrationDate = new Date(userData.registrationDate);
    const today = new Date();
    const diffTime = Math.abs(today - registrationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// Calculate total activities
function calculateTotalActivities(userData) {
    return userData.quizStats.totalQuizzes + 
           userData.readingStats.textsRead + 
           userData.writingStats.writingCount + 
           userData.listeningStats.listeningCount + 
           userData.speakingStats.speakingCount;
}

// Calculate total learning time (in hours)
function calculateTotalLearningTime(userData) {
    // Estimates based on activity types
    const quizTime = userData.quizStats.totalQuizzes * 10 / 60; // 10 minutes per quiz
    const readingTime = userData.readingStats.readingTime / 60; // Already in minutes, convert to hours
    const writingTime = userData.writingStats.writingCount * 20 / 60; // 20 minutes per writing
    const listeningTime = userData.listeningStats.listeningTime / 60; // Already in hours
    const speakingTime = userData.speakingStats.speakingTime / 60; // Already in hours
    
    return quizTime + readingTime + writingTime + listeningTime + speakingTime;
}

// Get level name
function getLevelName(level) {
    const levelMap = {
        'beginner': 'مبتدئ',
        'intermediate': 'متوسط',
        'advanced': 'متقدم'
    };
    
    return levelMap[level] || level;
}

// Update skills progress
function updateSkillsProgress(userData) {
    // Quiz progress
    const quizProgress = calculateQuizProgress(userData);
    document.getElementById('quizProgress').style.width = `${quizProgress}%`;
    document.getElementById('quizPercentage').textContent = `${quizProgress}%`;
    document.getElementById('quizDetails').textContent = 
        `${userData.quizStats.totalCorrect} إجابات صحيحة`;
    document.getElementById('quizCompleted').textContent = userData.quizStats.totalQuizzes;
    document.getElementById('quizAverage').textContent = `${userData.quizStats.averageScore}%`;
    
    // Reading progress
    const readingProgress = calculateReadingProgress(userData);
    document.getElementById('readingProgress').style.width = `${readingProgress}%`;
    document.getElementById('readingPercentage').textContent = `${readingProgress}%`;
    document.getElementById('readingDetails').textContent = 
        `${userData.readingStats.textsRead}/${getReadingGoal()} نصوص مقروءة`;
    document.getElementById('readingCompleted').textContent = userData.readingStats.textsRead;
    
    const readingAccuracy = userData.readingStats.totalQuestions > 0 ? 
        Math.round((userData.readingStats.correctAnswers / userData.readingStats.totalQuestions) * 100) : 0;
    document.getElementById('readingAccuracy').textContent = `${readingAccuracy}%`;
    
    // Writing progress
    const writingProgress = calculateWritingProgress(userData);
    document.getElementById('writingProgress').style.width = `${writingProgress}%`;
    document.getElementById('writingPercentage').textContent = `${writingProgress}%`;
    document.getElementById('writingDetails').textContent = 
        `${userData.writingStats.writingCount}/${getWritingGoal()} مواضيع مكتوبة`;
    document.getElementById('writingCompleted').textContent = userData.writingStats.writingCount;
    document.getElementById('writingWords').textContent = userData.writingStats.totalWords;
    
    // Listening progress
    const listeningProgress = calculateListeningProgress(userData);
    document.getElementById('listeningProgress').style.width = `${listeningProgress}%`;
    document.getElementById('listeningPercentage').textContent = `${listeningProgress}%`;
    document.getElementById('listeningDetails').textContent = 
        `${userData.listeningStats.listeningCount}/${getListeningGoal()} تدريبات مكتملة`;
    document.getElementById('listeningCompleted').textContent = userData.listeningStats.listeningCount;
    
    const listeningAccuracy = userData.listeningStats.totalQuestions > 0 ? 
        Math.round((userData.listeningStats.correctAnswers / userData.listeningStats.totalQuestions) * 100) : 0;
    document.getElementById('listeningAccuracy').textContent = `${listeningAccuracy}%`;
    
    // Speaking progress
    const speakingProgress = calculateSpeakingProgress(userData);
    document.getElementById('speakingProgress').style.width = `${speakingProgress}%`;
    document.getElementById('speakingPercentage').textContent = `${speakingProgress}%`;
    document.getElementById('speakingDetails').textContent = 
        `${userData.speakingStats.speakingCount}/${getSpeakingGoal()} تدريبات مكتملة`;
    document.getElementById('speakingCompleted').textContent = userData.speakingStats.speakingCount;
    
    const speakingRating = userData.speakingStats.totalEvaluations > 0 ? 
        (userData.speakingStats.selfRatingTotal / userData.speakingStats.totalEvaluations).toFixed(1) : 0;
    document.getElementById('speakingRating').textContent = `${speakingRating}/5`;
}

// Calculate quiz progress
function calculateQuizProgress(userData) {
    const goal = getQuizGoal();
    return Math.min(Math.round((userData.quizStats.totalQuizzes / goal) * 100), 100);
}

// Calculate reading progress
function calculateReadingProgress(userData) {
    const goal = getReadingGoal();
    return Math.min(Math.round((userData.readingStats.textsRead / goal) * 100), 100);
}

// Calculate writing progress
function calculateWritingProgress(userData) {
    const goal = getWritingGoal();
    return Math.min(Math.round((userData.writingStats.writingCount / goal) * 100), 100);
}

// Calculate listening progress
function calculateListeningProgress(userData) {
    const goal = getListeningGoal();
    return Math.min(Math.round((userData.listeningStats.listeningCount / goal) * 100), 100);
}

// Calculate speaking progress
function calculateSpeakingProgress(userData) {
    const goal = getSpeakingGoal();
    return Math.min(Math.round((userData.speakingStats.speakingCount / goal) * 100), 100);
}

// Get goals (these would normally be based on user level)
function getQuizGoal() { return 20; }
function getReadingGoal() { return 15; }
function getWritingGoal() { return 10; }
function getListeningGoal() { return 15; }
function getSpeakingGoal() { return 10; }

// Update activity feed
function updateActivityFeed() {
    const userData = getUserData();
    const activityFeed = document.getElementById('activityFeed');
    
    if (!activityFeed) return;
    
    const activities = userData.activityLog.slice(0, 10); // Show last 10 activities
    
    if (activities.length === 0) {
        return; // Keep the default empty message
    }
    
    let activitiesHTML = '';
    
    activities.forEach(activity => {
        const activityIcon = getActivityIcon(activity.type);
        const activityText = getActivityText(activity);
        
        activitiesHTML += `
            <div class="activity-item">
                <div class="activity-icon">${activityIcon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activityText}</div>
                    <div class="activity-time">${formatDate(activity.timestamp)}</div>
                </div>
            </div>
        `;
    });
    
    activityFeed.innerHTML = activitiesHTML;
}

// Get activity icon
function getActivityIcon(activityType) {
    const iconMap = {
        'level_selection': '<i class="fas fa-signal text-primary"></i>',
        'quiz_completed': '<i class="fas fa-question-circle text-success"></i>',
        'reading_completed': '<i class="fas fa-book-open text-info"></i>',
        'writing_submission': '<i class="fas fa-pen text-warning"></i>',
        'listening_completed': '<i class="fas fa-headphones text-secondary"></i>',
        'speaking_recording': '<i class="fas fa-microphone text-danger"></i>',
        'speaking_evaluation': '<i class="fas fa-star text-warning"></i>'
    };
    
    return iconMap[activityType] || '<i class="fas fa-circle text-muted"></i>';
}

// Get activity text
function getActivityText(activity) {
    const typeMap = {
        'level_selection': 'تحديد مستوى',
        'quiz_completed': 'إكمال اختبار',
        'reading_completed': 'قراءة نص',
        'writing_submission': 'كتابة موضوع',
        'listening_completed': 'إكمال تدريب استماع',
        'speaking_recording': 'تسجيل تحدث',
        'speaking_evaluation': 'تقييم أداء التحدث'
    };
    
    let text = typeMap[activity.type] || activity.type;
    
    if (activity.details) {
        text += `: ${activity.details}`;
    }
    
    if (activity.score !== null) {
        text += ` (${activity.score}%)`;
    }
    
    return text;
}

// Update recommendations
function updateRecommendations() {
    const userData = getUserData();
    const recommendationsList = document.getElementById('recommendationsList');
    
    if (!recommendationsList) return;
    
    let recommendations = [];
    
    // Check user level
    if (!userData.userLevel) {
        recommendations.push({
            icon: '<i class="fas fa-signal"></i>',
            text: 'ابدأ بتحديد مستواك من صفحة <a href="levels.html">المستويات</a> للحصول على محتوى مناسب لك.'
        });
    }
    
    // Check quiz activity
    if (userData.quizStats.totalQuizzes === 0) {
        recommendations.push({
            icon: '<i class="fas fa-question-circle"></i>',
            text: 'جرب <a href="quiz.html">الاختبارات</a> لتحسين قواعد اللغة والمفردات.'
        });
    } else if (userData.quizStats.averageScore < 70) {
        recommendations.push({
            icon: '<i class="fas fa-question-circle"></i>',
            text: 'يمكنك تحسين نتائجك في <a href="quiz.html">الاختبارات</a> بالتركيز على الأسئلة الخاطئة.'
        });
    }
    
    // Check reading activity
    if (userData.readingStats.textsRead === 0) {
        recommendations.push({
            icon: '<i class="fas fa-book-open"></i>',
            text: 'ابدأ <a href="reading.html">القراءة</a> لتحسين فهم النصوص الإنجليزية.'
        });
    }
    
    // Check writing activity
    if (userData.writingStats.writingCount === 0) {
        recommendations.push({
            icon: '<i class="fas fa-pen"></i>',
            text: 'جرب <a href="writing.html">الكتابة</a> لتحسين مهارة التعبير الكتابي.'
        });
    }
    
    // Check listening activity
    if (userData.listeningStats.listeningCount === 0) {
        recommendations.push({
            icon: '<i class="fas fa-headphones"></i>',
            text: 'تدرب على <a href="listening.html">الاستماع</a> لتحسين فهم اللغة المنطوقة.'
        });
    }
    
    // Check speaking activity
    if (userData.speakingStats.speakingCount === 0) {
        recommendations.push({
            icon: '<i class="fas fa-microphone"></i>',
            text: 'ابدأ <a href="speaking.html">التحدث</a> لتحسين مهارة التعبير الشفهي.'
        });
    }
    
    // Check streak
    if (userData.streak.current > 0 && userData.streak.current < 3) {
        recommendations.push({
            icon: '<i class="fas fa-fire"></i>',
            text: `استمر! لديك ${userData.streak.current} يوم متتالي من التعلم. حاول الوصول إلى 3 أيام.`
        });
    } else if (userData.streak.current >= 3) {
        recommendations.push({
            icon: '<i class="fas fa-trophy"></i>',
            text: `ممتاز! لديك ${userData.streak.current} يوم متتالي من التعلم. استمر في الحفاظ على هذا المستوى.`
        });
    }
    
    // If no specific recommendations, add a general one
    if (recommendations.length === 0) {
        recommendations.push({
            icon: '<i class="fas fa-lightbulb"></i>',
            text: 'أداؤك جيد! حاول التنويع بين المهارات المختلفة لتحقيق تقدم متوازن.'
        });
    }
    
    // Display recommendations
    let recommendationsHTML = '';
    recommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation">
                ${rec.icon}
                <p>${rec.text}</p>
            </div>
        `;
    });
    
    recommendationsList.innerHTML = recommendationsHTML;
}

// Initialize progress charts
function initializeProgressCharts() {
    const userData = getUserData();
    
    // Weekly activity chart
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
        const weeklyData = getWeeklyActivityData(userData);
        
        new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                datasets: [{
                    label: 'عدد الأنشطة',
                    data: weeklyData,
                    backgroundColor: 'rgba(44, 90, 160, 0.7)',
                    borderColor: 'rgba(44, 90, 160, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Skills distribution chart
    const skillsCtx = document.getElementById('skillsChart');
    if (skillsCtx) {
        const skillsData = getSkillsDistributionData(userData);
        
        new Chart(skillsCtx, {
            type: 'doughnut',
            data: {
                labels: ['الاختبارات', 'القراءة', 'الكتابة', 'الاستماع', 'التحدث'],
                datasets: [{
                    data: skillsData,
                    backgroundColor: [
                        'rgba(44, 90, 160, 0.7)',
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(33, 150, 243, 0.7)',
                        'rgba(156, 39, 176, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Monthly progress chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        const monthlyData = getMonthlyProgressData(userData);
        
        new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
                datasets: [{
                    label: 'متوسط النتائج %',
                    data: monthlyData,
                    backgroundColor: 'rgba(44, 90, 160, 0.2)',
                    borderColor: 'rgba(44, 90, 160, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Get weekly activity data
function getWeeklyActivityData(userData) {
    // For this simulation, generate random data
    // In a real implementation, you would calculate actual data
    return Array.from({length: 7}, () => Math.floor(Math.random() * 5) + 1);
}

// Get skills distribution data
function getSkillsDistributionData(userData) {
    const quizWeight = userData.quizStats.totalQuizzes;
    const readingWeight = userData.readingStats.textsRead;
    const writingWeight = userData.writingStats.writingCount;
    const listeningWeight = userData.listeningStats.listeningCount;
    const speakingWeight = userData.speakingStats.speakingCount;
    
    const total = quizWeight + readingWeight + writingWeight + listeningWeight + speakingWeight;
    
    if (total === 0) {
        return [20, 20, 20, 20, 20]; // Equal distribution if no data
    }
    
    return [
        Math.round((quizWeight / total) * 100),
        Math.round((readingWeight / total) * 100),
        Math.round((writingWeight / total) * 100),
        Math.round((listeningWeight / total) * 100),
        Math.round((speakingWeight / total) * 100)
    ];
}

// Get monthly progress data
function getMonthlyProgressData(userData) {
    // For this simulation, generate data showing improvement
    // In a real implementation, you would use actual historical data
    const base = userData.quizStats.averageScore || 50;
    return [
        base - 10,
        base - 5,
        base,
        base + 5
    ].map(value => Math.max(0, Math.min(100, value)));
}

// Export user data
function exportUserData() {
    const userData = getUserData();
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `english_learning_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import user data
function importUserData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the data structure (basic validation)
            if (importedData && typeof importedData === 'object') {
                if (confirm('هل تريد استيراد بيانات التقدم؟ سيتم استبدال بياناتك الحالية.')) {
                    localStorage.setItem(USER_DATA_KEY, JSON.stringify(importedData));
                    alert('تم استيراد البيانات بنجاح');
                    location.reload();
                }
            } else {
                alert('ملف البيانات غير صالح');
            }
        } catch (error) {
            alert('خطأ في قراءة ملف البيانات: ' + error.message);
        }
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
}

// Reset user data
function resetUserData() {
    if (confirm('هل أنت متأكد من مسح جميع بيانات التقدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        localStorage.removeItem(USER_DATA_KEY);
        alert('تم مسح جميع البيانات. سيتم إعادة تحميل الصفحة.');
        location.reload();
    }
}

// Update weekly goals
function updateWeeklyGoals() {
    // This is a simplified implementation
    // In a real app, you might have more sophisticated goal setting
    
    const goals = [
        'أكمل 3 اختبارات في القواعد',
        'اقرأ نصين إنجليزيين',
        'اكتب موضوعًا واحدًا',
        'أكمل تدريبين استماع',
        'سجل تدريب تحدث واحد'
    ];
    
    let newGoalsHTML = '';
    goals.forEach((goal, index) => {
        newGoalsHTML += `
            <li class="goal-item">
                <input type="checkbox" id="goal${index + 1}">
                <label for="goal${index + 1}">${goal}</label>
            </li>
        `;
    });
    
    const goalsList = document.querySelector('.goals-list');
    if (goalsList) {
        goalsList.innerHTML = newGoalsHTML;
    }
    
    alert('تم تحديث الأهداف الأسبوعية');
}

// =============================================
// 9. GLOBAL FUNCTIONS
// =============================================

// Load user progress (called on page load)
function loadUserProgress() {
    // This function ensures user data is initialized
    getUserData();
}

function updateAllStats() {
    const userData = typeof getUserData === "function" ? getUserData() : {};

    if (document.querySelector('.quiz-page')) {
        // handled elsewhere
    } else if (document.querySelector('.reading-page')) {
        updateReadingStats?.();
    } else if (document.querySelector('.writing-page')) {
        updateWritingStatsDisplay?.();
    } else if (document.querySelector('.listening-page')) {
        updateListeningStats?.();
    } else if (document.querySelector('.speaking-page')) {
        updateSpeakingStats?.();
    } else if (document.querySelector('.progress-page')) {
        loadProgressData?.();
    }
}


// =============================================
// 10. INITIALIZATION COMPLETE
// =============================================

console.log('English Learning Platform initialized successfully');