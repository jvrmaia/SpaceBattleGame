// Main game file
let game;

function setup() {
  createCanvas(windowWidth, windowHeight);
  game = new Game();
  StartScreen.initialize();
  console.log("Game initialized with dimensions:", width, height);
}

function draw() {
  background(0);
  
  if (!game.gameStarted) {
    StartScreen.display();
  } else {
    game.display();
    game.update();
  }
}

function keyPressed() {
  console.log("Key pressed:", keyCode);
  
  // Start game with Enter key
  if (!game.gameStarted && keyCode === ENTER) {
    console.log("Enter key pressed - starting game");
    game.playerColor = [...StartScreen.colorOptions[StartScreen.selectedColorIndex].color];
    game.init();
    game.gameStarted = true;
    return;
  }
  
  if (!game.gameStarted) return;
  
  if (keyCode === 32 && !game.gameOver && !game.enteringName) { // Space bar
    const bullet = game.player.fire();
    game.bullets.push(bullet);
  }
  
  if (keyCode === 82) { // R key
    if (game.gameOver && !game.enteringName) {
      game.init();
    }
  }
  
  if (keyCode === 27) { // ESC key
    game.gameStarted = false;
  }
  
  // Handle name entry for high scores
  if (game.enteringName) {
    game.handleKeyPress(key, keyCode);
  }
}

function mousePressed() {
  console.log("Mouse pressed at:", mouseX, mouseY);
  
  if (!game.gameStarted) {
    const result = StartScreen.handleMouseClick(mouseX, mouseY);
    console.log("Click handled with result:", result);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}