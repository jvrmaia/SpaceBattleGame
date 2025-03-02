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
    this.MAX_HIGH_SCORES = 5;
    this.playerName = "";
    this.enteringName = false;
    this.justEnded = false;
    this.level = 1;
    this.enemySpawnRate = 0.02;
    
    // Initialize the game
    this.init();
    this.loadHighScores();
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
    this.level = 1;
    this.enemySpawnRate = 0.02;
    
    // Initialize stars
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        speed: random(1, 3)
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

  saveHighScore(name, score) {
    try {
      // Add new score
      this.highScores.push({ name, score });
      
      // Sort by score (highest first)
      this.highScores.sort((a, b) => b.score - a.score);
      
      // Keep only top scores
      this.highScores = this.highScores.slice(0, this.MAX_HIGH_SCORES);
      
      // Save to localStorage
      localStorage.setItem('highScores', JSON.stringify(this.highScores));
    } catch (e) {
      console.error('Error saving high score:', e);
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
      
      bullet.move();
      
      if (bullet.isOffscreen()) {
        this.bullets.splice(i, 1);
      }
    }
  }

  display() {
    // Draw stars background
    background(0);
    
    for (const star of this.stars) {
      fill(255, 255, 255, random(150, 255));
      noStroke();
      ellipse(star.x, star.y, star.size, star.size);
      
      // Move stars down
      star.y += star.speed;
      
      // Reset stars that go off screen
      if (star.y > height) {
        star.y = 0;
        star.x = random(width);
      }
    }
    
    // Draw game elements if not game over
    if (!this.gameOver) {
      // Draw player
      if (this.player) {
        this.player.display();
      }
      
      // Draw enemies
      for (const enemy of this.enemies) {
        enemy.display();
      }
      
      // Draw bullets
      for (const bullet of this.bullets) {
        bullet.display();
      }
    }
    
    // Draw HUD
    this.displayHUD();
    
    // Draw game over screen if game is over
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
    text(`SCORE: ${this.score.toString().padStart(6, '0')}`, 20, 40);
    
    // High score display
    if (this.highScores.length > 0) {
      const highScore = this.highScores[0];
      textAlign(CENTER);
      text(`HIGH SCORE: ${highScore.name} ${highScore.score.toString().padStart(6, '0')}`, width/2, 40);
    }
    
    // Level display
    textAlign(LEFT);
    text(`LEVEL: ${this.level}`, 20, 70);
    
    // Lives display with hearts
    textAlign(RIGHT);
    text("LIVES:", width - 150, 40);
    
    for (let i = 0; i < this.lives; i++) {
      this.drawHeart(width - 120 + i * 30, 35, 20);
    }
    
    // Game title
    fill(100, 100, 255, 50);
    textSize(40);
    textAlign(CENTER);
    text("SPACE BATTLE GAME", width/2, height - 20);
    
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
  
  displayGameOver() {
    push();
    
    // Semi-transparent overlay
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    // Game over panel
    const panelWidth = 500;
    const panelHeight = 500;
    const panelX = width/2;
    const panelY = height/2;
    
    fill(0, 0, 50);
    stroke(255, 0, 0);
    strokeWeight(3);
    rectMode(CENTER);
    rect(panelX, panelY, panelWidth, panelHeight, 15);
    
    // Game over text
    fill(255, 0, 0);
    textSize(48);
    textFont('Courier New');
    textAlign(CENTER);
    text("GAME OVER", width/2, panelY + 60);
    
    // Final score
    fill(0, 255, 0);
    textSize(32);
    text(`SCORE: ${this.score.toString().padStart(6, '0')}`, width/2, panelY + 120);
    
    if (this.enteringName) {
      // Name entry prompt
      fill(255);
      textSize(24);
      text("ENTER YOUR NAME:", width/2, panelY + 180);
      
      // Name input box
      fill(0);
      stroke(0, 255, 0);
      strokeWeight(2);
      rectMode(CENTER);
      rect(width/2, panelY + 240, 300, 40);
      
      // Entered name with blinking cursor
      fill(0, 255, 0);
      textAlign(CENTER);
      const displayName = this.playerName + (frameCount % 30 < 15 ? "_" : "");
      text(displayName, width/2, panelY + 247);
      
      // Instructions
      fill(255);
      textAlign(CENTER);
      textSize(16);
      text("TYPE YOUR NAME AND PRESS ENTER", width/2, panelY + 280);
    } else {
      // High scores title
      fill(255, 255, 0);
      textSize(32);
      textAlign(CENTER);
      text("HIGH SCORES", width/2, panelY + 180);
      
      // High scores list
      fill(255);
      textSize(24);
      textAlign(CENTER);
      
      // Table header
      fill(0, 255, 0);
      text("RANK   NAME          SCORE", width/2, panelY + 220);
      
      // High scores
      fill(255);
      for (let i = 0; i < this.MAX_HIGH_SCORES; i++) {
        const score = i < this.highScores.length ? this.highScores[i] : { name: "---", score: 0 };
        const scoreText = `${(i + 1).toString().padStart(2, ' ')}     ${score.name.padEnd(10, ' ')}   ${score.score.toString().padStart(6, '0')}`;
        text(scoreText, width/2, panelY + 250 + i * 40);
      }
    }
    
    // Restart instructions
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("PRESS R TO RESTART", width/2, panelY + panelHeight - 40);
    
    pop();
  }
  
  handleKeyPress(key, keyCode) {
    if (this.enteringName) {
      if (keyCode === ENTER) {
        if (this.playerName.trim().length > 0) {
          this.saveHighScore(this.playerName.trim(), this.score);
          this.enteringName = false;
        }
      } else if (keyCode === BACKSPACE) {
        this.playerName = this.playerName.slice(0, -1);
      } else if (key.length === 1 && this.playerName.length < 10) {
        // Only allow letters, numbers, and some special characters
        const validChars = /^[a-zA-Z0-9!@#$%^&*()_\-+=[\]{}|:;,.<>?]$/;
        if (validChars.test(key)) {
          this.playerName += key;
        }
      }
    }
  }
}

// Global game instance
let gameInstance; 