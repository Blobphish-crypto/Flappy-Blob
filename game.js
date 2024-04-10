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

let lastSpawnTime = 0; // Variable to store the last spawn time
let spacePressed = false; // Variable to track if Spacebar is pressed
let startTime = Date.now(); // Variable to store the start time of the game
let elapsedTime = 0; // Variable to store the elapsed time

document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
        spacePressed = true; // Set spacePressed to true when Spacebar is pressed
    }
});

document.addEventListener('keyup', function (e) {
    if (e.code === 'Space') {
        spacePressed = false; // Set spacePressed to false when Spacebar is released
    }
});

// Function to draw blob
function drawBlob() {
    ctx.drawImage(blobImg, blob.x, blob.y, blob.width, blob.height);
}

// Function to draw background
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, backgroundWidth, backgroundHeight);
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

// Function to draw timer
function drawTimer() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(elapsedTime), canvas.width - 10, 30);
    
    drawLifeCounter(); // Draw life counter
}

// Function to generate obstacles
function generateObstacles() {
    if (obstacle.obstacles.length === 0 || obstacle.obstacles[obstacle.obstacles.length - 1].x <= canvas.width - obstacle.spacing) {
        const minHeight = obstacle.minHeight * scale;
        const maxHeight = canvas.height - obstacle.minHeight - obstacle.gap * scale;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const y = Math.floor(Math.random() * (obstacle.maxY - obstacle.minY + 1)) + obstacle.minY * scale;

        obstacle.obstacles.push({
            x: canvas.width,
            y: 0,
            height: height
        });

        obstacle.obstacles.push({
            x: canvas.width,
            y: y,
            height: canvas.height - (height + obstacle.gap * scale)
        });
    }
}

// Function to update obstacles
function updateObstacles() {
    obstacle.obstacles.forEach(obs => {
        obs.x -= backgroundSpeed;
    });

    if (obstacle.obstacles.length > 0 && obstacle.obstacles[0].x + obstacle.width < 0) {
        obstacle.obstacles.shift();
        obstacle.obstacles.shift();
    }
}

const backgroundSpeed = 2; // Adjust the speed of scrolling

// Function to generate collectibles
function generateCollectible() {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (currentTime - lastSpawnTime >= collectible.spawnTime) {
        // Spawn a collectible
        collectible.spawnTime = Math.floor(Math.random() * (collectible.maxSpawnTime - collectible.minSpawnTime + 1)) + collectible.minSpawnTime;
        lastSpawnTime = currentTime;
    }
}

// Function to update collectibles
function updateCollectible() {
    generateCollectible();
}

// Define a flag to track collision status
let isColliding = false;
let lastCollisionTime = 0;
const collisionBufferTime = 250; // Buffer time in milliseconds (0.25 seconds)

// Function to check collisions
function checkCollisions() {
    const currentTime = Date.now();

    // Debug: Print last collision time
    console.log('Last Collision Time:', lastCollisionTime);

    // Debug: Print current time
    console.log('Current Time:', currentTime);

    //check if enough time has passed since last collision
    if (!isColliding || (currentTime - lastCollisionTime) >= collisionBufferTime) {
        obstacle.obstacles.forEach(obs => {
            if (
                blob.x < obs.x + obstacle.width &&
                blob.x + blob.width > obs.x &&
                (blob.y < obs.y + obs.height || blob.y + blob.height > obs.y + obs.height + obstacle.gap)
            ) {
                // Set collision flag to true
                isColliding = true;

                // Debug: Print collision detected message
                console.log('Collision Detected');

                // Collision with obstacle
                if (collectible.lives > 0) {
                    collectible.lives--; // Decrease lives by 1 only if it's greater than 1
                }
                if (collectible.lives <= 0) {
                    // Game over
                    gameOver();
                } else {
                    // Reset blob position
                    resetGame();
                }
            }
        });

        // Debug: Print collision check result
        console.log('Collision Check Result:', !isColliding || (currentTime - lastCollisionTime) >= collisionBufferTime);
    }

    const blobCenterX = blob.x + blob.width / 2;
    const blobCenterY = blob.y + blob.height / 2;

    const collectibleCenterX = canvas.width / 2;
    const collectibleCenterY = canvas.height / 2;

    const distance = Math.sqrt((blobCenterX - collectibleCenterX) ** 2 + (blobCenterY - collectibleCenterY) ** 2);
    if (distance < blob.width / 2 + collectible.width / 2) {
        // Collected the collectible
        collectible.lives++;
        lastSpawnTime = Math.floor(Date.now() / 1000); // Reset last spawn time
        collectible.spawnTime = Math.floor(Math.random() * (collectible.maxSpawnTime - collectible.minSpawnTime + 1)) + collectible.minSpawnTime;
    }
}

// Function to reset game
function resetGame() {
    // Set collision flag to false
    isColliding = false;

    blob.y = canvas.height / 2; // Reset blob position
    obstacle.obstacles = []; // Reset obstacle positions
    collectible.spawnTime = 0; // Reset collectible spawn time
}
// Function to update game elements
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawObstacles();
    drawBlob();
    drawCollectible();
    drawTimer();

    generateObstacles();
    updateObstacles();
    updateCollectible();
    checkCollisions();

     // Prevent blob from falling below the bottom edge
    if (blob.y + blob.height > canvas.height) {
        blob.y = canvas.height - blob.height;
        blob.velocity = 0;
    }

    // Prevent blob from moving above the top edge
    if (blob.y < 0) {
        blob.y = 0;
        blob.velocity = 0;
    }

    if (spacePressed && blob.y > 0) {
        // Ascend while Spacebar is pressed and blob is not at the top of the canvas
        blob.velocity = blob.jump;
    } else {
        // Apply gravity to bring the blob back down
        blob.velocity += blob.gravity;
    }

    blob.y += blob.velocity;

    // Calculate elapsed time
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    requestAnimationFrame(update);
}

// Function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Initial call to update function
update();
