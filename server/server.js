const express = require('express');
const { mongo } = require('../utils/db');
const usersController = require('../controllers/usersController');
const sudokuController = require('../controllers/sudokuController');
const { initialize } = require('../services/sudoku');
const app = express();

const PORT = 3000;

process.on("unhandledRejection", error => console.log('Unhandled rejection', error));

app.use(express.static("views"));
app.use(express.json());

app.use("/users", usersController);
app.use("/sudoku", sudokuController);

console.log("Connecting to the database...");
mongo.connect().then(async () => {
   console.log("Initializing puzzles...")
   await initialize();
   
   app.listen(PORT, "localhost", () => {
      console.log(`Server listening on http://localhost:${PORT}...`)
   });
});