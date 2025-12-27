const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// API endpoint for high scores (simple in-memory storage)
let highScores = [];

app.get('/api/highscores', (req, res) => {
  res.json(highScores);
});

app.post('/api/highscores', express.json(), (req, res) => {
  const { name, score } = req.body;
  if (name && score !== undefined) {
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // Keep top 10
    res.status(201).json({ message: 'Score added' });
  } else {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});