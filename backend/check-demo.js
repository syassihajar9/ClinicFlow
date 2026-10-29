
require('dotenv').config();

const pool = require('./src/config/database');

async function main() {
  try {
    for (const table of ['users', 'patients', 'appointments']) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM ${table}
         WHERE deleted_at IS NULL`
      );

      console.log(`${table}: ${result.rows[0].total}`);
    }

    const demoPatients = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM patients
       WHERE cin LIKE $1 AND deleted_at IS NULL`,
      ['CF-DEMO-%']
    );

    const demoAppointments = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM appointments
       WHERE reason LIKE $1 AND deleted_at IS NULL`,
      ['Consultation de démonstration%']
    );

    console.log('Patients de démonstration :', demoPatients.rows[0].total);
    console.log('Rendez-vous de démonstration :', demoAppointments.rows[0].total);
  } catch (error) {
    console.error('Erreur de vérification :', error.message);
  } finally {
    await pool.end();
  }
}

main();
