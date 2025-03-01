// Planet system
class PlanetSystem {
  static createPlanets() {
    gameInstance.planets = [
      // Mercury - small gray planet
      {
        x: width * 0.2,
        y: height * 0.2,
        size: 15,
        orbitRadius: 100,
        orbitSpeed: 0.01,
        orbitAngle: random(TWO_PI),
        color: color(180, 180, 180)
      },
      // Venus - yellowish planet
      {
        x: width * 0.5,
        y: height * 0.15,
        size: 25,
        orbitRadius: 150,
        orbitSpeed: 0.007,
        orbitAngle: random(TWO_PI),
        color: color(255, 198, 73)
      },
      // Earth - blue planet
      {
        x: width * 0.8,
        y: height * 0.25,
        size: 30,
        orbitRadius: 200,
        orbitSpeed: 0.005,
        orbitAngle: random(TWO_PI),
        color: color(70, 130, 230)
      },
      // Mars - red planet
      {
        x: width * 0.3,
        y: height * 0.7,
        size: 20,
        orbitRadius: 180,
        orbitSpeed: 0.004,
        orbitAngle: random(TWO_PI),
        color: color(210, 80, 60)
      },
      // Jupiter - large orange planet
      {
        x: width * 0.7,
        y: height * 0.6,
        size: 50,
        orbitRadius: 250,
        orbitSpeed: 0.002,
        orbitAngle: random(TWO_PI),
        color: color(255, 160, 60)
      },
      // Saturn - yellowish with rings
      {
        x: width * 0.2,
        y: height * 0.5,
        size: 45,
        orbitRadius: 220,
        orbitSpeed: 0.0015,
        orbitAngle: random(TWO_PI),
        color: color(240, 220, 150),
        hasRings: true
      }
    ];
  }

  static update() {
    for (let planet of gameInstance.planets) {
      planet.orbitAngle += planet.orbitSpeed;
    }
  }

  static display() {
    for (let planet of gameInstance.planets) {
      let orbitX = planet.x + cos(planet.orbitAngle) * planet.orbitRadius;
      let orbitY = planet.y + sin(planet.orbitAngle) * planet.orbitRadius;
      
      // Draw orbit path (faintly)
      noFill();
      stroke(50);
      ellipse(planet.x, planet.y, planet.orbitRadius * 2);
      
      // Draw planet
      noStroke();
      fill(planet.color);
      ellipse(orbitX, orbitY, planet.size);
      
      // Draw rings for Saturn
      if (planet.hasRings) {
        push();
        translate(orbitX, orbitY);
        rotate(PI/4);
        noFill();
        stroke(planet.color);
        ellipse(0, 0, planet.size * 2, planet.size / 2);
        pop();
      }
    }
  }
} 