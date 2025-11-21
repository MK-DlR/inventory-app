// routes/filter.js

const express = require("express");
const router = express.Router();
const db = require("../db/queries");
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
    const medicinalUses = await db.getAllMedicinalUses();

    // check if any filters were submitted
    const hasFilters = Object.keys(req.query).length > 0;

    console.log("Has filters?", hasFilters);

    if (hasFilters) {
      console.log(">>> CALLING FILTER CONTROLLER <<<");
      return filterController.globalFilter(req, res);
    }

    console.log(">>> RENDERING FILTER FORM <<<");
    res.render("filter", {
      title: "Filter Plants",
      medicinalUses: medicinalUses,
    });
  } catch (error) {
    console.error("Error loading filter page:", error);
    res.status(500).send("Error loading filter page");
  }
});

module.exports = router;
