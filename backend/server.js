const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const RANDOM_WORD_API_URL = "https://random-word-api.herokuapp.com/word";

let totalAttempts = 0;
let correctAttempts = 0;
let accuracy = 0;

let gameCounter = 0;
const scores = new Array(5);
const totals = new Array(5);
const acc = new Array(5);

app.options("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Length, X-Requested-With"
  );
  res.send(200);
});

//This function will serve to scramble the word that we get from the api call
function scrambleWord(word) {
  const characters = word.split(""); // Convert string to array of characters
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [characters[i], characters[j]] = [characters[j], characters[i]]; // Swap elements
  }
  return characters.join(""); // Convert array of characters back to string
}

//This endpoint serves to get the word from the API and scramble it
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(RANDOM_WORD_API_URL);
    word = response.data[0]; // Assuming the response is an array with one word
    const scramword = scrambleWord(word);
    res.json({ random_word: word, scrambled_word: scramword });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch random word" });
  }
});

//This endpoint serves to verify whether the user's guess is right or not
app.post("/guess", (req, res) => {
  const userGuess = req.body.guess;
  const originalWord = req.body.originalWord;

  totalAttempts += 1;

  if (userGuess === originalWord) {
    correctAttempts += 1;
    res.json({ correct: true });
  } else {
    res.json({ correct: false });
  }
});

//This endpoint serves to get the score of the user
app.get("/score", (req, res) => {
  accuracy = totalAttempts === 0 ? 0 : (correctAttempts / totalAttempts) * 100;

  res.json({
    accuracy: accuracy.toFixed(2),
    correct: correctAttempts,
    total: totalAttempts,
  });
});

//This serves to just reset the score and update the game array
app.get("/reset", (req, res) => {
  correctAttempts = 0;
  totalAttempts = 0;
  res.json({
    message: "Score reset successful!",
  });
});

app.get("/counter", (req, res) => {
  gameCounter += 1;
});

app.get("/history", (req, res) => {
  if (gameCounter <= 5) {
    scores[gameCounter] = correctAttempts;
    totals[gameCounter] = totalAttempts;
    acc[gameCounter] = accuracy;
  } else {
    scores.push(correctAttempts);
    scores.shift();

    totals.push(totalAttempts);
    totals.shift();

    acc.push(accuracy);
    acc.shift();
  }
  res.json({
    first: [scores[0], totals[0], acc[0]],
    second: [scores[1], totals[1], acc[1]],
    third: [scores[2], totals[2], acc[2]],
    fourth: [scores[3], totals[3], acc[3]],
    fifth: [scores[4], totals[4], acc[4]],
    counter: gameCounter,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
