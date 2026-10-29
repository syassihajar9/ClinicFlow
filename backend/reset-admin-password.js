require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function main() {
  try {
    const email = 'admin@clinicflow.local';
    const newPassword = 'ClinicFlowAdmin2026!';

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE email = $2
         AND role = 'admin'
         AND deleted_at IS NULL
       RETURNING id, email, role`,
      [passwordHash, email]
    );

    if (result.rowCount === 0) {
      console.log('Aucun compte administrateur modifié.');
    } else {
      console.log('Mot de passe administrateur réinitialisé.');
      console.log(result.rows[0]);
    }
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await pool.end();
  }
}

main();
