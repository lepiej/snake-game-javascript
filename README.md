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
   - Added a `NeuralNetwork` class with 10 inputs (distances to food, walls, and self in all directions), 6 hidden neurons, and 4 outputs (directions).
   - Implemented a genetic algorithm with:
     - Population of 20 neural networks
     - Fitness evaluation through game simulation
     - Tournament selection, crossover, and mutation
     - 50 generations of evolution when the solver button is clicked

4. **Solver Mode**: 
   - When "Snake Solver" is clicked, the GA runs for 50 generations to evolve the best neural network.
   - The game then starts in solver mode, where the AI controls the snake automatically.
   - The AI uses the evolved neural network to decide movements, aiming to eat all red squares (food) without hitting walls or itself.

5. **Game Logic Updates**:
   - Modified the game loop to use AI decisions in solver mode.
   - Disabled manual controls when in solver mode.
   - Reset solver mode on game reset.

The solver uses a neural network trained via genetic algorithm to play the game. While it may not be perfect on the first run (GA needs time to evolve good solutions), it should improve over generations and eventually find strategies to eat all the food without dying. You can run multiple solver sessions to potentially get better results.

To test it, start the server with `node server.js` and open the game in a browser, then click the "Snake Solver" button.

## Technologies

- Frontend: HTML5 Canvas, JavaScript