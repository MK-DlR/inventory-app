// app.js

require("dotenv").config(); // MUST BE FIRST!

const express = require("express");
const app = express();
const path = require("node:path");
// require router here
// const ROUTERNAME = require("./routes/ROUTERNAME");

app.set("views", path.join(__dirname, "views"));
// register view engine
app.set("view engine", "ejs");

// middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// use router for all routes
// app.use("/", ROUTERNAME);

// listen for requests
const PORT = process.env.PORT || 3005;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app listening on port ${PORT}!`);
});
