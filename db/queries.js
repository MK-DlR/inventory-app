// db/queries.js
const pool = require("./pool");

// get all plants, allow for search functionality
async function getPlants(search, stock_status, quantity_level, medicinal_use) {
  let query = "SELECT DISTINCT plants.* FROM plants"; // base query
  let conditions = []; // hold SQL conditions
  let params = []; // hold parameter values
  let paramCount = 1;

  // add JOIN if filtering by medicinal_use
  if (medicinal_use) {
    query += " INNER JOIN plant_medicinal_uses pmu ON plants.id = pmu.plant_id";
    query += " INNER JOIN medicinal_uses mu ON mu.id = pmu.medicinal_use_id";
  }

  // add search condition
  if (search) {
    conditions.push(
      `(LOWER(common_name) LIKE LOWER($${paramCount}) OR LOWER(scientific_name) LIKE LOWER($${paramCount}))`
    );
    params.push(`%${search}%`);
    paramCount++;
  }

  // add stock_status condition
  if (stock_status) {
    conditions.push(`stock_status = $${paramCount}`);
    params.push(stock_status);
    paramCount++;
  }

  // add quantity_level condition
  if (quantity_level) {
    conditions.push(`quantity_level = $${paramCount}`);
    params.push(quantity_level);
    paramCount++;
  }

  // add medicinal_use condition
  if (medicinal_use) {
    conditions.push(`mu.use_name = $${paramCount}`); // or mu.id if filtering by ID
    params.push(medicinal_use);
    paramCount++;
  }

  // combine conditions with AND
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // execute query
  const { rows } = await pool.query(query, params);
  return rows;
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
