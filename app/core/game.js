// Game state and core logic
class Game {
  constructor() {
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.stars = [];
    this.planets = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.justEnded = false;
    this.highScores = [];
    this.MAX_HIGH_SCORES = 5;
    this.playerName = "";
    this.enteringName = false;
    this.gameStarted = false;
    this.playerColor = [0, 255, 0];
  }

  init() {
    this.createPlayer();
    this.createEnemies();
    this.createStars();
    PlanetSystem.createPlanets();
    StorageManager.loadHighScores();
  }

  createPlayer() {
    this.player = new Spaceship(width / 2, height - 100, 'player', this.playerColor);
  }

  createEnemies() {
    this.enemies = [];
    for (let i = 0; i < 5; i++) {
      this.enemies.push(new Spaceship(random(width), random(height / 3), 'enemy'));
    }
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        speed: random(0.5, 2)
      });
    }
  }

  update() {
    if (this.enteringName || this.gameOver) return;

    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
  }

  updatePlayer() {
    this.player.update();
  }

  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update();
      
      // Enemy shooting randomly
      if (random(1) < 0.01) {
        this.bullets.push(new Bullet(this.enemies[i].x, this.enemies[i].y, 0, 5, 'enemy'));
      }
      
      // Check collision with player
      if (dist(this.player.x, this.player.y, this.enemies[i].x, this.enemies[i].y) < this.player.size/2 + this.enemies[i].size/2) {
        this.loseLife();
        this.enemies.splice(i, 1);
        this.enemies.push(new Spaceship(random(width), random(50), 'enemy'));
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update();
      
      // Remove bullets that go off screen
      if (this.bullets[i].y < 0 || this.bullets[i].y > height) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Check for bullet collisions
      if (this.bullets[i].type === 'player') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          if (dist(this.bullets[i].x, this.bullets[i].y, this.enemies[j].x, this.enemies[j].y) < this.enemies[j].size/2) {
            // Enemy hit
            this.score += 10;
            this.enemies.splice(j, 1);
            this.bullets.splice(i, 1);
            
            // Create a new enemy
            this.enemies.push(new Spaceship(random(width), random(50), 'enemy'));
            break;
          }
        }
      } else if (this.bullets[i].type === 'enemy') {
        if (dist(this.bullets[i].x, this.bullets[i].y, this.player.x, this.player.y) < this.player.size/2) {
          // Player hit by enemy bullet
          this.loseLife();
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
      this.justEnded = true;
      if (StorageManager.isHighScore(this.score)) {
        this.enteringName = true;
        this.playerName = "";
      }
    }
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.enteringName = false;
    this.bullets = [];
    this.init();
  }

  restartFromBeginning() {
    this.gameStarted = false;
    this.reset();
  }

  playerShoot() {
    if (!this.gameOver) {
      this.bullets.push(new Bullet(this.player.x, this.player.y, 0, -10, 'player'));
    }
  }

  submitHighScore() {
    // Trim whitespace and ensure name isn't empty
    this.playerName = this.playerName.trim();
    if (this.playerName === "") {
      this.playerName = "Player";
    }
    
    // Sanitize the name (extra safety)
    this.playerName = this.sanitizeNickname(this.playerName);
    
    StorageManager.addHighScore(this.score, this.playerName);
    this.enteringName = false;
    this.gameOver = true;
  }
  
  // New method to sanitize nicknames
  sanitizeNickname(name) {
    // Remove any characters that aren't allowed
    return name.replace(/[^a-zA-Z0-9_\-\.\ ]/g, '');
  }
}

// Global game instance
let gameInstance; 