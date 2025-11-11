// routes/medicinal.js

const express = require("express");
const router = express.Router();
const medicinalUseController = require("../controllers/medicinalUseController");

router.get("/", medicinalUseController.getAllMedicinalUses);
router.get("/new", medicinalUseController.createMedicinalUseForm);
router.post("/new", medicinalUseController.createMedicinalUse);
// :id needs to go after new
router.get("/:id", medicinalUseController.getMedicinalUseById);
router.get("/:id/edit", medicinalUseController.editMedicinalUseForm);
router.post("/:id/update", medicinalUseController.updateMedicinalUse);
router.post("/:id/delete", medicinalUseController.deleteMedicinalUse);

module.exports = router;
