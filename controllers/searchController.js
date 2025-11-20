// controllers/searchController.js

const db = require("../db/queries");

const globalSearch = async (req, res) => {
  // create a search query in queries.js
  // and call it here
  // to globally search
  // for matches within:
  // common name
  // scientific name
  // medicinal use name
  // remember to edit getAllPlants in plantController
  // to no longer have search features
  // since it will be handled here
};

module.exports = {
  globalSearch,
};
