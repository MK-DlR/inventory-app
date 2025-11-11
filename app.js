// app.js

require("dotenv").config(); // MUST BE FIRST!

const express = require("express");
const app = express();
const path = require("node:path");

// require routers
const plantsRouter = require("./routes/plants");
const medicinalRouter = require("./routes/medicinal");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware and static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// use routers
app.use("/plants", plantsRouter);
app.use("/medicinal", medicinalRouter);

// home route
app.get("/", (req, res) => {
  res.render("index", { title: "Medicinal Herbs Inventory" });
});

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
