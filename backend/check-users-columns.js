require('dotenv').config();
const db = require('./src/config/database');

async function main() {
  try {
    const result = await db.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
      ['users']
    );
    console.table(result.rows);
  } catch (error) {
    console.error(error.message);
  } finally {
    if (db.end) await db.end();
  }
}

main();
