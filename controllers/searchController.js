// controllers/searchController.js

const db = require("../db/queries");

const globalSearch = async (req, res) => {
  let searchTerm = req.query.search;
  let searchResults = await db.globalSearch(req.query.search);

  // determine title based on filters
  let title = "Search";
  if (req.query.search) {
    title = `Search Results for "${req.query.search}"`;
  } else if (
    req.query.scientific_name ||
    req.query.common_name ||
    req.query.medicinal_use
  ) {
    title = "Search Results";
  }

  res.render("search-results", { title, searchTerm, searchResults });
};

module.exports = {
  globalSearch,
};
