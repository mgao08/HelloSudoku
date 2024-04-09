const { getUser } = require("../services/users");
const { verifyPassword } = require("../utils/crypto");

module.exports = roles => async (req, res, next) => {
   const { username, password } = req.headers;

   console.log('username: ', username)
   console.log('password: ', password)
   if (!username || !password) {
      res.sendStatus(401);
      return;
   } else {
      const user = await getUser(username);
      if (!user || !(await verifyPassword(password, user.password)) || (roles && !roles.includes(user.role))) {
         res.sendStatus(401);
         return;
      } else {
         req.user = user;
      }
   }

   next();
}