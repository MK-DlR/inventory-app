// controllers/plantController.js

// get all plants
getAllPlants = (req, res) => {
  // needs optional filtering for:
  // stock_status
  // quality_level
  // order_status
  res.send("Get all plants");
};

// get plant by id
getPlantById = (req, res) => {
  res.send("Get plant by id");
};

// show create plant form
createPlantForm = (req, res) => {
  res.send("Show create plant form");
};

// create plant
createPlant = (req, res) => {
  // handles junction table for medicinal uses
  res.send("Create plant");
};

// show edit plant form
editPlantForm = (req, res) => {
  res.send("Show edit plant form");
};

// update plant
updatePlant = (req, res) => {
  // handles junction table for medicinal uses
  res.send("Update plant");
};

// delete plant
deletePlant = (req, res) => {
  res.send("Delete plant");
};

module.exports = {
  getAllPlants,
  getPlantById,
  createPlantForm,
  createPlant,
  editPlantForm,
  updatePlant,
  deletePlant,
};
