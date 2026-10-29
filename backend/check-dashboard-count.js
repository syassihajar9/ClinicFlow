require('dotenv').config();
const pool = require('./src/config/database');

pool.query(`
  SELECT
    COUNT(*) FILTER (
      WHERE deleted_at IS NULL
    ) AS total_rendez_vous,
    COUNT(*) FILTER (
      WHERE deleted_at IS NULL
        AND (appointment_date AT TIME ZONE 'Africa/Casablanca')::date
          = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date
    ) AS compteur_dashboard,
    COUNT(*) FILTER (
      WHERE deleted_at IS NULL
        AND appointment_date >= date_trunc('day', CURRENT_TIMESTAMP)
        AND appointment_date < date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '1 day'
    ) AS compteur_jour_serveur
  FROM appointments
`)
  .then(r => console.table(r.rows))
  .catch(e => console.error(e.message))
  .finally(() => pool.end());
