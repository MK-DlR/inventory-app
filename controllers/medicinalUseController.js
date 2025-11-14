// controllers/medicinalUseController.js

const db = require("../db/queries");

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
const createMedicinalUse = (req, res) => {
  res.send("Create medicinal use");
};

// show edit medicinal use form
const editMedicinalUseForm = (req, res) => {
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
  createMedicinalUseForm,
  createMedicinalUse,
  editMedicinalUseForm,
  updateMedicinalUse,
  deleteMedicinalUse,
};
