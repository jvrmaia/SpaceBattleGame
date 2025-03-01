// Input handling
class InputManager {
  static handleKeyPressed() {
    // If on start screen, ignore key presses except ESC to restart
    if (!gameInstance.gameStarted && !gameInstance.gameOver) {
      if (key === 'Escape') {
        gameInstance.restartFromBeginning();
      }
      return;
    }
    
    // Handle name input when entering name
    if (gameInstance.enteringName) {
      this.handleNameInput();
      return;
    }
    
    // Shoot bullets when spacebar is pressed
    if (key === ' ') {
      gameInstance.playerShoot();
    }
    
    // Restart game when 'R' is pressed
    if ((key === 'r' || key === 'R') && gameInstance.gameOver) {
      gameInstance.restartFromBeginning();
    }
    
    // Clear high scores when 'C' is pressed
    if (key === 'c' || key === 'C') {
      StorageManager.clearHighScores();
    }
  }
  
  // New method to handle name input with validation
  static handleNameInput() {
    if (keyCode === ENTER) {
      // Don't allow empty names
      if (gameInstance.playerName.trim() === "") {
        gameInstance.playerName = "Player";
      }
      gameInstance.submitHighScore();
    } else if (keyCode === BACKSPACE) {
      gameInstance.playerName = gameInstance.playerName.slice(0, -1);
    } else if (keyCode === ESCAPE) {
      // Allow canceling name input with ESC
      gameInstance.playerName = "Player";
      gameInstance.submitHighScore();
    } else if (key.length === 1) { // Only single characters
      // Check if the key is a valid character for a nickname
      if (this.isValidNicknameChar(key) && gameInstance.playerName.length < 15) {
        gameInstance.playerName += key;
      }
    }
  }
  
  // Method to validate nickname characters
  static isValidNicknameChar(char) {
    // Allow letters, numbers, and some special characters
    const validPattern = /^[a-zA-Z0-9_\-\.\ ]$/;
    return validPattern.test(char);
  }
  
  static handleMousePressed() {
    // Handle start screen clicks
    if (!gameInstance.gameStarted && !gameInstance.gameOver) {
      StartScreen.handleMouseClick(mouseX, mouseY);
      return;
    }
    
    // Only check for button clicks on game over screen
    if (gameInstance.gameOver) {
      // Check if reset button was clicked
      if (Screens.isResetButtonClicked(mouseX, mouseY)) {
        StorageManager.clearHighScores();
      }
    }
  }
} 