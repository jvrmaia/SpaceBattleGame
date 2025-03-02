// Main game file
let game;
let canvas;

function setup() {
  // Create a responsive canvas that fits the window
  canvas = createCanvas(windowWidth, windowHeight);
  
  // Initialize game
  game = new Game();
  StartScreen.initialize();
  
  // Set text rendering for better performance
  textFont('Arial');
  
  console.log(`Canvas created with size: ${width} x ${height}`);
}

function windowResized() {
  // Resize canvas when window size changes
  resizeCanvas(windowWidth, windowHeight);
  
  // Notify game of resize
  if (game) {
    game.handleResize();
  }
  
  console.log(`Canvas resized to: ${width} x ${height}`);
}

function draw() {
  if (!game.gameStarted) {
    StartScreen.display();
  } else {
    game.update();
    game.display();
  }
}

function keyPressed() {
  console.log("Key pressed:", key, "Keycode:", keyCode);
  
  // Handle key presses for the game
  if (game.gameStarted) {
    if (keyCode === 27) { // ESC key
      game.gameStarted = false;
      game.gameOver = false;
    } else if (keyCode === 82) { // R key
      game.restart();
    } else if (game.gameOver && game.enteringName) {
      // Handle name entry during game over
      if (keyCode === BACKSPACE) {
        game.handleNameEntry("Backspace");
        return false; // Prevent browser back navigation
      } else if (keyCode === ENTER || keyCode === 13) { // Ensure we catch Enter key
        console.log("Enter key detected for name submission");
        game.handleNameEntry("Enter");
        return false;
      }
      // Let the regular keyTyped handle character input
    } else if (keyCode === 32) { // Space key
      game.fireBullet();
    }
  }
  
  // Prevent default behavior for certain keys
  return !(keyCode === BACKSPACE || keyCode === 32 || keyCode === ENTER || keyCode === 13 || 
           keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW);
}

function keyTyped() {
  console.log("Key typed:", key);
  
  // Handle text input for name entry
  if (game.gameStarted && game.gameOver && game.enteringName) {
    // Only allow alphanumeric characters and some special characters
    if (/^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{}|;':",./<>?]$/.test(key)) {
      game.handleNameEntry(key);
    }
    return false; // Prevent default behavior
  }
  return true;
}

function mousePressed() {
  if (game.gameStarted && game.gameOver && game.enteringName) {
    // Check if click is on the submit button area
    const panelX = width/2;
    const panelY = height/2;
    
    // Submit button area (below the input field)
    if (mouseY > panelY + 80 && mouseY < panelY + 120 &&
        mouseX > panelX - 150 && mouseX < panelX + 150) {
      console.log("Submit button clicked");
      game.handleNameEntry("Enter");
      return false;
    }
  } else if (!game.gameStarted) {
    return StartScreen.handleMouseClick(mouseX, mouseY);
  } else if (game.gameOver) {
    // Handle restart click in game over screen
    if (mouseY > height/2 + 150 && mouseY < height/2 + 210) {
      if (mouseX > width/2 - 150 && mouseX < width/2 + 150) {
        game.restart();
        return true;
      }
    }
  }
  return false;
}

// Add touch support for mobile devices
function touchStarted() {
  // Handle touch for the start screen
  if (!game.gameStarted) {
    return StartScreen.handleMouseClick(mouseX, mouseY);
  } else if (game.gameOver) {
    // Handle restart touch in game over screen
    if (mouseY > height/2 + 150 && mouseY < height/2 + 210) {
      if (mouseX > width/2 - 150 && mouseX < width/2 + 150) {
        game.restart();
        return true;
      }
    }
  } else {
    // Handle touch controls during gameplay
    game.handleTouchStart(mouseX, mouseY);
  }
  return false;
}

function touchMoved() {
  if (game.gameStarted && !game.gameOver) {
    game.handleTouchMove(mouseX, mouseY);
  }
  // Prevent default behavior (scrolling, zooming)
  return false;
}

function touchEnded() {
  if (game.gameStarted && !game.gameOver) {
    game.handleTouchEnd();
  }
  return false;
}