const express = require("express");
const { newBoard } = require("../services/sudoku");

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

module.exports = sudokuController;