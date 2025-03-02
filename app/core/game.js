// Game state and core logic
class Game {
  constructor() {
    console.log("Game constructor called");
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.stars = [];
    this.backgroundUFOs = []; // Decorative UFOs
    this.planets = []; // Background planets
    this.score = 0;
    this.lives = 3; // Start with 3 lives
    this.gameOver = false;
    this.gameStarted = false;
    this.playerColor = [0, 255, 0]; // Default color
    this.highScores = [];
    this.MAX_HIGH_SCORES = 5; // Keep storing 5 scores, but only display top 3
    this.playerName = "";
    this.enteringName = false;
    this.justEnded = false;
    this.showingScoreboard = false; // New flag to track scoreboard display
    this.nameSubmitted = false; // New flag to track if name has been submitted for this match
    this.level = 1;
    this.enemySpawnRate = 0.02;
    this.backgroundUFOSpawnRate = 0.003; // Reduced spawn rate for background UFOs
    this.planetSpawnRate = 0.0005; // Very low spawn rate for planets
    
    // Touch control variables
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
    this.lastTouchTime = 0;
    this.touchFireThreshold = 300; // ms between shots
    this.virtualJoystickRadius = 50;
    this.joystickActive = false;
    this.joystickBaseX = 0;
    this.joystickBaseY = 0;
    this.joystickX = 0;
    this.joystickY = 0;
    
    // Screen size variables
    this.baseWidth = 800;
    this.baseHeight = 600;
    this.scaleRatio = 1;
    
    // Initialize stars immediately to avoid the error
    this.initializeStars();
    
    // Initialize some background UFOs
    this.initializeBackgroundUFOs();
    
    // Initialize some planets
    this.initializePlanets();
    
    // Initialize the game
    this.init();
    this.loadHighScores();
    this.calculateScaleRatio();
  }

  /**
   * Initialize stars for the background
   */
  initializeStars() {
    this.stars = [];
    
    // Create a default set of stars
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        brightness: random(100, 255)
      });
    }
    
    console.log("Stars initialized:", this.stars.length);
  }

  /**
   * Create stars for the background (used for resizing and initialization)
   */
  createStars() {
    // Clear existing stars
    this.stars = [];
    
    // Calculate number of stars based on screen area
    const screenArea = width * height;
    const baseArea = this.baseWidth * this.baseHeight;
    const starCount = Math.floor((screenArea / baseArea) * 100);
    
    // Create stars
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        brightness: random(100, 255)
      });
    }
    
    console.log("Stars created:", this.stars.length);
  }

  calculateScaleRatio() {
    // Calculate the scale ratio based on the smaller dimension
    const widthRatio = width / this.baseWidth;
    const heightRatio = height / this.baseHeight;
    this.scaleRatio = min(widthRatio, heightRatio);
    
    console.log(`Scale ratio calculated: ${this.scaleRatio}`);
  }

  handleResize() {
    // Recalculate scale ratio
    this.calculateScaleRatio();
    
    // Reposition player if needed
    if (this.player) {
      // Keep player within bounds after resize
      this.player.x = constrain(this.player.x, 20, width - 20);
      this.player.y = constrain(this.player.y, 20, height - 20);
    }
    
    // Regenerate stars for the new screen size
    this.createStars();
  }

  init() {
    try {
      // Create player
      if (typeof Player === 'undefined') {
        console.error("Player class is not defined. Creating inline player.");
        this.createInlinePlayer();
      } else {
        this.player = new Player(width / 2, height - 100, this.playerColor);
      }
      
      // Reset game state
      this.enemies = [];
      this.bullets = [];
      // Don't reset background UFOs, they're decorative
      this.score = 0;
      this.lives = 3; // Reset to 3 lives
      this.gameOver = false;
      this.level = 1;
      this.enemySpawnRate = 0.02;
      
      // Create stars
      try {
        this.createStars();
      } catch (e) {
        console.error("Error creating stars:", e);
        // Fallback to initialize stars
        this.initializeStars();
      }
    } catch (e) {
      console.error("Error initializing game:", e);
    }
  }

  loadHighScores() {
    try {
      const scores = localStorage.getItem('highScores');
      this.highScores = scores ? JSON.parse(scores) : [];
    } catch (e) {
      console.error('Error loading high scores:', e);
      this.highScores = [];
    }
  }

  saveHighScores() {
    try {
      localStorage.setItem('highScores', JSON.stringify(this.highScores));
    } catch (e) {
      console.error('Error saving high scores:', e);
    }
  }

  update() {
    if (this.gameOver) return;
    
    // Update player if it exists and has update method
    if (this.player) {
      try {
        this.player.update();
        
        // Ensure player stays within screen bounds
        if (this.player.x !== undefined && this.player.y !== undefined) {
          this.player.x = constrain(this.player.x, this.player.width / 2, width - this.player.width / 2);
          this.player.y = constrain(this.player.y, this.player.height / 2, height - this.player.height / 2);
        }
      } catch (e) {
        console.error("Error updating player:", e);
      }
    }
    
    // Handle touch controls
    this.handleTouchControls();
    
    // Move stars
    for (let star of this.stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = random(width);
      }
    }
    
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update();
      
      // Remove inactive bullets
      if (!this.bullets[i].active) {
        this.bullets.splice(i, 1);
      }
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update();
      
      // Check for collision with player using simple distance check
      if (this.player && !this.player.invincible) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (enemy.width + this.player.width) / 2;
        
        if (distance < minDistance) {
          this.handlePlayerHit();
          enemy.active = false;
        }
      }
      
      // Check for collision with bullets
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const bullet = this.bullets[j];
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (enemy.width + bullet.width) / 2;
        
        if (distance < minDistance) {
          this.score += 10;
          enemy.active = false;
          bullet.active = false;
          break;
        }
      }
      
      // Remove inactive enemies
      if (!enemy.active) {
        this.enemies.splice(i, 1);
      }
    }
    
    // Update background UFOs (purely decorative)
    for (let i = this.backgroundUFOs.length - 1; i >= 0; i--) {
      const ufo = this.backgroundUFOs[i];
      ufo.update();
      
      // Remove UFOs that have gone off screen
      if (ufo.x < -100 || ufo.x > width + 100) {
        this.backgroundUFOs.splice(i, 1);
      }
    }
    
    // Update planets (purely decorative)
    for (let i = this.planets.length - 1; i >= 0; i--) {
      const planet = this.planets[i];
      const isActive = planet.update();
      
      // Remove planets that have gone off screen
      if (!isActive) {
        this.planets.splice(i, 1);
      }
    }
    
    // Spawn enemies
    if (random() < this.enemySpawnRate) {
      this.spawnEnemy();
    }
    
    // Spawn background UFOs (decorative)
    if (random() < this.backgroundUFOSpawnRate) {
      this.spawnBackgroundUFO();
    }
    
    // Spawn planets (decorative, very rare)
    if (random() < this.planetSpawnRate) {
      this.spawnPlanet();
    }
    
    // Increase difficulty over time
    if (frameCount % 600 === 0) { // Every 10 seconds at 60fps
      this.level++;
      this.enemySpawnRate = min(this.enemySpawnRate * 1.2, 0.1);
    }
  }

  display() {
    push();
    
    // Clear background
    background(0);
    
    // Draw stars
    for (const star of this.stars) {
      fill(star.brightness);
      noStroke();
      ellipse(star.x, star.y, star.size, star.size);
    }
    
    // Draw planets (behind UFOs)
    for (const planet of this.planets) {
      planet.display();
    }
    
    // Draw background UFOs (behind everything else)
    for (const ufo of this.backgroundUFOs) {
      ufo.display();
    }
    
    // Draw player if it exists and has display method
    if (this.player) {
      try {
        // Ensure player is within bounds before displaying
        if (this.player.x !== undefined && this.player.y !== undefined) {
          if (this.player.x < 0 || this.player.x > width || 
              this.player.y < 0 || this.player.y > height) {
            console.warn("Player out of bounds, resetting position");
            this.player.x = width / 2;
            this.player.y = height - 100;
          }
          
          // Set visibility flag if it doesn't exist
          if (this.player.visible === undefined) {
            this.player.visible = true;
          }
          
          this.player.display();
        }
      } catch (e) {
        console.error("Error displaying player:", e);
      }
    }
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.display();
    }
    
    // Draw bullets
    for (const bullet of this.bullets) {
      bullet.display();
    }
    
    // Display score and level
    this.displayHUD();
    
    // Display touch controls if active
    this.displayTouchControls();
    
    pop();
    
    // Display game over screen if game is over
    if (this.gameOver) {
      this.displayGameOver();
    }
  }
  
  displayHUD() {
    push();
    
    // Score display
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text(`SCORE: ${this.score}`, 20, 30);
    
    // Level display
    textAlign(CENTER);
    text(`LEVEL: ${this.level}`, width / 2, 30);
    
    // Lives display with hearts
    textAlign(RIGHT);
    text("LIVES:", width - 150, 30);
    
    // Draw hearts based on lives
    const heartSize = 20;
    const heartSpacing = 30;
    const startX = width - 120;
    
    for (let i = 0; i < this.lives; i++) {
      this.drawHeart(startX + i * heartSpacing, 25, heartSize, this.playerColor);
    }
    
    pop();
  }
  
  /**
   * Draw a heart shape
   */
  drawHeart(x, y, size, color) {
    push();
    
    // Heart shape
    fill(color[0], color[1], color[2]);
    noStroke();
    
    // Add glow effect
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`;
    
    // Draw heart using bezier curves
    beginShape();
    // Left half of heart
    vertex(x, y + size * 0.3);
    bezierVertex(
      x - size * 0.5, y - size * 0.3, 
      x - size * 0.3, y - size * 0.8, 
      x, y - size * 0.5
    );
    // Right half of heart
    bezierVertex(
      x + size * 0.3, y - size * 0.8, 
      x + size * 0.5, y - size * 0.3, 
      x, y + size * 0.3
    );
    endShape(CLOSE);
    
    pop();
  }
  
  /**
   * Display game over screen
   */
  displayGameOver() {
    push();
    
    // Semi-transparent overlay
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    // Game over panel
    const panelWidth = min(500, width * 0.8);
    const panelHeight = min(500, height * 0.8);
    const panelX = width/2;
    const panelY = height/2;
    
    fill(0, 0, 50);
    stroke(255, 0, 0);
    strokeWeight(3);
    rectMode(CENTER);
    rect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Draw neon "GAME OVER" title
    this.drawNeonGameOverTitle(panelX, panelY - 180);
    
    // Score display
    fill(255);
    textSize(30);
    textAlign(CENTER);
    text(`SCORE: ${this.score.toString().padStart(6, '0')}`, panelX, panelY - 100);
    
    // High score check
    const isHighScore = this.isHighScore();
    
    if (this.enteringName && !this.nameSubmitted) {
      // Name entry
      fill(255);
      textSize(24);
      textAlign(CENTER);
      text("NEW HIGH SCORE!", panelX, panelY - 50);
      text("ENTER YOUR NAME:", panelX, panelY);
      
      // Name input field
      fill(0);
      stroke(0, 255, 0);
      strokeWeight(2);
      rect(panelX, panelY + 50, 300, 50, 5);
      
      // Entered name
      fill(0, 255, 0);
      textSize(24);
      textAlign(CENTER);
      text(this.playerName + (frameCount % 60 < 30 ? "_" : ""), panelX, panelY + 58);
      
      // Submit button
      const buttonY = panelY + 100;
      const buttonHover = mouseY > buttonY - 20 && mouseY < buttonY + 20 && 
                          mouseX > panelX - 100 && mouseX < panelX + 100;
      
      // Fixed button colors
      if (buttonHover) {
        fill(0, 200, 0); // Bright green when hovering
      } else {
        fill(0, 100, 0); // Darker green when not hovering
      }
      
      stroke(0, 255, 0);
      strokeWeight(2);
      rect(panelX, buttonY, 200, 40, 5);
      
      // Button text
      fill(255);
      textSize(18);
      text("SUBMIT", panelX, buttonY + 6);
      
      // Instructions
      fill(200);
      textSize(14);
      text("PRESS ENTER OR CLICK SUBMIT", panelX, panelY + 140);
      
      console.log("Displaying name entry. Current name:", this.playerName);
    } else if (isHighScore && !this.justEnded && !this.showingScoreboard && !this.nameSubmitted) {
      // Prompt to enter name
      this.enteringName = true;
      console.log("Prompting for name entry");
    } else {
      // Display high scores
      fill(0, 255, 0);
      textSize(24);
      textAlign(CENTER);
      text("TOP SCORES", panelX, panelY - 50);
      
      // High scores list - only top 3
      textSize(20);
      for (let i = 0; i < Math.min(this.highScores.length, 3); i++) {
        const score = this.highScores[i];
        const yPos = panelY + i * 40;
        
        // Highlight the player's new score
        if (this.justEnded && score.name === this.playerName && score.score === this.score) {
          fill(255, 255, 0); // Bright yellow highlight for the player's score
          
          // Add a pulsing effect to make it more noticeable
          const pulseAmount = sin(frameCount * 0.1) * 0.5 + 0.5;
          stroke(255, 255 * pulseAmount, 0);
          strokeWeight(2);
        } else {
          fill(0, 150, 255);
          noStroke();
        }
        
        textAlign(LEFT);
        
        // Draw trophy or medal emoji for top 3 positions
        if (i === 0) {
          // Trophy for 1st place
          textSize(24);
          text("🏆", panelX - 130, yPos);
          textSize(20);
        } else if (i === 1) {
          // Silver medal for 2nd place
          textSize(24);
          text("🥈", panelX - 130, yPos);
          textSize(20);
        } else if (i === 2) {
          // Bronze medal for 3rd place
          textSize(24);
          text("🥉", panelX - 130, yPos);
          textSize(20);
        }
        
        text(score.name, panelX - 80, yPos);
        
        textAlign(RIGHT);
        text(score.score.toString().padStart(6, '0'), panelX + 120, yPos);
      }
      
      // Draw a separator line
      stroke(0, 100, 255);
      strokeWeight(2);
      line(panelX - 150, panelY + 80, panelX + 150, panelY + 80);
      
      // Restart and menu instructions in a box
      fill(0, 0, 30);
      stroke(0, 100, 255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(panelX, panelY + 140, 300, 80, 10);
      
      // Restart instructions
      fill(255);
      textSize(20);
      textAlign(CENTER);
      text("PRESS 'R' TO RESTART", panelX, panelY + 130);
      text("PRESS 'ESC' FOR MENU", panelX, panelY + 160);
    }
    
    pop();
  }
  
  /**
   * Draw neon "GAME OVER" title
   */
  drawNeonGameOverTitle(x, y) {
    push();
    
    // Calculate animation values
    const pulseRate = 0.05;
    const flickerRate = 0.2;
    const baseGlow = 15;
    const maxGlow = 25;
    
    // Pulse effect (smooth sine wave)
    const pulse = sin(frameCount * pulseRate) * 0.5 + 0.5;
    
    // Random flicker effect (occasional dimming)
    const flicker = random() > 0.95 ? random(0.7, 0.9) : 1;
    
    // Calculate current glow amount
    const glowAmount = baseGlow + pulse * (maxGlow - baseGlow);
    
    // Calculate color values with animation
    const r = 255;
    const g = 50 + 50 * pulse * flicker;
    const b = 50 + 50 * pulse * flicker;
    
    // Draw multiple layers for the neon effect
    
    // Outer glow (largest)
    drawingContext.shadowBlur = glowAmount * 2;
    drawingContext.shadowColor = `rgba(255, 0, 0, ${0.3 * flicker})`;
    fill(0, 0, 0, 0); // Transparent fill
    stroke(255, 0, 0, 50 * flicker);
    strokeWeight(12);
    textSize(48);
    textAlign(CENTER);
    textFont('Arial Black');
    text("GAME OVER", x, y);
    
    // Middle glow
    drawingContext.shadowBlur = glowAmount * 1.5;
    drawingContext.shadowColor = `rgba(255, 50, 50, ${0.5 * flicker})`;
    stroke(255, 50, 50, 100 * flicker);
    strokeWeight(8);
    text("GAME OVER", x, y);
    
    // Inner glow
    drawingContext.shadowBlur = glowAmount;
    drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.8 * flicker})`;
    stroke(r, g, b, 200 * flicker);
    strokeWeight(4);
    text("GAME OVER", x, y);
    
    // Core text
    fill(255, 255, 255, 255 * flicker);
    stroke(r, g, b, 255 * flicker);
    strokeWeight(2);
    text("GAME OVER", x, y);
    
    pop();
  }
  
  /**
   * Add a new high score to the list
   */
  addHighScore(name, score) {
    // Check if the player already has a score
    const existingIndex = this.highScores.findIndex(entry => entry.name === name);
    
    if (existingIndex !== -1) {
      // Player already exists in high scores
      const existingScore = this.highScores[existingIndex];
      
      // Only update if the new score is higher
      if (score > existingScore.score) {
        // Remove the existing entry
        this.highScores.splice(existingIndex, 1);
        
        // Add the new higher score
        this.highScores.push({ name, score });
      } else {
        // New score is not higher, don't add it
        console.log(`${name}'s new score (${score}) is not higher than their existing score (${existingScore.score})`);
        return false;
      }
    } else {
      // New player, add their score
      this.highScores.push({ name, score });
    }
    
    // Sort high scores in descending order
    this.highScores.sort((a, b) => b.score - a.score);
    
    // Trim to maximum number of high scores
    if (this.highScores.length > this.MAX_HIGH_SCORES) {
      this.highScores = this.highScores.slice(0, this.MAX_HIGH_SCORES);
    }
    
    // Save high scores to localStorage
    this.saveHighScores();
    
    return true;
  }
  
  /**
   * Check if the current score qualifies as a high score
   */
  isHighScore() {
    // If name already submitted for this match, don't prompt again
    if (this.nameSubmitted) {
      return false;
    }
    
    // If we don't have enough high scores yet, any score qualifies
    if (this.highScores.length < this.MAX_HIGH_SCORES) {
      return true;
    }
    
    // Check if the player already has a higher score
    if (this.playerName) {
      const existingIndex = this.highScores.findIndex(entry => entry.name === this.playerName);
      if (existingIndex !== -1 && this.highScores[existingIndex].score >= this.score) {
        // Player already has a higher or equal score
        return false;
      }
    }
    
    // Check if the current score is higher than the lowest high score
    return this.score > this.highScores[this.highScores.length - 1].score;
  }
  
  /**
   * Handle key press events
   */
  handleKeyPress(key) {
    if (this.gameOver) {
      if (this.enteringName) {
        this.handleNameEntry(key);
      }
      return;
    }
    
    // Handle spacebar for firing
    if (key === " ") {
      this.fireBullet();
    }
  }
  
  /**
   * Handle key press during name entry
   */
  handleNameEntry(key) {
    // If name already submitted for this match, ignore input
    if (this.nameSubmitted) {
      console.log("Name already submitted for this match");
      this.enteringName = false;
      this.showingScoreboard = true;
      return;
    }
    
    console.log("Name entry key:", key, "Current name:", this.playerName);
    
    if (key === "Enter") {
      // Submit name
      if (this.playerName.trim().length > 0) {
        console.log("Submitting name:", this.playerName, "with score:", this.score);
        const added = this.addHighScore(this.playerName, this.score);
        console.log("High score added:", added);
        this.enteringName = false;
        this.justEnded = true;
        this.showingScoreboard = true;
        this.nameSubmitted = true; // Mark name as submitted for this match
        this.saveHighScores(); // Ensure scores are saved immediately
      }
    } else if (key === "Backspace") {
      // Remove last character
      this.playerName = this.playerName.slice(0, -1);
      console.log("Backspace pressed, name now:", this.playerName);
    } else if (key.length === 1 && this.playerName.length < 10) {
      // Add character if it's a single character and name is not too long
      this.playerName += key;
      console.log("Character added, name now:", this.playerName);
    }
  }

  /**
   * Handle touch start event
   */
  handleTouchStart(x, y) {
    this.touchActive = true;
    this.touchX = x;
    this.touchY = y;
    
    // Check if touch is in the left half (movement) or right half (shooting)
    if (x < width / 2) {
      // Left side - movement joystick
      this.joystickActive = true;
      this.joystickBaseX = x;
      this.joystickBaseY = y;
      this.joystickX = x;
      this.joystickY = y;
    } else {
      // Right side - fire
      this.fireBullet();
      this.lastTouchTime = millis();
    }
  }
  
  /**
   * Handle touch move event
   */
  handleTouchMove(x, y) {
    this.touchX = x;
    this.touchY = y;
    
    if (this.joystickActive) {
      // Update joystick position
      this.joystickX = x;
      this.joystickY = y;
      
      // Calculate joystick displacement
      let dx = this.joystickX - this.joystickBaseX;
      let dy = this.joystickY - this.joystickBaseY;
      
      // Limit to joystick radius
      const distance = sqrt(dx * dx + dy * dy);
      if (distance > this.virtualJoystickRadius) {
        dx = dx * this.virtualJoystickRadius / distance;
        dy = dy * this.virtualJoystickRadius / distance;
        this.joystickX = this.joystickBaseX + dx;
        this.joystickY = this.joystickBaseY + dy;
      }
      
      // Move player based on joystick position
      const moveSpeed = 5;
      const moveX = map(dx, -this.virtualJoystickRadius, this.virtualJoystickRadius, -moveSpeed, moveSpeed);
      const moveY = map(dy, -this.virtualJoystickRadius, this.virtualJoystickRadius, -moveSpeed, moveSpeed);
      
      this.player.x = constrain(this.player.x + moveX, 20, width - 20);
      this.player.y = constrain(this.player.y + moveY, 20, height - 20);
    } else if (x > width / 2) {
      // Right side - continuous fire
      const currentTime = millis();
      if (currentTime - this.lastTouchTime > this.touchFireThreshold) {
        this.fireBullet();
        this.lastTouchTime = currentTime;
      }
    }
  }
  
  /**
   * Handle touch end event
   */
  handleTouchEnd() {
    this.touchActive = false;
    this.joystickActive = false;
  }
  
  /**
   * Display virtual joystick when active
   */
  displayTouchControls() {
    if (!this.touchActive || this.gameOver) return;
    
    push();
    
    // Draw virtual joystick if active
    if (this.joystickActive) {
      // Joystick base
      noFill();
      stroke(255, 100);
      strokeWeight(2);
      ellipse(this.joystickBaseX, this.joystickBaseY, this.virtualJoystickRadius * 2);
      
      // Joystick handle
      fill(this.playerColor[0], this.playerColor[1], this.playerColor[2], 150);
      stroke(255);
      ellipse(this.joystickX, this.joystickY, 40);
    }
    
    // Draw fire button indicator on right side
    if (this.touchX > width / 2) {
      noFill();
      stroke(255, 0, 0, 100);
      strokeWeight(2);
      ellipse(width - 80, height - 80, 60);
      
      fill(255, 0, 0, 100);
      textSize(16);
      textAlign(CENTER, CENTER);
      text("FIRE", width - 80, height - 80);
    }
    
    pop();
  }

  /**
   * Fire a bullet from the player's position
   */
  fireBullet() {
    if (this.gameOver) return;
    
    // Create a new bullet at the player's position
    const bullet = {
      x: this.player.x,
      y: this.player.y - 20,
      dx: 0,
      dy: -10,
      width: 4,
      height: 10,
      color: [...this.playerColor], // Copy the player's color
      active: true,
      
      // Update bullet position
      update: function() {
        this.x += this.dx;
        this.y += this.dy;
        
        // Deactivate bullets that go off screen
        if (this.y < -this.height || this.y > height + this.height ||
            this.x < -this.width || this.x > width + this.width) {
          this.active = false;
        }
      },
      
      // Display the bullet
      display: function() {
        push();
        
        // Bullet glow effect
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        
        // Bullet body
        fill(this.color);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height, 2);
        
        // Reset shadow
        drawingContext.shadowBlur = 0;
        
        pop();
      },
      
      // Check if bullet collides with an entity
      collidesWith: function(entity) {
        return (
          this.x - this.width/2 < entity.x + entity.width/2 &&
          this.x + this.width/2 > entity.x - entity.width/2 &&
          this.y - this.height/2 < entity.y + entity.height/2 &&
          this.y + this.height/2 > entity.y - entity.height/2
        );
      }
    };
    
    // Add bullet to the game
    this.bullets.push(bullet);
    
    // Play sound effect (if available)
    if (typeof playLaserSound === 'function') {
      playLaserSound();
    }
  }

  /**
   * Handle player being hit
   */
  handlePlayerHit() {
    this.lives--;
    
    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Make player invincible briefly
      if (this.player && typeof this.player.makeInvincible === 'function') {
        this.player.makeInvincible();
      } else if (this.player) {
        // Fallback if makeInvincible doesn't exist
        this.player.invincible = true;
        this.player.invincibleTimer = 120; // 2 seconds at 60fps
      }
    }
  }

  /**
   * End the game
   */
  endGame() {
    this.gameOver = true;
    this.justEnded = true;
    
    // Check if score is a high score
    if (this.isHighScore()) {
      this.enteringName = true;
    }
    
    console.log("Game over! Score:", this.score);
  }
  
  /**
   * Restart the game
   */
  restart() {
    this.init();
    this.gameOver = false;
    this.enteringName = false;
    this.justEnded = false;
    this.showingScoreboard = false;
    this.nameSubmitted = false; // Reset name submitted flag for new match
  }

  /**
   * Spawn a new enemy
   */
  spawnEnemy() {
    const x = random(width);
    const y = -30;
    
    const enemy = {
      x: x,
      y: y,
      width: 30,
      height: 30,
      speed: random(1, 3 + this.level * 0.5),
      active: true,
      
      update: function() {
        this.y += this.speed;
        
        // Deactivate if off screen
        if (this.y > height + 50) {
          this.active = false;
        }
      },
      
      display: function() {
        push();
        
        // Enemy body
        fill(255, 0, 0);
        noStroke();
        
        // Add glow effect
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';
        
        // Draw enemy (alien shape)
        beginShape();
        vertex(this.x, this.y - this.height/2); // Top
        vertex(this.x - this.width/2, this.y); // Left
        vertex(this.x - this.width/3, this.y + this.height/3); // Bottom left
        vertex(this.x + this.width/3, this.y + this.height/3); // Bottom right
        vertex(this.x + this.width/2, this.y); // Right
        endShape(CLOSE);
        
        // Draw eyes
        fill(255);
        ellipse(this.x - this.width/5, this.y - this.height/6, 8, 8);
        ellipse(this.x + this.width/5, this.y - this.height/6, 8, 8);
        
        // Draw pupils
        fill(0);
        ellipse(this.x - this.width/5, this.y - this.height/6, 4, 4);
        ellipse(this.x + this.width/5, this.y - this.height/6, 4, 4);
        
        pop();
      }
    };
    
    this.enemies.push(enemy);
  }
  
  /**
   * Spawn a background UFO (decorative only)
   */
  spawnBackgroundUFO() {
    // Determine if UFO comes from left or right
    const fromLeft = random() > 0.5;
    const x = fromLeft ? -50 : width + 50;
    const y = random(50, height/3); // Only in top third of screen
    
    const ufo = {
      x: x,
      y: y,
      width: 60,
      height: 30,
      speedX: (fromLeft ? 1 : -1) * random(0.5, 2),
      speedY: 0,
      color: [100, 100, 200],
      blinkTimer: 0,
      blinkState: false,
      
      update: function() {
        // Move horizontally
        this.x += this.speedX;
        
        // Add slight vertical wave motion
        this.speedY = sin(frameCount * 0.05) * 0.5;
        this.y += this.speedY;
        
        // Update blink timer
        this.blinkTimer++;
        if (this.blinkTimer > 10) {
          this.blinkTimer = 0;
          this.blinkState = !this.blinkState;
        }
      },
      
      display: function() {
        push();
        
        // UFO body
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.width, this.height);
        
        // UFO dome
        fill(150, 200, 255);
        ellipse(this.x, this.y - this.height/4, this.width/2, this.height/2);
        
        // UFO lights
        if (this.blinkState) {
          fill(255, 0, 0);
        } else {
          fill(0, 255, 255);
        }
        
        ellipse(this.x - this.width/3, this.y, 8, 8);
        ellipse(this.x, this.y + this.height/4, 8, 8);
        ellipse(this.x + this.width/3, this.y, 8, 8);
        
        // Add glow effect
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = this.blinkState ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)';
        
        pop();
      }
    };
    
    this.backgroundUFOs.push(ufo);
  }

  /**
   * Create an inline player object if Player class is not available
   */
  createInlinePlayer() {
    this.player = {
      x: width / 2,
      y: height - 100,
      width: 40,
      height: 40,
      speed: 5,
      color: this.playerColor,
      thrusterAnimation: 0,
      invincible: false,
      invincibleTimer: 0,
      invincibleDuration: 120,
      
      update: function() {
        // Handle keyboard input
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left arrow or A
          this.x -= this.speed;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right arrow or D
          this.x += this.speed;
        }
        if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Up arrow or W
          this.y -= this.speed;
        }
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Down arrow or S
          this.y += this.speed;
        }
        
        // Update thruster animation
        this.thrusterAnimation = (this.thrusterAnimation + 0.2) % 1;
        
        // Update invincibility timer
        if (this.invincible) {
          this.invincibleTimer--;
          if (this.invincibleTimer <= 0) {
            this.invincible = false;
          }
        }
      },
      
      move: function(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
      },
      
      makeInvincible: function() {
        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;
      },
      
      display: function() {
        push();
        
        // Skip drawing every few frames if invincible (blinking effect)
        if (this.invincible && frameCount % 6 < 3) {
          pop();
          return;
        }
        
        // Ship body
        fill(this.color);
        noStroke();
        
        // Add glow effect
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.5)`;
        
        // Draw ship body (triangle)
        beginShape();
        vertex(this.x, this.y - this.height/2);
        vertex(this.x - this.width/2, this.y + this.height/2);
        vertex(this.x + this.width/2, this.y + this.height/2);
        endShape(CLOSE);
        
        // Draw cockpit
        fill(200, 200, 255);
        ellipse(this.x, this.y, this.width/3, this.height/3);
        
        // Draw thrusters with animation
        fill(255, 100 + sin(this.thrusterAnimation * TWO_PI) * 155, 0);
        
        // Left thruster
        rect(this.x - this.width/4, this.y + this.height/2, 
             this.width/6, this.height/4 + sin(this.thrusterAnimation * TWO_PI) * 5);
        
        // Right thruster
        rect(this.x + this.width/4, this.y + this.height/2, 
             this.width/6, this.height/4 + cos(this.thrusterAnimation * TWO_PI) * 5);
        
        pop();
      },
      
      collidesWith: function(entity) {
        // Skip collision check if invincible
        if (this.invincible) {
          return false;
        }
        
        // Simple rectangular collision detection
        return (
          this.x - this.width/2 < entity.x + entity.width/2 &&
          this.x + this.width/2 > entity.x - entity.width/2 &&
          this.y - this.height/2 < entity.y + entity.height/2 &&
          this.y + this.height/2 > entity.y - entity.height/2
        );
      }
    };
  }

  /**
   * Handle touch controls
   */
  handleTouchControls() {
    if (!this.touchActive || !this.player) return;
    
    if (this.joystickActive) {
      // Calculate joystick direction
      const dx = this.joystickX - this.joystickBaseX;
      const dy = this.joystickY - this.joystickBaseY;
      
      // Normalize direction
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        const normalizedDx = dx / length;
        const normalizedDy = dy / length;
        
        // Move player based on joystick direction
        try {
          if (typeof this.player.move === 'function') {
            this.player.move(normalizedDx, normalizedDy);
          } else {
            // Fallback to direct position update
            this.player.x += normalizedDx * (this.player.speed || 5);
            this.player.y += normalizedDy * (this.player.speed || 5);
          }
          
          // Ensure player stays within screen bounds
          this.player.x = constrain(this.player.x, this.player.width / 2, width - this.player.width / 2);
          this.player.y = constrain(this.player.y, this.player.height / 2, height - this.player.height / 2);
        } catch (e) {
          console.error("Error moving player:", e);
        }
      }
      
      // Auto-fire if enough time has passed
      const currentTime = millis();
      if (currentTime - this.lastTouchTime > this.touchFireThreshold) {
        this.fireBullet();
        this.lastTouchTime = currentTime;
      }
    }
  }

  /**
   * Initialize some background UFOs
   */
  initializeBackgroundUFOs() {
    // Start with a few UFOs in the background
    for (let i = 0; i < 2; i++) {
      this.spawnBackgroundUFO();
    }
  }

  /**
   * Initialize some planets
   */
  initializePlanets() {
    // Start with 2-3 planets in the background
    const numPlanets = floor(random(2, 4));
    for (let i = 0; i < numPlanets; i++) {
      this.spawnPlanet();
    }
  }

  /**
   * Spawn a planet in the background
   */
  spawnPlanet() {
    // Create a planet with random properties
    const planetTypes = [
      { name: 'rocky', colors: [[139, 69, 19], [160, 82, 45], [205, 133, 63]] }, // Brown rocky planet
      { name: 'gas', colors: [[255, 140, 0], [255, 165, 0], [255, 215, 0]] },    // Orange/yellow gas giant
      { name: 'ice', colors: [[135, 206, 235], [135, 206, 250], [176, 224, 230]] }, // Blue ice planet
      { name: 'earth', colors: [[0, 128, 0], [65, 105, 225], [245, 245, 245]] },  // Earth-like
      { name: 'lava', colors: [[178, 34, 34], [220, 20, 60], [255, 69, 0]] }      // Red/orange lava planet
    ];
    
    const selectedType = random(planetTypes);
    const size = random(80, 200); // Larger than stars but not too dominant
    const x = random(-size/2, width + size/2);
    const y = random(-size/2, height/2); // Only in top half of screen
    const speedY = random(0.05, 0.2); // Very slow movement
    const rotationSpeed = random(-0.01, 0.01);
    const hasRings = random() > 0.7; // 30% chance of having rings
    
    const planet = {
      x: x,
      y: y,
      size: size,
      type: selectedType.name,
      colors: selectedType.colors,
      speedY: speedY,
      rotation: random(TWO_PI),
      rotationSpeed: rotationSpeed,
      hasRings: hasRings,
      ringColor: [random(150, 255), random(150, 255), random(150, 255)],
      ringWidth: random(1.4, 2.0), // Ring width multiplier
      features: [],
      
      // Generate random surface features
      generateFeatures: function() {
        const numFeatures = floor(random(3, 8));
        for (let i = 0; i < numFeatures; i++) {
          this.features.push({
            angle: random(TWO_PI),
            distance: random(0.3, 0.9) * (this.size/2),
            size: random(0.05, 0.2) * this.size,
            color: this.colors[floor(random(this.colors.length))]
          });
        }
      },
      
      update: function() {
        // Move very slowly down
        this.y += this.speedY;
        
        // Rotate slowly
        this.rotation += this.rotationSpeed;
        
        // Remove if completely off screen
        if (this.y - this.size > height) {
          return false;
        }
        return true;
      },
      
      display: function() {
        push();
        
        // Draw rings first (if planet has them) so they appear behind the planet
        if (this.hasRings) {
          push();
          translate(this.x, this.y);
          rotate(this.rotation);
          
          // Ring
          noFill();
          strokeWeight(this.size * 0.05);
          stroke(this.ringColor[0], this.ringColor[1], this.ringColor[2], 150);
          
          // Draw elliptical rings
          ellipse(0, 0, this.size * this.ringWidth, this.size * 0.4);
          
          pop();
        }
        
        // Planet body
        noStroke();
        
        // Base planet color (first color in the array)
        fill(this.colors[0][0], this.colors[0][1], this.colors[0][2]);
        ellipse(this.x, this.y, this.size, this.size);
        
        // Draw surface features
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        
        for (const feature of this.features) {
          fill(feature.color[0], feature.color[1], feature.color[2]);
          const featureX = cos(feature.angle) * feature.distance;
          const featureY = sin(feature.angle) * feature.distance;
          ellipse(featureX, featureY, feature.size, feature.size);
        }
        
        pop();
        
        // Add subtle glow effect
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = `rgba(${this.colors[0][0]}, ${this.colors[0][1]}, ${this.colors[0][2]}, 0.3)`;
        
        pop();
      }
    };
    
    // Generate surface features
    planet.generateFeatures();
    
    this.planets.push(planet);
  }
}

// Global game instance
let gameInstance; 