const express = require("express");
const { createUser, getUser } = require("../services/users");
const authorize = require("../middlewares/authorize");

const usersController = express.Router();

usersController.post("/signup", async (req, res) => {
   try {
      const user = req.body;
      const result = await createUser(user);
      if (result.acknowledged)
         res.sendStatus(200);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

usersController.get("/signin", authorize(), async (req, res) => {
   try {
      res.sendStatus(req.user ? 200 : 401);
   } catch (err) {
      res.status(500).send(err.message);
   }
});

usersController.get("/search/:username", authorize(["admin"]), async (req, res) => {
   const user = await getUser(req.params.username);
   
   if (!user)
      res.sendStatus(404);
   else
      res.send(user);
})

module.exports = usersController;