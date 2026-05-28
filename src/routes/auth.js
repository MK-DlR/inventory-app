// src/routes/auth.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// display login page
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: null,
  });
});

// POST /auth/login
router.post("/login", (req, res) => {
  const { password } = req.body;
  const checkPassword = bcrypt.compareSync(
    password,
    process.env.ADMIN_PASSWORD,
  );

  if (checkPassword) {
    req.session.userId = process.env.ADMIN_USER_ID; // set user ID in session
    res.redirect("/plants"); // redirect to home page after login
  } else {
    res.status(401).render("login", {
      title: "Login",
      error: "Invalid password. Please try again.",
    });
  }
});

// logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.clearCookie("connect.sid"); // clear the session cookie
    res.redirect("/plants"); // redirect to home page after logout
  });
});

module.exports = router;
