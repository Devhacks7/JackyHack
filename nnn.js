const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const characters = "ABCDEFPKQRSTUWXYZ1456789";
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(0); // Y position of drops

function draw() {
    // Create a linear gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#242424'); // Start color
    gradient.addColorStop(1, '#fe3e39'); // End color

    // Set the global alpha for fading effect
    ctx.globalAlpha = 0.07; 
    ctx.fillStyle = gradient; // Use gradient as background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset global alpha for characters
    ctx.globalAlpha = 1; 
    ctx.fillStyle = 'black'; // Green color for characters
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop position after reaching the bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

// Start the animation
animate();