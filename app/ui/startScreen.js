// Start screen with spaceship color selection
class StartScreen {
  static colorOptions = [
    { name: "Green", color: [0, 255, 0] },
    { name: "Blue", color: [0, 150, 255] },
    { name: "Yellow", color: [255, 255, 0] },
    { name: "Purple", color: [200, 0, 255] },
    { name: "Orange", color: [255, 150, 0] }
  ];
  
  static selectedColorIndex = 0;
  static buttonWidth = 200;
  static buttonHeight = 50;
  static shipY = 0; // For ship animation
  static titleY = 0; // For title animation
  static frameCounter = 0; // For blinking effects
  static stars = []; // For retro star field
  static currentTagline = 0; // Current tagline index
  static taglineTimer = 0; // Timer for tagline rotation
  
  // Engaging taglines to encourage play
  static taglines = [
    "DEFEND EARTH FROM ALIEN INVASION!",
    "CAN YOU BEAT THE HIGH SCORE?",
    "BLAST OFF INTO ADVENTURE!",
    "THE GALAXY NEEDS A HERO!",
    "PREPARE FOR SPACE COMBAT!",
    "SHOW THOSE ALIENS WHO'S BOSS!",
    "BECOME THE ULTIMATE SPACE PILOT!",
    "YOUR MISSION: SAVE HUMANITY!",
    "READY YOUR LASERS, CAPTAIN!",
    "SPACE AWAITS YOUR COMMAND!"
  ];
  
  // Initialize the start screen elements
  static initialize() {
    // Create star field for retro effect
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: random(width),
        y: random(height),
        size: random(1, 3),
        speed: random(1, 3),
        blinkRate: random(0.02, 0.1),
        blinkState: random() > 0.5
      });
    }
    
    // Try to load saved color preference
    const savedColorIndex = localStorage.getItem('playerColorIndex');
    if (savedColorIndex !== null) {
      this.selectedColorIndex = parseInt(savedColorIndex);
    }
    
    // Set initial positions for animations
    this.shipY = height + 100;
    this.titleY = -100;
    
    // Initialize tagline
    this.currentTagline = floor(random(this.taglines.length));
    this.taglineTimer = 0;
  }
  
  static update() {
    // Update frame counter for blinking effects
    this.frameCounter++;
    
    // Animate ship position (move up to final position)
    if (this.shipY > height - 150) {
      this.shipY -= 5;
    }
    
    // Animate title position (move down to final position)
    if (this.titleY < 80) {
      this.titleY += 5;
    }
    
    // Update stars
    for (let star of this.stars) {
      // Move stars
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = random(width);
      }
      
      // Blink stars
      if (random() < star.blinkRate) {
        star.blinkState = !star.blinkState;
      }
    }
    
    // Update tagline
    this.taglineTimer++;
    if (this.taglineTimer > 300) { // Change tagline every 5 seconds
      this.currentTagline = (this.currentTagline + 1) % this.taglines.length;
      this.taglineTimer = 0;
    }
  }
  
  static display() {
    background(0);
    
    // Update animations
    this.update();
    
    // Draw background grid
    stroke(0, 100, 100, 50);
    strokeWeight(1);
    for (let y = 0; y < height; y += 40) {
      line(0, y, width, y);
    }
    for (let x = 0; x < width; x += 40) {
      line(x, 0, x, height);
    }
    
    // Draw stars
    noStroke();
    for (let star of this.stars) {
      if (star.blinkState) {
        fill(255);
        ellipse(star.x, star.y, star.size, star.size);
      }
    }
    
    // Calculate layout based on screen size
    const centerX = width / 2;
    const centerPanelWidth = min(500, width * 0.3);
    const sidePanelWidth = min(300, width * 0.25);
    const panelHeight = min(500, height * 0.7);
    const panelPadding = width * 0.05;
    
    // Calculate panel positions
    const leftPanelX = sidePanelWidth / 2 + panelPadding;
    const rightPanelX = width - sidePanelWidth / 2 - panelPadding;
    const panelY = height / 2 + 50; // Move down to make room for title
    
    // Draw title
    textAlign(CENTER);
    textSize(min(60, width * 0.08));
    
    // Title glow
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 255, 0.8)';
    
    fill(0, 255, 255);
    text("SPACE BATTLE", centerX, this.titleY);
    
    // Subtitle
    textSize(min(24, width * 0.03));
    fill(255, 100, 100);
    text("ARCADE EDITION", centerX, this.titleY + 40);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
    
    // Draw side panels
    this.drawTaglines(leftPanelX, panelY, sidePanelWidth, panelHeight);
    this.drawKeyboardInstructions(rightPanelX, panelY, sidePanelWidth, panelHeight);
    
    // Draw center panel for ship selection
    this.drawCenterPanel(centerX, panelY, centerPanelWidth, panelHeight);
    
    // Draw scanlines effect
    this.drawScanlines();
  }
  
  static drawCenterPanel(x, y, width, height) {
    // Panel background
    fill(0, 0, 50, 150);
    stroke(0, 200, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 10);
    
    // Panel title
    fill(0, 200, 255);
    textSize(min(24, width * 0.12));
    textAlign(CENTER);
    text("SELECT SHIP", x, y - height/2 + 40);
    
    // Draw color options
    const options = this.colorOptions;
    const spacing = min(60, width * 0.8 / options.length);
    const startX = x - (spacing * (options.length - 1)) / 2;
    const colorY = y - height/4;
    
    for (let i = 0; i < options.length; i++) {
      const optionX = startX + i * spacing;
      
      // Draw color circle
      fill(options[i].color);
      stroke(255);
      strokeWeight(i === this.selectedColorIndex ? 4 : 1);
      ellipse(optionX, colorY, 40, 40);
    }
    
    // Draw larger ship preview with pilot
    const shipY = y;
    const shipColor = this.colorOptions[this.selectedColorIndex].color;
    this.drawEnhancedShipPreview(x, shipY, 100, shipColor);
    
    // Calculate button position
    const buttonY = y + height/2 - 60;
    
    // Create blinking effect for the button
    const buttonGlow = sin(frameCount * 0.1) * 50 + 150; // Oscillate between 100 and 200
    const buttonColor = [0, buttonGlow, 0]; // Pulsing green
    
    // Draw start button with pulsing effect
    fill(buttonColor);
    stroke(255);
    strokeWeight(3);
    rectMode(CENTER);
    rect(x, buttonY, this.buttonWidth, this.buttonHeight, 10);
    
    // Add glow effect to button
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = `rgba(0, 255, 0, ${buttonGlow/255})`;
    
    // Draw button text - centered both horizontally and vertically
    fill(255);
    textSize(min(24, width * 0.1));
    textAlign(CENTER, CENTER); // Center both horizontally and vertically
    text("START GAME", x, buttonY);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  static drawEnhancedShipPreview(x, y, size, color) {
    push();
    translate(x, y);
    
    // Landing pad
    fill(100, 100, 100);
    stroke(150, 150, 150);
    strokeWeight(2);
    ellipse(0, size/2 + 10, size * 1.2, 20);
    
    // Draw ship body - larger size
    fill(color);
    stroke(255);
    strokeWeight(2);
    
    // Ship shape
    triangle(
      0, -size/2,
      -size/2, size/2,
      size/2, size/2
    );
    
    // Engine flames with animation
    const flameSize = sin(frameCount * 0.2) * 10 + 20; // Animated flame size
    fill(255, 150, 0, 200);
    noStroke();
    
    // Main flame
    triangle(
      0, size/2,
      -size/4, size/2 + flameSize,
      size/4, size/2 + flameSize
    );
    
    // Secondary flames
    fill(255, 255, 0, 150);
    triangle(
      0, size/2,
      -size/6, size/2 + flameSize * 0.7,
      size/6, size/2 + flameSize * 0.7
    );
    
    // Ship details
    stroke(200);
    strokeWeight(1);
    
    // Cockpit window
    fill(200, 200, 255);
    ellipse(0, -size/6, size/3, size/4);
    
    // Wing details
    line(-size/4, size/4, size/4, size/4);
    
    // Ship lights
    noStroke();
    fill(255, 255, 0, 150 + sin(frameCount * 0.2) * 100);
    ellipse(-size/3, 0, size/10, size/10);
    ellipse(size/3, 0, size/10, size/10);
    
    // Draw pilot character outside the ship
    this.drawPilot(size/2 + 30, size/3, size/4);
    
    pop();
  }
  
  static drawPilot(x, y, size) {
    push();
    translate(x, y);
    
    // Pilot body
    fill(50, 50, 200);
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, size, size * 1.5); // Body
    
    // Helmet
    fill(200, 200, 255, 200);
    stroke(255);
    strokeWeight(1);
    ellipse(0, -size/2, size * 0.8, size * 0.8);
    
    // Face
    fill(255, 220, 180);
    noStroke();
    ellipse(0, -size/2, size * 0.6, size * 0.6);
    
    // Eyes
    fill(0);
    ellipse(-size/6, -size/2, size/10, size/10);
    ellipse(size/6, -size/2, size/10, size/10);
    
    // Smile - animated
    stroke(0);
    strokeWeight(1);
    noFill();
    const smileSize = sin(frameCount * 0.1) * 0.1 + 0.5; // Animate smile
    arc(0, -size/2 + size/10, size/3, size/3 * smileSize, 0, PI);
    
    // Waving arm - animated
    stroke(50, 50, 200);
    strokeWeight(size/10);
    const armAngle = sin(frameCount * 0.1) * 0.3 + 0.3; // Animate arm
    line(0, -size/4, size/2 * cos(-PI/4 - armAngle), -size/4 - size/2 * sin(-PI/4 - armAngle));
    
    // Hand
    fill(255, 220, 180);
    noStroke();
    ellipse(size/2 * cos(-PI/4 - armAngle), -size/4 - size/2 * sin(-PI/4 - armAngle), size/5, size/5);
    
    pop();
  }
  
  static drawKeyboardInstructions(x, y, width, height) {
    // Panel background
    fill(0, 0, 50, 150);
    stroke(255, 150, 0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 10);
    
    // Panel title
    fill(255, 150, 0);
    textSize(min(24, width * 0.12));
    textAlign(CENTER);
    text("CONTROLS", x, y - height/2 + 40);
    
    // Calculate key size based on available space
    const keySize = min(40, width * 0.15);
    const keyTextSize = min(16, width * 0.07);
    
    // Movement section - title first, then keys directly below
    fill(255);
    textSize(min(20, width * 0.09));
    const movementTitleY = y - height/4;
    text("MOVEMENT", x, movementTitleY);
    
    // Draw arrow keys in proper layout directly below the title
    const arrowY = movementTitleY + 50; // Position keys below the title
    const arrowSpacing = keySize * 1.2;
    
    // Up arrow
    this.drawKey("↑", x, arrowY, keySize);
    
    // Left, Down, Right arrows in a row
    this.drawKey("←", x - arrowSpacing, arrowY + arrowSpacing, keySize);
    this.drawKey("↓", x, arrowY + arrowSpacing, keySize);
    this.drawKey("→", x + arrowSpacing, arrowY + arrowSpacing, keySize);
    
    // Action controls section
    fill(255);
    textSize(min(20, width * 0.09));
    text("ACTION", x, y + height/6);
    
    // Space bar - centered and larger
    this.drawKey("SPACE", x, y + height/6 + 50, keySize * 3, keySize, "FIRE");
    
    // Tips at bottom
    fill(200, 200, 100);
    textSize(min(14, width * 0.06));
    text("TIP: AVOID ENEMY SHIPS!", x, y + height/2 - 40);
  }
  
  static drawKey(label, x, y, width, height = width, sublabel = null) {
    // Key background
    fill(50);
    stroke(200);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 5);
    
    // Key label
    fill(255);
    noStroke();
    textSize(min(16, width * 0.5));
    textAlign(CENTER, CENTER);
    text(label, x, y);
    
    // Optional sublabel below key
    if (sublabel) {
      textSize(min(14, width * 0.3));
      text(sublabel, x, y + height/2 + 15);
    }
  }
  
  static drawTaglines(x, y, width, height) {
    // Panel background
    fill(0, 0, 50, 150);
    stroke(0, 255, 0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 10);
    
    // Panel title
    fill(0, 255, 0);
    textSize(min(24, width * 0.12));
    textAlign(CENTER);
    text("MISSION", x, y - height/2 + 40);
    
    // Draw current tagline with animation
    const fadeEffect = sin(frameCount * 0.05) * 50 + 200;
    fill(255, 255, 0, fadeEffect);
    textSize(min(18, width * 0.08));
    textAlign(CENTER);
    
    // Word wrap the tagline
    const tagline = this.taglines[this.currentTagline];
    const words = tagline.split(' ');
    let line = '';
    let lineY = y - height/4;
    const maxLineWidth = width - 40;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = textWidth(testLine);
      
      if (testWidth > maxLineWidth) {
        text(line, x, lineY);
        line = words[i] + ' ';
        lineY += 30;
      } else {
        line = testLine;
      }
    }
    text(line, x, lineY);
    
    // Draw animated UFO
    this.drawAnimatedUFO(x, y + 20, width * 0.4);
    
    // Draw enemy preview
    const enemySize = min(30, width * 0.12);
    this.drawEnemyPreview(x - width/4, y + height/4, enemySize);
    this.drawEnemyPreview(x + width/4, y + height/4, enemySize);
    
    // Draw mission status
    fill(255);
    textSize(min(16, width * 0.08));
    text("EARTH DEFENSE:", x, y + height/2 - 60);
    
    // Draw blinking critical status
    if (frameCount % 60 < 30) {
      fill(255, 0, 0);
    } else {
      fill(200, 0, 0);
    }
    textSize(min(20, width * 0.1));
    text("CRITICAL", x, y + height/2 - 30);
  }
  
  static drawAnimatedUFO(x, y, size) {
    push();
    translate(x, y);
    
    // UFO body
    fill(100, 100, 150);
    ellipse(0, 0, size, size * 0.4);
    
    // UFO dome
    fill(150, 200, 255, 150 + sin(frameCount * 0.1) * 100);
    ellipse(0, -size * 0.2, size * 0.5, size * 0.4);
    
    // UFO lights
    for (let i = 0; i < 3; i++) {
      const lightOn = sin(frameCount * 0.1 + i) > 0;
      if (lightOn) {
        fill(255, 255, 0);
      } else {
        fill(100, 100, 0);
      }
      ellipse(-size * 0.25 + i * size * 0.25, 0, size * 0.12, size * 0.06);
    }
    
    // Light beam (occasional)
    if (sin(frameCount * 0.02) > 0.7) {
      fill(200, 200, 255, 100);
      triangle(-size * 0.25, size * 0.06, size * 0.25, size * 0.06, 0, size * 0.5);
    }
    
    pop();
  }
  
  static drawEnemyPreview(x, y, size) {
    push();
    translate(x, y);
    
    // Enemy ship
    fill(255, 0, 0);
    triangle(
      0, -size/2,
      -size/2, size/2,
      size/2, size/2
    );
    
    // Enemy details
    fill(200);
    rect(0, 0, size/5, size/3);
    fill(255, 255, 0);
    ellipse(0, -size/5, size/5, size/5);
    
    pop();
  }
  
  static drawScanlines() {
    // Draw retro scanlines
    noStroke();
    fill(0, 0, 0, 50);
    for (let y = 0; y < height; y += 4) {
      rect(0, y, width, 2);
    }
    
    // CRT vignette effect
    drawingContext.shadowBlur = 0;
    let gradient = drawingContext.createRadialGradient(
      width/2, height/2, height/3,
      width/2, height/2, height
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    drawingContext.fillStyle = gradient;
    drawingContext.fillRect(0, 0, width, height);
  }
  
  static handleMouseClick(mouseX, mouseY) {
    // Calculate layout based on screen size
    const centerX = width / 2;
    const centerPanelWidth = min(500, width * 0.3);
    const panelHeight = min(500, height * 0.7);
    const panelY = height / 2 + 50;
    
    // Check if a color option was clicked
    const options = this.colorOptions;
    const spacing = min(60, centerPanelWidth * 0.8 / options.length);
    const startX = centerX - (spacing * (options.length - 1)) / 2;
    const colorY = panelY - panelHeight/4;
    
    for (let i = 0; i < options.length; i++) {
      const optionX = startX + i * spacing;
      
      if (dist(mouseX, mouseY, optionX, colorY) < 20) {
        this.selectedColorIndex = i;
        // Save color preference to localStorage
        localStorage.setItem('playerColorIndex', i.toString());
        return true;
      }
    }
    
    // Check if start button was clicked
    const buttonY = panelY + panelHeight/2 - 60;
    if (
      mouseX > centerX - this.buttonWidth/2 &&
      mouseX < centerX + this.buttonWidth/2 &&
      mouseY > buttonY - this.buttonHeight/2 &&
      mouseY < buttonY + this.buttonHeight/2
    ) {
      // Start the game with selected color
      gameInstance.playerColor = this.colorOptions[this.selectedColorIndex].color;
      gameInstance.gameStarted = true;
      return true;
    }
    
    return false;
  }
}