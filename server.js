// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

let highScores = [];

app.use(cors());
app.use(express.json());

// Route to get highscores
app.get('/highscores', (req, res) => {
    res.json(highScores);
});

// Route to save highscore
app.post('/highscores', (req, res) => {
    const { name, score } = req.body;
    highScores.push({ name, score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // Keep up to 10 scores
    res.status(201).json({ message: 'Highscore saved successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
