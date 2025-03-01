// p5.js functions and main game loop
const BORDER_SIZE = 20; // Border size in pixels

function setup() {
  // Create canvas with border
  createCanvas(windowWidth - BORDER_SIZE * 2, windowHeight - BORDER_SIZE * 2);
  // Position canvas with border
  let canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.margin = BORDER_SIZE + 'px';
  }
  
  gameInstance = new Game();
  gameInstance.init();
  
  // Initialize UFOs
  UFOSystem.initialize();
  
  // Initialize start screen
  StartScreen.initialize();
}

function draw() {
  background(0);
  
  // If game hasn't started, show start screen
  if (!gameInstance.gameStarted && !gameInstance.gameOver) {
    StartScreen.display();
    return;
  }
  
  // Draw stars
  drawStars();
  
  // Update and draw planets
  PlanetSystem.update();
  PlanetSystem.display();
  
  // Update and draw UFOs
  UFOSystem.update();
  UFOSystem.display();
  
  // If player is entering name, show name input screen
  if (gameInstance.enteringName) {
    Screens.displayNameInput();
    return;
  }
  
  // Check if game is over
  if (gameInstance.gameOver) {
    // Initialize party elements if this is the first frame of game over
    if (gameInstance.justEnded) {
      Screens.initPartyElements();
      gameInstance.justEnded = false;
    }
    Screens.displayGameOver();
    return;
  }
  
  // Update game state
  gameInstance.update();
  
  // Display game elements
  gameInstance.player.display();
  
  for (let enemy of gameInstance.enemies) {
    enemy.display();
  }
  
  for (let bullet of gameInstance.bullets) {
    bullet.display();
  }
  
  // Display HUD
  HUD.display();
}

function keyPressed() {
  InputManager.handleKeyPressed();
}

function mousePressed() {
  InputManager.handleMousePressed();
}

function windowResized() {
  // Resize canvas with border
  resizeCanvas(windowWidth - BORDER_SIZE * 2, windowHeight - BORDER_SIZE * 2);
  // Reposition canvas
  let canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.margin = BORDER_SIZE + 'px';
  }
  
  PlanetSystem.createPlanets();
  
  // Reinitialize UFOs on window resize
  UFOSystem.initialize();
} 