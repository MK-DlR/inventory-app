// controllers/plantController.js

const db = require("../db/queries");

// get all plants, allow for search functionality
getAllPlants = async (req, res) => {
  const plants = await db.getPlants(
    req.query.search,
    req.query.stock_status,
    req.query.quantity_level,
    req.query.medicinal_use
  );

  // determine title based on filters
  let title = "All Plants";
  if (req.query.search) {
    title = `Search Results for "${req.query.search}"`;
  } else if (
    req.query.stock_status ||
    req.query.quantity_level ||
    req.query.medicinal_use
  ) {
    title = "Filtered Plants";
  }

  res.render("plants", { title, plants });
};

// get plant by id
getPlantById = async (req, res) => {
  try {
    const plantID = parseInt(req.params.id);
    const plant = await db.getSpecificPlant(plantID);

    if (!plant) {
      return res.redirect("/404");
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
