const { mongo } = require("../utils/db");

module.exports = (req, res, next) => {
   const Timestamp = new Date().toISOString();

   res.on("finish", async () => {
      const log = {
         Timestamp,
         Sender: req.headers.username,
         Method: req.method,
         Path: req.path,
         Query: req.query,
         StatusCode: res.statusCode,
      }

      await mongo.db().collection("logs").insertOne(log);
   });

   next();
}