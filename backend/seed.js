
require('dotenv').config();

const pool = require('./src/config/database');
const bcrypt = require('bcrypt');

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(
      process.env.SEED_PASSWORD || 'ChangeMe_ClinicFlow_2026!',
      12
    );

    // Créer les comptes uniquement s'ils n'existent pas.
    const users = [
      ['Administrateur ClinicFlow', 'admin@clinicflow.local', 'admin'],
      ['Personnel ClinicFlow 1', 'staff1@clinicflow.local', 'staff'],
      ['Personnel ClinicFlow 2', 'staff2@clinicflow.local', 'staff'],
    ];

    const userIds = {};

    for (const [fullName, email, role] of users) {
      const result = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [fullName, email, passwordHash, role]
      );

      if (result.rowCount > 0) {
        userIds[email] = result.rows[0].id;
      } else {
        const existing = await client.query(
          `SELECT id
           FROM users
           WHERE email = $1 AND deleted_at IS NULL`,
          [email]
        );

        if (existing.rowCount === 0) {
          throw new Error(
            `Le compte ${email} existe déjà mais est supprimé ou indisponible.`
          );
        }

        userIds[email] = existing.rows[0].id;
      }
    }

    // Créer les 5 patients de démonstration sans modifier les patients existants.
    const patients = [
      ['Salma Amrani', 'CF-DEMO-001', '0611111111', '1995-03-12'],
      ['Youssef Bennani', 'CF-DEMO-002', '0622222222', '1988-07-24'],
      ['Nadia Alaoui', 'CF-DEMO-003', '0633333333', '2000-11-08'],
      ['Omar Tazi', 'CF-DEMO-004', '0644444444', '1979-05-16'],
      ['Imane Idrissi', 'CF-DEMO-005', '0655555555', '1992-09-30'],
    ];

    const patientIds = [];

    for (const [fullName, cin, phone, birthDate] of patients) {
      const result = await client.query(
        `INSERT INTO patients (full_name, cin, phone, birth_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cin) DO NOTHING
         RETURNING id`,
        [fullName, cin, phone, birthDate]
      );

      if (result.rowCount > 0) {
        patientIds.push(result.rows[0].id);
      } else {
        const existing = await client.query(
          `SELECT id
           FROM patients
           WHERE cin = $1 AND deleted_at IS NULL`,
          [cin]
        );

        if (existing.rowCount === 0) {
          throw new Error(
            `Le patient ${cin} existe déjà mais est supprimé ou indisponible.`
          );
        }

        patientIds.push(existing.rows[0].id);
      }
    }

    // Répartir les rendez-vous sur des dates et heures distinctes.
    const statuses = [
      'pending',
      'confirmed',
      'cancelled',
      'pending',
      'confirmed',
      'pending',
      'cancelled',
      'confirmed',
      'pending',
      'cancelled',
    ];

    const baseDate = new Date();
    baseDate.setUTCHours(9, 0, 0, 0);
    baseDate.setUTCDate(baseDate.getUTCDate() + 1);

    for (let i = 0; i < 10; i++) {
      const appointmentDate = new Date(baseDate);
      appointmentDate.setUTCDate(appointmentDate.getUTCDate() + i);

      const reason = `Consultation de démonstration ${i + 1}`;

      await client.query(
        `INSERT INTO appointments
           (patient_id, appointment_date, status, reason, notes, created_by)
         SELECT $1, $2, $3, $4, $5, $6
         WHERE NOT EXISTS (
           SELECT 1
           FROM appointments
           WHERE patient_id = $1
             AND appointment_date = $2
             AND reason = $4
             AND deleted_at IS NULL
         )`,
        [
          patientIds[i % patientIds.length],
          appointmentDate.toISOString(),
          statuses[i],
          reason,
          'Donnée fictive pour la démonstration ClinicFlow',
          userIds['admin@clinicflow.local'],
        ]
      );
    }

    await client.query('COMMIT');

    console.log('Seed ClinicFlow terminé avec succès.');
    console.log('Comptes de démonstration vérifiés/créés : 3');
    console.log('Patients de démonstration vérifiés/créés : 5');
    console.log('Rendez-vous de démonstration vérifiés/créés : jusqu’à 10');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur du seed :', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
