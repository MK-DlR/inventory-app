// src/routes/filter.js

const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filterController");

// display filter page
router.get("/", async (req, res) => {
  try {
    // check if any filters were submitted
    const hasFilters = Object.keys(req.query).length > 0;

    if (hasFilters) {
      return filterController.globalFilter(req, res);
    }

    // if no filters applied, redirect to plants page
    res.redirect("/plants");
  } catch (error) {
    console.error("Error loading filter page:", error);
    res.status(500).send("Error loading filter page");
  }
});

module.exports = router;
