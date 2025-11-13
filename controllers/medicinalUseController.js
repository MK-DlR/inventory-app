// controllers/medicinalUseController.js
const db = require("../db/queries");

// get all medicinal uses
getAllMedicinalUses = async (req, res) => {
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
getMedicinalUseById = async (req, res) => {
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

// show create medicinal use form
createMedicinalUseForm = (req, res) => {
  res.send("Show create medicinal use form");
};

// create medicinal use
createMedicinalUse = (req, res) => {
  res.send("Create medicinal use");
};

// show edit medicinal use form
editMedicinalUseForm = (req, res) => {
  res.send("Show edit medicinal use form");
};

// update medicinal use
updateMedicinalUse = (req, res) => {
  res.send("Update medicinal use");
};

// delete medicinal use
deleteMedicinalUse = (req, res) => {
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
