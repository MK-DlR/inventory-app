// src/middleware/auth.js

// set userId if there is none
function checkUser(req, res, next) {
  if (!req.session.userId) {
    req.session.userId = process.env.GUEST_USER_ID;
  }
  next();
}

module.exports = {
  checkUser,
};
