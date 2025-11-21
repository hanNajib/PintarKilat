const gameUtils = {
  parseGameData() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) {
      return null;
    }
    try {
      const decoded = atob(data);
      const gameData = JSON.parse(decoded);
      return gameData;
    } catch (error) {
      return null;
    }
  },
  getGameData(requiredFields = ['category', 'filename']) {
    const gameData = this.parseGameData();
    if (!gameData) return null;
    const missing = requiredFields.filter(field => !gameData[field]);
    if (missing.length > 0) {
      return null;
    }
    return gameData;
  },
  formatPlayers(players) {
    if (!Array.isArray(players)) return 'No players';
    return players.map((p, i) => `${i + 1}. ${p.name}`).join(', ');
  },
  getPlayer(players, index) {
    return players?.[index] || null;
  },
  getNextPlayerIndex(currentIndex, totalPlayers) {
    return (currentIndex + 1) % totalPlayers;
  }
};
