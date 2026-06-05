// src/db/setup.js

/*
 * IMPORTANT
 * for fresh, local installs only
 * will wipe all existing data
 */

require("dotenv").config();
const pool = require("./pool");

async function main() {
  console.log("Setting up plant inventory database...");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // drop tables in correct order (respecting foreign keys)
    await client.query("DROP TABLE IF EXISTS plant_medicinal_uses CASCADE");
    await client.query("DROP TABLE IF EXISTS plants CASCADE");
    await client.query("DROP TABLE IF EXISTS medicinal_uses CASCADE");
    await client.query("DROP TABLE IF EXISTS users CASCADE");
    console.log("Dropped existing tables");

    // create users table first (plants and medicinal_uses depend on it)
    await client.query(
      `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) UNIQUE NOT NULL,
        password_hash TEXT,
        role VARCHAR(20) CHECK (role IN ('admin', 'guest')) NOT NULL
      )
    `,
    );
    console.log("Created users table");

    // create medicinal_uses table
    await client.query(
      `
      CREATE TABLE medicinal_uses (
        id SERIAL PRIMARY KEY,
        use_name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id)
      )
    `,
    );
    console.log("Created medicinal_uses table");

    // create plants table
    await client.query(
      `
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
        trefle_id INT,
        user_id INTEGER NOT NULL REFERENCES users(id)
      )
    `,
    );
    console.log("Created plants table");

    // create junction table
    await client.query(
      `
      CREATE TABLE plant_medicinal_uses (
        id SERIAL PRIMARY KEY,
        plant_id INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        medicinal_use_id INTEGER NOT NULL REFERENCES medicinal_uses(id) ON DELETE CASCADE,
        UNIQUE(plant_id, medicinal_use_id)
      )
    `,
    );
    console.log("Created plant_medicinal_uses junction table");

    // seed users and capture ids
    const guestResult = await client.query(
      `INSERT INTO users (username, password_hash, role) VALUES ('guest', NULL, 'guest') RETURNING id`,
    );
    const guestId = guestResult.rows[0].id;

    const adminResult = await client.query(
      `INSERT INTO users (username, password_hash, role) VALUES ('admin', $1, 'admin') RETURNING id`,
      [process.env.ADMIN_PASSWORD],
    );
    const adminId = adminResult.rows[0].id;
    console.log("Seeded users table");

    // seed guest plants
    await client.query(
      `
      INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status, user_id) VALUES
        ('Aloe vera', 'Aloe Vera', 'in_stock', 'high', 'needs_ordering', $1),
        ('Mentha piperita', 'Peppermint', 'in_stock', 'medium', 'needs_ordering', $1),
        ('Zingiber officinale', 'Ginger', 'out_of_stock', 'low', 'on_order', $1)
      `,
      [guestId],
    );
    console.log("Seeded guest plants");

    // seed guest medicinal uses
    await client.query(
      `
      INSERT INTO medicinal_uses (use_name, description, user_id) VALUES
        ('Anti-Inflammatory', 'Reduces inflammation and swelling in the body', $1),
        ('Digestive Aid', 'Supports healthy digestion and relieves gastrointestinal discomfort', $1),
        ('Immune Support', 'Strengthens the immune system and helps fight infections', $1),
        ('Pain Relief', 'Alleviates various types of pain', $1),
        ('Antimicrobial', 'Fights against bacteria, viruses, and fungi', $1),
        ('Antioxidant', 'Protects cells from oxidative damage', $1),
        ('Sedative', 'Promotes relaxation and helps with sleep', $1),
        ('Respiratory Support', 'Helps with breathing and lung health', $1)
      `,
      [guestId],
    );
    console.log("Seeded guest medicinal uses");

    // query guest plant and medicinal use IDs dynamically
    const guestPlantsResult = await client.query(
      `SELECT id, common_name FROM plants WHERE user_id = $1`,
      [guestId],
    );
    const guestPlantIds = {};
    guestPlantsResult.rows.forEach((row) => {
      guestPlantIds[row.common_name] = row.id;
    });

    const guestUsesResult = await client.query(
      `SELECT id, use_name FROM medicinal_uses WHERE user_id = $1`,
      [guestId],
    );
    const guestUseIds = {};
    guestUsesResult.rows.forEach((row) => {
      guestUseIds[row.use_name] = row.id;
    });

    // seed guest plant-medicinal use relationships
    await client.query(
      `
      INSERT INTO plant_medicinal_uses (plant_id, medicinal_use_id) VALUES
        ($1, $2), ($1, $3), ($1, $4),
        ($5, $6), ($5, $7), ($5, $8),
        ($9, $10), ($9, $11), ($9, $12)
      `,
      [
        guestPlantIds["Aloe Vera"],
        guestUseIds["Anti-Inflammatory"],
        guestUseIds["Antioxidant"],
        guestUseIds["Antimicrobial"],
        guestPlantIds["Peppermint"],
        guestUseIds["Digestive Aid"],
        guestUseIds["Anti-Inflammatory"],
        guestUseIds["Respiratory Support"],
        guestPlantIds["Ginger"],
        guestUseIds["Anti-Inflammatory"],
        guestUseIds["Digestive Aid"],
        guestUseIds["Pain Relief"],
      ],
    );
    console.log("Seeded guest plant-medicinal use relationships");

    await client.query("COMMIT");

    console.log(`\n✅ Database setup complete!`);
    console.log(`Guest user ID: ${guestId} | Admin user ID: ${adminId}`);
    console.log(
      `If needed, add these to your .env: GUEST_USER_ID=${guestId} ADMIN_USER_ID=${adminId}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error setting up database:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
