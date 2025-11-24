// controllers/plantController.js

const db = require("../db/queries");
const { body, validationResult, matchedData } = require("express-validator");
const {
  capitalizeTitle,
  capitalizeScientific,
  parseNewUses,
  formatStockStatus,
  formatQuantityLevel,
  quantityToSortValue,
} = require("../utils/helpers");
const { searchPlant } = require("../utils/trefleService");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 200 characters.";

// get all plants, allow for search functionality
const getAllPlants = async (req, res) => {
  const plants = await db.getPlants(
    req.query.stock_status,
    req.query.quantity_level,
    req.query.medicinal_use,
    req.query.order_status
  );

  // debugging
  console.log("First plant data:", plants[0]);

  // determine title based on filters
  let title = "All Plants";
  if (
    req.query.stock_status ||
    req.query.quantity_level ||
    req.query.medicinal_use
  ) {
    title = "Filtered Plants";
  }

  res.render("plants", {
    title,
    plants,
    quantityToSortValue,
    formatStockStatus,
    formatQuantityLevel,
  });
};

// get plant by id
const getPlantById = async (req, res) => {
  try {
    const plantID = parseInt(req.params.id);
    let plant = await db.getSpecificPlant(plantID);

    if (!plant) {
      return res.redirect("/404");
    }

    // check if plant doesn't have an image yet
    if (!plant.image_url) {
      console.log(`No image for ${plant.common_name}, fetching from Trefle...`);

      // search trefle api
      const results = await searchPlant(
        plant.scientific_name,
        plant.common_name
      );

      // if results, take first one
      if (results && results.length > 0) {
        const firstResult = results[0];
        console.log(`Found image for ${plant.common_name}`);

        // update database with image url and trefle id
        plant = await db.updatePlantImage(
          plantID,
          firstResult.image_url,
          firstResult.id
        );
      } else {
        console.log(`No image found for ${plant.common_name}`);
        // store null to avoid searching again on next visit
        plant = await db.updatePlantImage(plantID, null, null);
      }
    }

    // use the plant's name for the title
    res.render("plant-details", {
      title: plant.common_name || "Plant Details",
      plant,
      formatStockStatus,
      formatQuantityLevel,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

// validate information from create plant form
const validatePlant = [
  body("scientific_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/) // allow letters and spaces
    .withMessage(`Scientific name ${alphaErr}`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Scientific name ${lengthErr}`),
  body("common_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/) // allow letters and spaces
    .withMessage(`Common name ${alphaErr}`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Common name ${lengthErr}`),
  // custom validator that checks for duplicate scientific name
  body("scientific_name").custom(async (value) => {
    const duplicate = await db.checkDuplicate({
      scientific_name: value,
    });
    if (duplicate) {
      throw new Error(
        `This plant already exists as "${duplicate.common_name}" (${duplicate.scientific_name}).||${duplicate.id}`
      );
    }
    return true;
  }),
  body("stock_status")
    .isIn(["in_stock", "out_of_stock"])
    .withMessage("Stock status must be 'in_stock' or 'out_of_stock'"),
  body("quantity_level")
    .optional({ checkFalsy: true })
    .isIn(["high", "medium", "low"])
    .withMessage("Quantity level must be 'high', 'medium', 'low', or 'null'"),
  body("order_status")
    .optional({ checkFalsy: true })
    .isIn(["needs_ordering", "on_order"])
    .withMessage(
      "Order status must be 'needs_ordering', 'on_order', or 'null'"
    ),
  body("medicinal_uses").optional(),
];

// validate information from update plant form
const validatePlantUpdate = [
  body("scientific_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/) // allow letters and spaces
    .withMessage(`Scientific name ${alphaErr}`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Scientific name ${lengthErr}`),
  body("common_name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/) // allow letters and spaces
    .withMessage(`Common name ${alphaErr}`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Common name ${lengthErr}`),
  // special validator
  body("common_name").custom(async (value, { req }) => {
    const duplicate = await db.checkDuplicate({
      scientific_name: req.body.scientific_name,
      common_name: value,
    });
    // only throw error if duplicate exists AND it's not the current plant
    if (duplicate && duplicate.id !== parseInt(req.params.id)) {
      throw new Error(
        `This plant already exists as "${duplicate.common_name}" (${duplicate.scientific_name}).||${duplicate.id}`
      );
    }
    return true;
  }),
  body("stock_status")
    .isIn(["in_stock", "out_of_stock"])
    .withMessage("Stock status must be 'in_stock' or 'out_of_stock'"),
  body("quantity_level")
    .optional({ checkFalsy: true })
    .isIn(["high", "medium", "low"])
    .withMessage("Quantity level must be 'high', 'medium', 'low', or 'null'"),
  body("order_status")
    .optional({ checkFalsy: true })
    .isIn(["needs_ordering", "on_order"])
    .withMessage(
      "Order status must be 'needs_ordering', 'on_order', or 'null'"
    ),
  body("medicinal_uses").optional(),
];

// show create plant form with medicinal uses
const createPlantForm = async (req, res) => {
  try {
    const medicinalUses = await db.getAllMedicinalUses();
    res.render("create-plant", {
      title: "Add New Plant",
      medicinalUses,
    });
  } catch (err) {
    console.error("Error fetching create plant form:", err);
    res.status(500).send("Error fetching create plant form");
  }
};

// create plant
const createPlant = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);

  // if errors, re-render form with error messages
  if (!errors.isEmpty()) {
    try {
      const medicinalUses = await db.getAllMedicinalUses();

      return res.status(400).render("create-plant", {
        title: "Add New Plant",
        medicinalUses,
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
    const plantData = matchedData(req);

    // capitalize common name
    plantData.common_name = capitalizeTitle(plantData.common_name);

    // capitalize first letter of scientific name
    plantData.scientific_name = capitalizeScientific(plantData.scientific_name);

    // add checkbox IDs manually if any were selected
    plantData.medicinal_uses = req.body.medicinal_uses || [];

    // normalize checkbox ids -> array of numbers (handle single selection string)
    if (typeof plantData.medicinal_uses === "string") {
      plantData.medicinal_uses = [plantData.medicinal_uses];
    }
    plantData.medicinal_uses = plantData.medicinal_uses
      .map((id) => Number(id))
      .filter(Boolean);

    // parsed typed names
    plantData.new_medicinal_uses = parseNewUses(
      req.body.new_medicinal_uses || ""
    );

    const newPlant = await db.insertPlant(plantData);

    // redirect to the new plant's detail page
    res.redirect(`/plants/${newPlant.id}`);
  } catch (err) {
    console.error("Error creating plant:", err);
    res.status(500).send("Error creating plant");
  }
};

// show update plant form with medicinal uses
const updatePlantForm = async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const plantInfo = await db.getSpecificPlant(plantId);

    if (!plantInfo) {
      return res.redirect("/404");
    }

    const medicinalUses = await db.getAllMedicinalUses();
    res.render("update-plant", {
      title: `Update ${plantInfo.common_name}`,
      medicinalUses,
      plant: plantInfo,
    });
  } catch (err) {
    console.error("Error fetching update plant form:", err);
    res.status(500).send("Error fetching update plant form");
  }
};

// update plant
const updatePlant = async (req, res) => {
  const plantId = parseInt(req.params.id);

  // check for validation errors
  const errors = validationResult(req);

  // if errors, re-render form with error messages
  if (!errors.isEmpty()) {
    try {
      const medicinalUses = await db.getAllMedicinalUses();
      const plant = await db.getSpecificPlant(plantId);

      return res.status(400).render("update-plant", {
        title: "Update Plant",
        medicinalUses,
        plant,
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
    const plantData = matchedData(req);

    // capitalize common name
    plantData.common_name = capitalizeTitle(plantData.common_name);

    // add checkbox IDs manually if any were selected
    plantData.medicinal_uses = req.body.medicinal_uses || [];

    // normalize checkbox ids -> array of numbers (handle single selection string)
    if (typeof plantData.medicinal_uses === "string") {
      plantData.medicinal_uses = [plantData.medicinal_uses];
    }
    plantData.medicinal_uses = plantData.medicinal_uses
      .map((id) => Number(id))
      .filter(Boolean);

    // parsed typed names
    plantData.new_medicinal_uses = parseNewUses(
      req.body.new_medicinal_uses || ""
    );

    const updatedPlant = await db.updatePlant(plantId, plantData);

    // redirect to the new plant's detail page
    res.redirect(`/plants/${updatedPlant.id}`);
  } catch (err) {
    console.error("Error updating plant:", err);
    res.status(500).send("Error updating plant");
  }
};

// delete plant
const deletePlant = async (req, res) => {
  const plantId = req.params.id;
  try {
    await db.removePlant(plantId);
    // redirect back to all plants page
    res.redirect(`/plants`);
  } catch (err) {
    console.error("Error deleting plant:", err);
    res.status(500).send("Error deleting plant");
  }
};

module.exports = {
  getAllPlants,
  getPlantById,
  validatePlant,
  validatePlantUpdate,
  createPlantForm,
  createPlant,
  updatePlantForm,
  updatePlant,
  deletePlant,
};
