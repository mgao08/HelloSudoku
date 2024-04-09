const axios = require("axios");
const { mongo } = require("../utils/db");
const Puzzle = require("../models/puzzle");
const { retryablePromise } = require("../utils/promise");
const PuzzleForADay = require("../models/puzzleForADay");

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

const fetchPuzzleOfTheDay = async () => {
   const puzzleOfTheDay = await mongo.db().collection("puzzleOfTheDay").find({}).toArray();
   const today = new Date().toISOString().slice(0, 10); // e.g. '2024-04-09'
   if (puzzleOfTheDay.length) {
      if (puzzleOfTheDay[0].date === today) return puzzleOfTheDay[0];
   } else {
      const board = await newBoard(1);
      const puzzle = board[0];
      const puzzleOfTheDay = PuzzleForADay(today, puzzle.value, puzzle.difficulty, puzzle.solution);
      await mongo.db().collection("puzzleOfTheDay").replaceOne({}, puzzleOfTheDay, { upsert: true });
      return puzzleOfTheDay[0];
   }
}

const fetchPuzzleById = async (id) => {
   const puzzle = await mongo.db().collection("puzzles").findOne({puzzle_id: parseInt(id)});
   return puzzle; 
}

module.exports = {
   newBoard,
   initialize,
   fetchPuzzleOfTheDay,
   fetchPuzzleById,
}