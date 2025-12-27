const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const highScoresList = document.getElementById('high-scores-list');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100; // initial game speed in ms
let gameInterval;

let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

highScoreElement.textContent = highScore;

// Generate random food position
function randomTile() {
  return Math.floor(Math.random() * tileCount);
}

// Generate food
function generateFood() {
  food = {
    x: randomTile(),
    y: randomTile()
  };
  // Ensure food doesn't spawn on snake
  for (let segment of snake) {
    if (segment.x === food.x && segment.y === food.y) {
      generateFood();
      return;
    }
  }
}

// Draw game
function drawGame() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = '#0f0';
  for (let segment of snake) {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  }

  // Draw food
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Move snake
function moveSnake() {
  if (dx === 0 && dy === 0) return;
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    generateFood();
    // Speed up the game
    gameSpeed = Math.max(50, gameSpeed - 5);
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  } else {
    snake.pop();
  }
}

// Game over
function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if (score > highScore) {
    highScore = score;
    highScoreElement.textContent = highScore;
    localStorage.setItem('highScore', highScore);
  }
  submitScore('Player', score);
  alert(`Game Over! Score: ${score}`);
}

// Submit score to local storage
function submitScore(name, score) {
  highScores.push({ name, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10);
  localStorage.setItem('highScores', JSON.stringify(highScores));
  loadHighScores();
}

// Load high scores from local storage
function loadHighScores() {
  highScoresList.innerHTML = '';
  highScores.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    highScoresList.appendChild(li);
  });
}

// Game loop
function gameLoop() {
  if (!gameRunning || gamePaused) return;
  moveSnake();
  drawGame();
}

// Handle key presses
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  const key = e.key;
  if (key === 'ArrowUp' && dy === 0) {
    dx = 0;
    dy = -1;
  } else if (key === 'ArrowDown' && dy === 0) {
    dx = 0;
    dy = 1;
  } else if (key === 'ArrowLeft' && dx === 0) {
    dx = -1;
    dy = 0;
  } else if (key === 'ArrowRight' && dx === 0) {
    dx = 1;
    dy = 0;
  } else if (key === ' ') {
    e.preventDefault();
    togglePause();
  }
});

// Start game
startBtn.addEventListener('click', () => {
  if (!gameRunning) {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100; // reset speed
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    generateFood();
    drawGame();
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
});

// Pause game
function togglePause() {
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
  if (gamePaused) {
    clearInterval(gameInterval);
  } else {
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Pause button
pauseBtn.addEventListener('click', togglePause);

// Reset game
resetBtn.addEventListener('click', () => {
  gameRunning = false;
  gamePaused = false;
  clearInterval(gameInterval);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;
  score = 0;
  scoreElement.textContent = score;
  gameSpeed = 100; // reset speed
  drawGame();
});

// Load high scores on page load
loadHighScores();