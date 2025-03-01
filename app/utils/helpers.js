// Helper functions
function drawStars() {
  fill(255);
  noStroke();
  for (let star of gameInstance.stars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
} 