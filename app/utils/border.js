// Border utilities
class BorderUtils {
  static BORDER_SIZE = 20;
  
  // Adjust mouse coordinates to account for border
  static adjustMouseCoords(mouseX, mouseY) {
    return {
      x: mouseX,
      y: mouseY
    };
  }
  
  // Check if a point is within the game area
  static isInGameArea(x, y) {
    return x >= 0 && x <= width && y >= 0 && y <= height;
  }
  
  // Constrain an entity to stay within game boundaries
  static constrainToGame(x, y, size) {
    return {
      x: constrain(x, size/2, width - size/2),
      y: constrain(y, size/2, height - size/2)
    };
  }
}

// Create a global instance to ensure it's available
window.BorderUtils = BorderUtils; 