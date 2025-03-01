// Game screens
class Screens {
  // Properties for animations
  static partyShips = [];
  static confettiParticles = [];
  static frameCounter = 0;
  static titleAngle = 0;
  
  // Initialize party elements
  static initPartyElements() {
    // Create celebration spaceships
    this.partyShips = [];
    for (let i = 0; i < 8; i++) {
      this.partyShips.push({
        x: random(width),
        y: random(height/2),
        size: random(20, 40),
        speed: random(1, 3) * (random() > 0.5 ? 1 : -1),
        color: [random(100, 255), random(100, 255), random(100, 255)],
        lightTimer: random(0, 100),
        lightSpeed: random(0.05, 0.2)
      });
    }
    
    // Create confetti particles
    this.confettiParticles = [];
    for (let i = 0; i < 100; i++) {
      this.confettiParticles.push({
        x: random(width),
        y: random(-100, 0),
        size: random(3, 8),
        speedX: random(-1, 1),
        speedY: random(2, 5),
        color: [random(100, 255), random(100, 255), random(100, 255)],
        rotation: random(TWO_PI)
      });
    }
  }
  
  static displayNameInput() {
    // Update animations
    this.updateAnimations();
    
    // Draw background elements
    this.drawArcadeBackground();
    
    // Draw party ships in background
    this.drawPartyShips();
    
    // Draw confetti
    this.drawConfetti();
    
    // Center everything on screen
    const centerY = height/2;
    const boxHeight = 350;
    
    // Draw neon frame
    this.drawNeonFrame(width/2, centerY, 400, boxHeight);
    
    fill(255);
    textSize(32);
    textAlign(CENTER);
    
    // Draw title with glow effect
    this.drawGlowText("NEW HIGH SCORE!", width/2, centerY - boxHeight/2 + 50, [255, 255, 0]);
    
    textSize(24);
    fill(255);
    text("Enter your nickname:", width/2, centerY - 30);
    
    // Display input box with neon effect
    this.drawNeonBox(width/2, centerY + 10, 300, 40);
    
    // Display entered name
    fill(255);
    textSize(20);
    
    // Add blinking cursor
    const cursorBlink = frameCount % 60 < 30;
    const displayText = gameInstance.playerName + (cursorBlink ? "_" : "");
    text(displayText, width/2, centerY + 15);
    
    // Instructions
    textSize(16);
    text("Press ENTER when done", width/2, centerY + 50);
    text("Only letters, numbers, spaces, and _-. allowed", width/2, centerY + 75);
    text("ESC to use default name", width/2, centerY + 100);
    
    // Draw scanlines
    this.drawScanlines();
  }

  static displayGameOver() {
    // Update animations
    this.updateAnimations();
    
    // Draw background elements
    this.drawArcadeBackground();
    
    // Draw party ships in background
    this.drawPartyShips();
    
    // Draw confetti
    this.drawConfetti();
    
    // Center everything on screen
    const centerY = height/2;
    const boxHeight = 450;
    
    // Draw neon frame for game over
    this.drawNeonFrame(width/2, centerY, 500, boxHeight);
    
    // Draw title with rotating effect
    push();
    translate(width/2, centerY - boxHeight/2 + 60);
    rotate(sin(this.titleAngle) * 0.05);
    this.drawGlowText("GAME OVER", 0, 0, [255, 50, 50]);
    pop();
    
    // Draw score with pulsing effect
    const pulseSize = 32 + sin(frameCount * 0.1) * 4;
    textSize(pulseSize);
    this.drawGlowText("Score: " + gameInstance.score, width/2, centerY - boxHeight/2 + 120, [50, 255, 50]);
    
    // Display high scores with arcade style
    this.displayHighScores(centerY);
    
    // Draw restart button with neon effect
    this.drawNeonButton("PRESS 'R' TO RESTART", width/2, centerY + boxHeight/2 - 80, 300, 40);
    
    // Draw reset scoreboard button
    this.displayResetButton(centerY, boxHeight);
    
    // Draw scanlines
    this.drawScanlines();
  }

  static displayHighScores(centerY = height/2) {
    const scoreBoxTop = centerY - 60;
    
    // Draw high scores title with glow
    this.drawGlowText("HIGH SCORES", width/2, scoreBoxTop, [0, 200, 255]);
    
    // Draw score box background
    fill(0, 0, 50, 150);
    rectMode(CENTER);
    noStroke();
    rect(width/2, centerY + 40, 400, 150, 5);
    
    textSize(20);
    textAlign(CENTER);
    
    if (gameInstance.highScores.length === 0) {
      fill(255);
      text("No high scores yet!", width/2, centerY + 40);
    } else {
      // Calculate vertical positioning
      const scoreCount = Math.min(gameInstance.highScores.length, 5);
      const scoreHeight = 25;
      const totalScoreHeight = scoreCount * scoreHeight;
      const startY = centerY + 40 - totalScoreHeight/2 + scoreHeight/2;
      
      for (let i = 0; i < Math.min(gameInstance.highScores.length, 5); i++) {
        const yPos = startY + i * scoreHeight;
        
        // Alternate row colors for retro effect
        const rowColor = i % 2 === 0 ? [200, 200, 100] : [100, 200, 200];
        
        // Draw score row with highlight for new score
        const isCurrentScore = gameInstance.highScores[i].score === gameInstance.score && 
                              gameInstance.highScores[i].name === gameInstance.playerName;
        
        if (isCurrentScore && frameCount % 60 < 30) {
          // Blinking highlight for current score
          fill(255, 255, 0);
        } else {
          fill(rowColor);
        }
        
        // Draw rank with trophy icon for top 3
        let rankText = (i + 1) + ".";
        if (i < 3) {
          rankText = ["🏆", "🥈", "🥉"][i] + " ";
        }
        
        text(rankText + " " + gameInstance.highScores[i].name + ": " + gameInstance.highScores[i].score, width/2, yPos);
      }
    }
  }
  
  static displayResetButton(centerY = height/2, boxHeight = 400) {
    // Draw button with neon effect
    this.drawNeonButton("RESET SCOREBOARD", width/2, centerY + boxHeight/2 - 30, 200, 40, [150, 0, 0], [255, 50, 50]);
  }
  
  // Helper methods for arcade style
  static updateAnimations() {
    this.frameCounter++;
    this.titleAngle += 0.02;
    
    // Initialize party elements if needed
    if (this.partyShips.length === 0) {
      this.initPartyElements();
    }
    
    // Update party ships
    for (let ship of this.partyShips) {
      // Move ships
      ship.x += ship.speed;
      
      // Wrap around screen
      if (ship.x < -50) ship.x = width + 50;
      if (ship.x > width + 50) ship.x = -50;
      
      // Update light timer
      ship.lightTimer += ship.lightSpeed;
    }
    
    // Update confetti
    for (let particle of this.confettiParticles) {
      // Move particles
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.rotation += 0.02;
      
      // Reset particles that fall off screen
      if (particle.y > height) {
        particle.y = random(-100, 0);
        particle.x = random(width);
      }
    }
  }
  
  static drawArcadeBackground() {
    // Draw grid background
    stroke(0, 100, 100, 50);
    strokeWeight(1);
    
    // Horizontal lines
    for (let y = 0; y < height; y += 40) {
      line(0, y, width, y);
    }
    
    // Vertical lines
    for (let x = 0; x < width; x += 40) {
      line(x, 0, x, height);
    }
    
    // Draw distant stars
    noStroke();
    for (let i = 0; i < 100; i++) {
      const starX = (i * 17) % width;
      const starY = (i * 23) % height;
      const starBlink = sin(frameCount * 0.01 + i) > 0;
      
      if (starBlink) {
        fill(255, 255, 255, 150);
        ellipse(starX, starY, 2, 2);
      }
    }
  }
  
  static drawPartyShips() {
    for (let ship of this.partyShips) {
      push();
      translate(ship.x, ship.y);
      
      // Draw ship lights (blinking)
      for (let i = 0; i < 3; i++) {
        const lightOn = sin(ship.lightTimer + i) > 0;
        if (lightOn) {
          // Light glow
          drawingContext.shadowBlur = 15;
          drawingContext.shadowColor = `rgb(${ship.color[0]}, ${ship.color[1]}, ${ship.color[2]})`;
          
          fill(ship.color);
          ellipse(ship.size * 0.3 * (i-1), ship.size * 0.3, ship.size * 0.2, ship.size * 0.2);
        }
      }
      
      // Draw ship body
      fill(ship.color[0]/2, ship.color[1]/2, ship.color[2]/2);
      noStroke();
      
      // Draw different ship based on index
      if (ship.size > 30) {
        // Larger ship type
        ellipse(0, 0, ship.size * 1.5, ship.size * 0.6);
        rect(-ship.size * 0.4, -ship.size * 0.3, ship.size * 0.8, ship.size * 0.3);
      } else {
        // Smaller ship type
        triangle(
          ship.size * 0.5, 0,
          -ship.size * 0.5, -ship.size * 0.4,
          -ship.size * 0.5, ship.size * 0.4
        );
      }
      
      pop();
    }
  }
  
  static drawConfetti() {
    noStroke();
    for (let particle of this.confettiParticles) {
      push();
      translate(particle.x, particle.y);
      rotate(particle.rotation);
      fill(particle.color);
      rect(0, 0, particle.size, particle.size);
      pop();
    }
  }
  
  static drawNeonFrame(x, y, width, height) {
    // Outer glow
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 255, 0.5)';
    
    // Draw frame
    noFill();
    stroke(0, 255, 255);
    strokeWeight(3);
    rectMode(CENTER);
    rect(x, y, width, height, 10);
    
    // Inner frame
    stroke(0, 150, 150);
    strokeWeight(1);
    rect(x, y, width - 10, height - 10, 8);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  static drawNeonBox(x, y, width, height) {
    // Glow effect
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'rgba(0, 100, 255, 0.5)';
    
    // Draw box
    fill(20, 20, 50);
    stroke(0, 150, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 5);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  static drawNeonButton(buttonText, x, y, width, height, bgColor = [0, 100, 0], glowColor = [0, 255, 0]) {
    // Glow effect
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0.7)`;
    
    // Draw button
    fill(bgColor);
    stroke(glowColor);
    strokeWeight(3);
    rectMode(CENTER);
    rect(x, y, width, height, 5);
    
    // Button text
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(buttonText, x, y);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  static drawGlowText(displayText, x, y, color) {
    // Text glow
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
    
    // Draw text
    fill(color);
    textAlign(CENTER);
    text(displayText, x, y);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  static drawScanlines() {
    // Draw retro scanlines
    noStroke();
    fill(0, 0, 0, 30);
    for (let y = 0; y < height; y += 4) {
      rect(0, y, width, 2);
    }
    
    // CRT vignette effect
    let gradient = drawingContext.createRadialGradient(
      width/2, height/2, height/3,
      width/2, height/2, height
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    drawingContext.fillStyle = gradient;
    drawingContext.fillRect(0, 0, width, height);
  }
  
  static isResetButtonClicked(mouseX, mouseY) {
    return (
      mouseX > width/2 - 100 &&
      mouseX < width/2 + 100 &&
      mouseY > height/2 + 160 &&
      mouseY < height/2 + 200
    );
  }
} 