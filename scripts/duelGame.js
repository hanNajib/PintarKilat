let duelState = {
    questions: [],
    currentQuestionIndex: 0,
    category: '',
    filename: '',
    totalQuestions: 10,
    playerA: { name: 'Player A', score: 0 },
    playerB: { name: 'Player B', score: 0 },
    gamePhase: 'setup', 
    buzzWinner: null, 
    selectedAnswer: null,
    correctAnswer: '',
    maxCombo: 0,
    buzzKeyA: 'a',
    buzzKeyB: 'l'
};
const ANSWER_TIME_LIMIT = 7; 
const READY_COUNTDOWN = 3; 
let timerInterval = null;
let timeRemaining = 0;
let buzzActive = true;
function initDuelGame() {
    try {
        const gameData = gameUtils.parseGameData();
        if (gameData) {
            duelState.category = gameData.category;
            duelState.filename = gameData.filename;
            if (gameData.players && gameData.players.length >= 2) {
                duelState.playerA = {
                    name: gameData.players[0].name,
                    score: 0,
                    avatar: gameData.players[0].avatar
                        ? `../assets/images/avatar/${gameData.players[0].avatar}`
                        : '../assets/images/avatar/bocillakilaki.webp'
                };
                duelState.playerB = {
                    name: gameData.players[1].name,
                    score: 0,
                    avatar: gameData.players[1].avatar
                        ? `../assets/images/avatar/${gameData.players[1].avatar}`
                        : '../assets/images/avatar/bocilperempuan.webp'
                };
                $id('duelSetupScreen').style.display = 'none';
                setupGame();
            } else {
                duelState.playerA = { name: 'Player A', score: 0, avatar: '../assets/images/avatar/bocillakilaki.webp' };
                duelState.playerB = { name: 'Player B', score: 0, avatar: '../assets/images/avatar/bocilperempuan.webp' };
                $id('duelSetupScreen').style.display = 'none';
                setupGame();
            }
        } else {
            duelState.category = 'Pengetahuan Umum';
            duelState.filename = 'umum.csv';
            duelState.playerA = { name: 'Player A', score: 0, avatar: '../assets/images/avatar/bocillakilaki.webp' };
            duelState.playerB = { name: 'Player B', score: 0, avatar: '../assets/images/avatar/bocilperempuan.webp' };
            $id('duelSetupScreen').style.display = 'none';
            setupGame();
        }
    } catch (error) {
        duelState.category = 'Pengetahuan Umum';
        duelState.filename = 'umum.csv';
        duelState.playerA = { name: 'Player A', score: 0, avatar: '../assets/images/avatar/bocillakilaki.webp' };
        duelState.playerB = { name: 'Player B', score: 0, avatar: '../assets/images/avatar/bocilperempuan.webp' };
        $id('duelSetupScreen').style.display = 'none';
        setupGame();
    }
}
function showSetupScreen() {
    $id('duelSetupScreen').style.display = 'flex';
    $id('duelReadyScreen').style.display = 'none';
    $id('duelGameScreen').style.display = 'none';
    duelState.gamePhase = 'setup';
    const btnStartDuel = $id('btnStartDuel');
    if (btnStartDuel) {
        btnStartDuel.addEventListener('click', () => {
            duelState.playerA.name = $id('playerAName').value || 'Player A';
            duelState.playerB.name = $id('playerBName').value || 'Player B';
            if (!duelState.category) {
                duelState.category = 'Pengetahuan Umum';
                duelState.filename = 'umum.csv';
            }
            setupGame();
        });
    }
}
async function setupGame() {
    await loadDuelQuestions();
    setupBuzzerListeners();
    startReadyCountdown();
}
async function loadDuelQuestions() {
    if (duelState.category === 'Custom') {
        const customQuestions = localStorage.getItem('customQuestions');
        if (customQuestions) {
            duelState.questions = JSON.parse(customQuestions);
            duelState.totalQuestions = duelState.questions.length;
            shuffleQuestions();
            return;
        } else {
            alert('Custom questions not found');
            window.location.href = '../index.html';
            return;
        }
    }
    const paths = [
        `../scripts/soal/${duelState.category}/${duelState.filename}`,
        `./scripts/soal/${duelState.category}/${duelState.filename}`,
        `../scripts/soal/${duelState.category}/${duelState.filename}`
    ];
    for (let path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                duelState.questions = parseCSV(text);
                duelState.totalQuestions = duelState.questions.length;
                shuffleQuestions();
                return;
            }
        } catch (error) {
        }
    }
    alert('Tidak bisa load soal!');
    goBackHome();
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
    for (let i = duelState.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [duelState.questions[i], duelState.questions[j]] = [duelState.questions[j], duelState.questions[i]];
    }
}
function setupBuzzerListeners() {
    document.addEventListener('keydown', handleBuzzerKeyboard);
    const btnBuzzA = $id('btnBuzzA');
    const btnBuzzB = $id('btnBuzzB');
    if (btnBuzzA) {
        btnBuzzA.addEventListener('click', () => triggerBuzz('A'));
    }
    if (btnBuzzB) {
        btnBuzzB.addEventListener('click', () => triggerBuzz('B'));
    }
}
function handleBuzzerKeyboard(e) {
    if (!buzzActive) return;
    if (duelState.gamePhase !== 'buzzer_wait') return;
    const key = e.key.toLowerCase();
    if (key === duelState.buzzKeyA) {
        e.preventDefault();
        triggerBuzz('A');
    } else if (key === duelState.buzzKeyB) {
        e.preventDefault();
        triggerBuzz('B');
    }
}
function triggerBuzz(player) {
    if (duelState.buzzWinner) return;
    duelState.buzzWinner = player;
    buzzActive = false;
    stopTimer();
    showAnswersPhase();
}
function startReadyCountdown() {
    $id('duelSetupScreen').style.display = 'none';
    $id('duelReadyScreen').style.display = 'flex';
    $id('duelGameScreen').style.display = 'none';
    duelState.gamePhase = 'ready';
    let count = READY_COUNTDOWN;
    $id('countdown').textContent = count;
    const interval = setInterval(() => {
        count--;
        $id('countdown').textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            startBuzzerWait();
        }
    }, 1000);
}
function startBuzzerWait() {
    $id('duelSetupScreen').style.display = 'none';
    $id('duelReadyScreen').style.display = 'none';
    $id('duelGameScreen').style.display = 'flex';
    duelState.gamePhase = 'buzzer_wait';
    duelState.buzzWinner = null;
    duelState.selectedAnswer = null;
    buzzActive = true;
    $id('duelCategory').textContent = duelState.category;
    $id('qCounter').textContent = `Question ${duelState.currentQuestionIndex + 1} of ${duelState.totalQuestions}`;
    const q = duelState.questions[duelState.currentQuestionIndex];
    $id('questionText').textContent = q.question;
    $id('duelAnswersSection').style.display = 'none';
    $id('duelExplanation').style.display = 'none';
    $id('duelBuzzerUI').style.display = 'flex';
    const btnBuzzA = $id('btnBuzzA');
    const btnBuzzB = $id('btnBuzzB');
    if (btnBuzzA) {
        btnBuzzA.disabled = false;
        $id('buzzAName').textContent = duelState.playerA.name;
    }
    if (btnBuzzB) {
        btnBuzzB.disabled = false;
        $id('buzzBName').textContent = duelState.playerB.name;
    }
    $id('playerADispName').textContent = duelState.playerA.name;
    $id('playerBDispName').textContent = duelState.playerB.name;
    $id('playerAScore').textContent = duelState.playerA.score || 0;
    $id('playerBScore').textContent = duelState.playerB.score || 0;
    const scoreAvatarImg = $id('scorePlayerAAvatarImg');
    const scoreBavatarImg = $id('scorePlayerBAvatarImg');
    if (scoreAvatarImg) {
        scoreAvatarImg.src = duelState.playerA.avatar || '../assets/images/avatar/bocillakilaki.webp';
    }
    if (scoreBavatarImg) {
        scoreBavatarImg.src = duelState.playerB.avatar || '../assets/images/avatar/bocilperempuan.webp';
    }
    const buzzA = $id('playerABuzz');
    const buzzB = $id('playerBBuzz');
    if (buzzA) buzzA.textContent = '';
    if (buzzB) buzzB.textContent = '';
}
function showAnswersPhase() {
    duelState.gamePhase = 'answering';
    const q = duelState.questions[duelState.currentQuestionIndex];
    duelState.correctAnswer = q.answer;
    const buzzEl = duelState.buzzWinner === 'A' ? $id('playerABuzz') : $id('playerBBuzz');
    if (buzzEl) buzzEl.textContent = '⚡';
    $id('duelBuzzerUI').style.display = 'none';
    const btnBuzzA = $id('btnBuzzA');
    const btnBuzzB = $id('btnBuzzB');
    if (btnBuzzA) btnBuzzA.disabled = true;
    if (btnBuzzB) btnBuzzB.disabled = true;
    generateAnswerButtons(q);
    $id('duelAnswersSection').style.display = 'block';
    timeRemaining = ANSWER_TIME_LIMIT;
    updateAnswerTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateAnswerTimer();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (!duelState.selectedAnswer) {
                duelState.selectedAnswer = '';
                checkAnswer();
            }
        }
    }, 1000);
}
function generateAnswerButtons(question) {
    const container = $id('duelAnswers');
    container.innerHTML = '';
    const options = [
        { label: 'A', text: question.optionA },
        { label: 'B', text: question.optionB },
        { label: 'C', text: question.optionC },
        { label: 'D', text: question.optionD }
    ];
    options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'duel-answer-btn';
        btn.textContent = `${opt.label}. ${opt.text}`;
        btn.dataset.answer = opt.label;
        btn.addEventListener('click', () => {
            selectAnswer(opt.label);
        });
        container.appendChild(btn);
    });
}
function selectAnswer(answer) {
    if (duelState.selectedAnswer) return;
    duelState.selectedAnswer = answer;
    stopTimer();
    checkAnswer();
}
function checkAnswer() {
    const isCorrect = duelState.selectedAnswer === duelState.correctAnswer;
    if (isCorrect) {
        if (duelState.buzzWinner === 'A') {
            duelState.playerA.score++;
        } else {
            duelState.playerB.score++;
        }
    } else {
        if (duelState.buzzWinner === 'A') {
            duelState.playerA.score--;
        } else {
            duelState.playerB.score--;
        }
    }
    const buttons = $$('.duel-answer-btn');
    buttons.forEach(btn => {
        if (btn.dataset.answer === duelState.correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.dataset.answer === duelState.selectedAnswer && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    duelState.gamePhase = 'explanation';
    showExplanation(isCorrect);
}
function showExplanation(isCorrect) {
    const title = isCorrect ? 'Benar!' : 'Salah!';
    const q = duelState.questions[duelState.currentQuestionIndex];
    const explanation = `Jawaban benar: ${q.answer}`;
    $id('explanationTitle').textContent = title;
    $id('explanationText').textContent = explanation;
    $id('duelAnswersSection').style.display = 'none';
    $id('duelExplanation').style.display = 'block';
    $id('playerAScore').textContent = duelState.playerA.score || 0;
    $id('playerBScore').textContent = duelState.playerB.score || 0;
    let countdown = 5;
    const countdownEl = $id('duelCountdown');
    if (countdownEl) {
        countdownEl.textContent = countdown;
    }
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownEl && countdown > 0) {
            countdownEl.textContent = countdown;
        }
    }, 1000);
    window.duelAutoNextTimeout = setTimeout(() => {
        clearInterval(countdownInterval);
        nextRound();
    }, 5000);
}
function nextRound() {
    duelState.currentQuestionIndex++;
    if (duelState.currentQuestionIndex < duelState.totalQuestions) {
        startReadyCountdown();
    } else {
        showResults();
    }
}
function showResults() {
    stopTimer();
    const scoreA = duelState.playerA.score;
    const scoreB = duelState.playerB.score;
    let headerText = '';
    if (scoreA > scoreB) {
        headerText = `${duelState.playerA.name} Wins!`;
    } else if (scoreB > scoreA) {
        headerText = `${duelState.playerB.name} Wins!`;
    } else {
        headerText = 'Draw!';
    }
    $id('resultsHeader').textContent = headerText;
    $id('resultPlayer1').textContent = duelState.playerA.name;
    $id('resultScore1').textContent = scoreA || 0;
    $id('resultPlayer2').textContent = duelState.playerB.name;
    $id('resultScore2').textContent = scoreB || 0;
    const modal = $id('duelResultsModal');
    if (modal.showModal) {
        modal.showModal();
    } else {
        modal.style.display = 'flex';
    }
    $id('btnPlayAgainDuel').onclick = playAgainDuel;
    $id('btnBackHomeDuel').onclick = goBackHome;
}
function playAgainDuel() {
    duelState.currentQuestionIndex = 0;
    duelState.playerA.score = 0;
    duelState.playerB.score = 0;
    duelState.buzzWinner = null;
    const modal = $id('duelResultsModal');
    if (modal.close) {
        modal.close();
    } else {
        modal.style.display = 'none';
    }
    shuffleQuestions();
    startReadyCountdown();
}
function updateAnswerTimer() {
    const timerEl = $id('answerTimer');
    if (timerEl) {
        timerEl.textContent = `${timeRemaining}s`;
        if (timeRemaining <= 2) {
            timerEl.style.color = '#ff6b6b';
        } else if (timeRemaining <= 4) {
            timerEl.style.color = '#fbbf24';
        } else {
            timerEl.style.color = 'rgb(var(--color-primary))';
        }
    }
}
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function goBackHome() {
    window.location.href = '../index.html';
}
window.addEventListener('load', () => {
    initDuelGame();
    const btnBack = $id('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (confirm('Keluar dari game?')) {
                goBackHome();
            }
        });
    }
});
