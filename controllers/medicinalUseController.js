// controllers/medicinalUseController.js
const db = require("../db/queries");
const pool = require("../db/pool");

// get all medicinal uses
getAllMedicinalUses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM medicinal_uses ORDER BY use_name ASC"
    );
    res.render("medicinal", {
      title: "Medicinal Uses",
      medicinal_uses: rows,
    });
  } catch (error) {
    console.error("Error fetching medicinal uses:", error);
    res.status(500).send("Error fetching medicinal uses");
  }
};

// get medicinal use by id, show all plants with that medicinal use
getMedicinalUseById = async (req, res) => {
  try {
    const medicalUseID = parseInt(req.params.id);
    const result = await db.getSpecificUse(medicalUseID);

    if (!result) {
      return res.redirect("/404");
    }

    // use the medicinal use's name for the title
    res.render("medicinal-details", {
      title: result.use_name || "Medicinal Use Details",
      medicinalUse: result,
      plants: result.plants,
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
