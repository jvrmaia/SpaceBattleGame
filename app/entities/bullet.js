// Player bullet
class Bullet {
  constructor(x, y, speed = -10) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = 5;
    this.height = 10;
  }

  display() {
    push();
    fill(255, 255, 0);
    noStroke();
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height, 2);
    pop();
  }

  move() {
    this.y += this.speed;
  }

  isOffscreen() {
    return this.y < -this.height || this.y > height + this.height;
  }
} 