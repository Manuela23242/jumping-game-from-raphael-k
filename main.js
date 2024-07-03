const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');
const bgMusic = document.getElementById('bgMusic');
const gameOverOverlay = document.getElementById('gameOver');
const currentScoreDisplay = document.getElementById('currentScore');
const highScoreDisplay = document.getElementById('highScore');
const jumpSoundToggle = document.getElementById('jumpSoundToggle');
const gameOverSoundToggle = document.getElementById('gameOverSoundToggle');
const bgMusicToggle = document.getElementById('bgMusicToggle');
const speedDisplay = document.getElementById('speedDisplay');
const leaderboardList = document.getElementById('leaderboardList');
const nameInputContainer = document.getElementById('nameInputContainer');
const nameInput = document.getElementById('nameInput');
const startButton = document.getElementById('startButton');
const leaderboardContainer = document.getElementById('leaderboardContainer');

let player, obstacles, obstacleFrequency, frameCount, score, gameSpeed;
let gameRunning = false;
let highScore = localStorage.getItem('highScore') || 0;
let jumpSoundEnabled = true;
let gameOverSoundEnabled = true;
let bgMusicEnabled = true;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let playerName = '';

function initializeGame() {
    player = {
        x: 50,
        y: canvas.height - 100,
        width: 50,
        height: 50,
        color: 'blue',
        dy: 0,
        gravity: 0.8,
        jumpPower: -15,
        grounded: true
    };

    obstacles = [];
    obstacleFrequency = 100;
    frameCount = 0;
    score = 0;
    gameSpeed = 5; // Initial game speed
    gameRunning = true;

    scoreDisplay.textContent = `Score: ${score}`;
    gameOverOverlay.style.display = 'none';
    if (bgMusicEnabled) bgMusic.play();
}

function createObstacle() {
    const height = Math.random() * 100 + 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - height,
        width: 20,
        height: height,
        color: 'red',
        counted: false
    });
}

function update() {
    if (!gameRunning) return;

    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player physics
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.grounded = true;
        player.dy = 0;
    } else {
        player.grounded = false;
    }

    // Draw obstacles
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
        }

        // Collision detection
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            if (gameOverSoundEnabled) gameOverSound.play();
            bgMusic.pause();
            gameRunning = false;
            gameOverOverlay.style.display = 'block';
            currentScoreDisplay.textContent = `Dein Score: ${score}`;
            saveHighScore(score, playerName);
            updateLeaderboard();
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
            highScoreDisplay.textContent = `Highscore: ${highScore}`;
            return;
        }

        // Score counting
        if (!obs.counted && obs.x + obs.width < player.x) {
            score++;
            obs.counted = true;
            scoreDisplay.textContent = `Score: ${score}`;
            gameSpeed += 0.6; // Increase game speed as score increases
            speedDisplay.textContent = `Speed: ${gameSpeed.toFixed(1)}`;
        }
    }

    requestAnimationFrame(update);
}

function saveHighScore(newScore, name) {
    // Check if the player is already in the high scores
    let existingPlayer = highScores.find(entry => entry.name === name);
    if (existingPlayer) {
        // Update the score if the new score is higher
        if (newScore > existingPlayer.score) {
            existingPlayer.score = newScore;
        }
    } else {
        // Add a new player to the high scores
        highScores.push({ score: newScore, name: name });
    }

    // Sort and keep up to 10 scores
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // Keep up to 10 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function updateLeaderboard() {
    leaderboardList.innerHTML = '';
    highScores.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;

        if (jumpSoundEnabled) {
            // Reset the jump sound and play it
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }
});

function startGame() {
    playerName = nameInput.value.trim() || 'Anonymous'; // Ensure the player name is trimmed and not empty
    nameInputContainer.style.display = 'none';
    canvas.style.display = 'block';
    initializeGame();
    update();
}

function restartGame() {
    nameInputContainer.style.display = 'none';
    canvas.style.display = 'block';
    initializeGame();
    update();
}

function toggleJumpSound() {
    jumpSoundEnabled = !jumpSoundEnabled;
    jumpSoundToggle.textContent = `Jump Sound: ${jumpSoundEnabled ? 'An' : 'Aus'}`;
}

function toggleGameOverSound() {
    gameOverSoundEnabled = !gameOverSoundEnabled;
    gameOverSoundToggle.textContent = `Game Over Sound: ${gameOverSoundEnabled ? 'An' : 'Aus'}`;
}

function toggleBgMusic() {
    bgMusicEnabled = !bgMusicEnabled;
    bgMusicToggle.textContent = `Musik: ${bgMusicEnabled ? 'An' : 'Aus'}`;
    if (bgMusicEnabled) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}

// Initialize the leaderboard
updateLeaderboard();
