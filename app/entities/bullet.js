// Bullet class
class Bullet {
  constructor(x, y, xSpeed, ySpeed, type) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = 5;
    this.type = type;
  }
  
  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }
  
  display() {
    push();
    if (this.type === 'player') {
      fill(0, 255, 255);
    } else {
      fill(255, 0, 0);
    }
    noStroke();
    ellipse(this.x, this.y, this.size);
    pop();
  }
} 