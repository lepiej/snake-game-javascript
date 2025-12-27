const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const highScoresList = document.getElementById('high-scores-list');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const saveModal = document.getElementById('save-modal');
const saveYesBtn = document.getElementById('save-yes');
const saveNoBtn = document.getElementById('save-no');

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

// Neural Network for AI
class NeuralNetwork {
  constructor(weights) {
    this.inputSize = 10; // 4 danger, 4 food-ahead, 2 relative food, 4 direction one-hot
    this.hiddenSize = 12;
    this.outputSize = 4;
    if (weights) {
      this.weightsIH = weights.slice(0, this.inputSize * this.hiddenSize);
      this.weightsHO = weights.slice(this.inputSize * this.hiddenSize, this.inputSize * this.hiddenSize + this.hiddenSize * this.outputSize);
      this.biasH = weights.slice(this.inputSize * this.hiddenSize + this.hiddenSize * this.outputSize, this.inputSize * this.hiddenSize + this.hiddenSize * this.outputSize + this.hiddenSize);
      this.biasO = weights.slice(this.inputSize * this.hiddenSize + this.hiddenSize * this.outputSize + this.hiddenSize);
    } else {
      this.weightsIH = new Array(this.inputSize * this.hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
      this.weightsHO = new Array(this.hiddenSize * this.outputSize).fill(0).map(() => Math.random() * 2 - 1);
      this.biasH = new Array(this.hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
      this.biasO = new Array(this.outputSize).fill(0).map(() => Math.random() * 2 - 1);
    }
  }

  predict(inputs) {
    // Hidden layer
    let hidden = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.biasH[i];
      for (let j = 0; j < this.inputSize; j++) {
        sum += inputs[j] * this.weightsIH[j * this.hiddenSize + i];
      }
      hidden[i] = Math.tanh(sum);
    }
    // Output layer
    let outputs = [];
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.biasO[i];
      for (let j = 0; j < this.hiddenSize; j++) {
        sum += hidden[j] * this.weightsHO[j * this.outputSize + i];
      }
      outputs[i] = Math.tanh(sum);
    }
    return outputs;
  }

  getWeights() {
    return [...this.weightsIH, ...this.weightsHO, ...this.biasH, ...this.biasO];
  }
}

// Genetic Algorithm
let population = [];
let populationSize = 50;
let generation = 0;
let bestFitness = 0;
let bestNN = null;

function initializePopulation() {
  population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(new NeuralNetwork());
  }
}

function evaluateFitness(nn) {
  // Simulate game with this NN
  let simSnake = [{ x: 10, y: 10 }];
  let simDx = 0;
  let simDy = 0;
  let simScore = 0;
  let simFood = generateFoodForSim();
  let steps = 0;
  let maxSteps = 500;
  let foodEaten = 0;
  let alive = true;
  let totalDistReward = 0;
  let prevDist = Math.abs(simSnake[0].x - simFood.x) + Math.abs(simSnake[0].y - simFood.y);

  while (steps < maxSteps && alive) {
    let inputs = getInputs(simSnake, simFood, simDx, simDy);
    let outputs = nn.predict(inputs);
    let maxIndex = outputs.indexOf(Math.max(...outputs));
    let newDx = 0, newDy = 0;
    if (maxIndex === 0) { newDx = 0; newDy = -1; }
    else if (maxIndex === 1) { newDx = 0; newDy = 1; }
    else if (maxIndex === 2) { newDx = -1; newDy = 0; }
    else { newDx = 1; newDy = 0; }
    simDx = newDx;
    simDy = newDy;
    const head = { x: simSnake[0].x + simDx, y: simSnake[0].y + simDy };
    // Check wall
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      alive = false;
      break;
    }
    // Check self
    for (let segment of simSnake) {
      if (head.x === segment.x && head.y === segment.y) {
        alive = false;
        break;
      }
    }
    if (!alive) break;
    simSnake.unshift(head);
    let currDist = Math.abs(head.x - simFood.x) + Math.abs(head.y - simFood.y);
    // Reward getting closer to food
    if (currDist < prevDist) {
      totalDistReward += 2;
    } else if (currDist > prevDist) {
      totalDistReward -= 1;
    }
    prevDist = currDist;
    if (head.x === simFood.x && head.y === simFood.y) {
      simScore += 10;
      foodEaten++;
      simFood = generateFoodForSim();
      prevDist = Math.abs(head.x - simFood.x) + Math.abs(head.y - simFood.y);
    } else {
      simSnake.pop();
    }
    steps++;
  }
  // Fitness: reward food, survival, getting closer to food, penalize dying early
  return (foodEaten * 200) + (steps) + totalDistReward - (alive ? 0 : 200);
}

function generateFoodForSim() {
  let f = { x: randomTile(), y: randomTile() };
  // Simple check, assume no overlap for sim
  return f;
}

function getInputs(snake, food, dx, dy) {
  let head = snake[0];
  let inputs = [];
  // For each direction: up, down, left, right
  let directions = [
    {dx: 0, dy: -1}, // up
    {dx: 0, dy: 1}, // down
    {dx: -1, dy: 0}, // left
    {dx: 1, dy: 0} // right
  ];
  for (let dir of directions) {
    let nx = head.x + dir.dx;
    let ny = head.y + dir.dy;
    let danger = 0;
    if (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount) danger = 1;
    else if (snake.some(s => s.x === nx && s.y === ny)) danger = 1;
    let foodAhead = (food.x === nx && food.y === ny) ? 1 : 0;
    inputs.push(danger, foodAhead);
  }
  // Relative food position (normalized)
  let relFoodX = (food.x - head.x) / tileCount;
  let relFoodY = (food.y - head.y) / tileCount;
  inputs.push(relFoodX, relFoodY);
  // One-hot direction
  inputs.push(dx === 0 && dy === -1 ? 1 : 0); // up
  inputs.push(dx === 0 && dy === 1 ? 1 : 0);  // down
  inputs.push(dx === -1 && dy === 0 ? 1 : 0); // left
  inputs.push(dx === 1 && dy === 0 ? 1 : 0);  // right
  return inputs;
}

function evolve() {
  // Evaluate fitness
  let fitnesses = population.map(nn => evaluateFitness(nn));
  // Find best
  let maxFit = Math.max(...fitnesses);
  let bestIndex = fitnesses.indexOf(maxFit);
  bestNN = population[bestIndex];
  bestFitness = maxFit;
  console.log(`Generation ${generation}: Best fitness ${bestFitness}`);

  // Selection: tournament
  let newPopulation = [];
  for (let i = 0; i < populationSize; i++) {
    let a = population[Math.floor(Math.random() * populationSize)];
    let b = population[Math.floor(Math.random() * populationSize)];
    newPopulation.push(evaluateFitness(a) > evaluateFitness(b) ? a : b);
  }

  // Crossover and mutation
  for (let i = 0; i < populationSize; i += 2) {
    let parent1 = newPopulation[i];
    let parent2 = newPopulation[i + 1];
    let child1Weights = parent1.getWeights();
    let child2Weights = parent2.getWeights();
    let crossoverPoint = Math.floor(Math.random() * child1Weights.length);
    let child1 = [...child1Weights.slice(0, crossoverPoint), ...child2Weights.slice(crossoverPoint)];
    let child2 = [...child2Weights.slice(0, crossoverPoint), ...child1Weights.slice(crossoverPoint)];
    // Mutation
    child1 = child1.map(w => Math.random() < 0.2 ? w + (Math.random() * 0.4 - 0.2) : w);
    child2 = child2.map(w => Math.random() < 0.2 ? w + (Math.random() * 0.4 - 0.2) : w);
    newPopulation[i] = new NeuralNetwork(child1);
    if (i + 1 < populationSize) newPopulation[i + 1] = new NeuralNetwork(child2);
  }
  population = newPopulation;
  generation++;
}

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
  alert(`Game Over! Score: ${score}`);
  saveModal.style.display = 'block';
}

// Submit score to local storage
function submitScore(name, score) {
  highScores.push({ name, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
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
  if (solverMode && hamiltonianCycle) {
    hamiltonianIndex = (hamiltonianIndex + 1) % hamiltonianCycle.length;
    const next = hamiltonianCycle[hamiltonianIndex];
    const head = snake[0];
    dx = next.x - head.x;
    dy = next.y - head.y;
  }
  moveSnake();
  drawGame();
}

// Handle key presses
document.addEventListener('keydown', (e) => {
  if (!gameRunning || solverMode) return;
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
  solverMode = false;
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
  highScores = [];
  localStorage.setItem('highScores', JSON.stringify(highScores));
  loadHighScores();
  drawGame();
});

// Load high scores on page load
loadHighScores();

// Event listeners for save modal
saveYesBtn.addEventListener('click', () => {
  submitScore('Player', score);
  saveModal.style.display = 'none';
});

saveNoBtn.addEventListener('click', () => {
  saveModal.style.display = 'none';
});

// Solver mode
let solverMode = false;
const solverBtn = document.getElementById('solver-btn');
const solverProgress = document.getElementById('solver-progress');


solverBtn.addEventListener('click', () => {
  solverMode = true;
  solverProgress.textContent = 'Calculating Hamiltonian cycle...';
  setTimeout(() => {
    hamiltonianCycle = window.findHamiltonianCycle(tileCount, tileCount);
    hamiltonianIndex = 0;
    solverProgress.textContent = hamiltonianCycle ? 'Cycle found! Starting solver.' : 'No cycle found.';
    setTimeout(() => {
      solverProgress.textContent = '';
      if (!gameRunning && hamiltonianCycle) {
        snake = [{ x: hamiltonianCycle[0].x, y: hamiltonianCycle[0].y }];
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        gameSpeed = 100;
        gameRunning = true;
        gamePaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        generateFood();
        drawGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
      }
    }, 500);
  }, 100);
});