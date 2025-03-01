// LocalStorage management
class StorageManager {
  static loadHighScores() {
    if (localStorage.getItem('spaceHighScores')) {
      gameInstance.highScores = JSON.parse(localStorage.getItem('spaceHighScores'));
    } else {
      gameInstance.highScores = [];
    }
  }

  static saveHighScores() {
    localStorage.setItem('spaceHighScores', JSON.stringify(gameInstance.highScores));
  }

  static addHighScore(newScore, nickname) {
    gameInstance.highScores.push({
      name: nickname || "Anonymous",
      score: newScore
    });
    
    gameInstance.highScores.sort((a, b) => b.score - a.score);
    
    if (gameInstance.highScores.length > gameInstance.MAX_HIGH_SCORES) {
      gameInstance.highScores = gameInstance.highScores.slice(0, gameInstance.MAX_HIGH_SCORES);
    }
    
    this.saveHighScores();
  }

  static isHighScore(newScore) {
    if (gameInstance.highScores.length < gameInstance.MAX_HIGH_SCORES) {
      return true;
    }
    
    for (let score of gameInstance.highScores) {
      if (newScore > score.score) {
        return true;
      }
    }
    
    return false;
  }

  static clearHighScores() {
    gameInstance.highScores = [];
    this.saveHighScores();
  }
} 