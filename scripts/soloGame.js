let gameState = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    userAnswers: [],
    selectedAnswer: null,
    category: '',
    filename: '',
    combo: 0,
    maxCombo: 0,
    totalQuestions: 10
};
const QUESTION_TIME_LIMIT = 15; 
let timerInterval = null;
let timeRemaining = QUESTION_TIME_LIMIT;
async function initSoloGame() {
    try {
        const data = gameUtils.getGameData(['category', 'filename']);
        gameState.category = data.category;
        gameState.filename = data.filename;
        setupUI();
        await loadSoloQuestions();
    } catch (error) {
        alert('Error initializing game: ' + error.message);
        goBackHome();
    }
}
async function loadSoloQuestions() {
    if (gameState.category === 'Custom') {
        const customQuestions = localStorage.getItem('customQuestions');
        if (customQuestions) {
            gameState.questions = JSON.parse(customQuestions);
            gameState.totalQuestions = gameState.questions.length;
            shuffleQuestions();
            displayQuestion();
            startTimer();
            return;
        } else {
            alert('Custom questions not found');
            goBackHome();
            return;
        }
    }
    const paths = [
        `../scripts/soal/${gameState.category}/${gameState.filename}`,
        `./scripts/soal/${gameState.category}/${gameState.filename}`,
        `../scripts/soal/${gameState.category}/${gameState.filename}`
    ];
    for (let path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                gameState.questions = parseCSV(text);
                gameState.totalQuestions = gameState.questions.length;
                shuffleQuestions();
                displayQuestion();
                startTimer();
                return;
            }
        } catch (error) {
        }
    }
    alert('Could not load questions from: ' + gameState.filename);
}
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const line = lines[i];
        let fields = [];
        let current = '';
        let insideQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        if (fields.length >= 6) {
            questions.push({
                id: parseInt(fields[0]) || i,
                question: fields[1].replace(/"/g, ''),
                optionA: fields[2].replace(/"/g, ''),
                optionB: fields[3].replace(/"/g, ''),
                optionC: fields[4].replace(/"/g, ''),
                optionD: fields[5].replace(/"/g, ''),
                answer: (fields[6] || '').replace(/"/g, '').toUpperCase()
            });
        }
    }
    return questions;
}
function shuffleQuestions() {
    for (let i = gameState.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.questions[i], gameState.questions[j]] = [gameState.questions[j], gameState.questions[i]];
    }
}
function setupUI() {
    const categoryTag = document.getElementById('categoryTag');
    if (categoryTag) {
        categoryTag.textContent = gameState.category;
    }
    const btnQuitSpeed = document.getElementById('btnQuitSpeed');
    if (btnQuitSpeed) {
        btnQuitSpeed.addEventListener('click', () => {
            if (confirm('Keluar dari permainan? Progress Anda akan hilang')) {
                goBackHome();
            }
        });
    }
    const btnPlayAgainSpeed = document.getElementById('btnPlayAgainSpeed');
    if (btnPlayAgainSpeed) {
        btnPlayAgainSpeed.addEventListener('click', playAgainSpeed);
    }
    const btnBackHomeSpeed = document.getElementById('btnBackHomeSpeed');
    if (btnBackHomeSpeed) {
        btnBackHomeSpeed.addEventListener('click', goBackHome);
    }
}
function displayQuestion() {
    const q = gameState.questions[gameState.currentQuestionIndex];
    const qCounter = document.getElementById('qCounter');
    if (qCounter) {
        qCounter.textContent = `Question ${gameState.currentQuestionIndex + 1} of ${gameState.totalQuestions}`;
    }
    const questionText = document.getElementById('questionText');
    if (questionText) {
        questionText.textContent = q.question;
        questionText.style.animation = 'none';
        setTimeout(() => {
            questionText.style.animation = 'questionPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, 10);
    }
    generateAnswerOptions(q);
    gameState.selectedAnswer = null;
    updateComboDisplay();
    timeRemaining = QUESTION_TIME_LIMIT;
    updateTimer();
}
function generateAnswerOptions(question) {
    const answersContainer = document.getElementById('speedAnswers');
    if (!answersContainer) return;
    answersContainer.innerHTML = '';
    const options = [
        { label: 'A', text: question.optionA },
        { label: 'B', text: question.optionB },
        { label: 'C', text: question.optionC },
        { label: 'D', text: question.optionD }
    ];
    options.forEach((option, idx) => {
        const btn = document.createElement('button');
        btn.className = 'speed-answer-btn';
        btn.innerHTML = `<span class="answer-label">${option.label}</span><span class="answer-text">${option.text}</span>`;
        btn.dataset.answer = option.label;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectAnswer(option.label);
        });
        answersContainer.appendChild(btn);
    });
}
function selectAnswer(answer) {
    if (gameState.selectedAnswer !== null) {
        return;
    }
    gameState.selectedAnswer = answer;
    const buttons = document.querySelectorAll('.speed-answer-btn');
    buttons.forEach(btn => {
        if (btn.dataset.answer === answer) {
            btn.classList.add('selected');
        }
    });
    stopTimer();
    setTimeout(() => {
        checkAnswer();
    }, 300);
}
function checkAnswer() {
    const q = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === q.answer;
    gameState.userAnswers.push({
        question: q.question,
        selected: gameState.selectedAnswer,
        correct: q.answer,
        isCorrect: isCorrect
    });
    const buttons = document.querySelectorAll('.speed-answer-btn');
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.combo++;
        gameState.score += 10 * gameState.combo; 
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
        buttons.forEach(btn => {
            if (btn.dataset.answer === q.answer) {
                btn.classList.add('correct');
            }
        });
    } else {
        gameState.wrongAnswers++;
        gameState.combo = 0; 
        buttons.forEach(btn => {
            if (btn.dataset.answer === gameState.selectedAnswer) {
                btn.classList.add('wrong');
            }
            if (btn.dataset.answer === q.answer) {
                btn.classList.add('correct');
            }
        });
    }
    updateScoreDisplay();
    updateComboDisplay();
    setTimeout(() => {
        if (gameState.currentQuestionIndex < gameState.totalQuestions - 1) {
            gameState.currentQuestionIndex++;
            displayQuestion();
        } else {
            showResults();
        }
    }, 1200);
}
function updateScoreDisplay() {
    const scoreEl = document.getElementById('speedScore');
    if (scoreEl) {
        scoreEl.textContent = gameState.score;
    }
    const progressFill = document.getElementById('speedProgressFill');
    if (progressFill) {
        const percent = ((gameState.currentQuestionIndex + 1) / gameState.totalQuestions) * 100;
        progressFill.style.width = percent + '%';
    }
}
function updateComboDisplay() {
    const comboEl = document.getElementById('speedCombo');
    if (comboEl) {
        comboEl.textContent = gameState.combo + 'x';
        if (gameState.combo > 0) {
            comboEl.style.color = '#fbbf24'; 
            comboEl.style.textShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
        } else {
            comboEl.style.color = 'rgb(var(--color-text-secondary))';
            comboEl.style.textShadow = 'none';
        }
    }
}
function startTimer() {
    timeRemaining = QUESTION_TIME_LIMIT;
    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimer();
        if (timeRemaining <= 0) {
            stopTimer();
            if (gameState.selectedAnswer === null) {
                gameState.selectedAnswer = ''; 
                checkAnswer();
            }
        }
    }, 1000);
}
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function updateTimer() {
    const timerEl = document.getElementById('speedTimer');
    if (timerEl) {
        timerEl.textContent = `${timeRemaining}s`;
        if (timeRemaining <= 3) {
            timerEl.style.color = '#ff6b6b'; 
            timerEl.style.animation = 'pulse 0.5s ease-in-out';
        } else if (timeRemaining <= 7) {
            timerEl.style.color = '#fbbf24'; 
            timerEl.style.animation = 'none';
        } else {
            timerEl.style.color = 'rgb(var(--color-primary))';
            timerEl.style.animation = 'none';
        }
    }
}
function showResults() {
    stopTimer();
    const modal = document.getElementById('speedResultsModal');
    if (!modal) return;
    const accuracy = gameState.correctAnswers > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
        : 0;
    let titleText = '';
    if (gameState.correctAnswers === gameState.totalQuestions) {
        titleText = 'Perfect Score!';
    } else if (accuracy >= 80) {
        titleText = 'Excellent!';
    } else if (accuracy >= 60) {
        titleText = 'Good Job!';
    } else if (accuracy >= 40) {
        titleText = 'Keep Playing!';
    } else {
        titleText = 'Try Again!';
    }
    document.getElementById('resultsTitle').textContent = titleText;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('resultCorrect').textContent = gameState.correctAnswers;
    document.getElementById('resultWrong').textContent = gameState.wrongAnswers;
    document.getElementById('resultMaxCombo').textContent = gameState.maxCombo + 'x';
    if (modal.showModal) {
        modal.showModal();
    } else {
        modal.style.display = 'flex';
    }
}
function playAgainSpeed() {
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.userAnswers = [];
    gameState.selectedAnswer = null;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    const modal = document.getElementById('speedResultsModal');
    if (modal) {
        if (modal.close) {
            modal.close();
        } else {
            modal.style.display = 'none';
        }
    }
    updateScoreDisplay();
    updateComboDisplay();
    shuffleQuestions();
    displayQuestion();
}
function goBackHome() {
    window.location.href = '../index.html';
}
window.addEventListener('load', initSoloGame);
