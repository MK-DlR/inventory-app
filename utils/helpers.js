// utils/helpers.js

// capitalize new inputs
const capitalizeTitle = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

// capitalize first letter of scientific name
const capitalizeScientific = (str) =>
  String(str)
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

// trim new medicinal use input and split on commas
const parseNewUses = (newUse) =>
  String(newUse || "")
    .split(",") // split on commas
    .map((s) => s.trim()) // trim leading/trailing whitespace
    .map((s) => s.replace(/\s+/g, " ")) // normalize internal spaces
    .map((s) => capitalizeTitle(s)) // capitalize
    .filter((s) => s.length > 0) // remove empty strings
    .filter((v, i, arr) => arr.indexOf(v) === i); // remove duplicates

// format database values for display
const formatStockStatus = (status) => {
  if (!status) return "N/A";
  // converts "in_stock" to "In Stock", "out_of_stock" to "Out Of Stock"
  // converts "on_order" to "On Order", "needs_ordering" to "Needs Ordering"
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatQuantityLevel = (level) => {
  if (!level) return "N/A";
  // converts "low", "medium", "high" to "Low", "Medium", "High"
  return level.charAt(0).toUpperCase() + level.slice(1);
};

// convert quantity level to sortable number
const quantityToSortValue = (level) => {
  const mapping = {
    high: 3,
    medium: 2,
    low: 1,
  };
  return mapping[level] || 0; // null/undefined becomes 0
};

module.exports = {
  capitalizeTitle,
  capitalizeScientific,
  parseNewUses,
  formatStockStatus,
  formatQuantityLevel,
  quantityToSortValue,
};
