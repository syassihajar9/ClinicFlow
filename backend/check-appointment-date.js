require('dotenv').config();
const pool = require('./src/config/database');

pool.query(`
  SELECT
    id,
    appointment_date,
    appointment_date AT TIME ZONE 'Africa/Casablanca' AS date_maroc,
    (appointment_date AT TIME ZONE 'Africa/Casablanca')::date AS jour_maroc,
    (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date AS aujourd_hui_maroc
  FROM appointments
  WHERE deleted_at IS NULL
  ORDER BY appointment_date DESC
  LIMIT 10
`)
  .then(r => console.table(r.rows))
  .catch(e => console.error(e.message))
  .finally(() => pool.end());
