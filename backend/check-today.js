require('dotenv').config();
const pool = require('./src/config/database');

pool.query(`
  SELECT
    appointment_date,
    status,
    deleted_at,
    CURRENT_TIMESTAMP AS heure_serveur,
    CURRENT_DATE AS date_serveur,
    (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date AS date_maroc
  FROM appointments
  WHERE deleted_at IS NULL
  ORDER BY appointment_date ASC
  LIMIT 5
`)
  .then(r => console.table(r.rows))
  .catch(e => console.error(e.message))
  .finally(() => pool.end());
