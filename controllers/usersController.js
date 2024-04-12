const express = require("express");
const { createUser, getUser, changeRole, deleteUser } = require("../services/users");
const authorize = require("../middlewares/authorize");

const usersController = express.Router();

usersController.post("/signup", async (req, res) => {
   try {
      const user = req.body;
      const userInfo = await createUser(user);
      const mongoRes = userInfo[1];

      if (mongoRes.acknowledged) {
         const response = {
            role: userInfo[0].role,
            registrationDate: userInfo[0].registrationDate
         }
         res.send(response);
      }      
   } catch (err) {
      res.status(500).send(err.message);
   }
});

usersController.get("/signin", authorize(), async (req, res) => {
   try {
      if (req.user) {
         const response = {
            role: req.user.role,
            registrationDate: req.user.registrationDate
         }
         res.send(response);
      } else {
         res.sendStatus(401);
      }
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
});

usersController.post("/changeRole", authorize(["admin"]), async (req, res) => {
   const user = await changeRole(req.body.target);

   if (!user) {
      res.sendStatus(404);
   } else {
      res.send(user);
   }
});

usersController.delete("/delete", authorize(["admin"]), async (req, res) => {
   const response = await deleteUser(req.body.target);

   if (response.acknowledged) {
      res.sendStatus(200);
   } else {
      res.sendStatus(404);
   }
});

module.exports = usersController;