const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f00';
    ctx.fill();
    ctx.closePath();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    requestAnimationFrame(update);
}

document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
        bird.velocity = bird.jump;
    }
});

update();
