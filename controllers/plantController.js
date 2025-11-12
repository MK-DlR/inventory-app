// controllers/plantController.js

const db = require("../db/queries");

// get all plants
getAllPlants = async (req, res) => {
  // needs optional filtering for:
  // stock_status
  // quality_level
  // order_status
  const plants = await db.getPlants(req.query.search);

  // change title once search is functional
  res.render("plants", { title: "All Plants", plants });
};

// get plant by id
getPlantById = async (req, res) => {
  try {
    const plantID = parseInt(req.params.id);
    const plant = await db.getSpecificPlant(plantID);

    if (!plant) {
      return res.redirect("/404"); // or res.status(404).send("Plant not found")
    }

    // use the plant's name for the title
    res.render("plant-details", {
      title: plant.common_name || "Plant Details",
      plant,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
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
