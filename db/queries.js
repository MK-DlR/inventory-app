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

  // sort alphabetically by common_name
  query += " ORDER BY common_name ASC";

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

// get all medicinal uses alphabetically
async function getAllMedicinalUses() {
  const { rows } = await pool.query(
    "SELECT * FROM medicinal_uses ORDER BY use_name ASC"
  );
  return rows;
}

// get specific medicinal use by id with associated plants
async function getSpecificUse(useID) {
  // get medicinal use data
  const useQuery = await pool.query(
    "SELECT * FROM medicinal_uses WHERE id = $1",
    [useID]
  );

  if (useQuery.rows.length === 0) {
    return null;
  }

  const medicinalUse = useQuery.rows[0];

  // get plants associated with this medicinal use
  const plantsQuery = await pool.query(
    `SELECT p.id, p.common_name, p.scientific_name, p.stock_status, p.quantity_level
    FROM plants p
    INNER JOIN plant_medicinal_uses pmu ON p.id = pmu.plant_id
    WHERE pmu.medicinal_use_id = $1`,
    [useID]
  );

  // add plants to medicinal use object
  medicinalUse.plants = plantsQuery.rows;

  return medicinalUse;
}

// add new plant to database
async function insertPlant(plantData) {
  const {
    scientific_name,
    common_name,
    stock_status,
    quantity_level,
    order_status,
    medicinal_uses,
  } = plantData;

  const query = `
    INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    scientific_name,
    common_name,
    stock_status,
    quantity_level || null, // handle empty strings as NULL
    order_status || null, // handle empty strings as NULL
  ]);

  const newPlant = rows[0];
  const plantId = newPlant.id;

  // if no medicinal uses
  if (!medicinal_uses || medicinal_uses.length === 0) {
    return newPlant;
  }

  // insert each medicinial use relation
  for (const useId of medicinal_uses) {
    await pool.query(
      `INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id)
      VALUES ($1, $2)`,
      [plantId, useId]
    );
  }

  return newPlant;
}

module.exports = {
  getPlants,
  getSpecificPlant,
  getAllMedicinalUses,
  getSpecificUse,
  insertPlant,
};

// https://www.theodinproject.com/lessons/nodejs-using-postgresql#querying-with-pg
