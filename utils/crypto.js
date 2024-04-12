const bcrypt = require("bcrypt");
const env = require("./env");

const hashPassword = async password => bcrypt.hash(password, env.SALT_ROUNDS);

const verifyPassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

module.exports = {
   hashPassword,
   verifyPassword,
}