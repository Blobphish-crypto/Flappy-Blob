const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const blobImg = new Image();
blobImg.src = 'blob.jpg'; // Path to your blob image

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Path to your background image

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Path to your obstacle image

const collectibleImage = new Image();
collectibleImage.src = 'collectible.png'; // Path to your collectible image

const lifeIconImage = new Image();
lifeIconImage.src = 'life_icon.png'; // Path to your life icon image

const backgroundSpeed = 1; // Adjust the speed of scrolling
const obstacleSpeed = backgroundSpeed; // Obstacles scroll at the same speed as the background

const blob = {
    x: 50,
    y: canvas.height / 2,
    width: 34, // Adjust according to your blob image
    height: 24, // Adjust according to your blob image
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

const obstacle = {
    width: 50, // Adjust obstacle width
    minHeight: 50, // Minimum height for obstacles
    gap: 150, // Gap size for player to pass through
    spacing: 300, // Spacing between obstacles
    minY: 50, // Minimum Y position of top obstacle
    maxY: canvas.height - 150, // Maximum Y position of top obstacle
    obstacles: [] // Array to hold generated obstacles
};

const collectible = {
    width: 30, // Adjust collectible width
    height: 30, // Adjust collectible height
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
function drawBlob() {
    ctx.drawImage(blobImg, blob.x, blob.y, blob.width, blob.height);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawObstacles() {
    obstacle.obstacles.forEach(obs => {
        ctx.drawImage(obstacleImage, obs.x, obs.y, obstacle.width, obs.height);
        ctx.drawImage(obstacleImage, obs.x, obs.y + obs.height + obstacle.gap, obstacle.width, canvas.height - (obs.height + obstacle.gap));
    });
}

function drawCollectible() {
    ctx.drawImage(collectibleImage, canvas.width / 2 - collectible.width / 2, canvas.height / 2 - collectible.height / 2, collectible.width, collectible.height);
}

function drawLifeCounter() {
    ctx.drawImage(lifeIconImage, 10, 10, 30, 30); // Draw life icon
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`x${collectible.lives}`, 50, 35); // Draw life tally
}

function drawTimer() {
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(formatTime(elapsedTime), canvas.width - 10, 30);
    
    drawLifeCounter(); // Draw life counter
}

function generateObstacles() {
    if (obstacle.obstacles.length === 0 || obstacle.obstacles[obstacle.obstacles.length - 1].x <= canvas.width - obstacle.spacing) {
        const minHeight = obstacle.minHeight;
        const maxHeight = canvas.height - obstacle.minHeight - obstacle.gap;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const y = Math.floor(Math.random() * (obstacle.maxY - obstacle.minY + 1)) + obstacle.minY;

        obstacle.obstacles.push({
            x: canvas.width,
            y: 0,
            height: height
        });

        obstacle.obstacles.push({
            x: canvas.width,
            y: y,
            height: canvas.height - (height + obstacle.gap)
        });
    }
}

function generateCollectible() {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (currentTime - lastSpawnTime >= collectible.spawnTime) {
        // Spawn a collectible
        collectible.spawnTime = Math.floor(Math.random() * (collectible.maxSpawnTime - collectible.minSpawnTime + 1)) + collectible.minSpawnTime;
        lastSpawnTime = currentTime;
    }
}

function updateObstacles() {
    obstacle.obstacles.forEach(obs => {
        obs.x -= obstacleSpeed;
    });

    if (obstacle.obstacles.length > 0 && obstacle.obstacles[0].x + obstacle.width < 0) {
        obstacle.obstacles.shift();
        obstacle.obstacles.shift();
    }
}

function updateCollectible() {
    generateCollectible();
}

function checkCollisions() {
    obstacle.obstacles.forEach(obs => {
        if (
            blob.x < obs.x + obstacle.width &&
            blob.x + blob.width > obs.x &&
            (blob.y < obs.y + obs.height || blob.y + blob.height > obs.y + obs.height + obstacle.gap)
        ) {
            // Collision with obstacle
            collectible.lives--;
            if (collectible.lives <= 0) {
                // Game over
                gameOver();
            } else {
                // Reset blob position
                blob.y = canvas.height / 2;
                blob.velocity = 0;
            }
        }
    });

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

function gameOver() {
    // Implement game over logic
    console.log('Game Over');
}

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

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

update();
