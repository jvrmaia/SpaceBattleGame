// Player entity
class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 5;
    this.color = color || [0, 255, 0]; // Default green color
    this.thrusterAnimation = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 120; // 2 seconds at 60fps
    this.visible = true; // Flag to track visibility
  }
  
  /**
   * Update player position based on input
   */
  update() {
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
    
    // Ensure player stays within screen bounds
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    this.y = constrain(this.y, this.height/2, height - this.height/2);
    
    // Update thruster animation
    this.thrusterAnimation = (this.thrusterAnimation + 0.2) % 1;
    
    // Update invincibility timer
    if (this.invincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
    
    // Debug position
    console.log(`Player position: (${this.x}, ${this.y})`);
  }
  
  /**
   * Move player by a specific amount
   */
  move(dx, dy) {
    // Apply movement with speed factor
    this.x += dx * this.speed;
    this.y += dy * this.speed;
    
    // Ensure player stays within screen bounds
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    this.y = constrain(this.y, this.height/2, height - this.height/2);
    
    // Debug position after move
    console.log(`Player moved to: (${this.x}, ${this.y})`);
  }
  
  /**
   * Make player invincible for a short time
   */
  makeInvincible() {
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;
  }
  
  /**
   * Display the player ship
   */
  display() {
    // Skip if not visible
    if (!this.visible) return;
    
    push();
    
    // Skip drawing every few frames if invincible (blinking effect)
    if (this.invincible && frameCount % 6 < 3) {
      pop();
      return;
    }
    
    // Ship body
    fill(this.color[0], this.color[1], this.color[2]);
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
  }
  
  /**
   * Check collision with another entity
   */
  collidesWith(entity) {
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

  fire() {
    return new Bullet(this.x, this.y - this.height/2, -10);
  }

  hits(enemy) {
    const distance = dist(this.x, this.y, enemy.x, enemy.y);
    return distance < (this.width/2 + enemy.size/2);
  }
} 