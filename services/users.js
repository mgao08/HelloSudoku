const User = require("../models/user");
const { hashPassword } = require("../utils/crypto");
const { mongo } = require("../utils/db");

const getUser = async username => mongo.db().collection("users").findOne({ username });

const createUser = async userInfo => {
   const existingUser = await getUser(userInfo.username);
   
   if (existingUser)
      throw new Error(`The username '${userInfo.username}' is already taken`);

   const hashedPassword = await hashPassword(userInfo.password);
   const user = User(userInfo.username, hashedPassword);
   user.registrationDate = new Date().toISOString();
   user.role = "member";

   const response = [];
   response.push(user);
   const mongoRes = await mongo.db().collection("users").insertOne(user);
   response.push(mongoRes);
   return response;
};

module.exports = {
   getUser,
   createUser,
}