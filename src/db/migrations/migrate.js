// src/db/migrate.js

// added admin and user roles to existing database and plants

require("dotenv").config();
const pool = require("../pool");

async function migrate() {
  // use client so we can BEGIN/COMMIT/ROLLBACK
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // create users table
    const userTable = await client.query(
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

    // insert guest user and admin user and capture ids
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

    // add user_id to plants and medicinal_uses
    const addUserIdToPlants = await client.query(
      `
        ALTER TABLE plants
        ADD COLUMN user_id INTEGER REFERENCES users(id)
      `,
    );

    const addUserIdToMedicinalUses = await client.query(
      `
        ALTER TABLE medicinal_uses
        ADD COLUMN user_id INTEGER REFERENCES users(id)
      `,
    );
    console.log("Added user_id to plants and medicinal_uses");

    // backfill existing rows
    const updatePlants = await client.query(
      `
        UPDATE plants
        SET user_id = $1
      `,
      [adminId],
    );

    const updateMedicinalUses = await client.query(
      `
        UPDATE medicinal_uses
        SET user_id = $1
      `,
      [adminId],
    );
    console.log("Backfilled existing rows with admin user_id");

    // make user_id NOT NULL on both tables
    const makeUserIdNotNullPlants = await client.query(
      `
        ALTER TABLE plants
        ALTER COLUMN user_id SET NOT NULL
      `,
    );

    const makeUserIdNotNullMedicinalUses = await client.query(
      `
        ALTER TABLE medicinal_uses
        ALTER COLUMN user_id SET NOT NULL
      `,
    );
    console.log("Set user_id to NOT NULL on plants and medicinal_uses");

    // drop unique constraint
    await client.query(
      `ALTER TABLE medicinal_uses DROP CONSTRAINT medicinal_uses_use_name_key`,
    );

    // seed guest data
    const seedGuestPlants = await client.query(
      `
        INSERT INTO plants (scientific_name, common_name, stock_status, quantity_level, order_status, user_id) VALUES
        ('Aloe vera', 'Aloe Vera', 'in_stock', 'high', 'needs_ordering', $1),
        ('Mentha piperita', 'Peppermint', 'in_stock', 'medium', 'needs_ordering', $1),
        ('Zingiber officinale', 'Ginger', 'out_of_stock', 'low', 'on_order', $1)
      `,
      [guestId],
    );

    const seedGuestMedicinalUses = await client.query(
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
    console.log("Seeded guest data");

    // query guest plant and guest medicinal use IDs
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

    // insert guest plant-medicinal use relationships
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

    // commit
    await client.query("COMMIT");

    // log guest and admin ids to add to .env
    console.log(guestId, adminId);
    return { guestId, adminId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

migrate();
