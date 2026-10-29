
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationName = '001_initial_schema.sql';

    const migrationPath = path.join(
      __dirname,
      'database',
      'migrations',
      migrationName
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Fichier introuvable : ${migrationPath}`);
    }

    const alreadyApplied = await client.query(
      'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
      [migrationName]
    );

    if (alreadyApplied.rowCount > 0) {
      console.log(`Migration déjà appliquée : ${migrationName}`);
      return;
    }

    let sql = fs.readFileSync(migrationPath, 'utf8');

    // La transaction est gérée par ce script.
    sql = sql.replace(/^\s*BEGIN\s*;\s*/i, '');
    sql = sql.replace(/\s*COMMIT\s*;\s*$/i, '');

    await client.query('BEGIN');

    try {
      await client.query(sql);

      await client.query(
        'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
        [migrationName]
      );

      await client.query('COMMIT');
      console.log(`Migration appliquée avec succès : ${migrationName}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Échec de la migration :', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
