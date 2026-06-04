// src/db/queries.js

const pool = require("./pool");

// get all plants
async function getPlants(
  stock_statuses,
  quantity_levels,
  medicinal_uses,
  order_statuses,
  userId,
) {
  let query = "SELECT DISTINCT plants.* FROM plants"; // base query
  let conditions = []; // hold SQL conditions
  let params = []; // hold parameter values
  let paramCount = 1;

  // normalize inputs to arrays
  const normalizeToArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter((v) => v); // remove empty strings
    return [val]; // wrap single value in array
  };

  const stockArray = normalizeToArray(stock_statuses);
  const quantityArray = normalizeToArray(quantity_levels);
  const medicinalArray = normalizeToArray(medicinal_uses);
  const orderStatusArray = normalizeToArray(order_statuses);

  // add JOIN if filtering by medicinal_use
  if (medicinalArray.length > 0) {
    query += " INNER JOIN plant_medicinal_uses pmu ON plants.id = pmu.plant_id";
    query += " INNER JOIN medicinal_uses mu ON mu.id = pmu.medicinal_use_id";
  }

  // add stock_status condition
  if (stockArray.length > 0) {
    conditions.push(`stock_status = ANY($${paramCount})`);
    params.push(stockArray);
    paramCount++;
  }

  // add quantity_level condition
  if (quantityArray.length > 0) {
    conditions.push(`quantity_level = ANY($${paramCount})`);
    params.push(quantityArray);
    paramCount++;
  }

  // add medicinal_use condition
  if (medicinalArray.length > 0) {
    conditions.push(`mu.id = ANY($${paramCount})`);
    params.push(medicinalArray.map((id) => parseInt(id, 10)));
    paramCount++;
  }

  // add order_status condition
  if (orderStatusArray.length > 0) {
    const hasNull = orderStatusArray.includes("null");
    const nonNullStatuses = orderStatusArray.filter((s) => s !== "null");

    if (hasNull && nonNullStatuses.length > 0) {
      conditions.push(
        `(order_status = ANY($${paramCount}) OR order_status IS NULL)`,
      );
      params.push(nonNullStatuses);
      paramCount++;
    } else if (hasNull) {
      conditions.push(`order_status IS NULL`);
    } else {
      conditions.push(`order_status = ANY($${paramCount})`);
      params.push(orderStatusArray);
      paramCount++;
    }
  }

  // always apply user_id condition
  conditions.push(`plants.user_id = $${paramCount}`);
  params.push(userId);
  paramCount++;

  // combine conditions with AND (only if there are conditions)
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY common_name ASC";

  const { rows } = await pool.query(query, params);
  return rows;
}

// get specific plant by id with medicinal uses
async function getSpecificPlant(plantId, userId) {
  // get plant data
  const plantQuery = await pool.query(
    "SELECT * FROM plants WHERE id = $1 AND user_id = $2",
    [plantId, userId],
  );

  if (plantQuery.rows.length === 0) {
    return null;
  }

  const plant = plantQuery.rows[0];

  // get medicinal uses for this plant
  const usesQuery = await pool.query(
    `
    SELECT mu.id, mu.use_name, mu.description 
    FROM medicinal_uses mu
    INNER JOIN plant_medicinal_uses pmu ON mu.id = pmu.medicinal_use_id
    WHERE pmu.plant_id = $1 AND mu.user_id = $2
    ORDER BY mu.use_name ASC
    `,
    [plantId, userId],
  );

  // always ensure medicinal_uses is an array (even if empty)
  plant.medicinal_uses = usesQuery.rows || [];

  return plant;
}

// get all medicinal uses alphabetically
async function getAllMedicinalUses(userId) {
  const { rows } = await pool.query(
    `
    SELECT mu.*,
    COUNT(pmu.plant_id) AS plant_count
    FROM medicinal_uses mu
    LEFT JOIN plant_medicinal_uses pmu ON mu.id = pmu.medicinal_use_id
    WHERE mu.user_id = $1 
    GROUP BY mu.id, mu.use_name, mu.description, mu.user_id
    ORDER BY use_name ASC
    `,
    [userId],
  );
  return rows;
}

// get specific medicinal use by id with associated plants
async function getSpecificUse(useID, userId) {
  // get medicinal use data
  const useQuery = await pool.query(
    "SELECT * FROM medicinal_uses WHERE id = $1 AND user_id = $2",
    [useID, userId],
  );

  if (useQuery.rows.length === 0) {
    return null;
  }

  const medicinalUse = useQuery.rows[0];

  // get plants associated with this medicinal use
  const plantsQuery = await pool.query(
    `
    SELECT p.*
    FROM plants p
    INNER JOIN plant_medicinal_uses pmu ON p.id = pmu.plant_id
    WHERE pmu.medicinal_use_id = $1 AND p.user_id = $2
    ORDER BY p.common_name ASC
    `,
    [useID, userId],
  );

  // add plants to medicinal use object
  medicinalUse.plants = plantsQuery.rows;

  return medicinalUse;
}

// check if plant already exists
async function checkDuplicate(plantData, userId) {
  const { common_name, scientific_name } = plantData;

  // search for plants with specified name/s
  const plantsQuery = await pool.query(
    `
    SELECT id, common_name, scientific_name
    FROM plants
    WHERE (LOWER(common_name) = LOWER($1) OR LOWER(scientific_name) = LOWER($2)) AND user_id = $3
    LIMIT 1
    `,
    [common_name, scientific_name, userId],
  );

  // return plant if found, otherwise null
  return plantsQuery.rows.length > 0 ? plantsQuery.rows[0] : null;
}

// check if medicinal use already exists
async function checkDuplicateMedicinalUse(useName, userId) {
  const result = await pool.query(
    `
    SELECT id, use_name
    FROM medicinal_uses
    WHERE LOWER(use_name) = LOWER($1) AND user_id = $2
    LIMIT 1
    `,
    [useName, userId],
  );

  // return medicinal use if found, otherwise null
  return result.rows.length > 0 ? result.rows[0] : null;
}

// add new plant to database
async function insertPlant(plantData, userId) {
  const {
    scientific_name,
    common_name,
    stock_status,
    quantity_level,
    order_status,
    medicinal_uses = [], // array of numeric IDs from checkboxes
    new_medicinal_uses = [], // array of new names (strings)
  } = plantData;

  // use client so we can BEGIN/COMMIT/ROLLBACK
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // insert plant
    const plantInsert = `
      INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const plantRes = await client.query(plantInsert, [
      scientific_name,
      common_name,
      stock_status,
      quantity_level || null,
      order_status || null,
      userId,
    ]);
    const newPlant = plantRes.rows[0];
    const plantId = newPlant.id;

    // build final list of medicinal_use ids
    // start with checkbox IDs (already numbers)
    const finalUseIds = Array.isArray(medicinal_uses)
      ? [...medicinal_uses]
      : [];

    // for each new name, either select existing id (case-insensitive) or insert and get id
    for (const rawName of new_medicinal_uses) {
      const name = String(rawName).trim();
      if (!name) continue;

      // try to find existing (case-insensitive)
      const sel = await client.query(
        `
        SELECT id FROM medicinal_uses 
        WHERE LOWER(use_name) = LOWER($1) AND user_id = $2 LIMIT 1
        `,
        [name, userId],
      );

      let useId;
      if (sel.rows.length > 0) {
        useId = sel.rows[0].id;
      } else {
        // insert (no RETURNING id guaranteed in race-free path)
        try {
          const ins = await client.query(
            `
            INSERT INTO medicinal_uses (use_name, description, user_id)
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [name, null, userId],
          );
          useId = ins.rows[0].id;
        } catch (err) {
          // handle rare race where another process inserted same lowercased name
          // postgreSQL duplicate key error code is '23505'
          if (err && err.code === "23505") {
            const sel2 = await client.query(
              `
              SELECT id 
              FROM medicinal_uses 
              WHERE LOWER(use_name) = LOWER($1) 
              AND user_id = $2 LIMIT 1
              `,
              [name, userId],
            );
            if (sel2.rows.length > 0) {
              useId = sel2.rows[0].id;
            } else {
              throw err; // rethrow if we can't resolve
            }
          } else {
            throw err;
          }
        }
      }

      if (useId && !finalUseIds.includes(useId)) {
        finalUseIds.push(useId);
      }
    }

    // insert into junction table (avoid duplicates with ON CONFLICT DO NOTHING if constraint exists)
    for (const useId of finalUseIds) {
      if (!useId) continue;
      await client.query(
        `
        INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `, // requires a unique constraint on (plant_id, medicinal_use_id) to be effective
        [plantId, useId],
      );
    }

    // commit
    await client.query("COMMIT");
    return newPlant;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// add new medicinal use to database
async function insertMedicinalUse(medicinalName, medicinalDesc, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // check if medicinal use already exists (case-insensitive)
    const existingUse = await client.query(
      `
      SELECT * FROM medicinal_uses 
      WHERE LOWER(use_name) = LOWER($1) 
      AND user_id = $2 LIMIT 1
      `,
      [medicinalName, userId],
    );

    // if it already exists, rollback and return the existing record
    if (existingUse.rows.length > 0) {
      await client.query("ROLLBACK");
      return existingUse.rows[0];
    }

    // insert new medicinal use
    const insertQuery = `
      INSERT INTO medicinal_uses (use_name, description, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await client.query(insertQuery, [
      medicinalName,
      medicinalDesc,
      userId,
    ]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error in insertMedicinalUse:", err);
    throw err;
  } finally {
    client.release();
  }
}

// update plant
async function updatePlant(plantId, plantData, userId) {
  const {
    scientific_name,
    common_name,
    stock_status,
    quantity_level,
    order_status,
    medicinal_uses = [], // array of numeric IDs from checkboxes
    new_medicinal_uses = [], // array of new names (strings)
  } = plantData;

  // use client so we can BEGIN/COMMIT/ROLLBACK
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // update plant
    const plantUpdate = `
      UPDATE plants 
      SET scientific_name = $1, 
        common_name = $2, 
        stock_status = $3, 
        quantity_level = $4, 
        order_status = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `;
    const plantRes = await client.query(plantUpdate, [
      scientific_name,
      common_name,
      stock_status,
      quantity_level || null,
      order_status || null,
      plantId,
      userId,
    ]);
    const updatedPlant = plantRes.rows[0];

    // delete existing medicinal use associations for this plant
    await client.query(`DELETE FROM plant_medicinal_uses WHERE plant_id = $1`, [
      plantId,
    ]);

    // build final list of medicinal_use ids
    // start with checkbox IDs (already numbers)
    const finalUseIds = Array.isArray(medicinal_uses)
      ? [...medicinal_uses]
      : [];

    // for each new name, either select existing id (case-insensitive) or insert and get id
    for (const rawName of new_medicinal_uses) {
      const name = String(rawName).trim();
      if (!name) continue;

      // try to find existing (case-insensitive)
      const sel = await client.query(
        `
        SELECT id 
        FROM medicinal_uses 
        WHERE LOWER(use_name) = LOWER($1) 
        AND user_id = $2 LIMIT 1
        `,
        [name, userId],
      );

      let useId;
      if (sel.rows.length > 0) {
        useId = sel.rows[0].id;
      } else {
        // insert (no RETURNING id guaranteed in race-free path)
        try {
          const ins = await client.query(
            `
            INSERT INTO medicinal_uses (use_name, description, user_id)
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [name, null, userId],
          );
          useId = ins.rows[0].id;
        } catch (err) {
          // handle rare race where another process inserted same lowercased name
          // postgreSQL duplicate key error code is '23505'
          if (err && err.code === "23505") {
            const sel2 = await client.query(
              `
              SELECT id 
              FROM medicinal_uses 
              WHERE LOWER(use_name) = LOWER($1) AND user_id = $2 LIMIT 1
              `,
              [name, userId],
            );
            if (sel2.rows.length > 0) {
              useId = sel2.rows[0].id;
            } else {
              throw err; // rethrow if we can't resolve
            }
          } else {
            throw err;
          }
        }
      }

      if (useId && !finalUseIds.includes(useId)) {
        finalUseIds.push(useId);
      }
    }

    // insert into junction table (avoid duplicates with ON CONFLICT DO NOTHING if constraint exists)
    for (const useId of finalUseIds) {
      if (!useId) continue;
      await client.query(
        `
        INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `, // requires a unique constraint on (plant_id, medicinal_use_id) to be effective
        [plantId, useId],
      );
    }

    // commit
    await client.query("COMMIT");
    return updatedPlant;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// update medicinal use
async function updateMedicinalUse(
  medicinalId,
  medicinalName,
  medicinalDesc,
  userId,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateQuery = `
      UPDATE medicinal_uses 
      SET use_name = $1, 
        description = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    const result = await client.query(updateQuery, [
      medicinalName,
      medicinalDesc,
      medicinalId,
      userId,
    ]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error in updateMedicinalUse:", err);
    throw err;
  } finally {
    client.release();
  }
}

// delete plant
async function removePlant(plantId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const deleteQuery = `
      DELETE FROM plants
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await client.query(deleteQuery, [plantId, userId]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error in removePlant:", err);
    throw err;
  } finally {
    client.release();
  }
}

// delete medicinal use
async function removeMedicinalUse(medicinalId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const deleteQuery = `
      DELETE FROM medicinal_uses
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await client.query(deleteQuery, [medicinalId, userId]);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database error in removeMedicinalUse:", err);
    throw err;
  } finally {
    client.release();
  }
}

// global search for scientific name, common name, medicinal use
async function globalSearch(searchTerm, userId) {
  // query 1: search plants table
  const plantQuery = `
    SELECT 
      id,
      common_name,
      scientific_name,
      stock_status,
      quantity_level,
      image_url
    FROM plants
    WHERE (LOWER(common_name) LIKE LOWER($1)
      OR LOWER(scientific_name) LIKE LOWER($1))
      AND user_id = $2
    ORDER BY common_name ASC
  `;

  // query 2: search medicinal_uses table
  const medicinalQuery = `
  SELECT id, use_name, description
  FROM medicinal_uses
  WHERE LOWER(use_name) LIKE LOWER($1)
    AND user_id = $2
  ORDER BY use_name ASC
  `;

  // execute both queries with the search term
  const plantResults = await pool.query(plantQuery, [
    `%${searchTerm}%`,
    userId,
  ]);
  const medicinalResults = await pool.query(medicinalQuery, [
    `%${searchTerm}%`,
    userId,
  ]);

  // return object with both arrays
  return {
    plants: plantResults.rows,
    medicinal_uses: medicinalResults.rows,
  };
}

// update plant image and trefle_id
async function updatePlantImage(plantId, imageUrl, trefleId, userId) {
  const query = `
    UPDATE plants
    SET image_url = $1, trefle_id = $2
    WHERE id = $3 AND user_id = $4
    RETURNING *
  `;
  const result = await pool.query(query, [imageUrl, trefleId, plantId, userId]);
  return result.rows[0];
}

module.exports = {
  getPlants,
  getSpecificPlant,
  getAllMedicinalUses,
  getSpecificUse,
  checkDuplicate,
  checkDuplicateMedicinalUse,
  insertPlant,
  insertMedicinalUse,
  updatePlant,
  updateMedicinalUse,
  removePlant,
  removeMedicinalUse,
  globalSearch,
  updatePlantImage,
};
