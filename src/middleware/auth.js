// src/middleware/auth.js

// set userId if there is none
function checkUser(req, res, next) {
  if (!req.session.userId) {
    req.session.userId = process.env.GUEST_USER_ID; // set guest user ID in session
    req.session.userRole = "guest"; // set user role to guest
  }
  next();
}

module.exports = {
  checkUser,
};
