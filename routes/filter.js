// routes/filter.js

const express = require("express");
const router = express.Router();
const db = require("../db/queries");
const filterController = require("../controllers/filterController");

// display filter page
router.get("/", async (req, res) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses();

    // check if any filters were submitted
    const hasFilters = Object.keys(req.query).length > 0;

    if (hasFilters) {
      // filters submitted - call controller
      return filterController.globalFilter(req, res);
    }

    // no filters - just show filter page
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
