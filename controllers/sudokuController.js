const express = require("express");
const { newBoard, fetchPuzzleOfTheDay, fetchPuzzleById } = require("../services/sudoku");

const sudokuController = express.Router();

sudokuController.get("/newBoard", async (req, res) => {
   try {
      const board = await newBoard();
      console.log(board)
      res.send(board);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

sudokuController.get("/puzzleOfTheDay", async (req, res) => {
   try {
      const puzzle = await fetchPuzzleOfTheDay();
      res.send(puzzle);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

sudokuController.get("/:puzzle_id", async (req, res) => {
   try {
      const puzzle = await fetchPuzzleById(req.params.puzzle_id);
      res.send(puzzle);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

module.exports = sudokuController;