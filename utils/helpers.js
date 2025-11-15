// utils/helpers.js

const capitalizeTitle = (str) =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

module.exports = { capitalizeTitle };
