const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to match screen resolution
canvas.width = 1920;
canvas.height = 1080;

// Define scale factors for drawing elements
const scale = Math.min(canvas.width / 1920, canvas.height / 1080);

// Load images and set their scaled dimensions
const blobImg = new Image();
blobImg.src = 'blob.jpg'; // Path to your blob image
const blobWidth = 34 * scale;
const blobHeight = 24 * scale;

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Path to your background image
const backgroundWidth = canvas.width;
const backgroundHeight = canvas.height;

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Path to your obstacle image

const collectibleImage = new Image();
collectibleImage.src = 'collectible.png'; // Path to your collectible image

const lifeIconImage = new Image();
lifeIconImage.src = 'life.png'; // Path to your life icon image

// Update blob object dimensions
const blob = {
    x: 50 * scale,
    y: canvas.height / 2,
    width: blobWidth,
    height: blobHeight,
    velocity: 0,
    gravity: 0.5 * scale,
    jump: -10 * scale
};

// Obstacle settings
const obstacle = {
    width: 50 * scale, // Adjust obstacle width
    minHeight: 50 * scale, // Minimum height for obstacles
    gap: 150 * scale, // Gap size for player to pass through
    spacing: 300 * scale, // Spacing between obstacles
    minY: 50 * scale, // Minimum Y position of top obstacle
    maxY: canvas.height - 150 * scale, // Maximum Y position of top obstacle
    obstacles: [] // Array to hold generated obstacles
};

// Collectible settings
const collectible = {
    width: 30 * scale, // Adjust collectible width
    height: 30 * scale, // Adjust collectible height
    minSpawnTime: 120, // Minimum time between collectible spawns (in seconds)
    maxSpawnTime: 240, // Maximum time between collectible spawns (in seconds)
    spawnTime: 0, // Time until next collectible spawn
    lives: 3 // Initial number of lives
};

// Function to draw the background
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Function to draw the blob
function drawBlob() {
    ctx.drawImage(blobImg, blob.x, blob.y, blob.width, blob.height);
}

// Function to draw obstacles
function drawObstacles() {
    obstacle.obstacles.forEach(obs => {
        ctx.drawImage(obstacleImage, obs.x, obs.y, obstacle.width, obs.height);
        ctx.drawImage(obstacleImage, obs.x, obs.y + obs.height + obstacle.gap, obstacle.width, canvas.height - (obs.height + obstacle.gap));
    });
}

// Function to draw collectibles
function drawCollectible() {
    ctx.drawImage(collectibleImage, canvas.width / 2 - collectible.width / 2, canvas.height / 2 - collectible.height / 2, collectible.width, collectible.height);
}

// Function to draw life counter
function drawLifeCounter() {
    ctx.drawImage(lifeIconImage, 10, 10, 30, 30); // Draw life icon
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`x${collectible.lives}`, 50, 35); // Draw life tally
}

// Function to update the game state
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawObstacles();
    drawBlob();
    drawCollectible();
    drawLifeCounter();
    requestAnimationFrame(update);
}

// Start the game loop
update();
