require('dotenv').config();
const pool = require('./src/config/database');

pool.query(`
  SELECT
    current_setting('TimeZone') AS timezone_postgres,
    CURRENT_TIMESTAMP AS heure_actuelle,
    (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca') AS heure_maroc
`)
  .then(r => console.table(r.rows))
  .catch(e => console.error(e.message))
  .finally(() => pool.end());
