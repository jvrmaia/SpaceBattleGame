// Heads-up display
class HUD {
  static display() {
    // Display score
    fill(255);
    textSize(24);
    textAlign(LEFT);
    text("Score: " + gameInstance.score, 20, 30);
    
    // Display lives as hearts instead of number
    this.displayLivesAsHearts();
  }
  
  // New method to display lives as hearts
  static displayLivesAsHearts() {
    const heartSize = 25;
    const spacing = 10;
    const startX = width - 30 - (heartSize + spacing) * (gameInstance.lives - 1);
    const y = 25;
    
    fill(255, 50, 50); // Red color for hearts
    noStroke();
    
    for (let i = 0; i < gameInstance.lives; i++) {
      const x = startX + i * (heartSize + spacing);
      this.drawHeart(x, y, heartSize);
    }
  }
  
  // Method to draw a heart shape
  static drawHeart(x, y, size) {
    push();
    translate(x, y);
    
    beginShape();
    // Heart shape using bezier curves
    vertex(0, -size/4);
    bezierVertex(size/2, -size, size, -size/4, 0, size/2);
    bezierVertex(-size, -size/4, -size/2, -size, 0, -size/4);
    endShape(CLOSE);
    
    pop();
  }
} 