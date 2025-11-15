// routes/plants.js

const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");

router.get("/", plantController.getAllPlants);
router.get("/new", plantController.createPlantForm);

// validation middleware
router.post("/new", plantController.validatePlant, plantController.createPlant);

// :id needs to go after /new
router.get("/:id", plantController.getPlantById);
router.get("/:id/edit", plantController.updatePlantForm);
router.post("/:id/update", plantController.updatePlant);
router.post("/:id/delete", plantController.deletePlant);

module.exports = router;
