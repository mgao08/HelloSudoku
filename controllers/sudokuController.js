const express = require("express");
const { newBoard, fetchPuzzleOfTheDay, fetchPuzzleById, record, records } = require("../services/sudoku");
const authorize = require("../middlewares/authorize");

const sudokuController = express.Router();

sudokuController.get("/newBoard", async (req, res) => {
   try {
      const board = await newBoard();
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

sudokuController.post("/record", authorize(["admin", "member"]), async (req, res) => {
   try {
      const response = await record(req.body.record);
      res.send(response);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

sudokuController.get("/records/:username", authorize(["admin", "member"]), async (req, res) => {
   try {
      const response = await records(req.params.username);
      res.send(response);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

module.exports = sudokuController;