// routes/filter.js

const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filterController");

console.log("!!! FILTER ROUTES FILE LOADED !!!");

// display filter page
router.get("/", async (req, res) => {
  // debugging
  console.log("=== FILTER ROUTE HIT ===");
  console.log("URL:", req.url);
  console.log("Query params:", req.query);
  console.log("Query keys:", Object.keys(req.query));
  console.log("Query keys length:", Object.keys(req.query).length);

  try {
    // check if any filters were submitted
    const hasFilters = Object.keys(req.query).length > 0;

    console.log("Has filters?", hasFilters);

    if (hasFilters) {
      console.log(">>> CALLING FILTER CONTROLLER <<<");
      return filterController.globalFilter(req, res);
    }

    // if no filters applied, redirect to plants page
    console.log(">>> NO FILTERS - REDIRECTING TO /plants <<<");
    res.redirect("/plants");
  } catch (error) {
    console.error("Error loading filter page:", error);
    res.status(500).send("Error loading filter page");
  }
});

module.exports = router;
