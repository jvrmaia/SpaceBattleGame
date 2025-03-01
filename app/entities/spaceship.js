// Spaceship class
class Spaceship {
  constructor(x, y, type, color) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = type === 'player' ? 40 : 30;
    this.speed = type === 'player' ? 5 : 2;
    this.direction = type === 'player' ? 0 : random(-1, 1);
    this.color = color || (type === 'player' ? [0, 255, 0] : [255, 0, 0]); // Default colors with override option
  }
  
  update() {
    if (this.type === 'player') {
      // Player controls
      if (keyIsDown(LEFT_ARROW)) {
        this.x -= this.speed;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.x += this.speed;
      }
      if (keyIsDown(UP_ARROW)) {
        this.y -= this.speed;
      }
      if (keyIsDown(DOWN_ARROW)) {
        this.y += this.speed;
      }
      
      // Keep player on screen using border utilities if available
      if (typeof BorderUtils !== 'undefined') {
        const constrained = BorderUtils.constrainToGame(this.x, this.y, this.size);
        this.x = constrained.x;
        this.y = constrained.y;
      } else {
        // Fallback if BorderUtils is not available
        this.x = constrain(this.x, this.size/2, width - this.size/2);
        this.y = constrain(this.y, this.size/2, height - this.size/2);
      }
    } else {
      // Enemy movement
      this.x += this.direction * this.speed;
      
      // Change direction when reaching edges
      if (this.x < this.size/2 || this.x > width - this.size/2) {
        this.direction *= -1;
      }
    }
  }
  
  display() {
    push();
    if (this.type === 'player') {
      fill(this.color);
    } else {
      fill(255, 0, 0);
    }
    noStroke();
    
    // Draw spaceship
    if (this.type === 'player') {
      triangle(
        this.x, this.y - this.size/2,
        this.x - this.size/2, this.y + this.size/2,
        this.x + this.size/2, this.y + this.size/2
      );
    } else {
      triangle(
        this.x, this.y + this.size/2,
        this.x - this.size/2, this.y - this.size/2,
        this.x + this.size/2, this.y - this.size/2
      );
    }
    pop();
  }
} 