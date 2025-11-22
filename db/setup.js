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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url TEXT,
        trefle_id INT
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

    // seed medicinal uses
    await pool.query(`
      INSERT INTO medicinal_uses (use_name, description) VALUES 
        ('Anti-Inflammatory', 'Reduces inflammation and swelling in the body'),
        ('Digestive Aid', 'Supports healthy digestion and relieves gastrointestinal discomfort'),
        ('Immune Support', 'Strengthens the immune system and helps fight infections'),
        ('Pain Relief', 'Alleviates various types of pain'),
        ('Antimicrobial', 'Fights against bacteria, viruses, and fungi'),
        ('Antioxidant', 'Protects cells from oxidative damage'),
        ('Sedative', 'Promotes relaxation and helps with sleep'),
        ('Respiratory Support', 'Helps with breathing and lung health')
    `);
    console.log("Seeded medicinal uses");

    // seed plants
    await pool.query(`
      INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status) VALUES 
        ('Echinacea purpurea', 'Purple Coneflower', 'in_stock', 'high', NULL),
        ('Matricaria chamomilla', 'German Chamomile', 'in_stock', 'medium', NULL),
        ('Zingiber officinale', 'Ginger', 'out_of_stock', 'low', 'needs_ordering')
    `);
    console.log("Seeded plants");

    // seed plant-medicinal use relationships
    await pool.query(`
      INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id) VALUES 
        (1, 3),
        (1, 5),
        (1, 6),
        (2, 1),
        (2, 2),
        (2, 7),
        (3, 1),
        (3, 2),
        (3, 4),
        (3, 5)
    `);
    console.log("Seeded plant-medicinal use relationships");

    console.log("\n✅ Database setup complete!");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

main();
