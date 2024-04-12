require('dotenv').config();

module.exports = {
   SALT_ROUNDS: process.env.SALT_ROUNDS ?? 10,
   MONGODB_SERVER: process.env.MONGODB_SERVER,
   MONGODB_USER: process.env.MONGODB_USER,
   MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
   MONGODB_DATABASE: process.env.MONGODB_DATABASE,
}