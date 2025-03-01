// UFO class for background elements
class UFOSystem {
  static ufos = [];
  static ufoCount = 3; // Number of UFOs to display
  
  static initialize() {
    this.ufos = [];
    for (let i = 0; i < this.ufoCount; i++) {
      this.createUFO();
    }
  }
  
  static createUFO() {
    // Randomly decide if UFO enters from left or right
    const enterFromLeft = random() > 0.5;
    const x = enterFromLeft ? -100 : width + 100;
    const y = random(50, height/2);
    const speed = random(1, 3);
    const size = random(40, 80);
    const blinkRate = random(0.02, 0.1);
    
    this.ufos.push({
      x: x,
      y: y,
      size: size,
      speed: enterFromLeft ? speed : -speed,
      blinkTime: 0,
      blinkRate: blinkRate,
      lightOn: false,
      alienVisible: random() > 0.3 // 70% chance to show alien
    });
  }
  
  static update() {
    for (let i = this.ufos.length - 1; i >= 0; i--) {
      const ufo = this.ufos[i];
      
      // Move UFO
      ufo.x += ufo.speed;
      
      // Blink lights
      ufo.blinkTime += ufo.blinkRate;
      if (ufo.blinkTime >= 1) {
        ufo.blinkTime = 0;
        ufo.lightOn = !ufo.lightOn;
      }
      
      // Remove UFO if it's off-screen and create a new one
      if ((ufo.speed > 0 && ufo.x > width + 150) || 
          (ufo.speed < 0 && ufo.x < -150)) {
        this.ufos.splice(i, 1);
        this.createUFO();
      }
    }
  }
  
  static display() {
    for (const ufo of this.ufos) {
      this.drawUFO(ufo);
    }
  }
  
  static drawUFO(ufo) {
    push();
    translate(ufo.x, ufo.y);
    
    // Draw UFO body (saucer shape)
    fill(150, 150, 170);
    ellipse(0, 0, ufo.size, ufo.size * 0.4);
    
    // Draw dome
    fill(200, 200, 220);
    arc(0, -ufo.size * 0.1, ufo.size * 0.6, ufo.size * 0.5, PI, TWO_PI, CHORD);
    
    // Draw lights
    if (ufo.lightOn) {
      fill(255, 255, 100);
    } else {
      fill(200, 100, 100);
    }
    
    for (let i = 0; i < 5; i++) {
      const angle = map(i, 0, 4, -PI * 0.7, -PI * 0.3);
      const lightX = cos(angle) * ufo.size * 0.45;
      const lightY = sin(angle) * ufo.size * 0.2;
      ellipse(lightX, lightY, ufo.size * 0.1, ufo.size * 0.1);
    }
    
    // Draw alien if visible
    if (ufo.alienVisible) {
      this.drawAlien(0, -ufo.size * 0.1, ufo.size * 0.3);
    }
    
    // Draw light beam occasionally
    if (ufo.lightOn && random() < 0.3) {
      this.drawLightBeam(ufo.size);
    }
    
    pop();
  }
  
  static drawAlien(x, y, size) {
    push();
    translate(x, y);
    
    // Alien head
    fill(100, 220, 100);
    ellipse(0, 0, size * 0.8, size);
    
    // Alien eyes
    fill(0);
    ellipse(-size * 0.15, -size * 0.1, size * 0.25, size * 0.15);
    ellipse(size * 0.15, -size * 0.1, size * 0.25, size * 0.15);
    
    // Alien mouth
    noFill();
    stroke(0);
    strokeWeight(size * 0.05);
    arc(0, size * 0.2, size * 0.3, size * 0.1, 0, PI);
    
    pop();
  }
  
  static drawLightBeam(size) {
    // Draw light beam
    noStroke();
    fill(255, 255, 100, 50);
    beginShape();
    vertex(-size * 0.2, 0);
    vertex(size * 0.2, 0);
    vertex(size * 0.4, size);
    vertex(-size * 0.4, size);
    endShape(CLOSE);
  }
} 