require('dotenv').config();
const pool = require('./src/config/database');

pool.query(
  "SELECT data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
  ['appointments', 'appointment_date']
)
  .then(r => console.log(r.rows))
  .catch(e => console.error(e.message))
  .finally(() => pool.end());
