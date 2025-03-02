// Game state and core logic
class Game {
  constructor() {
    console.log("Game constructor called");
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.stars = [];
    this.score = 0;
    this.lives = 3;
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
    
    // Initialize the game
    this.init();
    this.loadHighScores();
    this.calculateScaleRatio();
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
    this.initStars();
  }

  init() {
    console.log("Initializing game with color:", this.playerColor);
    // Initialize player with the selected color
    this.player = new Player(width / 2, height - 100, this.playerColor);
    
    // Clear existing enemies and bullets
    this.enemies = [];
    this.bullets = [];
    
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.enteringName = false;
    this.justEnded = false;
    this.showingScoreboard = false; // Reset scoreboard flag
    this.level = 1;
    this.enemySpawnRate = 0.02;
    
    // Initialize stars
    this.initStars();
  }

  initStars() {
    this.stars = [];
    const starCount = Math.floor(100 * (width * height) / (this.baseWidth * this.baseHeight));
    
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        brightness: random(100, 255),
        speed: random(0.5, 2)
      });
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
    if (this.gameOver) {
      if (this.justEnded) {
        this.justEnded = false;
        this.enteringName = true;
        this.playerName = "";
      }
      return;
    }
    
    if (this.enteringName) return;
    
    // Handle player movement
    if (keyIsDown(LEFT_ARROW)) this.player.move('left');
    if (keyIsDown(RIGHT_ARROW)) this.player.move('right');
    if (keyIsDown(UP_ARROW)) this.player.move('up');
    if (keyIsDown(DOWN_ARROW)) this.player.move('down');
    
    // Move stars
    for (let star of this.stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = random(width);
      }
    }
    
    // Spawn enemies
    if (random() < this.enemySpawnRate) {
      const enemy = new Enemy(random(width), -20);
      this.enemies.push(enemy);
    }
    
    // Increase difficulty over time
    if (frameCount % 1000 === 0) {
      this.level++;
      this.enemySpawnRate = min(0.1, this.enemySpawnRate + 0.01);
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      enemy.move();
      
      // Check if enemy is offscreen
      if (enemy.isOffscreen()) {
        this.enemies.splice(i, 1);
        continue;
      }
      
      // Check for collision with player
      if (this.player.hits(enemy)) {
        this.lives--;
        this.enemies.splice(i, 1);
        
        if (this.lives <= 0) {
          this.gameOver = true;
          this.justEnded = true;
        }
        
        continue;
      }
      
      // Check for collision with bullets
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const bullet = this.bullets[j];
        
        if (enemy.hits(bullet)) {
          this.score += 100;
          this.enemies.splice(i, 1);
          this.bullets.splice(j, 1);
          break;
        }
      }
    }
    
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      bullet.update();
      
      if (!bullet.active) {
        this.bullets.splice(i, 1);
      }
    }
  }

  display() {
    background(0);
    
    push();
    
    // Apply scaling for responsive design
    // scale(this.scaleRatio);
    
    // Draw stars
    for (const star of this.stars) {
      fill(255, star.brightness);
      noStroke();
      ellipse(star.x, star.y, star.size);
    }
    
    // Draw player
    this.player.display();
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.display();
    }
    
    // Draw bullets
    for (const bullet of this.bullets) {
      bullet.display();
    }
    
    // Display score and lives
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
    text(`SCORE: ${this.score.toString().padStart(6, '0')}`, 20, 30);
    
    // Lives display
    textAlign(RIGHT);
    text(`LIVES: ${this.lives}`, width - 20, 30);
    
    // Level display
    textAlign(CENTER);
    text(`LEVEL: ${this.level}`, width / 2, 30);
    
    pop();
  }
  
  drawHeart(x, y, size) {
    push();
    translate(x, y);
    
    fill(255, 0, 0);
    noStroke();
    
    beginShape();
    vertex(0, -size/4);
    bezierVertex(size/2, -size, size, -size/4, 0, size/2);
    bezierVertex(-size, -size/4, -size/2, -size, 0, -size/4);
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
   * Game over state
   */
  endGame() {
    this.gameOver = true;
    
    // Only prompt for name entry if it's a high score and name hasn't been submitted yet
    this.enteringName = this.isHighScore() && !this.nameSubmitted;
    
    this.showingScoreboard = false;
    
    // Only reset player name if we haven't submitted a name yet
    if (!this.nameSubmitted) {
      this.playerName = "";
    }
    
    console.log("Game over. High score?", this.enteringName, "Name submitted?", this.nameSubmitted);
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
}

// Global game instance
let gameInstance; 