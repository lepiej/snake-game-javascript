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


### Changes Made:

1. **New Branch**: Created and switched to the `snake-solver` branch.

2. **UI Update**: Added a "Snake Solver" button to the game controls in `index.html`.

 3. **Hamiltonian Cycle Solver**:
    - The solver now uses a fundamental graph theory algorithm to find a Hamiltonian cycle in the grid.
    - The cycle is a path that visits every cell exactly once and returns to the start, guaranteeing the snake can eat all food and never die.
    - The algorithm uses recursive backtracking to find a valid cycle, represented as a sequence of grid coordinates.
    - When "Snake Solver" is clicked, the cycle is calculated and the snake follows it perfectly, always achieving the maximum score.

 **Why this matters:**

 The Hamiltonian cycle guarantees the snake will traverse every cell without hitting itself or the walls, always eating all food and achieving the highest possible score. This approach is mathematically optimal for the snake game grid.

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