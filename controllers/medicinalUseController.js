// controllers/medicinalUseController.js

const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");
const { capitalizeTitle } = require("../utils/helpers");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 200 characters.";
const lengthErr2 = "must be between 1 and 500 characters.";

// get all medicinal uses
const getAllMedicinalUses = async (req, res) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses();
    res.render("medicinal", {
      title: "Medicinal Uses",
      medicinal_uses: medicinalUses,
    });
  } catch (error) {
    console.error("Error fetching medicinal uses:", error);
    res.status(500).send("Error fetching medicinal uses");
  }
};

// get a specific medicinal use by ID with associated plants
const getMedicinalUseById = async (req, res) => {
  try {
    const useID = parseInt(req.params.id);
    const medicinalUse = await db.getSpecificUse(useID);

    if (!medicinalUse) {
      return res.redirect("/404");
    }

    res.render("medicinal-details", {
      title: medicinalUse.use_name || "Medicinal Use Details",
      medicinalUse,
      plants: medicinalUse.plants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

// validate information from create medicinal use form
const validateMedicinal = [
  body("use_name")
    .trim()
    .notEmpty()
    .withMessage(`Medicinal use name is required`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Medicinal use name ${lengthErr}`),
  body("description")
    .trim()
    .notEmpty()
    .withMessage(`Description is required`)
    .isLength({ min: 1, max: 500 })
    .withMessage(`Description ${lengthErr2}`),
];

// show create medicinal use form
const createMedicinalUseForm = async (req, res) => {
  try {
    res.render("create-medicinal", {
      title: "Add New Medicinal Use",
    });
  } catch (err) {
    console.error("Error fetching create medicinal use form:", err);
    res.status(500).send("Error fetching create medicinal use form");
  }
};

// create medicinal use
const createMedicinalUse = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  // if errors, re-render form with error messages
  if (!errors.isEmpty()) {
    try {
      return res.status(400).render("create-medicinal", {
        title: "Add New Medicinal Use",
        errors: errors.array(),
        formData: req.body, // send back form entry so its not lost
      });
    } catch (err) {
      console.error("Error fetching medicinal uses:", err);
      return res.status(500).send("Error loading form");
    }
  }
  try {
    // use matchedData to get only validated/sanitized data
    const medicinalData = matchedData(req);

    const newMedicinal = await db.insertMedicinalUse(
      capitalizeTitle(medicinalData.use_name),
      medicinalData.description
    );

    // redirect to the new plant's detail page
    res.redirect(`/medicinal/${newMedicinal.id}`);
  } catch (err) {
    console.error("Error creating medicinal use:", err);
    res.status(500).send("Error creating medicinal use");
  }
};

// show edit medicinal use form
const updateMedicinalUseForm = (req, res) => {
  res.send("Show edit medicinal use form");
};

// update medicinal use
const updateMedicinalUse = (req, res) => {
  res.send("Update medicinal use");
};

// delete medicinal use
const deleteMedicinalUse = (req, res) => {
  res.send("Delete medicinal use");
};

module.exports = {
  getAllMedicinalUses,
  getMedicinalUseById,
  validateMedicinal,
  createMedicinalUseForm,
  createMedicinalUse,
  updateMedicinalUseForm,
  updateMedicinalUse,
  deleteMedicinalUse,
};
