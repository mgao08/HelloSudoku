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

const changeRole = async targetname => {
   const mongoRes = await mongo.db().collection("users").findOne({ username: targetname });
   console.log(mongoRes);
   if (mongoRes) {
      mongoRes.role === "admin" ? mongoRes.role = "member" : mongoRes.role = 'admin';
      const mongoRes2 = await mongo.db().collection("users").replaceOne({ username: targetname },  mongoRes);
      if (mongoRes2.acknowledged) return mongo.db().collection("users").findOne({ username: targetname });
      else return mongoRes2;
   } else {
      console.log('no..')
   }
}

const deleteUser = async targetname => mongo.db().collection("users").deleteOne({ username: targetname });

module.exports = {
   getUser,
   createUser,
   changeRole,
   deleteUser,
}