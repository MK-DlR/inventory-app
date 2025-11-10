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

// middleware and static files
// makes files in public folder available to front end
app.use(express.static("public"));
// takes url encoded data and passes it into an object
app.use(express.urlencoded({ extended: true }));

// use router for all routes
// app.use("/", ROUTERNAME);

// 404 page
// has to go at the bottom so it fires last
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

// listen for requests
const PORT = process.env.PORT || 3005;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app listening on port ${PORT}!`);
});
