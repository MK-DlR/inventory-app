// db/queries.js
const pool = require("./pool");

// get all plants, allow for search functionality
async function getPlants(searchTerm) {
  if (searchTerm) {
    const { rows } = await pool.query(
      "SELECT * FROM plants WHERE LOWER(common_name) LIKE LOWER($1) OR LOWER(scientific_name) LIKE LOWER($1)",
      [`%${searchTerm}%`]
    );
    return rows;
  } else {
    const { rows } = await pool.query("SELECT * from plants");
    return rows;
  }
}

module.exports = {
  getPlants,
};

// https://www.theodinproject.com/lessons/nodejs-using-postgresql#querying-with-pg
