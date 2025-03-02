// Storage manager for high scores
class StorageManager {
  static getHighScores() {
    try {
      const scores = localStorage.getItem('highScores');
      return scores ? JSON.parse(scores) : [];
    } catch (e) {
      console.error('Error loading high scores:', e);
      return [];
    }
  }

  static saveHighScore(name, score) {
    try {
      let highScores = this.getHighScores();
      
      // Add new score
      highScores.push({ name, score });
      
      // Sort by score (highest first)
      highScores.sort((a, b) => b.score - a.score);
      
      // Keep only top scores
      highScores = highScores.slice(0, 5);
      
      // Save to localStorage
      localStorage.setItem('highScores', JSON.stringify(highScores));
      
      return highScores;
    } catch (e) {
      console.error('Error saving high score:', e);
      return [];
    }
  }
} 