const axios = require("axios");
const { mongo } = require("../utils/db");
const Puzzle = require("../models/puzzle");

const SUDOKU_API_URL = "https://sudoku-api.vercel.app/api";

const sudokuAPI = axios.create({
   baseURL: SUDOKU_API_URL
});

const newBoard = async limit => sudokuAPI.get(`/dosuku?query={newboard(limit:${limit}){grids{value,solution,difficulty}}}`).then(r => r.data.newboard.grids);

const initialize = async () => {
   const puzzles = await mongo.db().collection("puzzles").find({}).toArray();
   console.log(puzzles);
   const difficulties = ['easy', 'medium', 'hard'];
   const firstIndex = {
      easy: 1,
      medium: 26,
      hard: 51
   }
   const missingPuzzles = {
      easy: 25 - puzzles.filter(p => p.difficulty === "easy").length,
      medium: 25 - puzzles.filter(p => p.difficulty === "medium").length,
      hard: 25 - puzzles.filter(p => p.difficulty === "hard").length,
   }

   const newPuzzles = [];

   while (missingPuzzles.easy || missingPuzzles.medium || missingPuzzles.hard) {
      const boards = await newBoard(5);
      for (const difficulty of difficulties) {
         const difficultyBoards = boards.filter(b => b.difficulty === difficulty);

         for (const board of difficultyBoards) {
            if (!missingPuzzles[difficulty])
               break;
            
            const puzzle_id = firstIndex[difficulty] + 25 - missingPuzzles[difficulty];
            newPuzzles.push(Puzzle(puzzle_id, board.value, board.difficulty.toLowerCase(), board.solution));
            missingPuzzles[difficulty]--;
         }
      }
   }

   if (newPuzzles.length)
      mongo.db().collection("puzzles").insertMany(newPuzzles);
}

module.exports = {
   newBoard,
   initialize,
}