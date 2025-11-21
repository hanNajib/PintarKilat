let allSOAL = {};
let selectedCategory = null;
let selectedTopic = null;
let duelPlayers = [];
let duelPlayerCount = 2;
let currentPlayerIndex = 0;
let classicPlayers = [];
let classicPlayerCount = 1;
let classicCurrentPlayerIndex = 0;
const avatarImages = [
  'bocillakilaki.webp',
  'bocilperempuan.webp',
  'lakilaki.webp',
  'perempuan.webp',
  'semangka.webp',
  'alpukat.webp',
  'jeruk.webp',
  'mangga.webp',
  'wortel.webp'
];
const generateAvatarGrid = () => {
  const avatarGrid = $id('avatarGrid');
  avatarGrid.innerHTML = '';
  avatarImages.forEach((imageName, index) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option';
    btn.type = 'button';
    btn.dataset.avatar = imageName;
    const img = document.createElement('img');
    img.src = `./assets/images/avatar/${imageName}`;
    img.alt = `Avatar ${index + 1}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      $$('.avatar-option').forEach(opt => opt.classList.remove('selected'));
      btn.classList.add('selected');
      $id('playerName').dataset.selectedAvatar = imageName;
    });
    avatarGrid.appendChild(btn);
  });
};
const initDuelPlayerCountModal = () => {
  const playerCountModal = $id('duelPlayerCountModal');
  const playerCountNext = $id('playerCountNext');
  const playerCountClose = $id('duelCountModalClose');
  if (playerCountClose) {
    playerCountClose.addEventListener('click', () => {
      playerCountModal.close();
    });
  }
  if (playerCountNext) {
    playerCountNext.addEventListener('click', () => {
      duelPlayerCount = parseInt($id('playerCount').value) || 2;
      duelPlayers = [];
      currentPlayerIndex = 0;
      playerCountModal.close();
      setTimeout(() => {
        generateAvatarGrid();
        $id('duelPlayerRegisterModal').showModal();
      }, 300);
    });
  }
};
const initDuelPlayerRegisterModal = () => {
  const registerModal = $id('duelPlayerRegisterModal');
  const registerNext = $id('playerRegisterNext');
  const registerClose = $id('duelRegisterModalClose');
  const playerName = $id('playerName');
  if (registerClose) {
    registerClose.addEventListener('click', () => {
      registerModal.close();
    });
  }
    if (registerNext) {
    registerNext.addEventListener('click', () => {
      const name = playerName.value.trim();
      const avatar = playerName.dataset.selectedAvatar || avatarImages[0];
      if (!name) {
        alert('Masukkan nama pemain');
        return;
      }      duelPlayers.push({ name, avatar });
      currentPlayerIndex++;
      if (currentPlayerIndex < duelPlayerCount) {
        playerName.value = '';
        playerName.dataset.selectedAvatar = '';
        $id('playerRegisterDesc').textContent = `Pemain ${currentPlayerIndex + 1} dari ${duelPlayerCount}`;
        $$('.avatar-option').forEach(opt => opt.classList.remove('selected'));
      } else {
        registerModal.close();
        setTimeout(() => {
          generateDuelSoalCards();
          $id('duelSoalModal').showModal();
        }, 300);
      }
    });
  }
};
const initClassicPlayerCountModal = () => {
  const playerCountModal = $id('classicPlayerCountModal');
  const playerCountNext = $id('classicCountNext');
  const playerCountClose = $id('classicCountModalClose');
  if (playerCountClose) {
    playerCountClose.addEventListener('click', () => {
      playerCountModal.close();
    });
  }
  if (playerCountNext) {
    playerCountNext.addEventListener('click', () => {
      classicPlayerCount = parseInt($id('classicPlayerCount').value) || 1;
      classicPlayers = [];
      classicCurrentPlayerIndex = 0;
      playerCountModal.close();
      setTimeout(() => {
        generateClassicAvatarGrid();
        $id('classicPlayerRegisterModal').showModal();
      }, 300);
    });
  }
};
const initClassicPlayerRegisterModal = () => {
  const registerModal = $id('classicPlayerRegisterModal');
  const registerNext = $id('classicPlayerRegisterNext');
  const registerClose = $id('classicRegisterModalClose');
  const playerName = $id('classicPlayerName');
  if (registerClose) {
    registerClose.addEventListener('click', () => {
      registerModal.close();
    });
  }
  if (registerNext) {
    registerNext.addEventListener('click', () => {
      const name = playerName.value.trim();
      const avatar = playerName.dataset.selectedAvatar || avatarImages[0];
      if (!name) {
        alert('Masukkan nama pemain');
        return;
      }
      classicPlayers.push({ name, avatar });
      classicCurrentPlayerIndex++;
      if (classicCurrentPlayerIndex < classicPlayerCount) {
        playerName.value = '';
        playerName.dataset.selectedAvatar = '';
        $id('classicPlayerRegisterDesc').textContent = `Pemain ${classicCurrentPlayerIndex + 1} dari ${classicPlayerCount}`;
        $$('.avatar-option').forEach(opt => opt.classList.remove('selected'));
      } else {
        registerModal.close();
        setTimeout(() => {
          navigateClassic();
        }, 300);
      }
    });
  }
};
const generateClassicAvatarGrid = () => {
  const avatarGrid = $id('classicAvatarGrid');
  avatarGrid.innerHTML = '';
  avatarImages.forEach((imageName, index) => {
    const btn = document.createElement('button');
    btn.className = 'avatar-option';
    btn.type = 'button';
    btn.dataset.avatar = imageName;
    const img = document.createElement('img');
    img.src = `./assets/images/avatar/${imageName}`;
    img.alt = `Avatar ${index + 1}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      $$('#classicAvatarGrid .avatar-option').forEach(opt => opt.classList.remove('selected'));
      btn.classList.add('selected');
      $id('classicPlayerName').dataset.selectedAvatar = imageName;
    });
    avatarGrid.appendChild(btn);
  });
};
const generateDuelSoalCards = () => {
  const duelSoalContainer = $id('duelSoalContainer');
  duelSoalContainer.innerHTML = '';
  const categories = getAllCategories(allSOAL);
  categories.forEach(category => {
    const fileCount = 1; 
    const card = document.createElement('button');
    card.className = 'soal-card';
    card.dataset.category = category;
    const description = `${fileCount} topik`;
    card.innerHTML = `
      <div class="soal-icon">
        <i class="bi bi-folder2-open"></i>
      </div>
      <div class="soal-content">
        <h3 class="soal-title">${category}</h3>
        <p class="soal-desc">${description}</p>
      </div>
      <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    card.addEventListener('click', () => {
      selectDuelCategory(category);
    });
    duelSoalContainer.appendChild(card);
  });
};
const selectDuelCategory = (category) => {
  selectedCategory = category;
  const duelSoalContainer = $id('duelSoalContainer');
  duelSoalContainer.innerHTML = '';
  const backButton = document.createElement('button');
  backButton.className = 'soal-card soal-back-btn';
  backButton.innerHTML = `
    <div class="soal-icon">
      <i class="bi bi-arrow-left"></i>
    </div>
    <div class="soal-content">
      <h3 class="soal-title">Kembali</h3>
      <p class="soal-desc">Pilih kategori lain</p>
    </div>
  `;
  backButton.addEventListener('click', () => {
    generateDuelSoalCards();
  });
  duelSoalContainer.appendChild(backButton);
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'soal-loading';
  loadingDiv.textContent = 'Memuat file soal...';
  duelSoalContainer.appendChild(loadingDiv);
  (async () => {
    try {
      const manifestResp = await fetch('./scripts/soal/manifest.json');
      if (!manifestResp.ok) throw new Error(`Manifest failed: ${manifestResp.status}`);
      const manifestData = await manifestResp.json();
      const categoryFiles = manifestData.categories?.[category] || [];
      if (!categoryFiles || categoryFiles.length === 0) {
        loadingDiv.textContent = 'Tidak ada file soal di kategori ini';
        return;
      }
      loadingDiv.remove();
      for (const filename of categoryFiles) {
        try {
          const count = await getFileQuestionCount(category, filename);
          const card = document.createElement('button');
          card.className = 'soal-card';
          card.dataset.filename = filename;
          card.innerHTML = `
            <div class="soal-icon">
              <i class="bi bi-file-text"></i>
            </div>
            <div class="soal-content">
              <h3 class="soal-title">${filename.replace('.csv', '')}</h3>
              <p class="soal-desc">${count} soal</p>
            </div>
            <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
          card.addEventListener('click', () => {
            selectDuelFile(category, filename);
          });
          duelSoalContainer.appendChild(card);
        } catch (err) {
        }
      }
    } catch (error) {
      loadingDiv.textContent = `Error: ${error.message}`;
    }
  })();
};
const selectDuelFile = (category, filename) => {
  selectedCategory = category;
  selectedTopic = filename.replace('.csv', '');
  navigateDuel(category, filename);
};
const navigateDuel = (category, filename) => {
  $id('duelSoalModal').close();
  const duelParams = btoa(JSON.stringify({ category, filename, players: duelPlayers }));
  window.location.href = `./game/duel.html?data=${duelParams}`;
};
const generateSoloSoalCards = () => {
  const soloSoalContainer = $id('soloSoalContainer');
  soloSoalContainer.innerHTML = '';
  const categories = getAllCategories(allSOAL);
  categories.forEach(category => {
    const fileCount = 1; 
    const card = document.createElement('button');
    card.className = 'soal-card';
    card.dataset.category = category;
    const description = `${fileCount} topik`;
    card.innerHTML = `
      <div class="soal-icon">
        <i class="bi bi-folder2-open"></i>
      </div>
      <div class="soal-content">
        <h3 class="soal-title">${category}</h3>
        <p class="soal-desc">${description}</p>
      </div>
      <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    card.addEventListener('click', () => {
      selectSoloCategory(category);
    });
    soloSoalContainer.appendChild(card);
  });
};
const selectSoloCategory = (category) => {
  selectedCategory = category;
  const soloSoalContainer = $id('soloSoalContainer');
  soloSoalContainer.innerHTML = '';
  const backButton = document.createElement('button');
  backButton.className = 'soal-card soal-back-btn';
  backButton.innerHTML = `
    <div class="soal-icon">
      <i class="bi bi-arrow-left"></i>
    </div>
    <div class="soal-content">
      <h3 class="soal-title">Kembali</h3>
      <p class="soal-desc">Pilih kategori lain</p>
    </div>
  `;
  backButton.addEventListener('click', () => {
    generateSoloSoalCards();
  });
  soloSoalContainer.appendChild(backButton);
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'soal-loading';
  loadingDiv.textContent = 'Memuat file soal...';
  soloSoalContainer.appendChild(loadingDiv);
  (async () => {
    try {
      const manifestResp = await fetch('./scripts/soal/manifest.json');
      if (!manifestResp.ok) throw new Error(`Manifest failed: ${manifestResp.status}`);
      const manifestData = await manifestResp.json();
      const categoryFiles = manifestData.categories?.[category] || [];
      if (!categoryFiles || categoryFiles.length === 0) {
        loadingDiv.textContent = 'Tidak ada file soal di kategori ini';
        return;
      }
      loadingDiv.remove();
      for (const filename of categoryFiles) {
        try {
          const count = await getFileQuestionCount(category, filename);
          const card = document.createElement('button');
          card.className = 'soal-card';
          card.dataset.filename = filename;
          card.innerHTML = `
            <div class="soal-icon">
              <i class="bi bi-file-text"></i>
            </div>
            <div class="soal-content">
              <h3 class="soal-title">${filename.replace('.csv', '')}</h3>
              <p class="soal-desc">${count} soal</p>
            </div>
            <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
          card.addEventListener('click', () => {
            selectSoloFile(category, filename);
          });
          soloSoalContainer.appendChild(card);
        } catch (err) {
        }
      }
    } catch (error) {
      loadingDiv.textContent = `Error: ${error.message}`;
    }
  })();
};
const selectSoloFile = (category, filename) => {
  selectedCategory = category;
  selectedTopic = filename.replace('.csv', '');
  navigateSolo(category, filename);
};
const navigateSolo = (category, filename) => {
  $id('soloSoalModal').close();
  const soloParams = btoa(JSON.stringify({ category, filename }));
  window.location.href = `./game/solo.html?data=${soloParams}`;
};
const generateCategoryCards = () => {
  const soalContainer = $id('soalContainer');
  soalContainer.innerHTML = '';
  const categories = getAllCategories(allSOAL);
  categories.forEach(category => {
    const fileCount = 1; 
    const card = document.createElement('button');
    card.className = 'soal-card';
    card.dataset.category = category;
    const description = `${fileCount} topik`;
    card.innerHTML = `
      <div class="soal-icon">
        <i class="bi bi-folder2-open"></i>
      </div>
      <div class="soal-content">
        <h3 class="soal-title">${category}</h3>
        <p class="soal-desc">${description}</p>
      </div>
      <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    card.addEventListener('click', () => {
      selectCategory(category);
    });
    soalContainer.appendChild(card);
  });
};
const selectCategory = (category) => {
  selectedCategory = category;
  const soalContainer = $id('soalContainer');
  soalContainer.innerHTML = '';
  const backButton = document.createElement('button');
  backButton.className = 'soal-card soal-back-btn';
  backButton.innerHTML = `
    <div class="soal-icon">
      <i class="bi bi-arrow-left"></i>
    </div>
    <div class="soal-content">
      <h3 class="soal-title">Kembali</h3>
      <p class="soal-desc">Pilih kategori lain</p>
    </div>
  `;
  backButton.addEventListener('click', () => {
    selectedCategory = null;
    generateCategoryCards();
  });
  soalContainer.appendChild(backButton);
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'soal-loading';
  loadingDiv.textContent = 'Memuat file soal...';
  soalContainer.appendChild(loadingDiv);
  (async () => {
    try {
      const manifestResp = await fetch('./scripts/soal/manifest.json');
      if (!manifestResp.ok) {
        throw new Error(`Manifest failed: ${manifestResp.status}`);
      }
      const manifestData = await manifestResp.json();
      const categoryFiles = manifestData.categories?.[category] || [];
      if (!categoryFiles || categoryFiles.length === 0) {
        loadingDiv.textContent = 'Tidak ada file soal di kategori ini';
        return;
      }
      loadingDiv.remove();
      for (const filename of categoryFiles) {
        try {
          const count = await getFileQuestionCount(category, filename);
          const card = document.createElement('button');
          card.className = 'soal-card';
          card.dataset.filename = filename;
          card.innerHTML = `
            <div class="soal-icon">
              <i class="bi bi-file-text"></i>
            </div>
            <div class="soal-content">
              <h3 class="soal-title">${filename.replace('.csv', '')}</h3>
              <p class="soal-desc">${count} soal</p>
            </div>
            <svg class="soal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          `;
          card.addEventListener('click', () => {
            selectFile(category, filename);
          });
          soalContainer.appendChild(card);
        } catch (err) {
        }
      }
    } catch (error) {
      loadingDiv.textContent = `Error: ${error.message}`;
    }
  })();
};
const selectFile = (category, filename) => {
  selectedCategory = category;
  selectedTopic = filename;
  $id('soalModal').close();
  setTimeout(() => {
    $id('classicPlayerCountModal').showModal();
  }, 300);
};
const navigateClassic = () => {
  const classicParams = btoa(JSON.stringify({ 
    category: selectedCategory, 
    filename: selectedTopic,
    players: classicPlayers
  }));
  window.location.href = `./game/classic.html?data=${classicParams}`;
};
const handleCSVUpload = async (file) => {
  try {
    const text = await file.text();
    const questions = parseCSV(text);
    if (questions.length === 0) {
      alert('File CSV kosong atau format tidak valid');
      return;
    }
    selectedCategory = 'Custom';
    selectedTopic = file.name;
    if (!allSOAL['Custom']) {
      allSOAL['Custom'] = [];
    }
    allSOAL['Custom'] = questions;
    localStorage.setItem('customQuestions', JSON.stringify(questions));
    $id('soalModal').close();
    setTimeout(() => {
      $id('classicPlayerCountModal').showModal();
    }, 300);
  } catch (error) {
    alert('Error membaca file CSV. Pastikan format sesuai: id,question,optionA,optionB,optionC,optionD,answer');
  }
};
const handleDuelCSVUpload = async (file) => {
  try {
    const text = await file.text();
    const questions = parseCSV(text);
    if (questions.length === 0) {
      alert('File CSV kosong atau format tidak valid');
      return;
    }
    selectedCategory = 'Custom';
    const filename = file.name;
    localStorage.setItem('customQuestions', JSON.stringify(questions));
    navigateDuel('Custom', filename);
  } catch (error) {
    alert('Error membaca file CSV. Pastikan format sesuai: id,question,optionA,optionB,optionC,optionD,answer');
  }
};
const handleSoloCSVUpload = async (file) => {
  try {
    const text = await file.text();
    const questions = parseCSV(text);
    if (questions.length === 0) {
      alert('File CSV kosong atau format tidak valid');
      return;
    }
    selectedCategory = 'Custom';
    const filename = file.name;
    localStorage.setItem('customQuestions', JSON.stringify(questions));
    navigateSolo('Custom', filename);
  } catch (error) {
    alert('Error membaca file CSV. Pastikan format sesuai: id,question,optionA,optionB,optionC,optionD,answer');
  }
};
document.addEventListener('DOMContentLoaded', async function() {
  allSOAL = await loadAllSOAL();
  const demoModal = $id('demoModal');
  const soalModal = $id('soalModal');
  const playButton = $id('playButton');
  const demoModalClose = $id('demoModalClose');
  const soalModalClose = $id('soalModalClose');
  const gameModeCards = $$('.game-mode-card');
  generateCategoryCards();
  if (playButton) {
    playButton.addEventListener('click', () => {
      demoModal.showModal();
    });
  }
  if (demoModalClose) {
    demoModalClose.addEventListener('click', () => {
      demoModal.close();
    });
  }
  if (soalModalClose) {
    soalModalClose.addEventListener('click', () => {
      soalModal.close();
    });
  }
  gameModeCards.forEach(card => {
    card.addEventListener('click', function() {
      const mode = this.dataset.mode;
      if (mode === 'siapa-cepat') {
        demoModal.close();
        setTimeout(() => {
          soalModal.showModal();
        }, 300);
      } else if (mode === 'duel') {
        demoModal.close();
        setTimeout(() => {
          duelPlayerCount = 2;
          duelPlayers = [];
          currentPlayerIndex = 0;
          generateAvatarGrid();
          $id('duelPlayerRegisterModal').showModal();
        }, 300);
      } else if (mode === 'solo') {
        demoModal.close();
        setTimeout(() => {
          generateSoloSoalCards();
          $id('soloSoalModal').showModal();
        }, 300);
      } else {
        demoModal.close();
      }
    });
  });
  [demoModal, soalModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.close();
      }
    });
  });
  const csvFileInput = $id('csvFileInput');
  if (csvFileInput) {
    csvFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleCSVUpload(file);
        csvFileInput.value = '';
      }
    });
  }
  initClassicPlayerCountModal();
  initClassicPlayerRegisterModal();
  initDuelPlayerCountModal();
  initDuelPlayerRegisterModal();
  const duelCsvFileInput = $id('duelCsvFileInput');
  if (duelCsvFileInput) {
    duelCsvFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleDuelCSVUpload(file);
        duelCsvFileInput.value = '';
      }
    });
  }
  const duelModals = [
    $id('duelPlayerCountModal'),
    $id('duelPlayerRegisterModal'),
    $id('duelSoalModal')
  ];
  duelModals.forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.close();
      }
    });
  });
  const soloSoalModalClose = $id('soloSoalModalClose');
  if (soloSoalModalClose) {
    soloSoalModalClose.addEventListener('click', () => {
      $id('soloSoalModal').close();
    });
  }
  const soloCsvFileInput = $id('soloCsvFileInput');
  if (soloCsvFileInput) {
    soloCsvFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleSoloCSVUpload(file);
        soloCsvFileInput.value = '';
      }
    });
  }
  const soloSoalModal = $id('soloSoalModal');
  if (soloSoalModal) {
    soloSoalModal.addEventListener('click', (e) => {
      if (e.target === soloSoalModal) {
        soloSoalModal.close();
      }
    });
    soloSoalModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        soloSoalModal.close();
      }
    });
  }
});
