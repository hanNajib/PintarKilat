const classicState = {
    teams: [],
    questions: [],
    currentQuestionIndex: 0,
    buzzEnabled: false,
    buzzedPlayer: null,
    buzzTime: null,
    questionRevealed: false,
    answerLocked: false,
    category: '',
    filename: ''
};
const SCORING = {
    BUZZ_CORRECT: 150,      
    BUZZ_WRONG: -50,        
    SECOND_CHANCE: 50,      
    NO_ANSWER: 0            
};
function initClassicGame() {
    const gameData = gameUtils.getGameData(['category', 'filename']);
    if (!gameData) {
        window.location.href = '../index.html';
        return;
    }
    classicState.category = gameData.category;
    classicState.filename = gameData.filename;
    if (gameData.players && Array.isArray(gameData.players)) {
        generateTeamInputs(gameData.players);
    } else {
        window.location.href = '../index.html';
        return;
    }
    loadQuestions();
    setupEventListeners();
}
async function loadQuestions() {
    try {
        if (classicState.category === 'Custom') {
            const customQuestions = localStorage.getItem('customQuestions');
            if (customQuestions) {
                classicState.questions = JSON.parse(customQuestions);
                classicState.questions = shuffleArray(classicState.questions);
                return;
            } else {
                throw new Error('Custom questions not found in localStorage');
            }
        }
        const response = await fetch(`../scripts/soal/${classicState.category}/${classicState.filename}`);
        const text = await response.text();
        const lines = text.trim().split('\n').slice(1); 
        classicState.questions = lines.map(line => {
            const [id, question, optionA, optionB, optionC, optionD, answer] = line.split(',');
            return { id, question, optionA, optionB, optionC, optionD, answer };
        });
        classicState.questions = shuffleArray(classicState.questions);
    } catch (error) {
        alert('Gagal memuat soal!');
        window.location.href = '../index.html';
    }
}
function setupEventListeners() {
    const btnStartClassic = $id('btnStartClassic');
    btnStartClassic.addEventListener('click', startClassicGame);
}
function generateTeamInputs(playersData) {
    const count = playersData.length;
    const container = $id('teamsInputs');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const player = playersData[i];
        const card = document.createElement('div');
        card.className = 'team-player-card';
        const playerName = player.name || `Tim ${i + 1}`;
        const playerAvatar = player.avatar
            ? `../assets/images/avatar/${player.avatar}`
            : `../assets/images/avatar/avatar${i + 1}.svg`;
        card.innerHTML = `
            <div class="player-card-avatar">
                <img src="${playerAvatar}" 
                     alt="${playerName}"
                     onerror="this.src='../assets/images/avatar/avatar${i + 1}.svg'">
            </div>
            <div class="player-card-name">${playerName}</div>
            <div class="player-card-key">Tombol ${i + 1}</div>
        `;
        container.appendChild(card);
    }
}
function startClassicGame() {
    const gameData = gameUtils.getGameData(['category', 'filename']);
    if (!gameData.players || !Array.isArray(gameData.players)) {
        alert('Data pemain tidak ditemukan!');
        window.location.href = '../index.html';
        return;
    }
    classicState.teams = gameData.players.map((player, index) => ({
        name: player.name,
        score: 0,
        avatar: player.avatar 
            ? `../assets/images/avatar/${player.avatar}`
            : `../assets/images/avatar/avatar${index + 1}.svg`
    }));
    $id('classicSetup').style.display = 'none';
    renderScoreboard();
    $id('categoryName').textContent = classicState.category;
    startReadyCountdown();
}
function renderScoreboard() {
    const container = $id('scoreboard');
    container.innerHTML = '';
    classicState.teams.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'player-score';
        if (classicState.buzzedPlayer === index) {
            div.style.background = 'rgba(var(--color-primary), 0.2)';
            div.style.borderColor = 'rgb(var(--color-primary))';
            div.style.paddingInline = '0.5rem';
            div.style.borderRadius = '8px';
        }
        const avatarSrc = team.avatar || `../assets/images/avatar/avatar${index + 1}.svg`;
        div.innerHTML = `
            <img src="${avatarSrc}" class="avatar-sm" 
                 onerror="this.src='../assets/images/avatar/avatar${index + 1}.svg'">
            <span>${team.name}</span>
            <strong>${team.score || 0}</strong>
        `;
        container.appendChild(div);
    });
}
function startReadyCountdown() {
    const readyScreen = $id('classicReadyScreen');
    const gameScreen = $id('classicGame');
    const countdownEl = $id('countdown');
    readyScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    let count = 3;
    countdownEl.textContent = count;
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(countInterval);
            readyScreen.style.display = 'none';
            gameScreen.style.display = 'flex';
            showQuestion();
        }
    }, 1000);
}
function showQuestion() {
    const q = classicState.questions[classicState.currentQuestionIndex];
    classicState.buzzEnabled = false;
    classicState.buzzedPlayer = null;
    classicState.buzzTime = null;
    classicState.questionRevealed = false;
    classicState.answerLocked = false;
    $id('explanationBox').style.display = 'none';
    const answersSection = $id('answersSection');
    if (answersSection) answersSection.style.display = 'none';
    const buzzerUI = $id('buzzerUI');
    if (buzzerUI) buzzerUI.style.display = 'flex';
    $id('qProgress').textContent = `${classicState.currentQuestionIndex + 1}/${classicState.questions.length}`;
    $id('questionText').textContent = q.question;
    ['A', 'B', 'C', 'D'].forEach(label => {
        const btn = $id(`btn${label}`);
        if (btn) {
            btn.disabled = true;
            btn.className = 'speed-answer-btn';
            btn.style.opacity = '0.5';
        }
    });
    renderBuzzButtons();
    setTimeout(() => {
        classicState.questionRevealed = true;
        classicState.buzzEnabled = true;
        document.querySelectorAll('.buzz-btn').forEach(btn => {
            btn.classList.add('buzz-ready');
        });
    }, 1000);
}
function renderBuzzButtons() {
    const container = $id('buzzerUI');
    if (!container) return;
    container.innerHTML = '';
    const buzzKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
    classicState.teams.forEach((team, index) => {
        const btn = document.createElement('button');
        const key = buzzKeys[index] || (index + 1).toString();
        btn.className = 'buzz-btn';
        btn.dataset.teamIndex = index;
        btn.innerHTML = `
            <span class="buzz-key">${key}</span>
            <span class="buzz-label">${team.name}</span>
        `;
        btn.addEventListener('click', () => handleBuzz(index));
        container.appendChild(btn);
    });
    setupBuzzKeyboardListeners();
}
function setupBuzzKeyboardListeners() {
    if (window.buzzKeyHandler) {
        document.removeEventListener('keydown', window.buzzKeyHandler);
    }
    const buzzKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
    window.buzzKeyHandler = (e) => {
        const key = e.key.toLowerCase();
        const teamIndex = buzzKeys.indexOf(key);
        if (teamIndex !== -1 && teamIndex < classicState.teams.length) {
            handleBuzz(teamIndex);
        }
    };
    document.addEventListener('keydown', window.buzzKeyHandler);
}
function handleBuzz(playerIndex) {
    if (!classicState.buzzEnabled) {
        return;
    }
    if (classicState.buzzedPlayer !== null) {
        return;
    }
    classicState.buzzEnabled = false;
    classicState.buzzedPlayer = playerIndex;
    classicState.buzzTime = Date.now();
    const team = classicState.teams[playerIndex];
    showBuzzIndicator(team.name);
    renderScoreboard();
    setTimeout(() => {
        showAnswerOptions();
    }, 1500);
}
function showBuzzIndicator(teamName) {
}
function showAnswerOptions() {
    const q = classicState.questions[classicState.currentQuestionIndex];
    if (window.buzzKeyHandler) {
        document.removeEventListener('keydown', window.buzzKeyHandler);
    }
    const buzzerUI = $id('buzzerUI');
    if (buzzerUI) buzzerUI.style.display = 'none';
    const answersSection = $id('answersSection');
    if (answersSection) answersSection.style.display = 'block';
    $id('ansTextA').textContent = q.optionA;
    $id('ansTextB').textContent = q.optionB;
    $id('ansTextC').textContent = q.optionC;
    $id('ansTextD').textContent = q.optionD;
    ['A', 'B', 'C', 'D'].forEach(label => {
        const btn = $id(`btn${label}`);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.onclick = () => handleAnswer(label);
        }
    });
}
function handleAnswer(answer) {
    if (classicState.answerLocked) return;
    classicState.answerLocked = true;
    document.querySelectorAll('.speed-answer-btn').forEach(btn => {
        btn.disabled = true;
    });
    setTimeout(() => {
        checkAnswer(answer);
    }, 500);
}
function checkAnswer(answer) {
    const q = classicState.questions[classicState.currentQuestionIndex];
    const correct = answer === q.answer;
    document.querySelectorAll('.speed-answer-btn').forEach(btn => {
        const btnAnswer = btn.dataset.answer;
        if (btnAnswer === q.answer) {
            btn.classList.add('correct');
        } else if (btnAnswer === answer && !correct) {
            btn.classList.add('wrong');
        }
    });
    const buzzedTeam = classicState.teams[classicState.buzzedPlayer];
    let scoreChange = 0;
    let statusText = '';
    let statusColor = '';
    if (correct) {
        scoreChange = SCORING.BUZZ_CORRECT;
        statusText = `CORRECT! +${scoreChange}`;
        statusColor = '#4caf50';
    } else {
        scoreChange = SCORING.BUZZ_WRONG;
        statusText = `WRONG! ${scoreChange}`;
        statusColor = '#f44336';
    }
    buzzedTeam.score += scoreChange;
    renderScoreboard();
    setTimeout(() => {
        showExplanation(statusText, statusColor, q.answer);
    }, 1500);
}
function showExplanation(statusText, statusColor, correctAnswer) {
    const buzzedTeam = classicState.teams[classicState.buzzedPlayer];
    $id('expStatus').textContent = statusText;
    $id('expStatus').style.color = statusColor;
    $id('expText').innerHTML = `
        <div style="margin-bottom: 1rem;">
            Dijawab oleh <strong>${buzzedTeam.name}</strong>
        </div>
        <div style="font-size: 0.9rem; opacity: 0.8;">
            Jawaban benar: <strong>${correctAnswer}</strong>
        </div>
    `;
    $id('explanationBox').style.display = 'block';
    let countdown = 5;
    const countdownEl = $id('classicCountdown');
    if (countdownEl) {
        countdownEl.textContent = countdown;
    }
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownEl && countdown > 0) {
            countdownEl.textContent = countdown;
        }
    }, 1000);
    window.autoNextTimeout = setTimeout(() => {
        clearInterval(countdownInterval);
        nextQuestion();
    }, 5000);
}
function nextQuestion() {
    classicState.currentQuestionIndex++;
    if (classicState.currentQuestionIndex >= classicState.questions.length) {
        showResults();
    } else {
        startReadyCountdown();
    }
}
function showResults() {
    const dialog = $id('resultsDialog');
    const list = $id('resultsList');
    const sorted = [...classicState.teams].sort((a, b) => (b.score || 0) - (a.score || 0));
    list.innerHTML = '';
    sorted.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="result-rank">${index + 1}</div>
            <div class="result-name">${team.name}</div>
            <div class="result-score">${team.score || 0}</div>
        `;
        list.appendChild(div);
    });
    dialog.showModal();
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
$id('btnPlayAgain')?.addEventListener('click', () => {
    window.location.reload();
});
$id('btnBackHome')?.addEventListener('click', () => {
    window.location.href = '../index.html';
});
$id('btnBack')?.addEventListener('click', () => {
    if (confirm('Keluar dari game?')) {
        window.location.href = '../index.html';
    }
});
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassicGame);
} else {
    initClassicGame();
}
