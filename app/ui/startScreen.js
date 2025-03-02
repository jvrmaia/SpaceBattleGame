// Start screen with spaceship color selection
class StartScreen {
  // Configuration
  static colorOptions = [
    { name: "Green", color: [0, 255, 0] },
    { name: "Blue", color: [0, 150, 255] },
    { name: "Yellow", color: [255, 255, 0] },
    { name: "Purple", color: [200, 0, 255] },
    { name: "Orange", color: [255, 150, 0] }
  ];
  
  static selectedColorIndex = 0;
  static buttonWidth = 250;
  static buttonHeight = 60;
  
  /**
   * Initialize the start screen elements
   */
  static initialize() {
    // Try to load saved color preference
    const savedColorIndex = localStorage.getItem('playerColorIndex');
    if (savedColorIndex !== null) {
      this.selectedColorIndex = parseInt(savedColorIndex);
    }
    console.log("StartScreen initialized with color index:", this.selectedColorIndex);
  }
  
  /**
   * Main display method - renders the entire start screen
   */
  static display() {
    this.drawBackground();
    this.drawNeonTitle();
    this.drawPanels();
  }
  
  /**
   * Draw animated starfield background
   */
  static drawBackground() {
    background(0);
    
    // Draw animated stars in background
    for (let i = 0; i < 100; i++) {
      const starY = (height + (frameCount * (i % 5 + 1) / 10) % height);
      const brightness = map(sin(frameCount * 0.01 + i), -1, 1, 150, 255);
      fill(255, brightness);
      noStroke();
      ellipse(width * (i / 100), starY, random(1, 3), random(1, 3));
    }
  }
  
  /**
   * Draw the game title with enhanced neon effect and animation
   */
  static drawNeonTitle() {
    push();
    
    // Calculate animation values
    const pulseRate = 0.05;
    const flickerRate = 0.2;
    const baseGlow = 15;
    const maxGlow = 25;
    
    // Pulse effect (smooth sine wave)
    const pulse = sin(frameCount * pulseRate) * 0.5 + 0.5;
    
    // Random flicker effect (occasional dimming)
    const flicker = random() > 0.95 ? random(0.7, 0.9) : 1;
    
    // Calculate current glow amount
    const glowAmount = baseGlow + pulse * (maxGlow - baseGlow);
    
    // Calculate color values with animation
    const r = 50 + 205 * pulse * flicker;
    const g = 150 + 105 * pulse * flicker;
    const b = 255 * pulse * flicker;
    
    // Draw multiple layers for the neon effect
    
    // Outer glow (largest)
    drawingContext.shadowBlur = glowAmount * 2;
    drawingContext.shadowColor = `rgba(0, 100, 255, ${0.3 * flicker})`;
    fill(0, 0, 0, 0); // Transparent fill
    stroke(0, 100, 255, 50 * flicker);
    strokeWeight(12);
    textSize(72);
    textAlign(CENTER);
    textFont('Arial Black');
    text("SPACE BATTLE GAME", width/2, height * 0.15);
    
    // Middle glow
    drawingContext.shadowBlur = glowAmount * 1.5;
    drawingContext.shadowColor = `rgba(50, 150, 255, ${0.5 * flicker})`;
    stroke(50, 150, 255, 100 * flicker);
    strokeWeight(8);
    text("SPACE BATTLE GAME", width/2, height * 0.15);
    
    // Inner glow
    drawingContext.shadowBlur = glowAmount;
    drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.8 * flicker})`;
    stroke(r, g, b, 200 * flicker);
    strokeWeight(4);
    text("SPACE BATTLE GAME", width/2, height * 0.15);
    
    // Core text
    fill(255, 255, 255, 255 * flicker);
    stroke(r, g, b, 255 * flicker);
    strokeWeight(2);
    text("SPACE BATTLE GAME", width/2, height * 0.15);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
    
    pop();
  }
  
  /**
   * Draw all three main panels
   */
  static drawPanels() {
    // Calculate panel positions with proper spacing
    const panelWidth = 350; // Reduced from 400
    const panelHeight = 400;
    const spacing = 50; // Space between panels
    
    // Calculate total width needed for all three panels
    const totalWidth = panelWidth * 3 + spacing * 2;
    
    // Calculate starting X position to center all panels
    const startX = (width - totalWidth) / 2 + panelWidth / 2;
    
    // Draw each panel at its calculated position
    this.drawHighScoresPanel(startX, height/2, panelWidth, panelHeight);
    this.drawMainPanel(startX + panelWidth + spacing, height/2, panelWidth, panelHeight);
    this.drawControlsPanel(startX + (panelWidth + spacing) * 2, height/2, panelWidth, panelHeight);
  }
  
  /**
   * Draw the high scores panel
   */
  static drawHighScoresPanel(x, y, width, height) {
    // Panel background
    this.drawPanelBackground(x, y, width, height);
    
    // High scores title
    fill(0, 255, 0);
    textSize(30);
    textFont('Courier New');
    textAlign(CENTER);
    text("HIGH SCORES", x, y - 150);
    
    // Column headers
    fill(0, 255, 0);
    textSize(20);
    textAlign(LEFT);
    text("RANK", x - 120, y - 110);
    text("NAME", x - 60, y - 110);
    text("SCORE", x + 60, y - 110);
    
    // High scores
    fill(0, 150, 255);
    textSize(20);
    
    // Get high scores from game
    const scores = game.highScores.length > 0 ? game.highScores : [
      { name: "joao", score: 6600 },
      { name: "joao", score: 2300 },
      { name: "joao", score: 230 },
      { name: "joao", score: 100 },
      { name: "joao", score: 10 }
    ];
    
    for (let i = 0; i < 5; i++) {
      const score = i < scores.length ? scores[i] : { name: "---", score: 0 };
      textAlign(LEFT);
      text(i + 1, x - 120, y - 70 + i * 40);
      text(score.name, x - 60, y - 70 + i * 40);
      textAlign(RIGHT);
      text(score.score.toString().padStart(6, '0'), x + 120, y - 70 + i * 40);
    }
    
    // Insert coin text with blinking effect
    if (frameCount % 60 < 30) {
      fill(0, 255, 0);
      textSize(24);
      textAlign(CENTER);
      text("INSERT COIN", x, y + 150);
    }
  }
  
  /**
   * Draw the main center panel with ship selection and start button
   */
  static drawMainPanel(x, y, width, height) {
    // Draw panel background
    this.drawPanelBackground(x, y, width, height);
    
    // Draw panel title at the top
    this.drawPanelTitle(x, y - 140, "SELECT SHIP COLOR");
    
    // Draw ship preview closer to the title
    const shipColor = this.colorOptions[this.selectedColorIndex].color;
    this.drawShipPreview(x, y - 60, shipColor);
    
    // Draw color selection options closer to the ship
    this.drawColorOptions(x, y + 40);
    
    // Draw start button closer to the color options
    this.drawStartButton(x, y + 120);
    
    // Draw "PRESS ENTER TO START" text below the button but inside the box
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text("PRESS ENTER TO START", x, y + 170);
  }
  
  /**
   * Draw the controls panel
   */
  static drawControlsPanel(x, y, width, height) {
    // Draw panel background
    this.drawPanelBackground(x, y, width, height);
    
    // Draw panel title
    this.drawPanelTitle(x, y - 140, "CONTROLS");
    
    // Calculate spacing for controls sections
    const sectionSpacing = 70;
    const startY = y - 80;
    
    // Draw movement controls
    this.drawMovementControls(x, startY);
    
    // Draw fire controls
    this.drawFireControls(x, startY + sectionSpacing);
    
    // Draw restart controls
    this.drawRestartControls(x, startY + sectionSpacing * 2);
    
    // Draw menu controls
    this.drawMenuControls(x, startY + sectionSpacing * 3);
  }
  
  /**
   * Draw a panel background with border
   */
  static drawPanelBackground(x, y, width, height) {
    fill(0, 0, 50);
    stroke(0, 200, 255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(x, y, width, height, 10);
  }
  
  /**
   * Draw a panel title
   */
  static drawPanelTitle(x, y, title) {
    fill(0, 255, 0);
    textSize(30);
    textFont('Courier New');
    textAlign(CENTER);
    text(title, x, y);
  }
  
  /**
   * Draw ship preview with animated engine flames
   */
  static drawShipPreview(x, y, shipColor) {
    push();
    translate(x, y);
    
    // Draw ship body
    fill(shipColor);
    stroke(255);
    strokeWeight(2);
    triangle(0, -30, 30, 30, -30, 30);
    
    // Draw cockpit
    fill(255);
    noStroke();
    ellipse(0, 0, 15, 15);
    
    // Draw animated engine flames
    this.drawEngineFlames(0, 30);
    
    pop();
  }
  
  /**
   * Draw animated engine flames
   */
  static drawEngineFlames(x, y) {
    // Flame animation based on frame count
    const flameSize = map(sin(frameCount * 0.2), -1, 1, 0.7, 1.3);
    
    // Main flame
    fill(255, 100, 0, 200);
    noStroke();
    triangle(x, y, x + 20 * flameSize, y + 30 * flameSize, x - 20 * flameSize, y + 30 * flameSize);
    
    // Inner flame
    fill(255, 200, 0, 200);
    triangle(x, y + 5, x + 10 * flameSize, y + 20 * flameSize, x - 10 * flameSize, y + 20 * flameSize);
  }
  
  /**
   * Draw color selection options
   */
  static drawColorOptions(x, y) {
    const options = this.colorOptions;
    const spacing = 60;
    const startX = x - (spacing * (options.length - 1)) / 2;
    
    for (let i = 0; i < options.length; i++) {
      const optionX = startX + i * spacing;
      const color = options[i].color;
      
      // Draw color circle
      fill(color);
      stroke(255);
      strokeWeight(i === this.selectedColorIndex ? 4 : 1);
      ellipse(optionX, y, 40, 40);
    }
  }
  
  /**
   * Draw start button with glow effect
   */
  static drawStartButton(x, y) {
    // Button glow effect
    const glowIntensity = map(sin(frameCount * 0.1), -1, 1, 10, 20);
    
    // Draw button with glow
    drawingContext.shadowBlur = glowIntensity;
    drawingContext.shadowColor = 'rgba(0, 255, 0, 0.8)';
    
    // Button background
    fill(0, 200, 0);
    stroke(0, 255, 0);
    strokeWeight(3);
    rectMode(CENTER);
    rect(x, y, this.buttonWidth, this.buttonHeight, 10);
    
    // Button text
    fill(255);
    textSize(30);
    textFont('Arial Black');
    textAlign(CENTER, CENTER);
    text("START GAME", x, y);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
  
  /**
   * Draw movement controls section
   */
  static drawMovementControls(x, y) {
    // Movement section title
    fill(0, 255, 255);
    textSize(24);
    textAlign(CENTER);
    text("MOVEMENT", x, y);
    
    // Arrow keys
    const keySize = 40;
    const keyY = y + 40;
    
    // Up arrow
    fill(50);
    stroke(200);
    strokeWeight(1);
    rect(x, keyY, keySize, keySize, 5);
    
    // Arrow keys row
    const keysRowY = keyY + keySize;
    
    // Left arrow
    rect(x - keySize, keysRowY, keySize, keySize, 5);
    
    // Down arrow
    rect(x, keysRowY, keySize, keySize, 5);
    
    // Right arrow
    rect(x + keySize, keysRowY, keySize, keySize, 5);
    
    // Arrow symbols
    fill(0, 255, 0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("↑", x, keyY);
    text("←", x - keySize, keysRowY);
    text("↓", x, keysRowY);
    text("→", x + keySize, keysRowY);
  }
  
  /**
   * Draw fire controls section
   */
  static drawFireControls(x, y) {
    // Fire section title
    fill(0, 255, 255);
    textSize(24);
    textAlign(CENTER);
    text("FIRE", x, y);
    
    // Space bar
    const keySize = 40;
    fill(50);
    stroke(200);
    rect(x, y + 30, keySize * 3, keySize, 5);
    
    // Space bar text
    fill(0, 255, 0);
    textSize(18);
    text("SPACE", x, y + 30);
  }
  
  /**
   * Draw restart controls section
   */
  static drawRestartControls(x, y) {
    // Restart section title
    fill(0, 255, 255);
    textSize(24);
    textAlign(CENTER);
    text("RESTART", x, y);
    
    // R key
    const keySize = 40;
    fill(50);
    stroke(200);
    rect(x, y + 30, keySize, keySize, 5);
    
    // R key text
    fill(0, 255, 0);
    textSize(18);
    text("R", x, y + 30);
  }
  
  /**
   * Draw menu controls section
   */
  static drawMenuControls(x, y) {
    // Menu section title
    fill(0, 255, 255);
    textSize(24);
    textAlign(CENTER);
    text("MENU", x, y);
    
    // ESC key
    const keySize = 40;
    fill(50);
    stroke(200);
    rect(x, y + 30, keySize * 1.5, keySize, 5);
    
    // ESC text
    fill(0, 255, 0);
    textSize(18);
    text("ESC", x, y + 30);
  }
  
  /**
   * Handle mouse clicks on the start screen
   */
  static handleMouseClick(mouseX, mouseY) {
    console.log("Mouse clicked at:", mouseX, mouseY);
    
    if (this.handleColorSelection(mouseX, mouseY)) {
      return true;
    }
    
    if (this.handleStartButtonClick(mouseX, mouseY)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle color selection clicks
   */
  static handleColorSelection(mouseX, mouseY) {
    // Calculate panel positions with proper spacing
    const panelWidth = 350;
    const spacing = 50;
    const totalWidth = panelWidth * 3 + spacing * 2;
    const startX = (width - totalWidth) / 2 + panelWidth / 2;
    const centerX = startX + panelWidth + spacing;
    
    // Check if a color option was clicked
    const options = this.colorOptions;
    const optionSpacing = 60;
    const colorY = height/2 + 40; // Updated Y position
    const optionStartX = centerX - (optionSpacing * (options.length - 1)) / 2;
    
    for (let i = 0; i < options.length; i++) {
      const optionX = optionStartX + i * optionSpacing;
      const distance = dist(mouseX, mouseY, optionX, colorY);
      
      console.log(`Color option ${i} (${options[i].name}) at (${optionX}, ${colorY}), distance: ${distance}`);
      
      if (distance < 25) { // Reduced hit area to match smaller circles
        console.log(`Selected color ${i}: ${options[i].name}`);
        this.selectedColorIndex = i;
        // Save color preference to localStorage
        localStorage.setItem('playerColorIndex', i.toString());
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Handle start button clicks
   */
  static handleStartButtonClick(mouseX, mouseY) {
    // Calculate panel positions with proper spacing
    const panelWidth = 350;
    const spacing = 50;
    const totalWidth = panelWidth * 3 + spacing * 2;
    const startX = (width - totalWidth) / 2 + panelWidth / 2;
    const centerX = startX + panelWidth + spacing;
    
    // Check if start button was clicked
    const buttonY = height/2 + 120; // Updated Y position
    const buttonLeft = centerX - this.buttonWidth/2;
    const buttonRight = centerX + this.buttonWidth/2;
    const buttonTop = buttonY - this.buttonHeight/2;
    const buttonBottom = buttonY + this.buttonHeight/2;
    
    console.log("Start button bounds:", buttonLeft, buttonRight, buttonTop, buttonBottom);
    
    if (
      mouseX > buttonLeft &&
      mouseX < buttonRight &&
      mouseY > buttonTop &&
      mouseY < buttonBottom
    ) {
      console.log("Start button clicked!");
      // Start the game with selected color
      game.playerColor = [...this.colorOptions[this.selectedColorIndex].color];
      game.init();
      game.gameStarted = true;
      return true;
    }
    
    return false;
  }
}