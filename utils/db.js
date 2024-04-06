const { MongoClient } = require("mongodb");
const env = require('./env');

const mongo = new MongoClient(`mongodb+srv://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${env.MONGODB_SERVER}/${env.MONGODB_DATABASE}`);

mongo.on("open", () => console.log("Connected to the database successfully"));

module.exports = {
   mongo
}