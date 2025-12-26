# Snake Game JavaScript

A classic Snake game built with JavaScript, featuring both frontend and backend components.

## Features

- Classic Snake gameplay
- Score tracking
- High score persistence (local and server-side)
- Pause/Resume functionality
- Responsive design

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Usage

- Open your browser and go to `http://localhost:3000`
- Click "Start Game" to begin
- Use arrow keys to control the snake
- Press spacebar to pause/resume
- Avoid walls and yourself!

## Controls

- Arrow keys: Move snake
- Spacebar: Pause/Resume
- Start/Pause/Reset buttons

## API

The backend provides a simple API for high scores:

- GET `/api/highscores`: Retrieve top 10 high scores
- POST `/api/highscores`: Submit a new score (JSON: `{ "name": "Player", "score": 100 }`)

## Technologies

- Frontend: HTML5 Canvas, JavaScript
- Backend: Node.js, Express