const axios = require("axios");
const { mongo } = require("../utils/db");
const Puzzle = require("../models/puzzle");
const { retryablePromise } = require("../utils/promise");

const SUDOKU_API_URL = "https://sudoku-api.vercel.app/api";

const sudokuAPI = axios.create({
   baseURL: SUDOKU_API_URL
});

const newBoard = async limit => sudokuAPI.get(`/dosuku?query={newboard(limit:${limit}){grids{value,solution,difficulty}}}`).then(r => r.data.newboard.grids);

const initialize = async () => {
   const puzzles = await mongo.db().collection("puzzles").find({}).toArray();
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

   while (missingPuzzles.easy || missingPuzzles.medium || missingPuzzles.hard) {
      const boards = await retryablePromise(() => newBoard(5), 5, 2000);

      for (const difficulty of difficulties) {
         const difficultyBoards = boards.filter(b => b.difficulty.toLowerCase() === difficulty);

         for (const board of difficultyBoards) {
            if (!missingPuzzles[difficulty])
               break;
            
            const puzzle_id = firstIndex[difficulty] + 25 - missingPuzzles[difficulty];
            const puzzle = Puzzle(puzzle_id, board.value, board.difficulty.toLowerCase(), board.solution);
            await mongo.db().collection("puzzles").insertOne(puzzle);
            missingPuzzles[difficulty]--;
         }
      }
   }

}

module.exports = {
   newBoard,
   initialize,
}