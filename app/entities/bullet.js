// Bullet entity
class Bullet {
  constructor(x, y, dx = 0, dy = -10, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = 4;
    this.height = 10;
    this.color = color || [255, 255, 0]; // Default to yellow if no color provided
    this.active = true;
  }
  
  /**
   * Update bullet position
   */
  update() {
    this.x += this.dx;
    this.y += this.dy;
    
    // Deactivate bullets that go off screen
    if (this.y < -this.height || this.y > height + this.height ||
        this.x < -this.width || this.x > width + this.width) {
      this.active = false;
    }
  }
  
  /**
   * Display the bullet
   */
  display() {
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
  }
  
  /**
   * Check if bullet collides with an entity
   */
  collidesWith(entity) {
    return (
      this.x - this.width/2 < entity.x + entity.width/2 &&
      this.x + this.width/2 > entity.x - entity.width/2 &&
      this.y - this.height/2 < entity.y + entity.height/2 &&
      this.y + this.height/2 > entity.y - entity.height/2
    );
  }
  
  /**
   * Check if bullet is off screen
   */
  isOffscreen() {
    return this.y < -this.height || this.y > height + this.height ||
           this.x < -this.width || this.x > width + this.width;
  }
}