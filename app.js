// app.js

require("dotenv").config(); // MUST BE FIRST!

const express = require("express");
const app = express();
const path = require("node:path");
const db = require("./db/queries");

// require routers
const plantsRouter = require("./routes/plants");
const medicinalRouter = require("./routes/medicinal");
const searchRouter = require("./routes/search");
const filterRouter = require("./routes/filter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware and static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses();
    res.locals.medicinalUses = medicinalUses;
    next();
  } catch (error) {
    console.error("Error loading filter:", error);
    res.status(500).send("Error loading filter");
  }
});

// use routers
app.use("/plants", plantsRouter);
app.use("/medicinal", medicinalRouter);
app.use("/search", searchRouter);
app.use("/filter", filterRouter);

// home route
app.get("/", (req, res) => {
  res.redirect("/plants");
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
