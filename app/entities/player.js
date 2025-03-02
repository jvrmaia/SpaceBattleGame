// Player spaceship
class Player {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 5;
    this.color = color || [0, 255, 0]; // Use provided color or default to green
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // Draw ship body with the selected color
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Ship shape
    triangle(
      0, -this.height/2,
      -this.width/2, this.height/2,
      this.width/2, this.height/2
    );
    
    // Engine flames with animation
    const flameSize = sin(frameCount * 0.2) * 5 + 10; // Animated flame size
    fill(255, 150, 0, 200);
    noStroke();
    
    // Main flame
    triangle(
      0, this.height/2,
      -this.width/4, this.height/2 + flameSize,
      this.width/4, this.height/2 + flameSize
    );
    
    // Cockpit
    fill(200, 200, 255);
    ellipse(0, 0, this.width/4, this.width/4);
    
    pop();
  }

  move(direction) {
    switch(direction) {
      case 'left':
        this.x -= this.speed;
        break;
      case 'right':
        this.x += this.speed;
        break;
      case 'up':
        this.y -= this.speed;
        break;
      case 'down':
        this.y += this.speed;
        break;
    }
    
    // Keep player within screen bounds
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    this.y = constrain(this.y, this.height/2, height - this.height/2);
  }

  fire() {
    return new Bullet(this.x, this.y - this.height/2, -10);
  }

  hits(enemy) {
    const distance = dist(this.x, this.y, enemy.x, enemy.y);
    return distance < (this.width/2 + enemy.size/2);
  }
} 