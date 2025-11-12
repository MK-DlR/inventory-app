// db/setup.js

require("dotenv").config();
const pool = require("./pool");

async function main() {
  console.log("Setting up plant inventory database...");

  try {
    // drop tables in correct order (respecting foreign keys)
    await pool.query("DROP TABLE IF EXISTS plant_medicinal_uses CASCADE");
    await pool.query("DROP TABLE IF EXISTS plants CASCADE");
    await pool.query("DROP TABLE IF EXISTS medicinal_uses CASCADE");
    console.log("Dropped existing tables");

    // create medicinal_uses table first (no dependencies)
    await pool.query(`
      CREATE TABLE medicinal_uses (
        id SERIAL PRIMARY KEY,
        use_name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
      )
    `);
    console.log("Created medicinal_uses table");

    // create plants table
    await pool.query(`
      CREATE TABLE plants (
        id SERIAL PRIMARY KEY,
        scientific_name VARCHAR(255) NOT NULL,
        common_name VARCHAR(255) NOT NULL,
        stock_status VARCHAR(50) CHECK (stock_status IN ('in_stock', 'out_of_stock')),
        quantity_level VARCHAR(50) CHECK (quantity_level IN ('high', 'medium', 'low')),
        order_status VARCHAR(50) CHECK (order_status IN ('needs_ordering', 'on_order')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created plants table");

    // create join table
    await pool.query(`
      CREATE TABLE plant_medicinal_uses (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        medicinal_use_id INTEGER NOT NULL REFERENCES medicinal_uses(id) ON DELETE CASCADE,
        UNIQUE(plant_id, medicinal_use_id)
      )
    `);
    console.log("Created plant_medicinal_uses junction table");

    // seed one placeholder medicinal use
    await pool.query(`
      INSERT INTO medicinal_uses (use_name, description) VALUES 
        ('Example Use', 'This is a placeholder medicinal use')
    `);
    console.log("Seeded placeholder medicinal use");

    // seed one placeholder plant
    await pool.query(`
      INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status) VALUES 
        ('Example scientificus', 'Example Plant', 'in_stock', 'medium', NULL)
    `);
    console.log("Seeded placeholder plant");

    // seed one placeholder relationship (add medicinal use to plant)
    await pool.query(`
      INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id) VALUES 
        (1, 1)
    `);
    console.log("Seeded placeholder relationship");

    console.log("\n✅ Database setup complete!");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

main();
