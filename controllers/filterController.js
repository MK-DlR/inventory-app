// controllers/filterController.js

const db = require("../db/queries");
const {
  quantityToSortValue,
  formatStockStatus,
  formatQuantityLevel,
} = require("../utils/helpers");

const globalFilter = async (req, res) => {
  // debugging
  console.log("QUERY:", req.query);

  try {
    // extract filter values from query params
    const medicinalUses = req.query["medicinal_uses[]"] || [];
    const stockStatuses = req.query["stock_status[]"] || [];
    const quantityLevels = req.query["quantity_level[]"] || [];
    const orderStatuses = req.query["order_status[]"] || [];

    // ensure arrays
    const medicinalUsesArray = Array.isArray(medicinalUses)
      ? medicinalUses
      : [medicinalUses];
    const stockStatusArray = Array.isArray(stockStatuses)
      ? stockStatuses
      : [stockStatuses];
    const quantityLevelArray = Array.isArray(quantityLevels)
      ? quantityLevels
      : [quantityLevels];
    const orderStatusArray = Array.isArray(orderStatuses)
      ? orderStatuses
      : [orderStatuses];

    // debugging
    console.log("Stock Status Array:", stockStatusArray);
    console.log("Quantity Level Array:", quantityLevelArray);
    console.log("Medicinal Uses Array:", medicinalUsesArray);
    console.log("Order Status Array:", orderStatusArray);

    // call modified getPlants function
    const filterResults = await db.getPlants(
      stockStatusArray.filter((s) => s), // remove empty strings
      quantityLevelArray.filter((q) => q),
      medicinalUsesArray.filter((m) => m),
      orderStatusArray.filter((o) => o)
    );

    res.render("filter-results", {
      title: "Filter Results",
      filterResults,
      quantityToSortValue,
      formatStockStatus, // ADDED
      formatQuantityLevel, // ADDED
    });
  } catch (error) {
    console.error("Error filtering plants:", error);
    res.status(500).send("Error filtering plants");
  }
};

module.exports = {
  globalFilter,
};
