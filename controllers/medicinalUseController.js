// controllers/medicinalUseController.js

// get all medicinal uses
getAllMedicinalUses = (req, res) => {
  res.send("Get all medicinal uses");
};

// get medicinal use by id
getMedicinalUseById = (req, res) => {
  res.send("Get medicinal use by id");
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
