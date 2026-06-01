// src/app.js

require("dotenv").config();

const express = require("express");
const expressSession = require("express-session");
const app = express();
const path = require("node:path");
const db = require("./db/queries");
const { checkUser } = require("./middleware/auth");

// require routers
const authRouter = require("./routes/auth");
const filterRouter = require("./routes/filter");
const medicinalRouter = require("./routes/medicinal");
const plantsRouter = require("./routes/plants");
const searchRouter = require("./routes/search");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware and static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(checkUser);
app.use(async (req, res, next) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses(req.session.userId);
    res.locals.medicinalUses = medicinalUses;
    res.locals.userRole = req.session.userRole; // make user role available in all views
    next();
  } catch (error) {
    console.error("Error loading filter:", error);
    res.status(500).send("Error loading filter");
  }
});

// use routers
app.use("/auth", authRouter);
app.use("/filter", filterRouter);
app.use("/medicinal", medicinalRouter);
app.use("/plants", plantsRouter);
app.use("/search", searchRouter);
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
