const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let shootingStars = [];
let planets = [];
let sun;
let asteroids = [];
let lastTime = 0;  // For controlling the frame rate
let frameDelay = 1000 / 30;  // Delay to slow down the animation (e.g., 30 FPS)

// Background Star class for creating stars in the sky
class BackgroundStar {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }

    update() {
        this.x -= this.speed; // Stars drift slowly from right to left
        if (this.x < 0) this.x = canvas.width; // Reappear on the right side
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 10;  // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow
    }
}

// Shooting Star class
class ShootingStar {
    constructor() {
        this.x = Math.random() * canvas.width; // Random starting X
        this.y = Math.random() * (canvas.height / 2); // Random starting Y (Top half of canvas)
        this.size = Math.random() * 3 + 2; // Random size
        this.speedX = Math.random() * 3 + 1; // Random horizontal speed
        this.speedY = Math.random() * 2 + 1; // Random vertical speed
        this.lifeSpan = Math.random() * 50 + 50; // Lifetime of the star
        this.tail = []; // Tail of the shooting star
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Create a tail effect by pushing previous positions into the tail array
        this.tail.push({ x: this.x, y: this.y });

        // Limit the length of the tail
        if (this.tail.length > 10) {
            this.tail.shift();
        }

        this.lifeSpan--;
    }

    draw() {
        // Draw the shooting star's tail (fading as it moves)
        for (let i = 0; i < this.tail.length; i++) {
            let alpha = (i + 1) / this.tail.length;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.tail[i].x, this.tail[i].y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw the actual shooting star at the end of the trail
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 15;  // Glow effect for the shooting star
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow
    }

    isDead() {
        return this.lifeSpan <= 0 || this.x > canvas.width; // Dead if out of bounds
    }
}

// Sun class (center of the solar system)
class Sun {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 30;  // Glow effect for the Sun
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow
    }
}

// Planet class (planets orbiting the Sun)
class Planet {
    constructor(name, distance, radius, color, speed) {
        this.name = name;
        this.distance = distance;  // Distance from the Sun
        this.radius = radius;  // Radius of the planet
        this.color = color;  // Color of the planet
        this.speed = speed;  // Speed of the orbit (lower is slower)
        this.angle = Math.random() * Math.PI * 2;  // Starting angle of the orbit

        this.moons = [];  // Array to hold moons if the planet has any
    }

    addMoon(moon) {
        this.moons.push(moon);  // Add moon to planet
    }

    update() {
        this.angle += this.speed;  // Update the angle for orbital movement

        // Orbiting the Sun
        this.x = sun.x + this.distance * Math.cos(this.angle);
        this.y = sun.y + this.distance * Math.sin(this.angle);
        
        // Update moons' positions
        for (let moon of this.moons) {
            moon.update(this.x, this.y);
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;  // Glow effect for planets
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow

        // Draw moons
        for (let moon of this.moons) {
            moon.draw();
        }
    }
}

// Moon class (moons orbiting planets)
class Moon {
    constructor(distance, radius, color, speed) {
        this.distance = distance;  // Distance from the planet
        this.radius = radius;  // Radius of the moon
        this.color = color;  // Color of the moon
        this.speed = speed;  // Speed of the orbit
        this.angle = Math.random() * Math.PI * 2;  // Starting angle of the orbit
    }

    update(planetX, planetY) {
        this.angle += this.speed;  // Update the angle for orbital movement

        // Orbiting the planet
        this.x = planetX + this.distance * Math.cos(this.angle);
        this.y = planetY + this.distance * Math.sin(this.angle);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;  // Glow effect for moons
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow
    }
}

// Asteroid class (asteroids drifting in space)
class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;  // Random starting X
        this.y = Math.random() * canvas.height; // Random starting Y
        this.size = Math.random() * 5 + 2; // Random size
        this.speedX = Math.random() * 1 + 0.5; // Horizontal speed
        this.speedY = Math.random() * 1 + 0.5; // Vertical speed
    }

    update() {
        this.x -= this.speedX;
        this.y -= this.speedY;

        // Reappear on the other side if out of bounds
        if (this.x < 0) this.x = canvas.width;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = 'gray';
        ctx.shadowColor = 'gray';
        ctx.shadowBlur = 5;  // Glow effect for asteroids
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;  // Reset glow
    }
}

// Initialize solar system objects
function initializeSolarSystem() {
    sun = new Sun(canvas.width / 2, canvas.height / 2, 50);  // Sun at the center of the canvas

    // Create planets with moons
    let earth = new Planet('Earth', 200, 20, 'blue', 0.005); // Earth orbiting at distance 200
    let moon = new Moon(40, 5, 'gray', 0.02); // Moon orbiting Earth at distance 40
    earth.addMoon(moon);

    let jupiter = new Planet('Jupiter', 350, 40, 'orange', 0.002);
    let europa = new Moon(60, 8, 'lightgray', 0.03); // Europa moon orbiting Jupiter
    jupiter.addMoon(europa);

    let mars = new Planet('Mars', 150, 15, 'red', 0.008); // Mars orbiting closer to the Sun

    planets.push(earth, jupiter, mars);  // Add planets to the solar system
}

// Initialize background stars
function createStars() {
    for (let i = 0; i < 50; i++) {
        let star = new BackgroundStar(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2 + 1, // Random size
            Math.random() * 0.1 + 0.05 // Random speed
        );
        stars.push(star);
    }
}

// Create asteroids
function createAsteroids() {
    for (let i = 0; i < 20; i++) {
        let asteroid = new Asteroid();
        asteroids.push(asteroid);
    }
}

// Main animation loop
function animate(timestamp) {
    if (timestamp - lastTime < frameDelay) {
        requestAnimationFrame(animate);
        return;
    }
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Update background stars
    for (let star of stars) {
        star.update();
        star.draw();
    }

    // Draw the Sun
    sun.draw();

    // Update and draw planets and moons
    for (let planet of planets) {
        planet.update();
        planet.draw();
    }

    // Update and draw shooting stars
    if (Math.random() < 0.05) { // Random chance to spawn a new shooting star
        shootingStars.push(new ShootingStar());
    }

    // Update and draw each shooting star
    shootingStars = shootingStars.filter(star => !star.isDead()); // Remove dead stars
    for (let star of shootingStars) {
        star.update();
        star.draw();
    }

    // Update and draw asteroids
    for (let asteroid of asteroids) {
        asteroid.update();
        asteroid.draw();
    }

    // Call the next frame of animation
    requestAnimationFrame(animate);
}

// Initialize the scene
initializeSolarSystem();
createStars();
createAsteroids();
animate(0);
