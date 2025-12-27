# Snake Game JavaScript

A classic Snake game built with JavaScript.

## Features

- Classic Snake gameplay
- Score tracking
- High score persistence (local storage)
- Pause/Resume functionality
- Responsive design

## Installation

1. Clone the repository

## Usage

### Running Locally

- Open the `docs/index.html` file directly in your browser.
- Alternatively, start the server with `npm install` then `npm start` and go to `http://localhost:3000`.
- Click "Start Game" to begin
- Use arrow keys to control the snake
- Press spacebar to pause/resume
- Avoid walls and yourself!

### Running on GitHub Pages

- Access the game by GitHub Pages URL (https://lepiej.github.io/snake-game-javascript/)

## Controls

- Arrow keys: Move snake
- Spacebar: Pause/Resume
- Start/Pause/Reset buttons

## High Scores

- **Highest Score**: Displays your personal best score across all games played in this browser (stored locally).
- **High Scores List**: Shows the top 5 scores saved locally. Scores are saved when you choose to save after a game over.

## Snake Solver Mode

A new feature implemented on the `snake-solver` branch adds an AI-powered solver using a genetic algorithm to automatically play and win the game.

### Changes Made:

1. **New Branch**: Created and switched to the `snake-solver` branch.

2. **UI Update**: Added a "Snake Solver" button to the game controls in `index.html`.

3. **Genetic Algorithm Implementation**: 
    - Added a `NeuralNetwork` class with 10 inputs:
       - 4 danger flags (is there a wall or self in each direction?)
       - 4 food-ahead flags (is food in the next tile in each direction?)
       - 2 relative food position values (normalized dx, dy from head to food)
       - 4 one-hot direction flags (current direction)
    - The network has 12 hidden neurons and 4 outputs (directions).
    - Implemented a genetic algorithm with:
       - Population of 50 neural networks
      - Fitness evaluation through game simulation (up to 500 steps)
      - The fitness function rewards eating food, surviving, and getting closer to the food each step, so the AI learns to turn toward the food even if it requires multiple turns.
       - Tournament selection, crossover, and mutation (20% rate with larger range)
       - 100 generations of evolution when the solver button is clicked

**Why this matters:**

The improved input scheme gives the AI enough information to learn how to turn toward the food and avoid obstacles. The previous version only knew about immediate danger and food in the next tile, which made it impossible to plan or turn. Now, the AI can learn to navigate the board and actually solve the game.

4. **Solver Mode**: 
   - When "Snake Solver" is clicked, the GA runs for 100 generations to evolve the best neural network.
   - The game then starts in solver mode, where the AI controls the snake automatically.
   - The AI uses the evolved neural network to decide movements, aiming to eat all red squares (food) without hitting walls or itself.
   - Improved direction logic prevents reversing and allows continuing straight.

5. **Game Logic Updates**:
   - Modified the game loop to use AI decisions in solver mode.
   - Disabled manual controls when in solver mode.
   - Reset solver mode on game reset.

The solver uses a neural network trained via genetic algorithm to play the game. While it may not be perfect on the first run (GA needs time to evolve good solutions), it should improve over generations and eventually find strategies to eat all the food without dying. You can run multiple solver sessions to potentially get better results.

To test it, start the server with `node server.js` and open the game in a browser, then click the "Snake Solver" button.

## Technologies

- Frontend: HTML5 Canvas, JavaScript