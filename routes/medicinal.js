// routes/medicinal.js

const express = require("express");
const router = express.Router();
const medicinalUseController = require("../controllers/medicinalUseController");

router.get("/", medicinalUseController.getAllMedicinalUses);
router.get("/new", medicinalUseController.createMedicinalUseForm);

// validation middleware for creating
router.post(
  "/new",
  medicinalUseController.validateMedicinal,
  medicinalUseController.createMedicinalUse
);

// :id needs to go after new
router.get("/:id", medicinalUseController.getMedicinalUseById);
router.get("/:id/edit", medicinalUseController.updateMedicinalUseForm);

// validation middleware for updating
router.post(
  "/:id/update",
  medicinalUseController.validateMedicinalUpdate,
  medicinalUseController.updateMedicinalUse
);

router.post("/:id/delete", medicinalUseController.deleteMedicinalUse);

module.exports = router;
