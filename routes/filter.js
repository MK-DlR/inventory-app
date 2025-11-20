// routes/filter.js

const express = require("express");
const router = express.Router();
const db = require("../db/queries");

// display filter page
router.get("/", async (req, res) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses();

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
