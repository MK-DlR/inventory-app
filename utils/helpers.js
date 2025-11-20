// utils/helpers.js

// capitalize new inputs
const capitalizeTitle = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

// trim new medicinal use input and split on commas
const parseNewUses = (newUse) =>
  String(newUse || "")
    .split(",") // split on commas
    .map((s) => s.trim()) // trim leading/trailing whitespace
    .map((s) => s.replace(/\s+/g, " ")) // normalize internal spaces
    .map((s) => capitalizeTitle(s)) // capitalize
    .filter((s) => s.length > 0) // remove empty strings
    .filter((v, i, arr) => arr.indexOf(v) === i); // remove duplicates

module.exports = { capitalizeTitle, parseNewUses };
