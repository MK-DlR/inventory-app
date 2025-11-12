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

// get specific plant by id with medicinal uses
async function getSpecificPlant(plantID) {
  // get plant data
  const plantQuery = await pool.query("SELECT * FROM plants WHERE id = $1", [
    plantID,
  ]);

  if (plantQuery.rows.length === 0) {
    return null;
  }

  const plant = plantQuery.rows[0];

  // get medicinal uses for this plant
  const usesQuery = await pool.query(
    `SELECT mu.id, mu.use_name, mu.description 
     FROM medicinal_uses mu
     INNER JOIN plant_medicinal_uses pmu ON mu.id = pmu.medicinal_use_id
     WHERE pmu.plant_id = $1`,
    [plantID]
  );

  // add medicinal uses to plant object
  plant.medicinal_uses = usesQuery.rows;

  return plant;
}

module.exports = {
  getPlants,
  getSpecificPlant,
};

// https://www.theodinproject.com/lessons/nodejs-using-postgresql#querying-with-pg
