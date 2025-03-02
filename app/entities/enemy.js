// Enemy spaceship
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40);
    this.speed = random(1, 3);
    this.color = [255, 0, 0];
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // Draw enemy ship
    fill(this.color);
    stroke(255);
    strokeWeight(1);
    
    // Enemy shape
    triangle(
      0, -this.size/2,
      -this.size/2, this.size/2,
      this.size/2, this.size/2
    );
    
    // Enemy details
    fill(200);
    rect(0, 0, this.size/5, this.size/3);
    
    pop();
  }

  move() {
    this.y += this.speed;
  }

  isOffscreen() {
    return this.y > height + this.size;
  }

  hits(bullet) {
    const distance = dist(this.x, this.y, bullet.x, bullet.y);
    return distance < (this.size/2 + 5);
  }
}